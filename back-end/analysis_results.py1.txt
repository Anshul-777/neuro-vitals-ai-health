
class AnalysisResults:
    def __init__(self):
        # rPPG Metrics
        self.bpm = 0.0
        self.hrv_sdnn = 0.0
        self.rr = 0.0

        # Gait Metrics
        self.gait_status = "No Data"
        self.gait_cadence = 0.0
        self.gait_symmetry = 0.0
        self.gait_avg_stride_length = 0.0
        self.gait_balance_stability = 0.0

        # Face Metrics (e.g., from face_analyzer)
        self.face_asymmetry_score = 0.0 # Placeholder, FaceAnalyzer needs to implement this
        self.face_eye_openness = 0.0    # Placeholder

        # Voice Metrics
        self.voice_mpt_seconds = 0.0
        self.voice_jitter_percent = None # Can be None if blocked
        self.voice_shimmer_percent = None # Can be None if blocked
        self.voice_hnr_db = None       # Can be None if blocked

        # Risk Stratification Results
        self.risk_signals = {
            'cardiovascular_risk': 'low',
            'respiratory_risk': 'low',
            'neuro_motor_gait_risk': 'low',
            'neuro_motor_face_risk': 'low',
            'speech_pathology_risk': 'low'
        }
        self.risk_confidence = 0.0
        self.risk_uncertainty_flags = []

    def to_dict(self):
        return {
            'rppg': {
                'bpm': self.bpm,
                'hrv_sdnn': self.hrv_sdnn,
                'rr': self.rr
            },
            'gait': {
                'status': self.gait_status,
                'cadence': self.gait_cadence,
                'symmetry': self.gait_symmetry,
                'avg_stride_length': self.gait_avg_stride_length,
                'balance_stability': self.gait_balance_stability
            },
            'face': {
                'asymmetry_score': self.face_asymmetry_score,
                'eye_openness': self.face_eye_openness
            },
            'voice': {
                'mpt_seconds': self.voice_mpt_seconds,
                'jitter_percent': self.voice_jitter_percent,
                'shimmer_percent': self.voice_shimmer_percent,
                'hnr_db': self.voice_hnr_db
            },
            'risk_stratification': {
                'risk_signals': self.risk_signals,
                'confidence': self.risk_confidence,
                'uncertainty_flags': self.risk_uncertainty_flags
            }
        }

if __name__ == '__main__':
    # Test the data structure
    results = AnalysisResults()
    results.bpm = 72.5
    results.gait_symmetry = 88.2
    results.risk_signals['cardiovascular_risk'] = 'medium'
    results.risk_confidence = 0.75
    results.risk_uncertainty_flags.append('voice_metrics_blocked')

    print("AnalysisResults object created with dummy data:")
    print(results.to_dict())
