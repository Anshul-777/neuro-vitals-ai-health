import { AnalysisResults, RiskLevel } from "./types";

// Thresholds ported from risk_stratifier.py
const T = {
  bpmHigh: 100,
  bpmLow: 50,
  hrvLow: 20,
  rrHigh: 20,
  rrLow: 10,
  symmetryLow: 80,
  balanceLow: 70,
  cadenceLow: 90,
  asymmetryHigh: 0.15,
  mptLow: 3.0,
  jitterHigh: 1.0,
  shimmerHigh: 3.5,
  hnrLow: 15,
};

function cardio(bpm: number, hrv: number): RiskLevel {
  if (!bpm || !hrv) return "uncertain";
  if (bpm > T.bpmHigh) return "high";
  if (bpm < T.bpmLow || hrv < T.hrvLow) return "medium";
  return "low";
}

function respiratory(rr: number): RiskLevel {
  if (!rr) return "uncertain";
  if (rr > T.rrHigh) return "high";
  if (rr < T.rrLow) return "medium";
  return "low";
}

function gaitRisk(
  symmetry: number,
  balance: number,
  cadence: number
): RiskLevel {
  if (!symmetry && !balance && !cadence) return "uncertain";
  const flags = [
    symmetry > 0 && symmetry < T.symmetryLow,
    balance > 0 && balance < T.balanceLow,
    cadence > 0 && cadence < T.cadenceLow,
  ].filter(Boolean).length;
  if (flags >= 2) return "high";
  if (flags >= 1) return "medium";
  return "low";
}

function faceRisk(asymmetry: number): RiskLevel {
  if (!asymmetry) return "uncertain";
  if (asymmetry > T.asymmetryHigh) return "medium";
  return "low";
}

function speechRisk(
  mpt: number,
  jitter: number | null,
  shimmer: number | null,
  hnr: number | null
): RiskLevel {
  if (!mpt && jitter === null) return "uncertain";
  const flags = [
    mpt > 0 && mpt < T.mptLow,
    jitter !== null && jitter > T.jitterHigh,
    shimmer !== null && shimmer > T.shimmerHigh,
    hnr !== null && hnr < T.hnrLow,
  ].filter(Boolean).length;
  if (flags >= 2) return "high";
  if (flags >= 1) return "medium";
  return "low";
}

export function stratifyRisk(r: AnalysisResults): AnalysisResults {
  const flags: string[] = [];
  const signals = {
    cardiovascular: cardio(r.rppg.bpm, r.rppg.hrv_sdnn),
    respiratory: respiratory(r.rppg.rr),
    neuroMotorGait: gaitRisk(
      r.gait.symmetry,
      r.gait.balanceStability,
      r.gait.cadence
    ),
    neuroMotorFace: faceRisk(r.face.asymmetryScore),
    speechPathology: speechRisk(
      r.voice.mptSeconds,
      r.voice.jitterPercent,
      r.voice.shimmerPercent,
      r.voice.hnrDb
    ),
  };

  Object.entries(signals).forEach(([k, v]) => {
    if (v === "uncertain") flags.push(k);
  });

  const riskValues = Object.values(signals).filter((v) => v !== "uncertain");
  const confidence =
    riskValues.length > 0
      ? Math.round((riskValues.length / Object.keys(signals).length) * 100) /
        100
      : 0;

  return {
    ...r,
    risk: { signals, confidence, uncertaintyFlags: flags },
  };
}
