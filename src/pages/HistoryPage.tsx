import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, Scan, ListChecks, ChevronRight, SortAsc, SortDesc,
  Trash2, Calendar, Filter, Search, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface TestRecord {
  id: string;
  type: string;
  date: string;
  modules: string[];
  riskLevel: string;
}

const HistoryPage = () => {
  const navigate = useNavigate();
  const [testHistory, setTestHistory] = useState<TestRecord[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "full" | "individual">("all");

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("nvx_test_history") || "[]");
    if (history.length === 0) {
      setTestHistory([
        { id: "1", type: "Full System Analysis", date: "2026-02-10T14:30:00", modules: ["Face Scan", "Body Scan", "Voice Scan", "3D Face"], riskLevel: "low" },
        { id: "2", type: "Individual Test", date: "2026-02-08T09:15:00", modules: ["Face Scan"], riskLevel: "medium" },
        { id: "3", type: "Full System Analysis", date: "2026-02-05T16:45:00", modules: ["Face Scan", "Body Scan", "Voice Scan", "3D Face"], riskLevel: "low" },
        { id: "4", type: "Individual Test", date: "2026-02-01T11:00:00", modules: ["Voice Scan", "Body Scan"], riskLevel: "low" },
        { id: "5", type: "Individual Test", date: "2026-01-28T13:20:00", modules: ["Voice Scan"], riskLevel: "low" },
        { id: "6", type: "Full System Analysis", date: "2026-01-20T10:00:00", modules: ["Face Scan", "Body Scan", "Voice Scan", "3D Face"], riskLevel: "high" },
      ]);
    } else {
      setTestHistory(history);
    }
  }, []);

  const filtered = testHistory
    .filter((r) => {
      if (filterType === "full" && r.type !== "Full System Analysis") return false;
      if (filterType === "individual" && r.type !== "Individual Test") return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return r.type.toLowerCase().includes(q) || r.modules.some((m) => m.toLowerCase().includes(q));
      }
      return true;
    })
    .sort((a, b) => {
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

  const clearHistory = () => {
    localStorage.removeItem("nvx_test_history");
    setTestHistory([]);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10 flex-1 w-full">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Analysis History</h2>
              <p className="text-sm text-muted-foreground">View and manage all your past health assessments</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Tests", value: testHistory.length, color: "text-primary" },
            { label: "Full Analysis", value: testHistory.filter((r) => r.type === "Full System Analysis").length, color: "text-primary" },
            { label: "Individual", value: testHistory.filter((r) => r.type === "Individual Test").length, color: "text-primary" },
            { label: "High Risk", value: testHistory.filter((r) => r.riskLevel === "high").length, color: "text-destructive" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="p-4 rounded-xl border border-border/50 bg-card text-center"
            >
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by test type or module..."
              className="pl-10 bg-card"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "full", "individual"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === type
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "bg-card border border-border/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {type === "all" ? "All" : type === "full" ? "Full" : "Individual"}
              </button>
            ))}
            <button
              onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-muted-foreground border border-border/50 bg-card hover:text-foreground transition-colors"
            >
              {sortOrder === "newest" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
              {sortOrder === "newest" ? "Newest" : "Oldest"}
            </button>
          </div>
        </motion.div>

        {/* Records */}
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 border border-dashed border-border rounded-xl">
            <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground">No tests found. Start your first analysis from the dashboard.</p>
            <Button onClick={() => navigate("/dashboard")} className="mt-4" variant="outline">Go to Dashboard</Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filtered.map((record, idx) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + idx * 0.05 }}
                className="p-5 rounded-xl border border-border/50 bg-card hover:border-primary/20 hover:shadow-md transition-all duration-300 flex items-center gap-4 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                  {record.type === "Full System Analysis" ? <Scan className="h-6 w-6 text-primary" /> : <ListChecks className="h-6 w-6 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">{record.type}</h4>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${riskColor(record.riskLevel)}`}>
                      {record.riskLevel} risk
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {record.modules.join(" · ")}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3 text-muted-foreground/50" />
                    <p className="text-xs text-muted-foreground/70">
                      {new Date(record.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        )}

        {testHistory.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 flex justify-end">
            <Button variant="outline" size="sm" onClick={clearHistory} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" /> Clear All History
            </Button>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default HistoryPage;
