export interface UserProfile {
  name: string;
  age: number;
  sex: string;
  height: number;
  weight: number;
  dominantHand: string;
}

export interface AnalysisModule {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  duration: number; // 0 = manual (voice)
  instructions: string[];
}

export const MODULES: AnalysisModule[] = [
  {
    id: "face_scan",
    name: "Face Scan",
    subtitle: "Cardio-Respiratory",
    description: "Remote photoplethysmography (rPPG) for heart rate, HRV, and respiratory rate extraction",
    duration: 45,
    instructions: [
      "Position your face in the center of the frame",
      "Maintain a neutral, relaxed expression",
      "Sit still — do not speak or move",
      "Ensure even lighting on your face",
    ],
  },
  {
    id: "body_scan",
    name: "Body Scan",
    subtitle: "Neuro-Motor",
    description: "Pose estimation for gait analysis — cadence, symmetry, stride length, and balance",
    duration: 45,
    instructions: [
      "Stand up and step back from the camera",
      "Ensure your full body is visible in the frame",
      "Walk naturally across the camera view",
      "Maintain your normal walking pace",
    ],
  },
  {
    id: "voice_scan",
    name: "Voice Scan",
    subtitle: "Audio Analysis",
    description: "Speech pathology indicators — jitter, shimmer, HNR, and phonation time",
    duration: 0,
    instructions: [
      "Ensure a quiet environment with minimal background noise",
      "When prompted, speak clearly and naturally",
      'Say: "The quick brown fox jumps over the lazy dog"',
      'Then sustain an "ahhh" sound as long as you can',
    ],
  },
  {
    id: "3d_face",
    name: "3D Face Scan",
    subtitle: "Structural Analysis",
    description: "Facial structure and symmetry assessment via multi-angle capture",
    duration: 45,
    instructions: [
      "Look directly at the camera",
      "Slowly turn your head to the left when prompted",
      "Return to center, then turn right",
      "Hold a neutral expression throughout",
    ],
  },
];

// Backend types
export interface BackendBiomarkers {
  heart_rate_bpm?: number | null;
  hrv_sdnn_ms?: number | null;
  hrv_rmssd_ms?: number | null;
  respiratory_rate_bpm?: number | null;
  spo2_estimate_pct?: number | null;
  ear_average?: number | null;
  ear_left?: number | null;
  ear_right?: number | null;
  blink_count?: number | null;
  blink_rate_per_min?: number | null;
  fatigue_score?: number | null;
  hydration_proxy_score?: number | null;
  alert_dehydration?: boolean;
  cadence_steps_per_min?: number | null;
  gait_symmetry_pct?: number | null;
  balance_score?: number | null;
  stride_length_cm?: number | null;
  velocity_cm_per_sec?: number | null;
  step_width_cm?: number | null;
  head_tilt_deg?: number | null;
  cervical_score?: number | null;
  thoracic_score?: number | null;
  pelvic_score?: number | null;
  dominant_tremor_hz?: number | null;
  tremor_amplitude?: number | null;
  tremor_severity?: string | null;
  jitter_pct?: number | null;
  shimmer_pct?: number | null;
  hnr_db?: number | null;
  mpt_sec?: number | null;
  f0_mean_hz?: number | null;
  f0_std_hz?: number | null;
  speech_rate_syl_per_sec?: number | null;
  pause_ratio?: number | null;
  audio_duration_sec?: number | null;
  facial_asymmetry_score?: number | null;
  stress_structural_score?: number | null;
  muscle_tone_imbalance_score?: number | null;
  emotional_load_baseline?: number | null;
  rppg_quality_score?: number;
  pulse_wave_samples?: number[];
  [key: string]: any;
}

export interface BackendRiskSignal {
  domain: string;
  label: string;
  risk_level: "low" | "moderate" | "high" | "unknown";
  probability: number;
  confidence_score: number;
  uncertainty_flags: string[];
  contributing_biomarkers: string[];
}

export interface BackendRiskReport {
  signals: BackendRiskSignal[];
  overall_wellness_score: number;
  data_completeness_pct: number;
}

export interface BackendResults {
  session_id: string;
  status: string;
  elapsed_sec?: number;
  frames_processed: number;
  biomarkers: BackendBiomarkers;
  risk_report: BackendRiskReport;
  pulse_wave_samples?: number[];
}

export interface LiveMetrics {
  session_id: string;
  status: string;
  elapsed_sec: number;
  frames_processed: number;
  heart_rate_bpm?: number | null;
  hrv_rmssd_ms?: number | null;
  spo2_estimate_pct?: number | null;
  respiratory_rate_bpm?: number | null;
  posture_score?: number | null;
  balance_score?: number | null;
  tremor_hz?: number | null;
  facial_asymmetry_score?: number | null;
  stress_structural_score?: number | null;
  pulse_wave_samples?: number[];
  rppg_quality_score?: number;
  warning?: string | null;
}

// Legacy types kept for backward compat
export type RiskLevel = "low" | "medium" | "high" | "uncertain";
export interface RiskSignals {
  cardiovascular: RiskLevel;
  respiratory: RiskLevel;
  neuroMotorGait: RiskLevel;
  neuroMotorFace: RiskLevel;
  speechPathology: RiskLevel;
}
export interface RiskStratification {
  signals: RiskSignals;
  confidence: number;
  uncertaintyFlags: string[];
}
export interface AnalysisResults {
  rppg: { bpm: number; hrv_sdnn: number; rr: number };
  gait: { status: string; cadence: number; symmetry: number; avgStrideLength: number; balanceStability: number };
  face: { asymmetryScore: number; eyeOpenness: number };
  voice: { mptSeconds: number; jitterPercent: number | null; shimmerPercent: number | null; hnrDb: number | null };
  risk: RiskStratification;
  timestamp: string;
}
