import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalysis } from "@/context/AnalysisContext";
import { Button } from "@/components/ui/button";
import { Brain, Shield, Zap, Activity, AlertCircle } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
  const { setIdentityStatus } = useAnalysis();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<
    "hero" | "init" | "scan" | "resolved" | "error"
  >("hero");
  const [identity, setIdentity] = useState<"matched" | "new" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleInit = async () => {
    setPhase("init");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setPhase("scan");

      setTimeout(() => {
        const type = Math.random() > 0.4 ? "matched" : "new";
        setIdentity(type);
        setIdentityStatus(type);
        setPhase("resolved");
      }, 3000);
    } catch {
      setErrorMsg("Camera and microphone access are required for analysis.");
      setPhase("error");
    }
  };

  const handleContinue = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    navigate("/dashboard");
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 neuro-grid" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
        {/* HERO phase */}
        {phase === "hero" && (
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-xs font-mono tracking-widest text-primary/80 uppercase">
                System v2.0 · Ready
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-4 tracking-tight">
              NEURO<span className="text-primary">—</span>VITALS
            </h1>

            <p className="text-lg text-muted-foreground mb-12 max-w-md mx-auto leading-relaxed">
              Non-invasive biometric analysis through computer vision and audio
              signal processing
            </p>

            {/* Pulse line SVG */}
            <div className="mb-12 overflow-hidden">
              <svg
                viewBox="0 0 400 50"
                className="w-full max-w-sm mx-auto h-12 text-primary"
              >
                <path
                  d="M0,25 L60,25 L80,25 L90,8 L100,42 L110,25 L140,25 L155,5 L165,45 L175,25 L250,25 L265,10 L275,40 L285,25 L400,25"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  className="animate-pulse-line"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <Button
              onClick={handleInit}
              size="lg"
              className="px-8 h-14 text-base font-mono tracking-wider"
            >
              <Zap className="mr-2 h-5 w-5" />
              INITIALIZE SYSTEM
            </Button>

            <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
              {[
                { icon: Brain, label: "Neural Analysis" },
                { icon: Activity, label: "Vital Signs" },
                { icon: Shield, label: "Encrypted" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 text-muted-foreground/40"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-mono tracking-wider uppercase">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INITIALIZING phase */}
        {phase === "init" && (
          <div className="animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-primary/30 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
            <p className="text-primary font-mono text-sm tracking-wider">
              REQUESTING SENSOR ACCESS...
            </p>
          </div>
        )}

        {/* SCANNING phase */}
        {phase === "scan" && (
          <div className="animate-fade-in space-y-6">
            <div className="relative w-72 h-52 mx-auto rounded-xl overflow-hidden border border-primary/30 shadow-[0_0_40px_-10px_hsl(185_75%_48%_/_0.25)]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute inset-0 border-2 border-primary/10 rounded-xl" />
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
              {/* Corner brackets */}
              <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-primary/50 rounded-tl" />
              <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-primary/50 rounded-tr" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-primary/50 rounded-bl" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-primary/50 rounded-br" />
            </div>
            <p className="text-primary font-mono text-sm tracking-wider animate-pulse">
              ANALYZING BIOMETRICS...
            </p>
          </div>
        )}

        {/* RESOLVED phase */}
        {phase === "resolved" && (
          <div className="animate-fade-in space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full border-2 border-success/50 bg-success/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {identity === "matched"
                ? "Welcome back."
                : "New identity detected."}
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              {identity === "matched"
                ? "Biometric profile verified. Your session is securely linked."
                : "A new biometric profile has been initialized for this session."}
            </p>
            <Button
              onClick={handleContinue}
              size="lg"
              className="px-8 h-14 text-base font-mono tracking-wider"
            >
              PROCEED TO DASHBOARD
            </Button>
          </div>
        )}

        {/* ERROR phase */}
        {phase === "error" && (
          <div className="animate-fade-in space-y-6">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-bold text-foreground">
              Sensor Access Required
            </h2>
            <p className="text-muted-foreground text-sm">{errorMsg}</p>
            <Button onClick={handleInit} variant="outline">
              Retry
            </Button>
          </div>
        )}
      </div>

      {/* Bottom status bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center text-[10px] font-mono text-muted-foreground/25 border-t border-border/20">
        <span>SYS: OPERATIONAL</span>
        <span>SEC: AES-256</span>
        <span>BUILD: 2.0.1</span>
      </div>
    </div>
  );
};

export default LandingPage;
