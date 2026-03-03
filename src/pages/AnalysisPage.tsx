import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalysis } from "@/context/AnalysisContext";
import { MODULES, LiveMetrics } from "@/lib/types";
import {
  checkHealth, captureFrame, createWebSocketUrl, analyzeVoice,
  convertBlobToWav, refreshRisk, getSessionResults, MODULE_BACKEND_MAP,
  getBackendModules, formatWarning,
} from "@/lib/backendApi";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scan, Activity, Mic, Box, Shield, CheckCircle, XCircle, ChevronRight,
  Volume2, Camera, MicIcon, AlertTriangle, Loader2, Wifi, WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const iconMap: Record<string, React.ElementType> = {
  face_scan: Scan, body_scan: Activity, voice_scan: Mic, "3d_face": Box,
};

const preTestTips: Record<string, string[]> = {
  face_scan: [
    "Ensure bright, even lighting on your face",
    "Position face 40–60 cm from camera",
    "Neutral expression, remain still",
    "Remove glasses if possible",
  ],
  body_scan: [
    "Stand up, step back 2–3 meters",
    "Full body must be visible in frame",
    "Walk naturally when scan begins",
    "Clear the path of obstacles",
  ],
  voice_scan: [
    "Move to a quiet room",
    "Position 30–50 cm from mic",
    "Speak clearly at natural volume",
    "Press Done when finished speaking",
  ],
  "3d_face": [
    "Even lighting from multiple angles",
    "Look directly at camera",
    "Slowly turn head when prompted",
    "Neutral expression throughout",
  ],
};

const readyTips: Record<string, string> = {
  face_scan: "Look directly at the camera",
  body_scan: "Ensure your full body is visible",
  voice_scan: "Prepare to speak clearly",
  "3d_face": "Center your face in frame",
};

type Phase = "notice" | "permission" | "ready" | "scanning" | "break" | "processing";

const AnalysisPage = () => {
  const navigate = useNavigate();
  const { selectedModules, setResults, setSessionId: setCtxSessionId } = useAnalysis();
  const [phase, setPhase] = useState<Phase>("notice");
  const [moduleIndex, setModuleIndex] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [breakCountdown, setBreakCountdown] = useState(5);
  const [liveMetrics, setLiveMetrics] = useState<Partial<LiveMetrics>>({});
  const [warning, setWarning] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<"pending" | "granted" | "denied">("pending");
  const [backendStatus, setBackendStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [voiceElapsed, setVoiceElapsed] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const sessionIdRef = useRef(crypto.randomUUID());
  const moduleIndexRef = useRef(moduleIndex);
  const isFirstWs = useRef(true);

  moduleIndexRef.current = moduleIndex;

  const modules = useMemo(() => MODULES.filter(m => selectedModules.includes(m.id)), [selectedModules]);
  const current = modules[moduleIndex];
  const currentIsVoice = current?.id === "voice_scan";
  const needsCamera = selectedModules.some(m => ["face_scan", "body_scan", "3d_face"].includes(m));
  const needsMic = selectedModules.includes("voice_scan");
  const backendModules = useMemo(() => getBackendModules(selectedModules), [selectedModules]);

  useEffect(() => {
    if (selectedModules.length === 0) navigate("/test-selection");
    setCtxSessionId(sessionIdRef.current);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wsRef.current?.close();
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      recorderRef.current?.state === "recording" && recorderRef.current?.stop();
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Ready countdown (3s)
  useEffect(() => {
    if (phase !== "ready") return;
    setCountdown(3);
    const iv = setInterval(() => {
      setCountdown(p => {
        if (p <= 1) { clearInterval(iv); setPhase("scanning"); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [phase, moduleIndex]);

  // Break countdown (5s)
  useEffect(() => {
    if (phase !== "break") return;
    setBreakCountdown(5);
    const iv = setInterval(() => {
      setBreakCountdown(p => {
        if (p <= 1) {
          clearInterval(iv);
          setModuleIndex(i => i + 1);
          setPhase("ready");
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [phase]);

  // Scanning phase
  useEffect(() => {
    if (phase !== "scanning" || !current) return;
    setElapsed(0);
    setWarning(null);
    setLiveMetrics({});
    frameCountRef.current = 0;

    if (currentIsVoice) {
      startVoiceRecording();
    } else {
      startCameraStreaming();
    }

    return () => {
      stopCameraStreaming();
    };
  }, [phase, moduleIndex]);

  // Camera test timer (45s)
  useEffect(() => {
    if (phase !== "scanning" || currentIsVoice || !current) return;
    const start = Date.now();
    const iv = setInterval(() => {
      const e = (Date.now() - start) / 1000;
      setElapsed(e);
      if (e >= 45) {
        clearInterval(iv);
        handleTestComplete();
      }
    }, 100);
    return () => clearInterval(iv);
  }, [phase, moduleIndex]);

  // Voice elapsed timer
  useEffect(() => {
    if (phase !== "scanning" || !currentIsVoice) return;
    setVoiceElapsed(0);
    const start = Date.now();
    const iv = setInterval(() => setVoiceElapsed((Date.now() - start) / 1000), 100);
    return () => clearInterval(iv);
  }, [phase, moduleIndex]);

  // Processing phase
  useEffect(() => {
    if (phase !== "processing") return;
    const fetchResults = async () => {
      await new Promise(r => setTimeout(r, 2000));
      try {
        const [riskRes, resultsRes] = await Promise.all([
          refreshRisk(sessionIdRef.current).catch(() => null),
          getSessionResults(sessionIdRef.current).catch(() => null),
        ]);
        const finalResults = {
          session_id: sessionIdRef.current,
          status: "complete",
          frames_processed: resultsRes?.frames_processed || 0,
          biomarkers: resultsRes?.biomarkers || {},
          risk_report: riskRes?.risk_report || resultsRes?.risk_report || { signals: [], overall_wellness_score: 50, data_completeness_pct: 0 },
          pulse_wave_samples: resultsRes?.biomarkers?.pulse_wave_samples || resultsRes?.pulse_wave_samples || [],
        };
        setResults(finalResults);
        // Save to history
        const history = JSON.parse(localStorage.getItem("nvx_test_history") || "[]");
        history.unshift({
          id: sessionIdRef.current,
          type: selectedModules.length === 4 ? "Full System Analysis" : "Individual Test",
          date: new Date().toISOString(),
          modules: modules.map(m => m.name),
          wellness: finalResults.risk_report.overall_wellness_score,
        });
        localStorage.setItem("nvx_test_history", JSON.stringify(history.slice(0, 50)));
        navigate("/results");
      } catch (err) {
        toast.error("Failed to fetch results. Please try again.");
        navigate("/dashboard");
      }
    };
    fetchResults();
  }, [phase]);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: needsCamera ? { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } : false,
        audio: needsMic || needsCamera,
      });
      streamRef.current = stream;
      setPermissionStatus("granted");
      setBackendStatus("connecting");
      const healthy = await checkHealth();
      if (healthy) {
        setBackendStatus("connected");
        setTimeout(() => setPhase("ready"), 500);
      } else {
        setBackendStatus("error");
      }
    } catch {
      setPermissionStatus("denied");
    }
  };

  const startCameraStreaming = () => {
    const ws = new WebSocket(createWebSocketUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      setWarning(null);
      sendFrame(ws, true);
      frameIntervalRef.current = window.setInterval(() => sendFrame(ws, false), 100);
    };

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        setLiveMetrics(data);
        if (data.warning) setWarning(formatWarning(data.warning));
        else setWarning(null);
        if (data.status === "test_complete") handleTestComplete();
      } catch {}
    };

    ws.onerror = () => {
      setWarning("Connection error — retrying...");
    };

    ws.onclose = () => {};
  };

  const sendFrame = (ws: WebSocket, isFirst: boolean) => {
    if (!videoRef.current || ws.readyState !== WebSocket.OPEN) return;
    const frame = captureFrame(videoRef.current);
    const payload: any = {
      frame_b64: frame,
      frame_index: frameCountRef.current++,
      timestamp_ms: Date.now(),
      module: MODULE_BACKEND_MAP[current?.id] || "face",
      session_id: sessionIdRef.current,
    };
    if (isFirst && isFirstWs.current) {
      payload.modules = backendModules;
      isFirstWs.current = false;
    }
    ws.send(JSON.stringify(payload));
  };

  const stopCameraStreaming = () => {
    if (frameIntervalRef.current) { clearInterval(frameIntervalRef.current); frameIntervalRef.current = null; }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    wsRef.current = null;
  };

  const startVoiceRecording = () => {
    if (!streamRef.current) return;
    const audioTracks = streamRef.current.getAudioTracks();
    if (audioTracks.length === 0) { toast.error("No microphone available"); return; }
    const audioStream = new MediaStream(audioTracks);
    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(audioStream);
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = async () => {
      const rawBlob = new Blob(chunks, { type: recorder.mimeType });
      toast.info("Processing voice recording...");
      try {
        let audioBlob: Blob;
        try { audioBlob = await convertBlobToWav(rawBlob); } catch { audioBlob = rawBlob; }
        await analyzeVoice(audioBlob, sessionIdRef.current);
        toast.success("Voice analysis complete");
      } catch (err) {
        console.error("Voice analysis failed:", err);
        toast.error("Voice analysis failed — continuing with other data");
      }
      if (moduleIndexRef.current >= modules.length - 1) setPhase("processing");
      else setPhase("break");
    };
    recorder.start();
    recorderRef.current = recorder;
  };

  const handleVoiceDone = () => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  };

  const handleTestComplete = useCallback(() => {
    stopCameraStreaming();
    if (moduleIndexRef.current >= modules.length - 1) setPhase("processing");
    else setPhase("break");
  }, [modules.length]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (modules.length === 0) return null;
  const Icon = current ? iconMap[current.id] || Scan : Scan;

  // ── NOTICE ───────────────────────────────────────────
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
              <h2 className="text-xl font-bold text-foreground">{isFullAnalysis ? "Full System Analysis" : preTestTips[current?.id] ? current.name + " Preparation" : "Preparation"}</h2>
              <p className="text-xs text-muted-foreground">Review instructions before proceeding</p>
            </div>
          </div>
          {isFullAnalysis ? (
            <div className="space-y-4 mb-8">
              <p className="text-sm text-muted-foreground">This comprehensive analysis runs all 4 modules sequentially with breaks between each test.</p>
              <div className="space-y-2">
                {modules.map(m => {
                  const MIcon = iconMap[m.id] || Scan;
                  return (
                    <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <MIcon className="h-4 w-4 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{m.name}</p>
                        <p className="text-[10px] text-muted-foreground">{m.duration > 0 ? `~${m.duration}s` : "Manual — press Done"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-xs text-warning flex items-center gap-2"><AlertTriangle className="h-3 w-3" /> Ensure bright lighting, a quiet room, and enough space to walk.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 mb-8">
              {(preTestTips[current?.id] || []).map((tip, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
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

  // ── PERMISSION ───────────────────────────────────────
  if (phase === "permission") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-8 shadow-xl text-center">
          {backendStatus === "connecting" ? (
            <>
              <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-6" />
              <h2 className="text-xl font-bold text-foreground mb-2">Connecting to Analysis Server</h2>
              <p className="text-sm text-muted-foreground mb-4">Waking up the backend — this may take up to 30 seconds on first use...</p>
              <div className="flex items-center justify-center gap-2 text-xs text-primary">
                <Wifi className="h-3 w-3 animate-pulse" /> Establishing connection
              </div>
            </>
          ) : backendStatus === "error" ? (
            <>
              <WifiOff className="h-12 w-12 text-destructive mx-auto mb-6" />
              <h2 className="text-xl font-bold text-foreground mb-2">Server Unavailable</h2>
              <p className="text-sm text-muted-foreground mb-6">The analysis server is currently unavailable. Please try again.</p>
              <Button onClick={() => { setBackendStatus("connecting"); checkHealth().then(ok => setBackendStatus(ok ? "connected" : "error")); }} className="w-full">
                Retry Connection
              </Button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-6">
                {needsCamera ? <Camera className="h-8 w-8 text-primary" /> : <MicIcon className="h-8 w-8 text-primary" />}
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Permission Required</h2>
              <p className="text-sm text-muted-foreground mb-6">Neuro-Vitals needs access to perform the analysis:</p>
              <div className="space-y-3 mb-6">
                {needsCamera && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-left">
                    <Camera className="h-5 w-5 text-primary" />
                    <div><p className="text-sm font-medium text-foreground">Camera</p><p className="text-xs text-muted-foreground">For face, body, and 3D analysis</p></div>
                  </div>
                )}
                {(needsMic || needsCamera) && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-left">
                    <MicIcon className="h-5 w-5 text-primary" />
                    <div><p className="text-sm font-medium text-foreground">Microphone</p><p className="text-xs text-muted-foreground">For voice and audio analysis</p></div>
                  </div>
                )}
              </div>
              {permissionStatus === "denied" && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
                  <div className="flex items-center gap-2 mb-1"><XCircle className="h-4 w-4 text-destructive" /><p className="text-sm font-medium text-destructive">Permission Denied</p></div>
                  <p className="text-xs text-muted-foreground">Enable permissions in browser settings and try again.</p>
                </div>
              )}
              <Button onClick={requestPermissions} className="w-full font-mono tracking-wider" size="lg">
                {permissionStatus === "denied" ? "TRY AGAIN" : "GRANT ACCESS & START"}
              </Button>
              <button onClick={() => navigate("/test-selection")} className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  // ── READY COUNTDOWN (3s) ─────────────────────────────
  if (phase === "ready") {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
            <Icon className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{current?.name}</h2>
          <p className="text-lg text-muted-foreground mb-2">Get Ready</p>
          <p className="text-sm text-primary/70 mb-12">{readyTips[current?.id] || ""}</p>
          <AnimatePresence mode="wait">
            <motion.div key={countdown} initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="text-9xl font-bold text-primary font-mono">
              {countdown}
            </motion.div>
          </AnimatePresence>
          <p className="mt-8 text-xs text-muted-foreground font-mono">Module {moduleIndex + 1} of {modules.length}</p>
        </motion.div>
      </div>
    );
  }

  // ── BREAK (5s) ───────────────────────────────────────
  if (phase === "break") {
    const nextMod = modules[moduleIndex + 1];
    const NextIcon = nextMod ? iconMap[nextMod.id] || Scan : Scan;
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
            <CheckCircle className="h-20 w-20 text-primary mx-auto mb-6" />
          </motion.div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Great Job!</h2>
          <p className="text-lg text-muted-foreground mb-8">{current?.name} Complete</p>
          {nextMod && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 mb-8 mx-auto max-w-xs">
              <NextIcon className="h-6 w-6 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Next: {nextMod.name}</p>
                <p className="text-xs text-muted-foreground">{nextMod.duration > 0 ? `~${nextMod.duration}s` : "Manual"}</p>
              </div>
            </div>
          )}
          <p className="text-sm text-muted-foreground mb-4">Starting in</p>
          <AnimatePresence mode="wait">
            <motion.div key={breakCountdown} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="text-7xl font-bold text-primary font-mono">
              {breakCountdown}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  // ── PROCESSING ───────────────────────────────────────
  if (phase === "processing") {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-muted" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full border-2 border-primary/30 border-b-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Analyzing Results</h2>
          <p className="text-sm text-muted-foreground mb-4">Running risk stratification across all biomarkers...</p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono text-primary">Processing</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── VOICE SCANNING ───────────────────────────────────
  if (currentIsVoice) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col z-50">
        <header className="border-b border-border/50 px-6 py-4 bg-card/80 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-destructive animate-pulse">● REC</span>
              <span className="font-mono text-sm font-bold text-foreground">{current.name}</span>
            </div>
            <span className="text-sm font-mono text-primary">{formatTime(voiceElapsed)}</span>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="relative w-56 h-56 mb-10">
            <div className="absolute inset-0 rounded-full bg-primary/5 border-2 border-primary/20" />
            <motion.div className="absolute inset-4 rounded-full bg-primary/10 border border-primary/30" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <motion.div className="absolute inset-10 rounded-full bg-primary/15 border border-primary/40" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }} />
            <motion.div className="absolute inset-16 rounded-full bg-primary/20 border border-primary/50" animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.6 }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Volume2 className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">Speak Now</h3>
          <p className="text-muted-foreground text-center max-w-md mb-3">Say: <span className="text-foreground font-medium">"The quick brown fox jumps over the lazy dog"</span></p>
          <p className="text-muted-foreground text-center max-w-md mb-8">Then sustain an <span className="text-foreground font-medium">"ahhh"</span> sound as long as you can</p>
          <Button onClick={handleVoiceDone} size="lg" className="px-12 py-6 text-lg font-mono tracking-widest rounded-2xl">
            <CheckCircle className="h-6 w-6 mr-3" /> DONE
          </Button>
          <p className="mt-6 text-xs text-muted-foreground font-mono">Module {moduleIndex + 1} of {modules.length}</p>
        </main>
      </div>
    );
  }

  // ── CAMERA SCANNING ──────────────────────────────────
  return (
    <div className="fixed inset-0 bg-background z-50">
      {/* Full screen video */}
      <video
        ref={(el) => {
          videoRef.current = el;
          if (el && streamRef.current) {
            el.srcObject = streamRef.current;
            el.play().catch(() => {});
          }
        }}
        autoPlay playsInline muted
        className="w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }}
      />

      {/* Scan line */}
      <motion.div
        className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent pointer-events-none"
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Corner brackets */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-6 left-6 w-16 h-16 border-l-3 border-t-3 border-primary/60 rounded-tl-xl" style={{ borderWidth: "3px 0 0 3px" }} />
        <div className="absolute top-6 right-6 w-16 h-16 border-r-3 border-t-3 border-primary/60 rounded-tr-xl" style={{ borderWidth: "3px 3px 0 0" }} />
        <div className="absolute bottom-6 left-6 w-16 h-16 border-l-3 border-b-3 border-primary/60 rounded-bl-xl" style={{ borderWidth: "0 0 3px 3px" }} />
        <div className="absolute bottom-6 right-6 w-16 h-16 border-r-3 border-b-3 border-primary/60 rounded-br-xl" style={{ borderWidth: "0 3px 3px 0" }} />
        <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 100px rgba(0,0,0,0.4)" }} />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 p-5 bg-gradient-to-b from-background/80 via-background/40 to-transparent pointer-events-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-mono text-destructive animate-pulse font-bold">● REC</span>
            <div className="flex items-center gap-2 bg-card/60 backdrop-blur-md px-4 py-2 rounded-full">
              <Icon className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground text-sm">{current?.name}</span>
            </div>
          </div>
          <div className="bg-card/60 backdrop-blur-md px-5 py-2 rounded-full">
            <span className="font-mono text-2xl font-bold text-primary">{formatTime(45 - elapsed)}</span>
          </div>
        </div>
      </div>

      {/* Warning banner */}
      <AnimatePresence>
        {warning && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-20 inset-x-6 p-4 rounded-xl bg-warning/20 backdrop-blur-md border border-warning/40 text-center pointer-events-none">
            <p className="text-sm font-medium text-warning flex items-center justify-center gap-2">
              <AlertTriangle className="h-4 w-4" /> {warning}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live metrics */}
      <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-background/90 via-background/50 to-transparent">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {liveMetrics.heart_rate_bpm != null && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card/60 backdrop-blur-md rounded-xl p-4 text-center border border-border/30">
                <p className="text-3xl font-bold text-primary font-mono">{Math.round(liveMetrics.heart_rate_bpm)}</p>
                <p className="text-xs text-muted-foreground mt-1">Heart Rate BPM</p>
              </motion.div>
            )}
            {liveMetrics.spo2_estimate_pct != null && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card/60 backdrop-blur-md rounded-xl p-4 text-center border border-border/30">
                <p className="text-3xl font-bold text-primary font-mono">{Math.round(liveMetrics.spo2_estimate_pct)}%</p>
                <p className="text-xs text-muted-foreground mt-1">SpO₂ Estimate</p>
              </motion.div>
            )}
            {liveMetrics.balance_score != null && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card/60 backdrop-blur-md rounded-xl p-4 text-center border border-border/30">
                <p className="text-3xl font-bold text-primary font-mono">{(liveMetrics.balance_score * 100).toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Balance</p>
              </motion.div>
            )}
          </div>
          {liveMetrics.rppg_quality_score != null && (
            <div className="flex items-center justify-center gap-3">
              <div className={`w-2 h-2 rounded-full ${(liveMetrics.rppg_quality_score || 0) > 0.3 ? "bg-primary animate-pulse" : "bg-warning"}`} />
              <span className="text-xs font-mono text-muted-foreground">Signal Quality: {((liveMetrics.rppg_quality_score || 0) * 100).toFixed(0)}%</span>
            </div>
          )}
          <p className="text-center text-xs font-mono text-muted-foreground mt-3">Module {moduleIndex + 1} of {modules.length} · {liveMetrics.frames_processed || 0} frames</p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;
