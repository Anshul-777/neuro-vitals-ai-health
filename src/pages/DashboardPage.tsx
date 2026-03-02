import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalysis } from "@/context/AnalysisContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scan, ListChecks, FileText, ChevronRight, Activity, Heart, Brain,
  ArrowUpRight, Clock, X, Zap, Shield, Eye, BarChart3, TrendingUp,
} from "lucide-react";
import dashboardHeroBg from "@/assets/dashboard-hero-bg.jpg";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const actions = [
  { id: "full", icon: Scan, title: "Full System Analysis", description: "Comprehensive multi-modal biometric assessment across all 4 analysis modules — Face, Body, Voice, and 3D Scan.", path: "/intake", color: "from-primary/20 to-primary/5" },
  { id: "individual", icon: ListChecks, title: "Individual Test Selection", description: "Choose and run specific analysis modules independently for targeted health screening.", path: "/test-selection", color: "from-accent/40 to-accent/10" },
  { id: "reports", icon: FileText, title: "View Past Reports", description: "Access historical analysis data, downloadable reports, and longitudinal health trends.", path: "/history", color: "from-success/20 to-success/5" },
];

const capabilities = [
  { icon: Heart, title: "Cardio-Respiratory", desc: "Heart rate, HRV, respiratory rate via rPPG technology", color: "text-red-500" },
  { icon: Brain, title: "Neuro-Motor Analysis", desc: "Gait analysis, balance stability, tremor detection", color: "text-violet-500" },
  { icon: Activity, title: "Voice Biomarkers", desc: "MPT, Jitter, Shimmer, HNR for speech pathology", color: "text-amber-500" },
  { icon: Eye, title: "3D Facial Mapping", desc: "468-point mesh for asymmetry and structural analysis", color: "text-emerald-500" },
  { icon: Shield, title: "AI Risk Engine", desc: "Cross-modal correlation for probabilistic health signals", color: "text-primary" },
  { icon: BarChart3, title: "Exportable Reports", desc: "Download JSON reports with detailed metric breakdowns", color: "text-blue-500" },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const { reset } = useAnalysis();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [userName, setUserName] = useState("");
  const [testCount, setTestCount] = useState(0);

  useEffect(() => {
    const shown = sessionStorage.getItem("nvx_disclaimer_shown");
    if (!shown) {
      setShowDisclaimer(true);
      sessionStorage.setItem("nvx_disclaimer_shown", "1");
    }

    const currentUser = localStorage.getItem("nvx_current_user");
    if (currentUser) {
      const users = JSON.parse(localStorage.getItem("nvx_users") || "{}");
      const user = users[currentUser];
      if (user) setUserName(user.fullName?.split(" ")[0] || "User");
    }

    const history = JSON.parse(localStorage.getItem("nvx_test_history") || "[]");
    setTestCount(history.length);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Disclaimer Banner */}
      <AnimatePresence>
        {showDisclaimer && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="bg-warning/10 border-b border-warning/30 px-6 py-3">
              <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                <p className="text-sm text-warning font-medium">
                  ⚠️ This analysis is for informational purposes only and should not replace professional medical advice. Please consult a qualified healthcare professional for any health concerns.
                </p>
                <button onClick={() => setShowDisclaimer(false)} className="flex-shrink-0 p-1 rounded-full hover:bg-warning/20 transition-colors">
                  <X className="h-4 w-4 text-warning" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${dashboardHeroBg})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6 py-24">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-mono tracking-[0.15em] text-primary uppercase">AI-Powered Health Platform</span>
            </div>
            <h2 className="text-5xl font-extrabold text-foreground mb-4 tracking-tight">
              Welcome back{userName ? `, ${userName}` : ""}
            </h2>
            <p className="text-muted-foreground max-w-xl text-lg leading-relaxed mb-8">
              Track vital signs, monitor neurological patterns, and gain actionable health insights through non-invasive biometric analysis powered by computer vision and AI.
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card/60 backdrop-blur border border-border/30">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-lg font-bold text-foreground">{testCount || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Tests Completed</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card/60 backdrop-blur border border-border/30">
                <Zap className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-lg font-bold text-foreground">4</p>
                  <p className="text-[10px] text-muted-foreground">Analysis Modules</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card/60 backdrop-blur border border-border/30">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-lg font-bold text-foreground">5</p>
                  <p className="text-[10px] text-muted-foreground">Risk Domains</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <main className="max-w-6xl mx-auto px-6 py-12 flex-1">
        {/* Analysis Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="mb-16">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">Health Analysis</h3>
          </div>
          <p className="text-muted-foreground mb-6">Begin a new assessment or continue with specific test modules to monitor your health.</p>

          <div className="grid gap-4 md:grid-cols-3">
            {actions.map(({ id, icon: Icon, title, description, path, color }, idx) => (
              <motion.button
                key={id}
                onClick={() => { reset(); navigate(path); }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group w-full text-left p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} border border-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                  {title}
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Platform Capabilities */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="mb-16">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-5 w-5 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">Platform Capabilities</h3>
          </div>
          <p className="text-muted-foreground mb-6">Advanced biomarker extraction and AI-driven health insights from your device's camera and microphone.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map((cap, idx) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.7 + idx * 0.08 }}
                whileHover={{ scale: 1.02 }}
                className="p-5 rounded-xl border border-border/50 bg-card hover:border-primary/20 hover:shadow-md transition-all duration-300"
              >
                <cap.icon className={`h-6 w-6 ${cap.color} mb-3`} />
                <h4 className="font-semibold text-foreground mb-1 text-sm">{cap.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent History Preview */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.9 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">Recent Activity</h3>
            </div>
            <button onClick={() => navigate("/history")} className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <RecentHistory />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

function RecentHistory() {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("nvx_test_history") || "[]");
    if (history.length === 0) {
      setRecords([
        { id: "1", type: "Full System Analysis", date: "2026-02-10T14:30:00", modules: ["Face Scan", "Body Scan", "Voice Scan", "3D Face"], riskLevel: "low" },
        { id: "2", type: "Individual Test", date: "2026-02-08T09:15:00", modules: ["Face Scan"], riskLevel: "medium" },
      ]);
    } else {
      setRecords(history.slice(0, 3));
    }
  }, []);

  const riskColor = (level: string) => {
    switch (level) {
      case "low": return "bg-success/15 text-success border-success/30";
      case "medium": return "bg-warning/15 text-warning border-warning/30";
      case "high": return "bg-destructive/15 text-destructive border-destructive/30";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
        <Clock className="h-8 w-8 mx-auto mb-3 opacity-50" />
        <p>No tests taken yet. Start your first analysis above.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {records.map((record, idx) => (
        <motion.div
          key={record.id}
          initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 1.0 + idx * 0.1 }}
          className="p-4 rounded-xl border border-border/50 bg-card hover:border-primary/20 hover:shadow-sm transition-all duration-300 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            {record.type === "Full System Analysis" ? <Scan className="h-5 w-5 text-primary" /> : <ListChecks className="h-5 w-5 text-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold text-foreground">{record.type}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${riskColor(record.riskLevel)}`}>{record.riskLevel} risk</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {record.modules.join(" · ")} — {new Date(record.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
        </motion.div>
      ))}
    </div>
  );
}

export default DashboardPage;
