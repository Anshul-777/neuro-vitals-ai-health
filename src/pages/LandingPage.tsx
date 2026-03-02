import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  LogIn, UserPlus, ChevronDown, Heart, Activity, Mic, ScanFace, Brain,
  Shield, Eye, Lock, Zap, Globe, Clock, Cpu, Database, Layers,
  AlertTriangle, Stethoscope, Sun, Moon, BarChart3, LineChart, Bot, FileText,
  ArrowRight, CheckCircle, Sparkles,
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const modules = [
  { icon: Heart, title: "Face — Cardio/Respiratory", desc: "rPPG technology analyzes subtle skin color changes to extract Heart Rate, HRV, and Respiratory Rate from a standard webcam.", tech: "CHROM algorithm · 30fps · ROI forehead/cheeks", color: "text-red-500", bgColor: "bg-red-500/10 border-red-500/20" },
  { icon: Activity, title: "Body — Neuro-Motor", desc: "MediaPipe Pose with 3D skeleton tracking measures gait, stride, cadence, symmetry, and balance stability.", tech: "MediaPipe 3D · Gait cycle · 33 keypoints", color: "text-emerald-600", bgColor: "bg-emerald-600/10 border-emerald-600/20" },
  { icon: Mic, title: "Voice — Audio Biomarkers", desc: "Speech analysis extracts Maximum Phonation Time, Jitter, Shimmer, and Harmonics-to-Noise Ratio from vocal recordings.", tech: "librosa DSP · Jitter/Shimmer · 16kHz", color: "text-amber-500", bgColor: "bg-amber-500/10 border-amber-500/20" },
  { icon: ScanFace, title: "3D Face — Psychometric", desc: "468-landmark face mesh analyzes facial asymmetry, muscle tone, eye openness, and structural stress markers.", tech: "FaceMesh · 468 landmarks · Asymmetry scoring", color: "text-violet-500", bgColor: "bg-violet-500/10 border-violet-500/20" },
];

const features = [
  { icon: Brain, title: "AI Risk Stratification", desc: "Cross-modal pattern correlation produces probabilistic medical risk signals with confidence scores." },
  { icon: Shield, title: "Privacy-First", desc: "Data processed locally on your device. No raw video/audio stored. Metrics encrypted and under your control." },
  { icon: Eye, title: "Non-Invasive", desc: "Uses only a standard webcam and microphone — no wearables, no blood draws, no physical contact." },
  { icon: Zap, title: "Real-Time Processing", desc: "Live feedback on environmental conditions ensures optimal data capture for reliable results." },
  { icon: Globe, title: "Browser-Based", desc: "Runs entirely in the browser. No software installation — works on any modern device." },
  { icon: Clock, title: "Longitudinal Tracking", desc: "Historical data comparison across sessions enables trend detection over time." },
];

const steps = [
  { num: "01", title: "Create Account", desc: "Register with your details and create a secure account to store your health data." },
  { num: "02", title: "Medical Intake", desc: "Provide demographic context for full analysis — age, sex, height, weight, dominant hand." },
  { num: "03", title: "Module Selection", desc: "Choose which analysis modules to run based on your screening needs." },
  { num: "04", title: "Real-Time Analysis", desc: "Selected modules execute sequentially with live quality indicators and progress tracking." },
  { num: "05", title: "AI-Powered Results", desc: "View summary scores, interactive visualizations, risk assessment, and downloadable reports." },
];

const stats = [
  { value: "4", label: "Analysis Modules" },
  { value: "5", label: "Risk Domains" },
  { value: "468", label: "Facial Landmarks" },
  { value: "<60s", label: "Full Analysis" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

const LandingPage = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("nvx_theme") === "dark");

  useEffect(() => {
    if (darkMode) { document.documentElement.classList.add("dark"); localStorage.setItem("nvx_theme", "dark"); }
    else { document.documentElement.classList.remove("dark"); localStorage.setItem("nvx_theme", "light"); }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-extrabold tracking-tighter text-foreground">NEURO<span className="text-primary">—</span>VX</span>
          <div className="hidden md:flex items-center gap-6">
            <a href="#modules" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Modules</a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setDarkMode(!darkMode)} className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center hover:bg-accent transition-colors">
              {darkMode ? <Sun className="h-4 w-4 text-foreground" /> : <Moon className="h-4 w-4 text-foreground" />}
            </button>
            <Button onClick={() => navigate("/login")} variant="ghost" size="sm" className="font-mono text-xs tracking-wider">LOGIN</Button>
            <Button onClick={() => navigate("/register")} size="sm" className="font-mono text-xs tracking-wider">REGISTER</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${heroBg})` }} />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <div className="absolute inset-0 neuro-grid opacity-20" />
        <motion.div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/8 blur-[120px]" animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 6, repeat: Infinity }} />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono tracking-[0.2em] text-primary uppercase">Multi-Modal Digital Health Platform</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.4 }} className="text-6xl md:text-8xl font-extrabold text-foreground mb-6 tracking-tighter">
            NEURO<span className="text-primary">—</span>VX
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
            Non-invasive biometric health screening powered by computer vision, audio signal processing, and AI-driven risk stratification.
          </motion.p>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.7 }} className="text-sm text-muted-foreground/70 mb-8 max-w-xl mx-auto">
            Extract Heart Rate, HRV, Respiratory Rate, Gait Metrics, Voice Biomarkers, and 3D Facial Analysis — all from a webcam and microphone.
          </motion.p>

          {/* Pulse line */}
          <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ duration: 1.2, delay: 0.9 }} className="mb-10 overflow-hidden">
            <svg viewBox="0 0 400 50" className="w-full max-w-md mx-auto h-10 text-primary">
              <path d="M0,25 L60,25 L80,25 L90,8 L100,42 L110,25 L140,25 L155,5 L165,45 L175,25 L250,25 L265,10 L275,40 L285,25 L400,25" stroke="currentColor" strokeWidth="1.5" fill="none" className="animate-pulse-line" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.1 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button onClick={() => navigate("/login")} size="lg" className="px-8 h-14 text-base font-mono tracking-wider min-w-[200px]">
              <LogIn className="mr-2 h-5 w-5" /> LOGIN
            </Button>
            <Button onClick={() => navigate("/register")} size="lg" variant="outline" className="px-8 h-14 text-base font-mono tracking-wider min-w-[200px] border-primary/30 hover:bg-primary/10">
              <UserPlus className="mr-2 h-5 w-5" /> REGISTER
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-lg mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="p-3 rounded-xl bg-card/40 backdrop-blur border border-border/20">
                <p className="text-xl font-bold text-primary">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ChevronDown className="h-6 w-6 text-muted-foreground/40" />
        </motion.div>
      </section>

      {/* Core Modules */}
      <section id="modules" className="relative py-24 px-6 bg-background scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs font-mono tracking-[0.2em] text-primary/70 uppercase mb-4 block">Core Modules</span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Multi-Modal Biomarker Extraction</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Four specialized analysis modules extract distinct biomarkers from different sensory inputs.</p>
          </motion.div>

          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-2 gap-6">
            {modules.map((m) => (
              <motion.div key={m.title} variants={item} className="group p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-500">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg ${m.bgColor} border flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
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

      {/* Features */}
      <section id="features" className="relative py-24 px-6 bg-muted/30 scroll-mt-16">
        <div className="absolute inset-0 neuro-grid opacity-10" />
        <div className="relative max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs font-mono tracking-[0.2em] text-primary/70 uppercase mb-4 block">Platform Capabilities</span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Intelligent Health Monitoring</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Privacy, precision, and accessibility — combining AI with browser-native technologies.</p>
          </motion.div>

          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <motion.div key={f.title} variants={item} className="p-6 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-md transition-all duration-500 group">
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-24 px-6 bg-background scroll-mt-16">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs font-mono tracking-[0.2em] text-primary/70 uppercase mb-4 block">User Flow</span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">A streamlined 5-step workflow from registration to comprehensive health insights.</p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />
            {steps.map((step, idx) => (
              <motion.div key={step.num} initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`relative flex items-start gap-6 mb-12 md:w-1/2 ${idx % 2 === 0 ? "md:pr-12 md:ml-0" : "md:pl-12 md:ml-auto"}`}
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

      {/* Medical Disclaimer */}
      <section className="relative py-16 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-8 rounded-2xl border border-destructive/20 bg-destructive/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Medical Disclaimer</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Neuro-VX is a research and screening tool. It does not provide clinical diagnoses. All results are probabilistic risk indicators. Always consult a qualified healthcare professional for medical advice, diagnosis, or treatment.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6 bg-background border-t border-border">
        <div className="absolute inset-0 neuro-grid opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Begin Your Health Screening</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Create an account to access the full Neuro-VX platform and start monitoring your health.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button onClick={() => navigate("/register")} size="lg" className="px-8 h-14 text-base font-mono tracking-wider min-w-[200px]">
                <ArrowRight className="mr-2 h-5 w-5" /> GET STARTED
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
