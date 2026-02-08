export interface UserProfile {
  name: string;
  age: number;
  sex: string;
  height: number;
  weight: number;
  dominantHand: string;
}

export interface RppgMetrics {
  bpm: number;
  hrv_sdnn: number;
  rr: number;
}

export interface GaitMetrics {
  status: string;
  cadence: number;
  symmetry: number;
  avgStrideLength: number;
  balanceStability: number;
}

export interface FaceMetrics {
  asymmetryScore: number;
  eyeOpenness: number;
}

export interface VoiceMetrics {
  mptSeconds: number;
  jitterPercent: number | null;
  shimmerPercent: number | null;
  hnrDb: number | null;
}

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
  rppg: RppgMetrics;
  gait: GaitMetrics;
  face: FaceMetrics;
  voice: VoiceMetrics;
  risk: RiskStratification;
  timestamp: string;
}

export interface AnalysisModule {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  duration: number;
  instructions: string[];
}

export const MODULES: AnalysisModule[] = [
  {
    id: "face_scan",
    name: "Face Scan",
    subtitle: "Cardio-Respiratory",
    description:
      "Remote photoplethysmography (rPPG) for heart rate, HRV, and respiratory rate extraction",
    duration: 10,
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
    description:
      "Pose estimation for gait analysis — cadence, symmetry, stride length, and balance",
    duration: 12,
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
    description:
      "Speech pathology indicators — jitter, shimmer, HNR, and phonation time",
    duration: 8,
    instructions: [
      "Ensure a quiet environment with minimal background noise",
      'When prompted, speak clearly and naturally',
      'Say: "The quick brown fox jumps over the lazy dog"',
      'Then sustain an "ahhh" sound as long as you can',
    ],
  },
  {
    id: "3d_face",
    name: "3D Face Scan",
    subtitle: "Structural Analysis",
    description:
      "Facial structure and symmetry assessment via multi-angle capture",
    duration: 8,
    instructions: [
      "Look directly at the camera",
      "Slowly turn your head to the left when prompted",
      "Return to center, then turn right",
      "Hold a neutral expression throughout",
    ],
  },
];
