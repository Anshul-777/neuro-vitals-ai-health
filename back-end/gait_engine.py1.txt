import cv2
import mediapipe as mp
import numpy as np
import time

class GaitAnalyzer:
    def __init__(self):
        self.pose = mp.solutions.pose.Pose(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils

        # Gait Metrics
        self.left_steps = [] # Horizontal stride distances for left leg
        self.right_steps = [] # Horizontal stride distances for right leg
        self.is_left_forward = False # To detect step initiation
        self.last_step_side = None

        # Cadence tracking
        self.step_times = [] # Timestamps of each detected step
        self.last_step_time = time.time()
        self.total_steps = 0

        # Balance tracking
        self.center_of_mass_y_history = [] # For vertical balance stability
        self.ankle_spread_history = [] # For lateral balance

        # Frame rate tracking for time-based metrics
        self.frame_times = []

    def calculate_distance(self, p1, p2):
        """Euclidean distance between two landmarks"""
        return np.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2)

    def get_body_height(self, landmarks):
        """Estimate body height using distance from head to heel"""
        head_point = landmarks[mp.solutions.pose.PoseLandmark.NOSE]
        # Using both heels and averaging to be robust
        left_heel = landmarks[mp.solutions.pose.PoseLandmark.LEFT_HEEL]
        right_heel = landmarks[mp.solutions.pose.PoseLandmark.RIGHT_HEEL]

        if left_heel.visibility > 0.5 and right_heel.visibility > 0.5:
            avg_heel_y = (left_heel.y + right_heel.y) / 2
            return abs(head_point.y - avg_heel_y)
        elif left_heel.visibility > 0.5:
            return abs(head_point.y - left_heel.y)
        elif right_heel.visibility > 0.5:
            return abs(head_point.y - right_heel.y)
        return 0.0

    def analyze_frame(self, frame):
        current_time = time.time()
        self.frame_times.append(current_time)
        if len(self.frame_times) > 300: # Keep ~10 seconds of frame times
            self.frame_times.pop(0)

        fps = 0
        if len(self.frame_times) > 1:
            fps = len(self.frame_times) / (self.frame_times[-1] - self.frame_times[0])

        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(image)

        analysis = {
            "status": "No Human Detected",
            "symmetry": 0.0,
            "cadence": 0.0,
            "avg_stride_length": 0.0,
            "balance_stability": 0.0
        }

        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            analysis["status"] = "Tracking"

            left_ankle = landmarks[mp.solutions.pose.PoseLandmark.LEFT_ANKLE]
            right_ankle = landmarks[mp.solutions.pose.PoseLandmark.RIGHT_ANKLE]
            left_hip = landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP]
            right_hip = landmarks[mp.solutions.pose.PoseLandmark.RIGHT_HIP]
            mid_hip_y = (left_hip.y + right_hip.y) / 2

            # Normalize metrics relative to body height
            body_height = self.get_body_height(landmarks)
            if body_height == 0: body_height = 1.0 # Avoid division by zero

            # --- Stride Length (Refined) ---
            # Use the x-difference between ankles when one leg is clearly forward
            # Normalize by body height for better representation of actual stride
            stride_x_diff = abs(left_ankle.x - right_ankle.x)
            if left_ankle.visibility > 0.5 and right_ankle.visibility > 0.5:
                current_stride_length_norm = stride_x_diff / body_height

                # Step detection logic: When one foot crosses the other significantly
                step_threshold = 0.05 # relative to screen width/height
                if (left_ankle.x < right_ankle.x - step_threshold) and self.last_step_side != 'left':
                    self.left_steps.append(current_stride_length_norm)
                    self.total_steps += 1
                    self.step_times.append(current_time)
                    self.last_step_side = 'left'
                elif (right_ankle.x < left_ankle.x - step_threshold) and self.last_step_side != 'right':
                    self.right_steps.append(current_stride_length_norm)
                    self.total_steps += 1
                    self.step_times.append(current_time)
                    self.last_step_side = 'right'

            # Keep only recent steps for analysis (e.g., last 20 steps)
            max_steps_for_avg = 20
            self.left_steps = self.left_steps[-max_steps_for_avg:]
            self.right_steps = self.right_steps[-max_steps_for_avg:]
            self.step_times = [t for t in self.step_times if current_time - t < 10] # Keep last 10 seconds of step times

            # Calculate average stride length
            all_strides = self.left_steps + self.right_steps
            if len(all_strides) > 0:
                analysis["avg_stride_length"] = np.mean(all_strides)

            # --- Cadence ---
            if len(self.step_times) > 1:
                time_window = self.step_times[-1] - self.step_times[0]
                if time_window > 0:
                    cadence_steps_in_window = len(self.step_times)
                    # Convert to steps per minute
                    analysis["cadence"] = (cadence_steps_in_window / time_window) * 60

            # --- Symmetry ---
            if len(self.left_steps) > 5 and len(self.right_steps) > 5:
                avg_left = np.mean(self.left_steps)
                avg_right = np.mean(self.right_steps)
                if max(avg_left, avg_right) > 0: # Avoid division by zero
                    analysis["symmetry"] = min(avg_left, avg_right) / max(avg_left, avg_right)
                    analysis["symmetry"] = round(analysis["symmetry"] * 100, 1)

            # --- Balance Stability (simplified) ---
            # Vertical movement of hip (approximation of COM stability)
            self.center_of_mass_y_history.append(mid_hip_y)
            self.center_of_mass_y_history = self.center_of_mass_y_history[-int(fps * 5):] # Last 5 seconds

            # Lateral ankle spread variation (indicator of base of support)
            if left_ankle.visibility > 0.5 and right_ankle.visibility > 0.5:
                self.ankle_spread_history.append(abs(left_ankle.x - right_ankle.x))
            self.ankle_spread_history = self.ankle_spread_history[-int(fps * 5):] # Last 5 seconds

            balance_score = 0.0
            if len(self.center_of_mass_y_history) > 10 and len(self.ankle_spread_history) > 10:
                # Lower std dev in COM_y means more stable vertical movement
                vertical_stability = 1 - np.std(self.center_of_mass_y_history)
                # Consistency in ankle spread (lower std dev is better)
                lateral_stability = 1 - np.std(self.ankle_spread_history)

                # Simple combination (can be weighted or more complex)
                balance_score = (vertical_stability + lateral_stability) / 2
                balance_score = max(0, min(1, balance_score)) # Clamp between 0 and 1
                analysis["balance_stability"] = round(balance_score * 100, 1) # As a percentage

            # Visuals
            self.mp_drawing.draw_landmarks(
                frame, results.pose_landmarks, mp.solutions.pose.POSE_CONNECTIONS)

        return frame, analysis

if __name__ == "__main__":
    analyzer = GaitAnalyzer()
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Error: Could not open video stream.")
        exit()

    print("Starting Gait Analysis. Press 'q' to quit.")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        annotated_frame, analysis_results = analyzer.analyze_frame(frame)

        # Display results on the frame
        cv2.putText(annotated_frame, f"Status: {analysis_results['status']}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(annotated_frame, f"Total Steps: {analyzer.total_steps}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(annotated_frame, f"Cadence: {analysis_results['cadence']:.1f} SPM", (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(annotated_frame, f"Avg Stride: {analysis_results['avg_stride_length']:.2f} (norm)", (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(annotated_frame, f"Symmetry: {analysis_results['symmetry']:.1f}%", (10, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(annotated_frame, f"Balance: {analysis_results['balance_stability']:.1f}%", (10, 180), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

        cv2.imshow('Gait Analysis', annotated_frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
