
import cv2
import mediapipe as mp
import numpy as np
import time
import mediapipe.tasks as tasks
from mediapipe.tasks.python import vision
from processor import SignalProcessor # <--- Import SignalProcessor from new module

# --- CONFIGURATION ---
FOREHEAD_INDICES = [151, 9, 8, 107, 66, 69, 105, 104, 336]
BUFFER_SIZE = 150  # Store last 150 frames (approx 5 seconds of video)

class SignalExtractor:
    def __init__(self):
        # Define model path
        model_path = 'Neuro-VX/Backend/face_landmarker.task'

        base_options = tasks.BaseOptions(model_asset_path=model_path)
        options = vision.FaceLandmarkerOptions(
            base_options=base_options,
            num_faces=1,
            min_face_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.face_landmarker = vision.FaceLandmarker.create_from_options(options)
        self.processor = SignalProcessor() # <--- Initialize Processor

        # Removed self.cap = cv2.VideoCapture(0) as video capture is external

        # Sliding Window Buffers
        self.raw_rgb_signal = [] # Will now store (R, G, B) tuples
        self.times = []

        self.bpm_history = [] # To smooth out the result
        self.hrv_history = [] # To smooth out HRV
        self.rr_history = []  # To smooth out Respiratory Rate

        # New attributes to store signals for plotting
        self.raw_pulse_signal_for_plot = []
        self.filtered_pulse_signal_for_plot = []

        # Initialize latest metric values
        self.latest_bpm = 0.0
        self.latest_hrv = 0.0
        self.latest_rr = 0.0

    def get_roi_average(self, frame, landmarks):
        h, w, _ = frame.shape
        mask = np.zeros((h, w), dtype=np.uint8)
        points = []
        for landmark_point in landmarks:
            # face_landmarks is a list of NormalizedLandmark objects
            pt = landmark_point # access directly from the passed landmark
            points.append((int(pt.x * w), int(pt.y * h)))
        cv2.fillConvexPoly(mask, np.array(points), 255)

        # Get mean of ALL channels (Blue, Green, Red)
        mean_bgra = cv2.mean(frame, mask=mask)

        # OpenCV gives BGR, we want RGB order for consistency
        b, g, r = mean_bgra[0], mean_bgra[1], mean_bgra[2]

        return (r, g, b), points

    def process_frame(self, frame, face_landmarks):
        current_time = time.time()

        # Convert frame to MediaPipe Image format for drawing (no detection here)
        # Note: The frame is already RGB if coming from a MediaPipe pipeline before this module
        # Assuming `frame` is a BGR OpenCV image and `face_landmarks` are directly from MediaPipe detector result

        # The face_landmarks input to this method is already the processed landmarks list
        # from FaceAnalyzer.analyze_face, which is face_landmarker_result.face_landmarks[0]

        # CHANGED: Now gets a Tuple (r, g, b)
        rgb_tuple, roi_points = self.get_roi_average(frame, face_landmarks)

        # --- 1. SLIDING WINDOW LOGIC ---
        self.raw_rgb_signal.append(rgb_tuple) # Append tuple, now (R, G, B)
        self.times.append(current_time)

        # Keep only the last BUFFER_SIZE items
        if len(self.raw_rgb_signal) > BUFFER_SIZE:
            self.raw_rgb_signal.pop(0)
            self.times.pop(0)

        # --- 2. CALCULATE BPM, HRV, RR EVERY 10 FRAMES ---
        # We don't calc every single frame to save CPU
        if len(self.raw_rgb_signal) == BUFFER_SIZE and (len(self.raw_rgb_signal) % 10 == 0):
            # Calculate dynamic sampling rate
            dt = np.diff(self.times)
            fs = 1.0 / np.mean(dt) if len(dt) > 0 else 0.0

            # Run CHROM Algorithm to get pulse signal (raw signal for plot)
            pulse_signal = self.processor.chrom_method(self.raw_rgb_signal) if fs > 0 else []
            self.raw_pulse_signal_for_plot = pulse_signal.tolist() if isinstance(pulse_signal, np.ndarray) else []

            # Pass the full rgb_buffer to the updated processor
            bpm, hrv = self.processor.calculate_bpm_and_hrv(self.raw_rgb_signal, self.times)
            rr = self.processor.calculate_respiratory_rate(self.raw_rgb_signal, self.times)

            # Get the filtered signal for plotting from the processor (re-calculate if needed, or get directly)
            # For plotting, we'll use the 'clean_signal_hr' generated within calculate_bpm_and_hrv if possible.
            # Since calculate_bpm_and_hrv returns bpm, hrv, we need to extract the filtered signal specifically for plot.
            # Let's adjust processor.py to return the clean_signal_hr or re-create it here for simplicity.
            # For now, let's keep the current implementation and just use 'pulse_signal' as raw for plot and 'clean_signal_hr' as filtered for plot
            clean_signal_hr = self.processor.butter_bandpass_filter(pulse_signal, fs, self.processor.min_hz, self.processor.max_hz) if len(pulse_signal) > 0 else []
            self.filtered_pulse_signal_for_plot = clean_signal_hr.tolist() if isinstance(clean_signal_hr, np.ndarray) else []


            if bpm > 40 and bpm < 200: # Filter sanity check for BPM
                self.bpm_history.append(bpm)
                if len(self.bpm_history) > 10: self.bpm_history.pop(0)
                self.latest_bpm = np.mean(self.bpm_history)

            if hrv > 0: # Filter sanity check for HRV
                self.hrv_history.append(hrv)
                if len(self.hrv_history) > 10: self.hrv_history.pop(0)
                self.latest_hrv = np.mean(self.hrv_history)

            if rr > 5 and rr < 40: # Filter sanity check for RR (e.g., 5-40 breaths/min)
                self.rr_history.append(rr)
                if len(self.rr_history) > 10: self.rr_history.pop(0)
                self.latest_rr = np.mean(self.rr_history)

        return (self.latest_bpm, self.latest_hrv, self.latest_rr, roi_points, self.times, self.raw_pulse_signal_for_plot, self.filtered_pulse_signal_for_plot)

# Removed if __name__ == "__main__": block
