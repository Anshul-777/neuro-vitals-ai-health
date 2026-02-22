import cv2
import mediapipe as mp
import mediapipe.tasks as tasks
from mediapipe.tasks.python import vision
import numpy as np
import os

class FaceAnalyzer:
    def __init__(self):
        model_path = 'Neuro-VX/Backend/face_landmarker.task'
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"MediaPipe Face Landmarker model not found at {model_path}")

        base_options = tasks.BaseOptions(model_asset_path=model_path)
        options = vision.FaceLandmarkerOptions(
            base_options=base_options,
            num_faces=1, # Analyze one face at a time
            min_face_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.detector = vision.FaceLandmarker.create_from_options(options)
        print("FaceAnalyzer initialized with MediaPipe Face Landmarker.")

    def analyze_face(self, image):
        # Convert the BGR image to RGB format for MediaPipe
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_image)

        detection_result = self.detector.detect(mp_image)

        if detection_result.face_landmarks:
            return detection_result.face_landmarks[0] # Return landmarks for the first detected face
        else:
            return None

    def draw_landmarks_on_image(self, image, face_landmarks):
        annotated_image = np.copy(image)
        if face_landmarks:
            for landmark in face_landmarks:
                x = int(landmark.x * image.shape[1])
                y = int(landmark.y * image.shape[0])
                cv2.circle(annotated_image, (x, y), 1, (0, 255, 0), -1) # Draw green circles
        return annotated_image


if __name__ == "__main__":
    analyzer = FaceAnalyzer()

    # Create a dummy image for testing
    test_image_path = os.path.join("Neuro-VX", "Backend", "test_face_image.png")
    os.makedirs(os.path.dirname(test_image_path), exist_ok=True)

    if not os.path.exists(test_image_path):
        # Generate a simple black image if no image exists
        dummy_image = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.putText(dummy_image, "No Test Image Found. Replace with an actual face image!",
                    (50, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.imwrite(test_image_path, dummy_image)
        print(f"Created a dummy image at {test_image_path}. Please replace it with an actual face image for testing.")
    
    # Use an actual image for proper testing. If you don't have one, the dummy will be used.
    sample_image = cv2.imread(test_image_path)

    if sample_image is None:
        print(f"Error: Could not load sample image from {test_image_path}")
    else:
        print(f"Analyzing image: {test_image_path}")
        landmarks = analyzer.analyze_face(sample_image)

        if landmarks:
            print("Face landmarks detected successfully!")
            # Draw landmarks and display
            annotated_image = analyzer.draw_landmarks_on_image(sample_image, landmarks)
            cv2.imshow('Face Analysis Result', annotated_image)
            cv2.waitKey(0)
            cv2.destroyAllWindows()
        else:
            print("No face detected in the sample image.")
