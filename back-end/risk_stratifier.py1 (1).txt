
import numpy as np

class RiskStratifier:
    def __init__(self):
        # Initialize any parameters or thresholds needed for risk calculation
        # These could be loaded from a config file or pre-trained models in a real application
        self.cardio_bpm_threshold_high = 100 # BPM > 100 might indicate tachycardia
        self.cardio_bpm_threshold_low = 50   # BPM < 50 might indicate bradycardia
        self.cardio_hrv_threshold_low = 20   # SDNN < 20ms might indicate lower HRV (stress/autonomic dysfunction)
        self.resp_rr_threshold_high = 20     # RR > 20 breaths/min might indicate tachypnea
        self.resp_rr_threshold_low = 10      # RR < 10 breaths/min might indicate bradypnea

        self.gait_symmetry_threshold_low = 80 # Symmetry < 80% might indicate asymmetry
        self.gait_balance_threshold_low = 70  # Balance < 70% might indicate instability
        self.gait_cadence_threshold_low = 90  # Cadence < 90 steps/min might indicate slow gait

        self.face_asymmetry_threshold_high = 0.15 # Higher values indicate more asymmetry

        self.voice_mpt_threshold_low = 3.0   # MPT < 3.0s might indicate vocal fatigue/impairment
        self.voice_jitter_threshold_high = 1.0 # Jitter > 1.0% often indicates vocal instability
        self.voice_shimmer_threshold_high = 3.5 # Shimmer > 3.5% often indicates vocal instability
        self.voice_hnr_threshold_low = 15    # HNR < 15dB often indicates breathy voice/noise

    def _assess_cardiovascular_risk(self, rppg_metrics):
        risk = 'low'
        reasons = []
        bpm = rppg_metrics.get('bpm', 0.0)
        hrv_sdnn = rppg_metrics.get('hrv_sdnn', 0.0)

        if bpm == 0.0 or hrv_sdnn == 0.0:
            return 'uncertain', ['insufficient_cardio_data']

        if bpm > self.cardio_bpm_threshold_high:
            risk = 'high'
            reasons.append('high_bpm')
        elif bpm < self.cardio_bpm_threshold_low and bpm > 0.1:
            risk = 'medium'
            reasons.append('low_bpm')

        if hrv_sdnn < self.cardio_hrv_threshold_low and hrv_sdnn > 0.1:
            if risk == 'low': risk = 'medium'
            if risk == 'medium': risk = 'high'
            reasons.append('low_hrv')

        return risk, reasons

    def _assess_respiratory_risk(self, rppg_metrics):
        risk = 'low'
        reasons = []
        rr = rppg_metrics.get('rr', 0.0)

        if rr == 0.0:
            return 'uncertain', ['insufficient_resp_data']

        if rr > self.resp_rr_threshold_high:
            risk = 'high'
            reasons.append('high_rr')
        elif rr < self.resp_rr_threshold_low and rr > 0.1:
            risk = 'medium'
            reasons.append('low_rr')

        return risk, reasons

    def _assess_gait_risk(self, gait_metrics):
        risk = 'low'
        reasons = []
        status = gait_metrics.get('status', 'No Human Detected')
        symmetry = gait_metrics.get('symmetry', 0.0)
        balance_stability = gait_metrics.get('balance_stability', 0.0)
        cadence = gait_metrics.get('cadence', 0.0)

        if status == 'No Human Detected' or symmetry == 0.0 or balance_stability == 0.0 or cadence == 0.0:
            return 'uncertain', ['insufficient_gait_data']

        if symmetry < self.gait_symmetry_threshold_low:
            risk = 'medium'
            reasons.append('gait_asymmetry')

        if balance_stability < self.gait_balance_threshold_low:
            if risk == 'low': risk = 'medium'
            reasons.append('gait_instability')

        if cadence < self.gait_cadence_threshold_low:
            if risk == 'low': risk = 'medium'
            reasons.append('low_cadence')

        return risk, reasons

    def _assess_face_risk(self, face_metrics):
        risk = 'low'
        reasons = []
        asymmetry_score = face_metrics.get('asymmetry_score', 0.0)

        if asymmetry_score == 0.0:
            return 'uncertain', ['no_face_asymmetry_data']

        if asymmetry_score > self.face_asymmetry_threshold_high:
            risk = 'medium'
            reasons.append('high_face_asymmetry')

        return risk, reasons

    def _assess_voice_risk(self, voice_metrics):
        risk = 'low'
        reasons = []
        mpt = voice_metrics.get('mpt_seconds')
        jitter = voice_metrics.get('jitter_percent')
        shimmer = voice_metrics.get('shimmer_percent')
        hnr = voice_metrics.get('hnr_db')

        uncertain_flags = []
        if mpt is None: uncertain_flags.append('mpt_unavailable')

        if jitter is None or shimmer is None or hnr is None:
            uncertain_flags.append('voice_metrics_blocked')

        if uncertain_flags:
            return 'uncertain', uncertain_flags

        if mpt is not None and mpt < self.voice_mpt_threshold_low:
            risk = 'medium'
            reasons.append('low_mpt')

        # Only assess jitter/shimmer/hnr if values are available (not None)
        if jitter is not None and jitter > self.voice_jitter_threshold_high:
            if risk == 'low': risk = 'medium'
            if risk == 'medium': risk = 'high'
            reasons.append('high_jitter')

        if shimmer is not None and shimmer > self.voice_shimmer_threshold_high:
            if risk == 'low': risk = 'medium'
            if risk == 'medium': risk = 'high'
            reasons.append('high_shimmer')

        if hnr is not None and hnr < self.voice_hnr_threshold_low:
            if risk == 'low': risk = 'medium'
            if risk == 'medium': risk == 'high'
            reasons.append('low_hnr')

        return risk, reasons

    def stratify_risk(self, rppg_metrics, gait_metrics, voice_metrics, face_metrics):
        risk_signals = {
            'cardiovascular_risk': 'low',
            'respiratory_risk': 'low',
            'neuro_motor_gait_risk': 'low',
            'neuro_motor_face_risk': 'low',
            'speech_pathology_risk': 'low'
        }
        uncertainty_flags = []
        total_confidence_points = 0
        available_modules = 0

        # Assess rPPG related risks
        cardio_risk, cardio_reasons = self._assess_cardiovascular_risk(rppg_metrics)
        if cardio_risk != 'uncertain':
            risk_signals['cardiovascular_risk'] = cardio_risk
            available_modules += 1
            if cardio_risk == 'low': total_confidence_points += 1
            elif cardio_risk == 'medium': total_confidence_points += 0.5
        else:
            uncertainty_flags.extend(cardio_reasons)

        resp_risk, resp_reasons = self._assess_respiratory_risk(rppg_metrics)
        if resp_risk != 'uncertain':
            risk_signals['respiratory_risk'] = resp_risk
            # Note: rppg is a single module for both cardio/resp, so don't double count available_modules
            if resp_risk == 'low': total_confidence_points += 1
            elif resp_risk == 'medium': total_confidence_points += 0.5
        else:
            uncertainty_flags.extend(resp_reasons)

        # Assess Gait related risks
        gait_risk, gait_reasons = self._assess_gait_risk(gait_metrics)
        if gait_risk != 'uncertain':
            risk_signals['neuro_motor_gait_risk'] = gait_risk
            available_modules += 1
            if gait_risk == 'low': total_confidence_points += 1
            elif gait_risk == 'medium': total_confidence_points += 0.5
        else:
            uncertainty_flags.extend(gait_reasons)

        # Assess Face related risks
        face_risk, face_reasons = self._assess_face_risk(face_metrics)
        if face_risk != 'uncertain':
            risk_signals['neuro_motor_face_risk'] = face_risk
            available_modules += 1
            if face_risk == 'low': total_confidence_points += 1
            elif face_risk == 'medium': total_confidence_points += 0.5
        else:
            uncertainty_flags.extend(face_reasons)

        # Assess Voice related risks
        voice_risk, voice_reasons = self._assess_voice_risk(voice_metrics)
        if voice_risk != 'uncertain':
            risk_signals['speech_pathology_risk'] = voice_risk
            available_modules += 1
            if voice_risk == 'low': total_confidence_points += 1
            elif voice_risk == 'medium': total_confidence_points += 0.5
        else:
            uncertainty_flags.extend(voice_reasons)

        # Calculate overall confidence
        max_possible_confidence_points = 5 # rppg (cardio/resp considered one), gait, face, voice
        confidence = total_confidence_points / max_possible_confidence_points
        confidence = round(confidence, 2)

        return {
            'risk_signals': risk_signals,
            'confidence': confidence,
            'uncertainty_flags': list(set(uncertainty_flags)) # Use set to remove duplicates
        }


if __name__ == "__main__":
    stratifier = RiskStratifier()

    print("--- Test Case 1: Healthy Metrics ---")
    dummy_rppg_metrics_healthy = {'bpm': 70.0, 'hrv_sdnn': 50.0, 'rr': 15.0}
    dummy_gait_metrics_healthy = {'status': 'Tracking', 'cadence': 110.0, 'symmetry': 95.0, 'avg_stride_length': 0.7, 'balance_stability': 90.0}
    dummy_voice_metrics_healthy = {'mpt_seconds': 5.0, 'jitter_percent': 0.5, 'shimmer_percent': 2.0, 'hnr_db': 25.0}
    dummy_face_metrics_healthy = {'asymmetry_score': 0.05, 'eye_openness': 0.8}

    results_healthy = stratifier.stratify_risk(dummy_rppg_metrics_healthy, dummy_gait_metrics_healthy, dummy_voice_metrics_healthy, dummy_face_metrics_healthy)
    print("Risk Signals:", results_healthy['risk_signals'])
    print("Confidence:", results_healthy['confidence'])
    print("Uncertainty Flags:", results_healthy['uncertainty_flags'])

    print("\n--- Test Case 2: Elevated Cardiovascular and Gait Risk ---")
    dummy_rppg_metrics_risk_cardio = {'bpm': 110.0, 'hrv_sdnn': 15.0, 'rr': 16.0}
    dummy_gait_metrics_risk_gait = {'status': 'Tracking', 'cadence': 80.0, 'symmetry': 70.0, 'avg_stride_length': 0.5, 'balance_stability': 60.0}
    dummy_voice_metrics_risk_voice = {'mpt_seconds': 2.0, 'jitter_percent': 1.5, 'shimmer_percent': 4.0, 'hnr_db': 10.0}
    dummy_face_metrics_risk_face = {'asymmetry_score': 0.2, 'eye_openness': 0.6}

    results_risk = stratifier.stratify_risk(dummy_rppg_metrics_risk_cardio, dummy_gait_metrics_risk_gait, dummy_voice_metrics_risk_voice, dummy_face_metrics_risk_face)
    print("Risk Signals:", results_risk['risk_signals'])
    print("Confidence:", results_risk['confidence'])
    print("Uncertainty Flags:", results_risk['uncertainty_flags'])

    print("\n--- Test Case 3: Incomplete Data / Blocked Voice Metrics ---")
    dummy_rppg_metrics_incomplete = {'bpm': 0.0, 'hrv_sdnn': 0.0, 'rr': 0.0}
    dummy_gait_metrics_incomplete = {'status': 'No Human Detected', 'cadence': 0.0, 'symmetry': 0.0, 'avg_stride_length': 0.0, 'balance_stability': 0.0}
    dummy_voice_metrics_blocked = {'mpt_seconds': 4.0, 'jitter_percent': None, 'shimmer_percent': None, 'hnr_db': None}
    dummy_face_metrics_no_data = {'asymmetry_score': 0.0, 'eye_openness': 0.0}

    results_incomplete = stratifier.stratify_risk(dummy_rppg_metrics_incomplete, dummy_gait_metrics_incomplete, dummy_voice_metrics_blocked, dummy_face_metrics_no_data)
    print("Risk Signals:", results_incomplete['risk_signals'])
    print("Confidence:", results_incomplete['confidence'])
    print("Uncertainty Flags:", results_incomplete['uncertainty_flags'])
