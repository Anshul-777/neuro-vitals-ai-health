
import cv2
import time
import numpy as np

# Import the modules
from face_analyzer import FaceAnalyzer
from rppg_extractor import SignalExtractor
from gait_engine import GaitAnalyzer
from risk_stratifier import RiskStratifier
from analysis_results import AnalysisResults # Import the new data structure
from ui_utils import create_rppg_plot_image # Import the plotting utility

if __name__ == "__main__":
    # 1. Initialize Webcam
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Error: Could not open video stream. Please check your webcam.")
        exit()

    print("Initializing Neuro-Vitals System...")

    # 2. Instantiate Analyzers
    try:
        face_analyzer = FaceAnalyzer()
        rppg_extractor = SignalExtractor()
        gait_analyzer = GaitAnalyzer()
        risk_stratifier = RiskStratifier() # Initialize RiskStratifier
    except FileNotFoundError as e:
        print(f"Initialization error: {e}. Make sure all model files are in Neuro-VX/Backend/")
        cap.release()
        cv2.destroyAllWindows()
        exit()

    # Instantiate AnalysisResults to store and pass data
    current_results = AnalysisResults()

    # Display messages and analysis status
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.7
    font_thickness = 2
    line_height = 30
    start_y_left = 30
    start_y_right = 30

    # UI layout parameters
    summary_x_offset = 10
    rppg_x_offset = 10
    gait_x_offset = 250 # Adjust as needed
    ai_x_offset = 500
    graph_placeholder_y = 400

    # Plot dimensions
    rppg_plot_width = 300
    rppg_plot_height = 200

    print("Neuro-Vitals System Ready. Press 'q' to quit.")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame.")
            break

        # Create a copy to draw on for different modules
        annotated_frame = frame.copy()
        frame_h, frame_w, _ = annotated_frame.shape

        # --- Face Analysis (for rPPG) --- (Processes frame once for all face-related modules)
        face_landmarks = face_analyzer.analyze_face(frame)

        # --- Gait Analysis ---
        gait_annotated_frame, gait_analysis_results = gait_analyzer.analyze_frame(frame)
        annotated_frame = gait_annotated_frame # Use the frame with gait annotations

        # Update current_results with gait metrics
        current_results.gait_status = gait_analysis_results['status']
        current_results.gait_cadence = gait_analysis_results['cadence']
        current_results.gait_symmetry = gait_analysis_results['symmetry']
        current_results.gait_avg_stride_length = gait_analysis_results['avg_stride_length']
        current_results.gait_balance_stability = gait_analysis_results['balance_stability']

        # --- rPPG Analysis ---
        rppg_plot_image = None # Initialize plot image to None
        if face_landmarks:
            latest_bpm, latest_hrv, latest_rr, roi_points, times, raw_pulse, filtered_pulse = \
                rppg_extractor.process_frame(frame, face_landmarks)

            # Draw rPPG ROI on the already gait-annotated frame
            if roi_points:
                cv2.polylines(annotated_frame, [np.array(roi_points)], True, (0, 255, 255), 2)

            # Update current_results with rPPG metrics
            current_results.bpm = latest_bpm
            current_results.hrv_sdnn = latest_hrv
            current_results.rr = latest_rr

            # Generate rPPG plot
            if len(raw_pulse) > 0 and len(times) > 0:
                rppg_plot_image = create_rppg_plot_image(
                    np.array(times) - times[0], # Relative time for plotting
                    raw_pulse,
                    filtered_pulse,
                    latest_bpm,
                    rppg_plot_width,
                    rppg_plot_height
                )
        else:
            # Reset rppg metrics if face not detected
            current_results.bpm = 0.0
            current_results.hrv_sdnn = 0.0
            current_results.rr = 0.0

        # --- Face Metrics (Placeholder for FaceAnalyzer output) ---
        # Assuming face_analyzer will eventually provide more metrics than just landmarks
        current_results.face_asymmetry_score = 0.0 # To be implemented in FaceAnalyzer
        current_results.face_eye_openness = 0.0   # To be implemented in FaceAnalyzer

        # --- Voice Metrics (Currently blocked, so use default None) ---
        # In a real system, a voice analysis module would be called here.
        # For now, we'll use the default None values in AnalysisResults.

        # --- Risk Stratification ---
        # Pass all collected metrics to the risk stratifier
        risk_assessment = risk_stratifier.stratify_risk(
            current_results.to_dict()['rppg'],
            current_results.to_dict()['gait'],
            current_results.to_dict()['voice'], # Will contain None for blocked metrics
            current_results.to_dict()['face']
        )
        current_results.risk_signals = risk_assessment['risk_signals']
        current_results.risk_confidence = risk_assessment['confidence']
        current_results.risk_uncertainty_flags = risk_assessment['uncertainty_flags']

        # --- UI Layout Drawing ---
        # Tier 1: Summary Scores
        # Left side: Gait Metrics
        cv2.putText(annotated_frame, "GAIT METRICS:", (rppg_x_offset, start_y_left), font, font_scale, (255, 255, 0), font_thickness)
        cv2.putText(annotated_frame, f"Status: {current_results.gait_status}", (rppg_x_offset, start_y_left + line_height), font, font_scale, (255, 255, 0), font_thickness)
        cv2.putText(annotated_frame, f"Cadence: {current_results.gait_cadence:.1f} SPM", (rppg_x_offset, start_y_left + 2 * line_height), font, font_scale, (255, 255, 0), font_thickness)
        cv2.putText(annotated_frame, f"Symmetry: {current_results.gait_symmetry:.1f}%", (rppg_x_offset, start_y_left + 3 * line_height), font, font_scale, (255, 255, 0), font_thickness)
        cv2.putText(annotated_frame, f"Balance: {current_results.gait_balance_stability:.1f}%", (rppg_x_offset, start_y_left + 4 * line_height), font, font_scale, (255, 255, 0), font_thickness)

        # Right side: rPPG Metrics
        cv2.putText(annotated_frame, "CARDIO/RESP METRICS:", (frame_w - 300, start_y_right), font, font_scale, (0, 255, 0), font_thickness)
        color_bpm = (0, 255, 0) if current_results.bpm > 0 else (0, 0, 255)
        cv2.putText(annotated_frame, f"BPM: {current_results.bpm:.1f}", (frame_w - 300, start_y_right + line_height), font, font_scale, color_bpm, font_thickness)
        color_hrv = (0, 255, 255) if current_results.hrv_sdnn > 0 else (0, 0, 255)
        cv2.putText(annotated_frame, f"HRV (SDNN): {current_results.hrv_sdnn:.1f}", (frame_w - 300, start_y_right + 2 * line_height), font, font_scale, color_hrv, font_thickness)
        color_rr = (255, 0, 255) if current_results.rr > 0 else (0, 0, 255)
        cv2.putText(annotated_frame, f"RR: {current_results.rr:.1f} bpm", (frame_w - 300, start_y_right + 3 * line_height), font, font_scale, color_rr, font_thickness)

        if not face_landmarks:
            cv2.putText(annotated_frame, "No Face Detected for rPPG", (frame_w - 300, start_y_right + 4 * line_height), font, font_scale * 0.8, (0, 0, 255), font_thickness -1)

        # Tier 1: Risk Signals (Bottom Left)
        risk_y = frame_h - (len(current_results.risk_signals) + 2) * line_height - rppg_plot_height - 20 # Adjust for plot
        cv2.putText(annotated_frame, "RISK ASSESSMENT:", (summary_x_offset, risk_y), font, font_scale, (255, 255, 255), font_thickness)
        for i, (risk_type, risk_level) in enumerate(current_results.risk_signals.items()):
            color = (0, 255, 0) if risk_level == 'low' else ((0, 255, 255) if risk_level == 'medium' else (0, 0, 255))
            cv2.putText(annotated_frame, f"{risk_type.replace('_',' ').title()}: {risk_level.upper()}", (summary_x_offset, risk_y + (i+1) * line_height), font, font_scale * 0.7, color, font_thickness - 1)
        cv2.putText(annotated_frame, f"Confidence: {current_results.risk_confidence:.2f}", (summary_x_offset, risk_y + (len(current_results.risk_signals) + 1) * line_height), font, font_scale * 0.7, (255, 255, 255), font_thickness - 1)
        if current_results.risk_uncertainty_flags:
            cv2.putText(annotated_frame, f"Uncertain: {', '.join(current_results.risk_uncertainty_flags)}", (summary_x_offset + 200, risk_y + (len(current_results.risk_signals) + 1) * line_height), font, font_scale * 0.7, (0, 0, 255), font_thickness - 1)


        # Tier 2: Interactive Graphs - rPPG Plot
        if rppg_plot_image is not None:
            # Define where to place the plot image. For example, below the rppg metrics.
            plot_start_x = frame_w - rppg_plot_width - 10
            plot_start_y = start_y_right + 4 * line_height + 20 # Below rppg metrics

            # Ensure the plot fits within the frame
            if plot_start_y + rppg_plot_height < frame_h and plot_start_x + rppg_plot_width < frame_w:
                annotated_frame[plot_start_y:plot_start_y+rppg_plot_height, plot_start_x:plot_start_x+rppg_plot_width] = rppg_plot_image
            else:
                cv2.putText(annotated_frame, "(rPPG plot area too small)", (plot_start_x, plot_start_y + rppg_plot_height // 2), font, font_scale * 0.6, (0, 0, 200), 1)

        # Tier 3: 3D Visualizations Placeholder
        cv2.putText(annotated_frame, "[3D Face/Skeleton Visualizations Placeholder]", (frame_w // 2 - 300, graph_placeholder_y + line_height), font, font_scale * 0.8, (100, 255, 100), 1)

        # AI Assistant and AI Summary Button Placeholders
        cv2.rectangle(annotated_frame, (frame_w - 200, frame_h - 100), (frame_w - 10, frame_h - 70), (50, 50, 50), -1)
        cv2.putText(annotated_frame, "AI Assistant", (frame_w - 180, frame_h - 78), font, font_scale * 0.7, (255, 255, 255), 1)

        cv2.rectangle(annotated_frame, (frame_w - 200, frame_h - 60), (frame_w - 10, frame_h - 30), (50, 50, 50), -1)
        cv2.putText(annotated_frame, "AI Summary Report", (frame_w - 190, frame_h - 38), font, font_scale * 0.7, (255, 255, 255), 1)

        # Display the combined frame
        cv2.imshow('Neuro-Vitals Live Analysis', annotated_frame)

        # Exit on 'q' key press
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # 3. Release resources
    cap.release()
    cv2.destroyAllWindows()
    print("Neuro-Vitals System Shutdown.")
