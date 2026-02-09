import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const modules = [
  {
    icon: Heart,
    title: "Face — Cardio/Respiratory",
    desc: "rPPG technology analyzes subtle skin color changes to extract Heart Rate, HRV, Respiratory Rate, pulse wave features, and estimated SpO₂ and Blood Pressure surrogates.",
    color: "text-red-500",
    bgColor: "bg-red-500/10 border-red-500/20",
  },
  {
    icon: Activity,
    title: "Body — Neuro-Motor",
    desc: "Advanced pose estimation and 3D skeleton tracking measure gait analysis (stride, cadence, symmetry, balance), tremor frequency, and posture assessment.",
    color: "text-emerald-600",
    bgColor: "bg-emerald-600/10 border-emerald-600/20",
  },
  {
    icon: Mic,
    title: "Voice — Audio Biomarkers",
    desc: "Calibrated speech analysis extracts Jitter, Shimmer, Harmonics-to-Noise Ratio (HNR), and Maximum Phonation Time (MPT) from vocal recordings.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: ScanFace,
    title: "3D Face — Psychometric",
    desc: "Monocular 3D face mesh construction analyzes facial asymmetry, muscle tone imbalance, stress-related structural markers, and baseline emotional load.",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10 border-violet-500/20",
  },
];

const features = [
  {
    icon: Brain,
    title: "AI Risk Stratification",
    desc: "Cross-modal pattern correlation produces probabilistic medical risk signals with confidence scores and uncertainty flags.",
  },
  {
    icon: Shield,
    title: "Biometric Identity",
    desc: "Face-first identity management ensures data integrity. Different faces always create separate profiles, preventing data contamination.",
  },
  {
    icon: Fingerprint,
    title: "Secure Authentication",
    desc: "Fingerprint or face verification via WebAuthn ensures only verified users access their health data.",
  },
  {
    icon: Eye,
    title: "Non-Invasive Screening",
    desc: "Uses only a standard webcam and microphone — no wearables, no blood draws, no physical contact required.",
  },
];

const steps = [
  { num: "01", title: "Biometric Login", desc: "Authenticate via fingerprint sensor or face recognition. Your identity is verified before accessing any health data." },
  { num: "02", title: "Passive Face Match", desc: "The system generates a facial embedding to match against stored profiles, ensuring data continuity across sessions." },
  { num: "03", title: "Medical Intake", desc: "Provide demographic context (age, sex, height, weight) only when running a full analysis. Partial tests skip this step." },
  { num: "04", title: "Module Selection", desc: "Choose which analysis modules to run — Face, Body, Voice, or 3D Face — based on your screening needs." },
  { num: "05", title: "Real-Time Analysis", desc: "Selected modules execute sequentially, extracting biomarkers from your camera and microphone feed." },
  { num: "06", title: "AI-Powered Results", desc: "View multi-tiered results: summary scores, interactive visualizations, embedded AI explanations, and exportable reports." },
];

const tiers = [
  { icon: BarChart3, tier: "Tier 1", title: "Summary Scores", desc: "At-a-glance overview of key metrics and color-coded risk signals — green for optimal, yellow for caution, red for attention needed." },
  { icon: LineChart, tier: "Tier 2", title: "Interactive Visualizations", desc: "Deep-dive with rPPG waveform replays, HRV plots, audio spectrograms, interactive 3D skeleton, and rotatable face mesh." },
  { icon: Bot, tier: "Tier 3", title: "Embedded AI Assistant", desc: "Context-aware AI that understands your current results. Ask questions directly — no need to re-explain your data." },
  { icon: FileText, tier: "Tier 4", title: "AI Summary Reports", desc: "Generate comprehensive reports combining current analysis with historical data. Exportable as PDF for healthcare professionals." },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${heroBg})` }} />
        <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
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
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-sm text-muted-foreground/60 mb-12 max-w-xl mx-auto italic"
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
            <p className="text-muted-foreground max-w-2xl mx-auto">Four specialized analysis modules work in concert, each extracting distinct biomarkers from different sensory inputs.</p>
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
                    <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
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

      {/* ═══════════ WORKFLOW ═══════════ */}
      <section className="relative py-24 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <span className="text-xs font-mono tracking-[0.2em] text-primary/70 uppercase mb-4 block">User Flow</span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">A streamlined 6-step workflow from authentication to comprehensive health insights.</p>
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
      <section className="relative py-24 px-6 bg-muted/30">
        <div className="absolute inset-0 neuro-grid opacity-10" />
        <div className="relative max-w-6xl mx-auto">
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

      {/* ═══════════ FOOTER / CTA ═══════════ */}
      <section className="relative py-24 px-6 bg-background border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
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
