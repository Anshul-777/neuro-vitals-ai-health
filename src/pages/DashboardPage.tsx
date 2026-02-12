import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAnalysis } from "@/context/AnalysisContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scan, ListChecks, FileText, ChevronRight, UserCircle,
  Wifi, WifiOff, X, Activity, Heart, Brain, ArrowUpRight,
  Clock, SortAsc, SortDesc, Sun, Moon, Info, HelpCircle,
} from "lucide-react";
import dashboardHeroBg from "@/assets/dashboard-hero-bg.jpg";
import Footer from "@/components/Footer";

const actions = [
  { id: "full", icon: Scan, title: "Full System Analysis", description: "Comprehensive multi-modal biometric assessment across all analysis modules", path: "/intake", color: "from-primary/20 to-primary/5" },
  { id: "individual", icon: ListChecks, title: "Individual Test Selection", description: "Choose and run specific analysis modules independently", path: "/test-selection", color: "from-accent/40 to-accent/10" },
  { id: "reports", icon: FileText, title: "View Past Reports", description: "Access historical analysis data and longitudinal health trends", path: "/results", color: "from-success/20 to-success/5" },
];

interface TestRecord {
  id: string; type: string; date: string; modules: string[]; riskLevel: string;
}

type ThemeMode = "light" | "dark" | "system";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { reset } = useAnalysis();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [testHistory, setTestHistory] = useState<TestRecord[]>([]);
  const [userName, setUserName] = useState("");
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => { window.removeEventListener("online", handleOnline); window.removeEventListener("offline", handleOffline); };
  }, []);

  useEffect(() => {
    // Disclaimer: show only once per session
    const shown = sessionStorage.getItem("nvx_disclaimer_shown");
    if (!shown) {
      setShowDisclaimer(true);
      sessionStorage.setItem("nvx_disclaimer_shown", "1");
    }

    // Load theme
    const savedTheme = (localStorage.getItem("nvx_theme") as ThemeMode) || "light";
    setTheme(savedTheme);

    const currentUser = localStorage.getItem("nvx_current_user");
    if (currentUser) {
      const users = JSON.parse(localStorage.getItem("nvx_users") || "{}");
      const user = users[currentUser];
      if (user) setUserName(user.fullName?.split(" ")[0] || "User");
    }

    const history = JSON.parse(localStorage.getItem("nvx_test_history") || "[]");
    if (history.length === 0) {
      setTestHistory([
        { id: "1", type: "Full System Analysis", date: "2026-02-10T14:30:00", modules: ["Face Scan", "Body Scan", "Voice Scan", "3D Face"], riskLevel: "low" },
        { id: "2", type: "Individual Test", date: "2026-02-08T09:15:00", modules: ["Face Scan"], riskLevel: "medium" },
        { id: "3", type: "Full System Analysis", date: "2026-02-05T16:45:00", modules: ["Face Scan", "Body Scan", "Voice Scan", "3D Face"], riskLevel: "low" },
        { id: "4", type: "Individual Test", date: "2026-02-01T11:00:00", modules: ["Voice Scan", "Body Scan"], riskLevel: "low" },
      ]);
    } else {
      setTestHistory(history);
    }
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    setTheme(mode);
    localStorage.setItem("nvx_theme", mode);
    const root = document.documentElement;
    if (mode === "dark") root.classList.add("dark");
    else if (mode === "light") root.classList.remove("dark");
    else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) root.classList.add("dark");
      else root.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    const next: ThemeMode = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    applyTheme(next);
  };

  const sortedHistory = [...testHistory].sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    return sortOrder === "newest" ? db - da : da - db;
  });

  const riskColor = (level: string) => {
    switch (level) {
      case "low": return "bg-success/15 text-success border-success/30";
      case "medium": return "bg-warning/15 text-warning border-warning/30";
      case "high": return "bg-destructive/15 text-destructive border-destructive/30";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const ThemeIcon = theme === "dark" ? Moon : Sun;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-4 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              NEURO<span className="text-primary">—</span>VITALS
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/dashboard" className="px-3 py-1.5 text-sm font-medium text-primary rounded-lg bg-primary/10">Home</Link>
            <Link to="/about" className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors">About</Link>
            <Link to="/help" className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors">Help</Link>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-accent transition-colors" title={`Theme: ${theme}`}>
              <ThemeIcon className="h-4 w-4 text-muted-foreground" />
            </button>
            {isOnline ? <Wifi className="h-4 w-4 text-success" /> : <WifiOff className="h-4 w-4 text-destructive" />}
            <button onClick={() => navigate("/account")} className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors">
              <UserCircle className="h-5 w-5 text-primary" />
            </button>
          </div>
        </div>
      </header>

      {/* Disclaimer Banner */}
      <AnimatePresence>
        {showDisclaimer && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="bg-warning/10 border-b border-warning/30 px-6 py-3">
              <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
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
        <div className="relative max-w-5xl mx-auto px-6 py-20">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <h2 className="text-4xl font-bold text-foreground mb-3">Welcome back{userName ? `, ${userName}` : ""}</h2>
            <p className="text-muted-foreground max-w-lg text-lg">
              Your AI-powered biometric health companion. Track vital signs, monitor neurological patterns, and gain actionable insights.
            </p>
            <div className="flex items-center gap-6 mt-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/60 backdrop-blur border border-border/30">
                <Heart className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Cardio-Respiratory</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/60 backdrop-blur border border-border/30">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Neuro-Motor</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/60 backdrop-blur border border-border/30">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Voice Analysis</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 flex-1">
        {/* Analysis Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">Health Analysis</h3>
          </div>
          <p className="text-muted-foreground mb-6">Begin a new assessment or continue with specific test modules to monitor your health.</p>

          <div className="grid gap-4 md:grid-cols-3">
            {actions.map(({ id, icon: Icon, title, description, path, color }, idx) => (
              <motion.button
                key={id}
                onClick={() => navigate(path)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group w-full text-left p-6 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} border border-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
                  {title}
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* History Section */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">History</h3>
            </div>
            <button
              onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border/50 hover:border-border"
            >
              {sortOrder === "newest" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
              {sortOrder === "newest" ? "Newest First" : "Oldest First"}
            </button>
          </div>

          {sortedHistory.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
              <Clock className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p>No tests taken yet. Start your first analysis above.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {sortedHistory.map((record, idx) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + idx * 0.1 }}
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
                      {record.modules.join(" · ")} — {new Date(record.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;
