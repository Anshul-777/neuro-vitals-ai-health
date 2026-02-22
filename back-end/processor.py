import numpy as np
from scipy import signal

class SignalProcessor:
    def __init__(self):
        self.min_hz = 0.7  # 42 BPM
        self.max_hz = 3.5  # 210 BPM
        self.respiration_min_hz = 0.1 # 6 breaths/min
        self.respiration_max_hz = 0.5 # 30 breaths/min
        # Butterworth Filter Configuration
        self.filter_order = 6

    def butter_bandpass_filter(self, data, fs, lowcut, highcut):
        nyquist = 0.5 * fs
        low = lowcut / nyquist
        high = highcut / nyquist
        if low <= 0 or high >= 1: # Ensure filter parameters are valid
            return data 
        b, a = signal.butter(self.filter_order, [low, high], btype='band')
        return signal.filtfilt(b, a, data)

    def chrom_method(self, frames_buffer):
        """
        Implementation of de Haan & Jeanne (2013) Chrominance Method.
        Robust against motion and specular reflection.
        """
        data = np.array(frames_buffer)

        R = data[:, 0]
        G = data[:, 1]
        B = data[:, 2]

        R_norm = R / (np.mean(R) + 1e-6)
        G_norm = G / (np.mean(G) + 1e-6)
        B_norm = B / (np.mean(B) + 1e-6)

        X = 3 * R_norm - 2 * G_norm
        Y = 1.5 * R_norm + G_norm - 1.5 * B_norm

        std_x = np.std(X)
        std_y = np.std(Y)

        if std_y == 0: return X # Avoid division by zero

        alpha = std_x / std_y

        S = X - alpha * Y

        return S

    def calculate_bpm_and_hrv(self, rgb_buffer, times):
        """
        Calculates BPM and HRV (SDNN) using the CHROM method.
        Returns (bpm, sdnn).
        """
        if len(rgb_buffer) < 90: return 0.0, 0.0 # Need ~3 seconds minimum

        # 1. Calculate Frame Rate
        dt = np.diff(times)
        if len(dt) == 0: return 0.0, 0.0
        fs = 1.0 / np.mean(dt)
        if fs < 10: return 0.0, 0.0 # Garbage check

        # 2. Run CHROM Algorithm
        pulse_signal = self.chrom_method(rgb_buffer)

        # 3. Filter the Pulse Signal for HR
        clean_signal_hr = self.butter_bandpass_filter(pulse_signal, fs, self.min_hz, self.max_hz)

        # 4. FFT for Heart Rate
        window = np.hamming(len(clean_signal_hr))
        signal_windowed_hr = clean_signal_hr * window

        fft_spectrum_hr = np.abs(np.fft.rfft(signal_windowed_hr))
        freqs_hr = np.fft.rfftfreq(len(signal_windowed_hr), 1.0/fs)

        valid_idx_hr = np.where((freqs_hr >= self.min_hz) & (freqs_hr <= self.max_hz))
        valid_freqs_hr = freqs_hr[valid_idx_hr]
        valid_spectrum_hr = fft_spectrum_hr[valid_idx_hr]

        bpm = 0.0
        if len(valid_spectrum_hr) > 0:
            peak_idx_hr = np.argmax(valid_spectrum_hr)
            dominant_freq_hr = valid_freqs_hr[peak_idx_hr]
            bpm = dominant_freq_hr * 60

        # 5. Heart Rate Variability (HRV) - SDNN
        sdnn = 0.0
        if len(clean_signal_hr) > 2 * fs: # Need at least 2 seconds of filtered signal for meaningful peaks
            # Find peaks in the filtered pulse signal to estimate R-R intervals (or NN intervals)
            # This is a simplified approach; more robust peak detection might be needed for real applications
            peaks, _ = signal.find_peaks(clean_signal_hr, distance=fs/4) # Assume min 15 BPM
            
            if len(peaks) > 2:
                # Convert peak indices to times
                peak_times = np.array(times)[peaks]
                # Calculate inter-beat intervals (NN intervals)
                nn_intervals = np.diff(peak_times) * 1000 # Convert to milliseconds
                if len(nn_intervals) > 1:
                    sdnn = np.std(nn_intervals)

        return bpm, sdnn

    def calculate_respiratory_rate(self, rgb_buffer, times):
        """
        Calculates Respiratory Rate (breaths per minute).
        """
        if len(rgb_buffer) < 90: return 0.0 # Need ~3 seconds minimum

        dt = np.diff(times)
        if len(dt) == 0: return 0.0
        fs = 1.0 / np.mean(dt)
        if fs < 10: return 0.0

        # Use the CHROM method to get a pulse signal, which also contains respiratory information
        pulse_signal = self.chrom_method(rgb_buffer)

        # Filter for respiratory frequencies (e.g., 0.1 Hz to 0.5 Hz for 6-30 breaths/min)
        clean_signal_resp = self.butter_bandpass_filter(pulse_signal, fs, self.respiration_min_hz, self.respiration_max_hz)

        window = np.hamming(len(clean_signal_resp))
        signal_windowed_resp = clean_signal_resp * window

        fft_spectrum_resp = np.abs(np.fft.rfft(signal_windowed_resp))
        freqs_resp = np.fft.rfftfreq(len(signal_windowed_resp), 1.0/fs)

        valid_idx_resp = np.where((freqs_resp >= self.respiration_min_hz) & (freqs_resp <= self.respiration_max_hz))
        valid_freqs_resp = freqs_resp[valid_idx_resp]
        valid_spectrum_resp = fft_spectrum_resp[valid_idx_resp]

        if len(valid_spectrum_resp) == 0: return 0.0

        peak_idx_resp = np.argmax(valid_spectrum_resp)
        dominant_freq_resp = valid_freqs_resp[peak_idx_resp]

        return dominant_freq_resp * 60
