import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalysis } from "@/context/AnalysisContext";
import { MODULES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Play, Scan, Activity, Mic, Box, Clock, X, Info,
  Eye, Heart, Brain, Volume2, Shield,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  face_scan: Scan, body_scan: Activity, voice_scan: Mic, "3d_face": Box,
};

const learnMoreData: Record<string, { icon: React.ElementType; color: string; details: string[] }> = {
  face_scan: {
    icon: Heart,
    color: "text-primary",
    details: [
      "Remote Photoplethysmography (rPPG) Technology — This module uses your device camera to detect subtle color variations in your facial skin caused by blood flow. By analyzing the green channel of the RGB video feed, the system extracts physiological signals without any physical contact.",
      "Metrics Measured: Heart Rate (BPM), Heart Rate Variability (HRV as SDNN in milliseconds), and Respiratory Rate (breaths per minute).",
      "Clinical Relevance: rPPG has been validated against pulse oximetry with correlation exceeding 0.95. Abnormal resting HR (>100 BPM) or low HRV (<20ms) may indicate cardiovascular stress, autonomic dysfunction, or elevated health risk.",
      "Duration: ~10 seconds. Requirements: Even, bright lighting on your face. Neutral expression. Remain still and do not speak during the scan.",
    ],
  },
  body_scan: {
    icon: Activity,
    color: "text-primary",
    details: [
      "Pose Estimation & Gait Analysis — This module leverages MediaPipe's skeletal tracking to detect 33 body key points in real-time from your camera feed. It analyzes your walking pattern to extract neuro-motor indicators.",
      "Metrics Measured: Cadence (steps/minute), Gait Symmetry Index (%), Stride Length, and Dynamic Balance Stability (%).",
      "Clinical Relevance: Gait asymmetry below 80% may indicate neurological conditions such as early Parkinson's disease, peripheral neuropathy, or musculoskeletal dysfunction. Balance stability under 70% warrants further evaluation.",
      "Duration: ~12 seconds. Requirements: Full body must be visible in frame. Stand 2–3 meters from the camera. Walk naturally across the camera view at your normal pace.",
    ],
  },
  voice_scan: {
    icon: Volume2,
    color: "text-primary",
    details: [
      "Speech & Vocal Biomarker Analysis — This module captures audio through your device microphone and applies spectral analysis (librosa-based) to extract clinically relevant vocal parameters.",
      "Metrics Measured: Maximum Phonation Time (MPT in seconds), Jitter (frequency perturbation %), Shimmer (amplitude perturbation %), and Harmonics-to-Noise Ratio (HNR in dB).",
      "Clinical Relevance: MPT < 3 seconds, Jitter > 1%, or Shimmer > 3.5% may suggest vocal cord dysfunction, laryngeal pathology, or neurological speech disorders such as dysarthria.",
      "Duration: ~8 seconds. Requirements: Quiet environment with minimal background noise. Speak clearly when prompted. Sustain a vowel sound as long as possible.",
    ],
  },
  "3d_face": {
    icon: Box,
    color: "text-primary",
    details: [
      "3D Facial Structure Assessment — This module performs multi-angle facial geometry analysis using depth estimation from monocular video. It computes facial landmark positions across different head orientations.",
      "Metrics Measured: Facial Asymmetry Score and Eye Openness Ratio.",
      "Clinical Relevance: Asymmetry scores above 0.15 may indicate conditions such as Bell's palsy, stroke sequelae, or structural abnormalities. The analysis uses a dense face alignment network trained on 300,000+ facial scans.",
      "Duration: ~8 seconds. Requirements: Look directly at the camera. Slowly turn head left, center, then right when prompted. Maintain a neutral expression throughout.",
    ],
  },
};

const TestSelectionPage = () => {
  const navigate = useNavigate();
  const { selectedModules, setSelectedModules } = useAnalysis();
  const [selected, setSelected] = useState<string[]>(
    selectedModules.length > 0 ? selectedModules : MODULES.map((m) => m.id)
  );
  const [learnMoreId, setLearnMoreId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleStart = () => {
    if (selected.length === 0) return;
    setSelectedModules(selected);
    navigate("/analysis");
  };

  const totalTime = MODULES.filter((m) => selected.includes(m.id)).reduce((s, m) => s + m.duration, 0);
  const learnMod = learnMoreId ? MODULES.find((m) => m.id === learnMoreId) : null;
  const learnData = learnMoreId ? learnMoreData[learnMoreId] : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="h-4 w-px bg-border" />
          <span className="text-xs font-mono text-muted-foreground">MODULE SELECTION</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-2">Select Analysis Modules</h2>
          <p className="text-sm text-muted-foreground">Choose which biometric modules to include in this session.</p>
        </motion.div>

        <div className="grid gap-3 sm:grid-cols-2 mb-8">
          {MODULES.map((mod, idx) => {
            const Icon = iconMap[mod.id] || Scan;
            const isSelected = selected.includes(mod.id);
            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <button
                  onClick={() => toggle(mod.id)}
                  className={`w-full text-left p-5 rounded-xl border transition-all duration-200 ${
                    isSelected ? "border-primary/40 bg-primary/5" : "border-border/50 bg-card hover:border-border"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-foreground text-sm">{mod.name}</h3>
                        <Checkbox checked={isSelected} className="pointer-events-none" />
                      </div>
                      <p className="text-[11px] font-mono text-primary/70 mb-1">{mod.subtitle}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{mod.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 text-muted-foreground/60">
                          <Clock className="h-3 w-3" />
                          <span className="text-[10px] font-mono">~{mod.duration}s</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setLearnMoreId(mod.id); }}
                          className="text-[10px] font-medium text-primary hover:underline flex items-center gap-1"
                        >
                          <Info className="h-3 w-3" /> Learn More
                        </button>
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card"
        >
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{selected.length}</span> modules selected
            <span className="mx-2">·</span>Est. time: <span className="font-mono text-primary">{totalTime}s</span>
          </div>
          <Button onClick={handleStart} disabled={selected.length === 0} className="font-mono tracking-wider">
            <Play className="mr-2 h-4 w-4" /> START ANALYSIS
          </Button>
        </motion.div>
      </main>

      {/* Learn More Modal */}
      <AnimatePresence>
        {learnMoreId && learnMod && learnData && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setLearnMoreId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg rounded-2xl border border-border/50 bg-card p-6 shadow-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                    <learnData.icon className={`h-5 w-5 ${learnData.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{learnMod.name}</h3>
                    <p className="text-xs font-mono text-primary/70">{learnMod.subtitle}</p>
                  </div>
                </div>
                <button onClick={() => setLearnMoreId(null)} className="p-2 rounded-lg hover:bg-accent transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-4">
                {learnData.details.map((detail, i) => (
                  <p key={i} className="text-sm text-muted-foreground leading-relaxed">{detail}</p>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestSelectionPage;
