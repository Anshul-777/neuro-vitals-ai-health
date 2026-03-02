import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalysis } from "@/context/AnalysisContext";
import { MODULES } from "@/lib/types";
import { generateResults } from "@/lib/simulateResults";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scan, Activity, Mic, Box, AlertTriangle, Camera, MicIcon,
  Shield, CheckCircle, XCircle, ChevronRight, Volume2,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  face_scan: Scan, body_scan: Activity, voice_scan: Mic, "3d_face": Box,
};

const preTestInstructions: Record<string, { title: string; tips: string[] }> = {
  face_scan: {
    title: "Face Scan Preparation",
    tips: [
      "Ensure your face is well-lit with even, bright lighting — avoid backlighting",
      "Position your face in the center of the frame, 40–60 cm from camera",
      "Maintain a neutral, relaxed facial expression throughout",
      "Remove glasses or accessories that may obstruct your face",
      "Sit still and do not speak during the recording",
    ],
  },
  body_scan: {
    title: "Body Scan Preparation",
    tips: [
      "Stand up and step back 2–3 meters from the camera",
      "Ensure your full body is visible in frame",
      "Wear fitted clothing for better skeletal tracking",
      "Clear the walking path of obstacles",
      "Walk naturally at your normal pace when the scan begins",
    ],
  },
  voice_scan: {
    title: "Voice Scan Preparation",
    tips: [
      "Move to a quiet room with minimal background noise",
      "Position yourself 30–50 cm from the microphone",
      "Have a glass of water nearby — clear your throat beforehand",
      "You will speak a sentence and sustain a vowel sound",
      "Speak clearly at your natural volume",
    ],
  },
  "3d_face": {
    title: "3D Face Scan Preparation",
    tips: [
      "Ensure even lighting on your face from multiple directions",
      "Look directly at the camera to begin",
      "Slowly turn your head left, center, then right when prompted",
      "Maintain a neutral expression throughout",
      "Move slowly and smoothly — avoid jerky movements",
    ],
  },
};

type Phase = "notice" | "permission" | "scanning" | "processing";

const AnalysisPage = () => {
  const navigate = useNavigate();
  const { selectedModules, setResults } = useAnalysis();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const modulesRef = useRef(MODULES.filter((m) => selectedModules.includes(m.id)));
  const [moduleIndex, setModuleIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>("notice");
  const [instructionIndex, setInstructionIndex] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState<"pending" | "granted" | "denied">("pending");

  const modules = modulesRef.current;
  const current = modules[moduleIndex];
  const isVoiceOnly = selectedModules.length === 1 && selectedModules[0] === "voice_scan";
  const needsCamera = selectedModules.some((m) => ["face_scan", "body_scan", "3d_face"].includes(m));
  const needsMic = selectedModules.includes("voice_scan");
  const currentIsVoice = current?.id === "voice_scan";

  useEffect(() => {
    if (selectedModules.length === 0) navigate("/test-selection");
  }, [selectedModules, navigate]);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: needsCamera ? { facingMode: "user", width: 1280, height: 720 } : false,
        audio: needsMic,
      });
      streamRef.current = stream;
      if (videoRef.current && needsCamera) videoRef.current.srcObject = stream;
      setPermissionStatus("granted");
      setPhase("scanning");
    } catch {
      setPermissionStatus("denied");
    }
  };

  useEffect(() => {
    if (phase !== "scanning" || !current) return;
    setProgress(0);
    setInstructionIndex(0);

    const duration = current.duration * 1000;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      const idx = Math.min(Math.floor((elapsed / duration) * current.instructions.length), current.instructions.length - 1);
      setInstructionIndex(idx);
      if (pct >= 100) clearInterval(interval);
    }, 50);

    const completeTimeout = setTimeout(() => {
      if (moduleIndex >= modules.length - 1) {
        setPhase("processing");
        setTimeout(() => {
          const results = generateResults(selectedModules);
          setResults(results);
          const history = JSON.parse(localStorage.getItem("nvx_test_history") || "[]");
          history.unshift({
            id: Date.now().toString(),
            type: selectedModules.length === 4 ? "Full System Analysis" : "Individual Test",
            date: new Date().toISOString(),
            modules: modules.map((m) => m.name),
            riskLevel: results.risk.signals.cardiovascular,
          });
          localStorage.setItem("nvx_test_history", JSON.stringify(history));
          streamRef.current?.getTracks().forEach((t) => t.stop());
          navigate("/results");
        }, 2500);
      } else {
        setModuleIndex((prev) => prev + 1);
      }
    }, duration + 500);

    return () => { clearInterval(interval); clearTimeout(completeTimeout); };
  }, [moduleIndex, phase]);

  if (modules.length === 0) return null;

  const Icon = current ? iconMap[current.id] || Scan : Scan;

  // Pre-test Notice
  if (phase === "notice") {
    const isFullAnalysis = selectedModules.length === 4;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg rounded-2xl border border-border/50 bg-card p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {isFullAnalysis ? "Full System Analysis" : preTestInstructions[current?.id]?.title || "Preparation"}
              </h2>
              <p className="text-xs text-muted-foreground">Please review before proceeding</p>
            </div>
          </div>

          {isFullAnalysis ? (
            <div className="space-y-4 mb-8">
              <p className="text-sm text-muted-foreground leading-relaxed">
                This comprehensive analysis will run all 4 modules sequentially. Total time: ~{modules.reduce((s, m) => s + m.duration, 0)} seconds.
              </p>
              <div className="space-y-2">
                {modules.map((m) => {
                  const MIcon = iconMap[m.id] || Scan;
                  return (
                    <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <MIcon className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{m.name}</p>
                        <p className="text-[10px] text-muted-foreground">~{m.duration}s</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-xs text-warning">Ensure bright lighting, a quiet room, and enough space to walk.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 mb-8">
              {preTestInstructions[current?.id]?.tips.map((tip, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{tip}</p>
                </motion.div>
              ))}
            </div>
          )}

          <Button onClick={() => setPhase("permission")} className="w-full font-mono tracking-wider" size="lg">
            <ChevronRight className="h-4 w-4 mr-2" /> READY & BEGIN
          </Button>
        </motion.div>
      </div>
    );
  }

  // Permission Request
  if (phase === "permission") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-8 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-6">
            {isVoiceOnly ? <MicIcon className="h-8 w-8 text-primary" /> : <Camera className="h-8 w-8 text-primary" />}
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Permission Required</h2>
          <p className="text-sm text-muted-foreground mb-6">Neuro-Vitals needs access to perform the analysis:</p>
          <div className="space-y-3 mb-6">
            {needsCamera && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-left">
                <Camera className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Camera</p>
                  <p className="text-xs text-muted-foreground">For face, body, and 3D analysis</p>
                </div>
              </div>
            )}
            {needsMic && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-left">
                <MicIcon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Microphone</p>
                  <p className="text-xs text-muted-foreground">For voice and speech analysis</p>
                </div>
              </div>
            )}
          </div>

          {permissionStatus === "denied" && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-destructive" />
                <p className="text-sm font-medium text-destructive">Permission Denied</p>
              </div>
              <p className="text-xs text-muted-foreground">Please enable permissions in your browser settings.</p>
            </div>
          )}

          <Button onClick={requestPermissions} className="w-full font-mono tracking-wider" size="lg">
            {permissionStatus === "denied" ? "TRY AGAIN" : "GRANT ACCESS & START"}
          </Button>
          <button onClick={() => navigate("/test-selection")} className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors">
            Cancel and go back
          </button>
        </motion.div>
      </div>
    );
  }

  // Voice-only scanning UI
  if (currentIsVoice && !needsCamera) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border/50 px-6 py-3 flex-shrink-0">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-sm font-bold tracking-tight text-foreground">NEURO<span className="text-primary">—</span>VITALS</h1>
              <div className="h-4 w-px bg-border" />
              <span className="text-xs font-mono text-destructive animate-pulse">● REC</span>
            </div>
            <span className="text-xs font-mono text-muted-foreground">Voice Analysis</span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center">
            {/* Voice visualization */}
            <div className="relative w-48 h-48 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-primary/5 border-2 border-primary/20" />
              <motion.div
                className="absolute inset-4 rounded-full bg-primary/10 border border-primary/30"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-8 rounded-full bg-primary/15 border border-primary/40"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Volume2 className="h-12 w-12 text-primary" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-foreground mb-2">{current.name}</h3>
            <p className="text-sm text-muted-foreground mb-6">{current.subtitle}</p>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Progress</span>
                <span className="text-xs font-mono text-primary">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-2">
              {current.instructions.map((instr, i) => (
                <div key={i} className={`p-3 rounded-lg text-sm transition-all duration-300 ${i === instructionIndex ? "bg-primary/10 text-foreground border border-primary/20" : i < instructionIndex ? "text-muted-foreground/40" : "text-muted-foreground"}`}>
                  <span className="font-mono text-[10px] text-primary/60 mr-2">{i + 1}.</span>{instr}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border/30">
              <div className="flex items-center justify-center gap-2 text-[10px] text-warning/70 font-mono">
                <AlertTriangle className="h-3 w-3" />
                <span>Do not close this window during analysis</span>
              </div>
            </div>
          </motion.div>
        </main>

        {phase === "processing" && (
          <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-50">
            <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-primary font-mono text-sm tracking-wider">PROCESSING DATA...</p>
          </div>
        )}
      </div>
    );
  }

  // Camera-based scanning UI
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 px-6 py-3 flex-shrink-0 bg-card/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold tracking-tight text-foreground">NEURO<span className="text-primary">—</span>VITALS</h1>
            <div className="h-4 w-px bg-border" />
            <span className="text-xs font-mono text-destructive animate-pulse">● REC</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">Module {moduleIndex + 1} / {modules.length}</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Camera feed */}
        <div className="flex-1 relative bg-muted/30 flex items-center justify-center min-h-[400px] p-4">
          <div className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden border-2 border-primary/20 shadow-2xl bg-background">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />

            {/* Scan overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent"
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Corner brackets with glow */}
              <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-primary/50 rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-primary/50 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-primary/50 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-primary/50 rounded-br-lg" />
              {/* Vignette */}
              <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.3)" }} />
            </div>

            {/* Signal badge */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-mono border border-border/30">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-muted-foreground">Signal: Good</span>
            </div>

            {/* Module badge */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card/90 backdrop-blur px-4 py-2 rounded-full text-xs font-mono border border-border/30">
              <Icon className="h-4 w-4 text-primary" />
              <span className="text-foreground font-medium">{current?.name}</span>
            </div>
          </div>

          {/* Processing overlay */}
          {phase === "processing" && (
            <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-10 rounded-2xl">
              <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-primary font-mono text-sm tracking-wider">PROCESSING DATA...</p>
              <p className="text-muted-foreground text-xs">Running risk stratification</p>
            </div>
          )}
        </div>

        {/* Side panel */}
        {phase === "scanning" && current && (
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border/50 p-6 flex flex-col flex-shrink-0 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">{current.name}</h3>
                <p className="text-[10px] font-mono text-primary/70">{current.subtitle}</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Progress</span>
                <span className="text-xs font-mono text-primary">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>

            <div className="flex-1">
              <h4 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3">Instructions</h4>
              <div className="space-y-2">
                {current.instructions.map((instr, i) => (
                  <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg text-xs transition-all duration-300 ${i === instructionIndex ? "bg-primary/10 text-foreground border border-primary/20" : i < instructionIndex ? "text-muted-foreground/40" : "text-muted-foreground"}`}>
                    <span className="font-mono text-[10px] text-primary/60 mt-0.5">{i + 1}.</span>
                    <span>{instr}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/30">
              <div className="flex items-center gap-2 text-[10px] text-warning/70 font-mono">
                <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                <span>Do not close this window during analysis</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnalysisPage;
