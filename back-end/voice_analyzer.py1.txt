import librosa
import numpy as np
import soundfile as sf
import os

class VoiceAnalyzer:
    def __init__(self):
        # Configuration for pitch estimation
        self.fmin = librosa.note_to_hz('C2') # Minimum fundamental frequency (approx 65 Hz)
        self.fmax = librosa.note_to_hz('C5') # Maximum fundamental frequency (approx 523 Hz)

    def analyze_audio_file(self, audio_filepath):
        metrics = {
            "jitter_percent": None,
            "shimmer_percent": None,
            "hnr_db": None,
            "mpt_seconds": None
        }

        if not os.path.exists(audio_filepath):
            print(f"Error: Audio file not found at {audio_filepath}")
            return metrics

        try:
            y, sr = librosa.load(audio_filepath, sr=None) # y: audio time series, sr: sampling rate

            # Maximum Phonation Time (MPT)
            metrics["mpt_seconds"] = librosa.get_duration(y=y, sr=sr)

            # --- Custom Logic for Jitter, Shimmer, and HNR (Simplified) ---
            # Note: This is a highly simplified and illustrative implementation using librosa primitives.
            # For robust and clinically accurate voice analysis, specialized tools like Praat
            # or dedicated speech analysis libraries are typically required, as they use advanced
            # pitch-synchronous analysis, accurate voiced/unvoiced detection, and specific algorithms.
            # The results here should be interpreted as conceptual demonstrations rather than precise clinical values.

            # 1. Fundamental Frequency (F0) Estimation
            # Use a smaller hop_length for more resolution in F0/RMS frames, e.g., 10ms (sr//100)
            hop_length = sr // 100 # 10 ms
            frame_length = 2048

            f0, voiced_flag, voiced_probs = librosa.pyin(y, fmin=self.fmin, fmax=self.fmax, sr=sr, frame_length=frame_length, win_length=frame_length // 2, hop_length=hop_length)

            # Replace NaN with 0 for unvoiced frames
            f0[np.isnan(f0)] = 0

            # 2. Amplitude Envelope (RMS Energy)
            # We need RMS energy per frame, synchronized with F0 frames
            S = librosa.stft(y, n_fft=frame_length, hop_length=hop_length)
            rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]

            # --- Align lengths of f0, rms, and spectral_flatness --- 
            # Calculate spectral_flatness before finding min_len, then truncate all
            spectral_flatness_full = librosa.feature.spectral_flatness(y=y, S=np.abs(S), hop_length=hop_length)[0]

            min_len = min(len(f0), len(rms), len(spectral_flatness_full))

            f0 = f0[:min_len]
            rms = rms[:min_len]
            spectral_flatness = spectral_flatness_full[:min_len]

            # Identify voiced frames for analysis (where F0 is meaningful)
            voiced_indices = np.where(f0 > self.fmin)[0]

            if len(voiced_indices) > 5: # Need a sufficient number of voiced frames
                # Extract F0 and RMS for voiced frames
                f0_voiced = f0[voiced_indices]
                rms_voiced = rms[voiced_indices]

                # Convert F0 to Period (in seconds)
                periods_voiced = 1.0 / f0_voiced

                # Jitter (local, %): Average absolute difference between consecutive periods
                if len(periods_voiced) > 1:
                    diff_periods = np.abs(np.diff(periods_voiced))
                    if np.mean(periods_voiced) > 0: # Avoid division by zero
                        jitter_local = (np.mean(diff_periods) / np.mean(periods_voiced)) * 100
                        metrics["jitter_percent"] = jitter_local

                # Shimmer (local, %): Average absolute difference between consecutive amplitudes
                if len(rms_voiced) > 1:
                    diff_rms = np.abs(np.diff(rms_voiced))
                    if np.mean(rms_voiced) > 0: # Avoid division by zero
                        shimmer_local = (np.mean(diff_rms) / np.mean(rms_voiced)) * 100
                        metrics["shimmer_percent"] = shimmer_local

                # HNR (Harmonics-to-Noise Ratio, dB) - Simplified Spectral Approach
                try:
                    # Corrected: Pass np.abs(S) to spectral_flatness as it expects magnitude spectrogram
                    flatness_voiced = spectral_flatness[voiced_indices]

                    if len(flatness_voiced) > 0:
                        hnr_estimate = 10 * np.log10(1 / (np.mean(flatness_voiced) + 1e-6))
                        metrics["hnr_db"] = hnr_estimate
                except Exception as e:
                    print(f"Could not estimate HNR: {e}")
            else:
                print("Warning: Not enough voiced frames detected for Jitter/Shimmer/HNR calculation.")

        except Exception as e:
            print(f"An error occurred processing {audio_filepath}: {e}")

        return metrics

if __name__ == "__main__":
    # Test block: Generate a dummy WAV file if not exists
    test_audio_filename = "test_voice.wav"
    # Ensure the directory exists for the test file
    test_audio_path = os.path.join("Neuro-VX", "Backend", test_audio_filename)
    os.makedirs(os.path.dirname(test_audio_path), exist_ok=True)

    if not os.path.exists(test_audio_path):
        print("Generating dummy audio file...")
        samplerate = 44100  # samples per second
        duration = 3.0    # seconds
        frequency = 220.0 # Hz (A3 note)
        t = np.linspace(0., duration, int(samplerate * duration), False)
        amplitude = 0.5
        data = amplitude * np.sin(2. * np.pi * frequency * t)

        # Add some noise for a more realistic signal and simulate jitter/shimmer
        noise_amplitude = 0.02
        data_with_noise = data + noise_amplitude * np.random.randn(len(data))

        # Simulate slight frequency perturbation (jitter)
        if len(data_with_noise) > 100:
            perturb_factor = 0.005 # 0.5% perturbation
            data_with_jitter = data_with_noise * (1 + perturb_factor * np.sin(2 * np.pi * 5 * t))
            data_final = data_with_jitter
        else:
            data_final = data_with_noise

        sf.write(test_audio_path, data_final.astype(np.float32), samplerate)
        print(f"Dummy audio file created at {test_audio_path}")
    else:
        print(f"Using existing dummy audio file at {test_audio_path}")

    analyzer = VoiceAnalyzer()
    print(f"Analyzing: {test_audio_path}")
    results = analyzer.analyze_audio_file(test_audio_path)

    print("\n--- Voice Analysis Results (Simplified Librosa Custom Logic) ---")
    for key, value in results.items():
        if isinstance(value, float):
            print(f"{key.replace('_', ' ').title()}: {value:.2f}")
        else:
            print(f"{key.replace('_', ' ').title()}: {value}")
    print("--------------------------------------------------------------")

    # Example with a non-existent file
    print("\nAnalyzing non-existent file...")
    non_existent_results = analyzer.analyze_audio_file("non_existent.wav")
    print("Non-existent file analysis results:", non_existent_results)
