
# Neuro-Vitals: Multi-Modal Digital Health Screening Platform

Neuro-Vitals is an innovative browser-based, non-invasive digital health screening and longitudinal monitoring platform. It utilizes a standard webcam and microphone to extract and correlate multi-modal biomarkers from a user's face, body, voice, and facial structure.

**Important Note:** Neuro-Vitals is designed as an AI-assisted screening and monitoring system and is **not a diagnostic replacement**. Consult with a healthcare professional for any medical concerns.

## Core Concept & Functionality

Neuro-Vitals aims to provide a comprehensive, holistic overview of an individual's physiological and psychological state by integrating data from various sensory inputs:

### Identity Management (Face-First Approach)
-   **Passive Facial Matching:** Upon landing, the system generates a passive facial embedding. This embedding is matched against stored identities to maintain accurate user profiles.
-   **Data Integrity:** Identity is solely based on facial biometrics. Different faces always create separate identities, even with the same name, preventing medical data contamination. Names serve as metadata only.

### User Flow
1.  **Landing Page:** User arrives at the platform.
2.  **Passive Face Match:** The system attempts to match the user's face with existing profiles.
3.  **Full Analysis Trigger:** A medical intake form (requesting name, age, sex, height, weight, dominant hand) is prompted only when the user selects "Full System Analysis." This form is skipped for partial tests.
4.  **Test Selection:** User chooses specific modules for analysis.
5.  **Module Execution:** Selected modules run, extracting relevant biomarkers.
6.  **Results Storage:** All generated results are securely stored under the identified user's profile.

### Key Modules & Biomarkers Extracted

1.  **Face (Cardio/Respiratory Biomarkers):**
    *   Utilizes rPPG (remote Photoplethysmography) technology by analyzing subtle color changes in the forehead and cheek regions, incorporating motion correction.
    *   **Outputs:** Heart Rate (HR), Heart Rate Variability (HRV), Respiratory Rate (RR), pulse wave features, and estimated SpO₂ and Blood Pressure surrogates (clearly labeled as estimates).

2.  **Body (Neuro-Motor Biomarkers):**
    *   Employs advanced pose estimation and 3D skeleton tracking.
    *   **Outputs:** Comprehensive gait analysis (stride length, cadence, symmetry, balance), tremor frequency, and posture assessment (cervical, thoracic, pelvic alignment).

3.  **Voice (Audio Biomarkers):**
    *   Analyzes voice characteristics from calibrated speech tasks.
    *   **Outputs:** Jitter (vocal pitch perturbation), Shimmer (vocal amplitude perturbation), Harmonics-to-Noise Ratio (HNR), and Maximum Phonation Time (MPT).

4.  **3D Face (Psychometric/Structural Biomarkers):**
    *   Constructs a monocular 3D face mesh to analyze facial structure.
    *   **Outputs:** Metrics for facial asymmetry, muscle tone imbalance, stress-related structural markers, and baseline emotional load.

### Risk Stratification Engine

-   This intelligent engine correlates patterns across all multi-modal modules (rather than relying on single metrics) to produce **probabilistic medical risk signals**. 
-   Each risk signal is presented with an associated **confidence score** and **uncertainty flags**, indicating the reliability and completeness of the assessment.

### Results User Interface (UI) Tiers

1.  **Tier 1: Summary Scores:** Provides an at-a-glance overview of key metrics and risk signals.
2.  **Tier 2: Interactive Graphs & 3D Visualizations:** Offers detailed insights through interactive graphs (e.g., rPPG waveforms, HRV plots, spectrograms) and dynamic 3D representations of the skeleton and face.
3.  **Tier 3: Embedded AI Assistant:** A context-aware AI assistant integrated directly into the page, automatically understanding and explaining current results without needing to open a separate chat.
4.  **Tier 4: AI Summary Button:** A feature to generate a comprehensive report combining current analysis results with historical data.

Neuro-Vitals provides a powerful, non-invasive tool for health screening and monitoring, leveraging cutting-edge AI and computer vision technologies to offer valuable insights into an individual's well-being.
