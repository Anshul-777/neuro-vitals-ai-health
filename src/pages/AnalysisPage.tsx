import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalysis } from "@/context/AnalysisContext";
import { MODULES } from "@/lib/types";
import { generateResults } from "@/lib/simulateResults";
import { Progress } from "@/components/ui/progress";
import { Scan, Activity, Mic, Box, AlertTriangle } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  face_scan: Scan,
  body_scan: Activity,
  voice_scan: Mic,
  "3d_face": Box,
};

const AnalysisPage = () => {
  const navigate = useNavigate();
  const { selectedModules, setResults } = useAnalysis();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const modulesRef = useRef(
    MODULES.filter((m) => selectedModules.includes(m.id))
  );
  const [moduleIndex, setModuleIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"scanning" | "processing">("scanning");
  const [instructionIndex, setInstructionIndex] = useState(0);

  const modules = modulesRef.current;
  const current = modules[moduleIndex];

  // Redirect if no modules
  useEffect(() => {
    if (selectedModules.length === 0) navigate("/test-selection");
  }, [selectedModules, navigate]);

  // Start camera
  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 1280, height: 720 },
          audio: true,
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera error:", err);
      }
    };
    init();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Module progress timer
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

      const idx = Math.min(
        Math.floor((elapsed / duration) * current.instructions.length),
        current.instructions.length - 1
      );
      setInstructionIndex(idx);

      if (pct >= 100) {
        clearInterval(interval);
      }
    }, 50);

    // Schedule next module or finalize
    const completeTimeout = setTimeout(() => {
      if (moduleIndex >= modules.length - 1) {
        // Finalize
        setPhase("processing");
        setTimeout(() => {
          const results = generateResults(selectedModules);
          setResults(results);
          streamRef.current?.getTracks().forEach((t) => t.stop());
          navigate("/results");
        }, 2500);
      } else {
        setModuleIndex((prev) => prev + 1);
      }
    }, duration + 500);

    return () => {
      clearInterval(interval);
      clearTimeout(completeTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleIndex, phase]);

  if (modules.length === 0) return null;

  const Icon = current ? iconMap[current.id] || Scan : Scan;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-3 flex-shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold tracking-tight text-foreground">
              NEURO<span className="text-primary">—</span>VITALS
            </h1>
            <div className="h-4 w-px bg-border" />
            <span className="text-xs font-mono text-destructive animate-pulse">
              ● REC
            </span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            Module {moduleIndex + 1} / {modules.length}
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Camera feed */}
        <div className="flex-1 relative bg-background flex items-center justify-center min-h-[400px]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />

          {/* Scan overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-scan-line" />
            <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-primary/30" />
            <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-primary/30" />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-primary/30" />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-primary/30" />
          </div>

          {/* Signal quality indicator */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur px-3 py-1.5 rounded-full text-xs font-mono">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-muted-foreground">Signal: Good</span>
          </div>

          {/* Processing overlay */}
          {phase === "processing" && (
            <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-10">
              <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-primary font-mono text-sm tracking-wider">
                PROCESSING DATA...
              </p>
              <p className="text-muted-foreground text-xs">
                Running risk stratification
              </p>
            </div>
          )}
        </div>

        {/* Side panel */}
        {phase === "scanning" && current && (
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border/50 p-6 flex flex-col flex-shrink-0">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">
                  {current.name}
                </h3>
                <p className="text-[10px] font-mono text-primary/70">
                  {current.subtitle}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Progress
                </span>
                <span className="text-xs font-mono text-primary">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>

            <div className="flex-1">
              <h4 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3">
                Instructions
              </h4>
              <div className="space-y-2">
                {current.instructions.map((instr, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 p-2.5 rounded-lg text-xs transition-all duration-300 ${
                      i === instructionIndex
                        ? "bg-primary/10 text-foreground border border-primary/20"
                        : i < instructionIndex
                        ? "text-muted-foreground/40"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span className="font-mono text-[10px] text-primary/60 mt-0.5">
                      {i + 1}.
                    </span>
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
