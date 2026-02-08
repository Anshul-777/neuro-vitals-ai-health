import { AnalysisResults } from "./types";
import { stratifyRisk } from "./riskStratifier";

export function generateResults(modules: string[]): AnalysisResults {
  const has = (id: string) => modules.includes(id);
  const rand = (min: number, max: number) =>
    Math.round((min + Math.random() * (max - min)) * 100) / 100;

  const raw: AnalysisResults = {
    rppg: {
      bpm: has("face_scan") ? Math.round(rand(62, 82)) : 0,
      hrv_sdnn: has("face_scan") ? Math.round(rand(28, 58)) : 0,
      rr: has("face_scan") ? Math.round(rand(13, 19)) : 0,
    },
    gait: {
      status: has("body_scan") ? "Analyzed" : "No Data",
      cadence: has("body_scan") ? Math.round(rand(92, 116)) : 0,
      symmetry: has("body_scan") ? Math.round(rand(78, 96)) : 0,
      avgStrideLength: has("body_scan") ? rand(0.55, 0.85) : 0,
      balanceStability: has("body_scan") ? Math.round(rand(72, 95)) : 0,
    },
    face: {
      asymmetryScore: has("3d_face") ? rand(0.02, 0.18) : 0,
      eyeOpenness: has("3d_face") ? rand(0.6, 0.95) : 0,
    },
    voice: {
      mptSeconds: has("voice_scan") ? rand(4, 12) : 0,
      jitterPercent: has("voice_scan") ? rand(0.2, 1.2) : null,
      shimmerPercent: has("voice_scan") ? rand(0.8, 3.8) : null,
      hnrDb: has("voice_scan") ? rand(14, 26) : null,
    },
    risk: {
      signals: {
        cardiovascular: "low",
        respiratory: "low",
        neuroMotorGait: "low",
        neuroMotorFace: "low",
        speechPathology: "low",
      },
      confidence: 0,
      uncertaintyFlags: [],
    },
    timestamp: new Date().toISOString(),
  };

  return stratifyRisk(raw);
}

export function generatePulseWaveData(bpm: number) {
  const data = [];
  const freq = (bpm || 72) / 60;
  for (let i = 0; i < 300; i++) {
    const t = i / 30;
    data.push({
      time: parseFloat(t.toFixed(2)),
      raw:
        Math.sin(2 * Math.PI * freq * t) * 0.7 +
        Math.sin(2 * Math.PI * freq * 2 * t) * 0.2 +
        (Math.random() - 0.5) * 0.3,
      filtered:
        Math.sin(2 * Math.PI * freq * t) * 0.8 +
        Math.sin(2 * Math.PI * freq * 2 * t) * 0.15,
    });
  }
  return data;
}
