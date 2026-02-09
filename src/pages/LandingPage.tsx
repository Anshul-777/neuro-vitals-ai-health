import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  LogIn,
  UserPlus,
  ChevronDown,
  Heart,
  Activity,
  Mic,
  ScanFace,
  Brain,
  Shield,
  Fingerprint,
  Eye,
  BarChart3,
  LineChart,
  Bot,
  FileText,
  Sun,
  Moon,
  Stethoscope,
  Lock,
  Zap,
  Globe,
  Clock,
  Cpu,
  Database,
  Layers,
  AlertTriangle,
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const modules = [
  {
    icon: Heart,
    title: "Face — Cardio/Respiratory",
    desc: "rPPG technology analyzes subtle skin color changes to extract Heart Rate (BPM), Heart Rate Variability (HRV/SDNN), Respiratory Rate (RR), pulse wave features, and estimated SpO₂ and Blood Pressure surrogates — all from a standard webcam feed.",
    tech: "CHROM algorithm · 30fps sampling · ROI forehead/cheeks",
    color: "text-red-500",
    bgColor: "bg-red-500/10 border-red-500/20",
  },
  {
    icon: Activity,
    title: "Body — Neuro-Motor",
    desc: "Advanced pose estimation via MediaPipe Pose with 3D skeleton tracking measures gait analysis including stride length, cadence, left-right symmetry, balance stability score, tremor frequency detection, and posture assessment.",
    tech: "MediaPipe 3D landmarks · Gait cycle analysis · 33 keypoints",
    color: "text-emerald-600",
    bgColor: "bg-emerald-600/10 border-emerald-600/20",
  },
  {
    icon: Mic,
    title: "Voice — Audio Biomarkers",
    desc: "Calibrated speech analysis using librosa extracts Maximum Phonation Time (MPT), Jitter (pitch perturbation), Shimmer (amplitude perturbation), and Harmonics-to-Noise Ratio (HNR) from vocal recordings.",
    tech: "librosa DSP · Custom Jitter/Shimmer · 16kHz sampling",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: ScanFace,
    title: "3D Face — Psychometric",
    desc: "Monocular 3D face mesh construction with 468 landmarks analyzes facial asymmetry percentage, muscle tone imbalance, eye openness ratio, stress-related structural markers, and baseline emotional load indicators.",
    tech: "MediaPipe FaceMesh · 468 landmarks · Asymmetry scoring",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10 border-violet-500/20",
  },
];

const features = [
  {
    icon: Brain,
    title: "AI Risk Stratification",
    desc: "Cross-modal pattern correlation produces probabilistic medical risk signals with confidence scores and uncertainty flags. Evaluates cardiovascular, neurological, respiratory, and vocal health risks.",
  },
  {
    icon: Shield,
    title: "Biometric Identity",
    desc: "Face-first identity management ensures data integrity. Different faces always create separate profiles, preventing data contamination across sessions.",
  },
  {
    icon: Fingerprint,
    title: "Secure Authentication",
    desc: "Fingerprint or face verification via WebAuthn ensures only verified users access their health data. Platform authenticators for seamless login.",
  },
  {
    icon: Eye,
    title: "Non-Invasive Screening",
    desc: "Uses only a standard webcam and microphone — no wearables, no blood draws, no physical contact required. Completely passive data acquisition.",
  },
  {
    icon: Lock,
    title: "Privacy-First Architecture",
    desc: "Strict context separation prevents data leaks between identities. Session tokens are temporary and biometric data stays local to the device.",
  },
  {
    icon: Zap,
    title: "Real-Time Processing",
    desc: "Live feedback on environmental conditions — lighting quality, noise levels, and positioning — ensures optimal data capture for reliable results.",
  },
  {
    icon: Globe,
    title: "Browser-Based Platform",
    desc: "Runs entirely in the browser using getUserMedia APIs. No software installation required — works on any modern device with a camera and microphone.",
  },
  {
    icon: Clock,
    title: "Longitudinal Tracking",
    desc: "Historical data comparison across sessions enables trend detection. Monitor health biomarker changes over weeks, months, and years.",
  },
];

const steps = [
  { num: "01", title: "Biometric Login", desc: "Authenticate via fingerprint sensor or face recognition. Your identity is verified before accessing any health data. WebAuthn protocol ensures hardware-level security." },
  { num: "02", title: "Passive Face Match", desc: "The system generates a facial embedding to match against stored profiles, ensuring data continuity across sessions. No name required — biometric identity is the key." },
  { num: "03", title: "Medical Intake", desc: "Provide demographic context (name, age, sex, height, weight, dominant hand) only when running a full analysis. Partial tests skip this step entirely." },
  { num: "04", title: "Module Selection", desc: "Choose which analysis modules to run — Face, Body, Voice, or 3D Face — based on your screening needs. Hardware availability is auto-detected." },
  { num: "05", title: "Real-Time Analysis", desc: "Selected modules execute sequentially, extracting biomarkers from your camera and microphone feed with live quality indicators and progress tracking." },
  { num: "06", title: "AI-Powered Results", desc: "View multi-tiered results: summary scores with color-coded risk bands, interactive visualizations (rPPG waves, spectrograms, 3D models), embedded AI explanations, and exportable PDF reports." },
];

const tiers = [
  { icon: BarChart3, tier: "Tier 1", title: "Summary Scores", desc: "At-a-glance overview of key metrics and color-coded risk signals — green for optimal, yellow for caution, red for attention needed. No diagnostic claims." },
  { icon: LineChart, tier: "Tier 2", title: "Interactive Visualizations", desc: "Deep-dive with rPPG waveform replays, HRV Poincaré plots, audio spectrograms, interactive 3D skeleton with gait replay, and rotatable 468-point face mesh." },
  { icon: Bot, tier: "Tier 3", title: "Embedded AI Assistant", desc: "Context-aware AI that understands your current results. Ask questions directly — no need to re-explain your data. References specific charts and metrics." },
  { icon: FileText, tier: "Tier 4", title: "AI Summary Reports", desc: "Generate comprehensive reports combining current analysis with historical data. Structured output suitable for healthcare professionals. Export as PDF." },
];

const techStack = [
  { icon: Cpu, title: "Computer Vision", desc: "OpenCV, MediaPipe, rPPG CHROM algorithm for real-time physiological signal extraction from video." },
  { icon: Mic, title: "Audio DSP", desc: "librosa-powered speech analysis with custom implementations of Jitter, Shimmer, HNR, and MPT calculations." },
  { icon: Database, title: "Risk Engine", desc: "Rule-based risk stratifier correlates multi-modal metrics into probabilistic medical risk signals with confidence intervals." },
  { icon: Layers, title: "Full-Stack Architecture", desc: "React frontend → Node.js gateway (server.js) → Python backend modules. WebSocket streams for real-time data flow." },
];

const constraints = [
  "Not a diagnostic replacement — consult a healthcare professional for medical concerns",
  "Requires well-lit environment for accurate rPPG signal extraction",
  "Quiet room needed for reliable voice biomarker analysis",
  "Full body visibility required for gait and neuro-motor assessment",
  "Camera resolution affects 3D face mesh precision",
  "Results are probabilistic risk indicators, not clinical diagnoses",
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

const LandingPage = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("nvx_theme");
    return saved === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("nvx_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("nvx_theme", "light");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-background">
      {/* ═══════════ FIXED NAV ═══════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-extrabold tracking-tighter text-foreground">
            NEURO<span className="text-primary">—</span>VX
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="h-4 w-4 text-foreground" /> : <Moon className="h-4 w-4 text-foreground" />}
            </button>
            <Button onClick={() => navigate("/login")} variant="ghost" size="sm" className="font-mono text-xs tracking-wider">
              LOGIN
            </Button>
            <Button onClick={() => navigate("/register")} size="sm" className="font-mono text-xs tracking-wider">
              REGISTER
            </Button>
          </div>
        </div>
      </nav>

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${heroBg})` }} />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <div className="absolute inset-0 neuro-grid opacity-20" />

        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/8 blur-[120px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/6 blur-[100px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono tracking-[0.2em] text-primary uppercase">
              Multi-Modal Digital Health Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="text-6xl md:text-8xl font-extrabold text-foreground mb-6 tracking-tighter"
          >
            NEURO<span className="text-primary">—</span>VX
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed"
          >
            Non-invasive biometric health screening powered by computer vision,
            audio signal processing, and AI-driven risk stratification.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-sm text-muted-foreground/70 mb-3 max-w-xl mx-auto"
          >
            Extract Heart Rate, HRV, Respiratory Rate, Gait Metrics, Voice Biomarkers, and 3D Facial Analysis — all from a standard webcam and microphone.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-xs text-muted-foreground/50 mb-12 max-w-xl mx-auto italic"
          >
            Not a diagnostic replacement — consult a healthcare professional for medical concerns.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.9 }}
            className="mb-12 overflow-hidden"
          >
            <svg viewBox="0 0 400 50" className="w-full max-w-md mx-auto h-10 text-primary">
              <path
                d="M0,25 L60,25 L80,25 L90,8 L100,42 L110,25 L140,25 L155,5 L165,45 L175,25 L250,25 L265,10 L275,40 L285,25 L400,25"
                stroke="currentColor" strokeWidth="1.5" fill="none"
                className="animate-pulse-line" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button onClick={() => navigate("/login")} size="lg" className="px-8 h-14 text-base font-mono tracking-wider min-w-[200px]">
              <LogIn className="mr-2 h-5 w-5" /> LOGIN
            </Button>
            <Button onClick={() => navigate("/register")} size="lg" variant="outline" className="px-8 h-14 text-base font-mono tracking-wider min-w-[200px] border-primary/30 hover:bg-primary/10">
              <UserPlus className="mr-2 h-5 w-5" /> REGISTER
            </Button>
          </motion.div>
        </div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ChevronDown className="h-6 w-6 text-muted-foreground/40" />
        </motion.div>
      </section>

      {/* ═══════════ CORE MODULES ═══════════ */}
      <section className="relative py-24 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <span className="text-xs font-mono tracking-[0.2em] text-primary/70 uppercase mb-4 block">Core Modules</span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Multi-Modal Biomarker Extraction</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Four specialized analysis modules work in concert, each extracting distinct biomarkers from different sensory inputs using computer vision and audio processing.</p>
          </motion.div>

          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-2 gap-6">
            {modules.map((m) => (
              <motion.div key={m.title} variants={item} className="group p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-500">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg ${m.bgColor} border flex items-center justify-center flex-shrink-0`}>
                    <m.icon className={`h-6 w-6 ${m.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{m.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-2">{m.desc}</p>
                    <p className="text-[11px] font-mono text-primary/60 tracking-wide">{m.tech}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ PLATFORM FEATURES ═══════════ */}
      <section className="relative py-24 px-6 bg-muted/30">
        <div className="absolute inset-0 neuro-grid opacity-10" />
        <div className="relative max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <span className="text-xs font-mono tracking-[0.2em] text-primary/70 uppercase mb-4 block">Platform Capabilities</span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Intelligent Health Monitoring</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Built for privacy, precision, and accessibility — Neuro-VX combines cutting-edge AI with browser-native technologies.</p>
          </motion.div>

          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <motion.div key={f.title} variants={item} className="text-center p-6 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-md transition-all duration-500">
                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ TECHNOLOGY STACK ═══════════ */}
      <section className="relative py-24 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <span className="text-xs font-mono tracking-[0.2em] text-primary/70 uppercase mb-4 block">Under The Hood</span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Technology Stack</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Built on proven scientific algorithms and production-grade frameworks.</p>
          </motion.div>

          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((t) => (
              <motion.div key={t.title} variants={item} className="p-6 rounded-xl border border-border bg-card hover:border-primary/20 transition-all duration-500">
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <t.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{t.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ WORKFLOW ═══════════ */}
      <section className="relative py-24 px-6 bg-muted/30">
        <div className="absolute inset-0 neuro-grid opacity-10" />
        <div className="relative max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <span className="text-xs font-mono tracking-[0.2em] text-primary/70 uppercase mb-4 block">User Flow</span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">A streamlined 6-step workflow from biometric authentication to comprehensive health insights.</p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />
            {steps.map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`relative flex items-start gap-6 mb-12 md:w-1/2 ${idx % 2 === 0 ? "md:pr-12 md:ml-0" : "md:pl-12 md:ml-auto md:text-left"}`}
              >
                <div className={`absolute ${idx % 2 === 0 ? "left-6 md:left-auto md:right-0 md:translate-x-1/2" : "left-6 md:left-0 md:-translate-x-1/2"} top-1 w-3 h-3 rounded-full bg-primary border-2 border-background z-10`} />
                <div className="ml-12 md:ml-0">
                  <span className="text-xs font-mono text-primary/60 tracking-widest">{step.num}</span>
                  <h3 className="text-lg font-semibold text-foreground mt-1 mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ RESULTS TIERS ═══════════ */}
      <section className="relative py-24 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <span className="text-xs font-mono tracking-[0.2em] text-primary/70 uppercase mb-4 block">Results Interface</span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Multi-Tiered Results</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Complex health data rendered in layers of increasing depth, from quick summary to AI-powered explanations.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((t, idx) => (
              <motion.div key={t.tier} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 }} className="relative p-6 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-md transition-all duration-500 group">
                <div className="absolute top-4 right-4 text-[10px] font-mono text-primary/40 tracking-widest uppercase">{t.tier}</div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <t.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{t.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CONSTRAINTS & DISCLAIMERS ═══════════ */}
      <section className="relative py-24 px-6 bg-muted/30">
        <div className="absolute inset-0 neuro-grid opacity-10" />
        <div className="relative max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <span className="text-xs font-mono tracking-[0.2em] text-primary/70 uppercase mb-4 block">Important Notes</span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Constraints & Disclaimers</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Understanding the limitations ensures you get the most accurate and meaningful results from the platform.</p>
          </motion.div>

          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-4">
            {constraints.map((c, idx) => (
              <motion.div key={idx} variants={item} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{c}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ MEDICAL DISCLAIMER ═══════════ */}
      <section className="relative py-16 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="p-8 rounded-2xl border border-destructive/20 bg-destructive/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Medical Disclaimer</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Neuro-VX is a research and screening tool. It does not provide clinical diagnoses. All results are probabilistic risk indicators derived from biomarker analysis. Always consult a qualified healthcare professional for medical advice, diagnosis, or treatment. Do not disregard professional medical advice or delay seeking treatment based on information provided by this platform.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ FOOTER / CTA ═══════════ */}
      <section className="relative py-24 px-6 bg-muted/30 border-t border-border">
        <div className="absolute inset-0 neuro-grid opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Begin Your Health Screening</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Create an account or log in with biometric verification to access the full Neuro-VX platform.</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button onClick={() => navigate("/login")} size="lg" className="px-8 h-14 text-base font-mono tracking-wider min-w-[200px]">
                <LogIn className="mr-2 h-5 w-5" /> LOGIN
              </Button>
              <Button onClick={() => navigate("/register")} size="lg" variant="outline" className="px-8 h-14 text-base font-mono tracking-wider min-w-[200px] border-primary/30 hover:bg-primary/10">
                <UserPlus className="mr-2 h-5 w-5" /> REGISTER
              </Button>
            </div>
          </motion.div>

          <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground/40 border-t border-border pt-6">
            <span>NEURO—VX v2.0</span>
            <span>NOT A DIAGNOSTIC TOOL</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
