import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalysis } from "@/context/AnalysisContext";
import { BackendRiskSignal } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
} from "recharts";
import {
  Heart, Footprints, Mic, Box, Shield, ArrowLeft, Download, Brain,
  ChevronDown, ChevronUp, Eye, Activity, AlertTriangle, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const RISK_COLORS: Record<string, string> = {
  low: "text-primary bg-primary/10 border-primary/20",
  moderate: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  high: "text-destructive bg-destructive/10 border-destructive/20",
  unknown: "text-muted-foreground bg-muted border-border",
};

const DOMAIN_ICONS: Record<string, React.ElementType> = {
  cardiovascular: Heart,
  neurological: Brain,
  respiratory: Activity,
  neuromuscular: Footprints,
  fatigue_cognitive: Eye,
  psychometric: Zap,
};

interface MetricDef {
  key: string; label: string; unit: string; min: number; max: number; precision?: number;
}

const METRIC_CATEGORIES: { title: string; icon: React.ElementType; metrics: MetricDef[] }[] = [
  {
    title: "Cardio-Respiratory", icon: Heart, metrics: [
      { key: "heart_rate_bpm", label: "Heart Rate", unit: "BPM", min: 60, max: 100 },
      { key: "hrv_rmssd_ms", label: "HRV (RMSSD)", unit: "ms", min: 20, max: 80 },
      { key: "hrv_sdnn_ms", label: "HRV (SDNN)", unit: "ms", min: 30, max: 100 },
      { key: "respiratory_rate_bpm", label: "Respiratory Rate", unit: "br/min", min: 12, max: 20 },
      { key: "spo2_estimate_pct", label: "SpO₂ Estimate", unit: "%", min: 95, max: 100, precision: 1 },
    ],
  },
  {
    title: "Ocular & Fatigue", icon: Eye, metrics: [
      { key: "ear_average", label: "Eye Aspect Ratio", unit: "", min: 0.25, max: 0.40, precision: 3 },
      { key: "blink_rate_per_min", label: "Blink Rate", unit: "/min", min: 10, max: 25, precision: 1 },
      { key: "fatigue_score", label: "Fatigue Score", unit: "", min: 0, max: 0.3, precision: 2 },
    ],
  },
  {
    title: "Gait & Balance", icon: Footprints, metrics: [
      { key: "cadence_steps_per_min", label: "Cadence", unit: "steps/min", min: 90, max: 120, precision: 0 },
      { key: "gait_symmetry_pct", label: "Gait Symmetry", unit: "%", min: 90, max: 100, precision: 1 },
      { key: "balance_score", label: "Balance Score", unit: "", min: 0.8, max: 1.0, precision: 2 },
      { key: "stride_length_cm", label: "Stride Length", unit: "cm", min: 50, max: 80, precision: 1 },
      { key: "velocity_cm_per_sec", label: "Gait Velocity", unit: "cm/s", min: 80, max: 140, precision: 1 },
    ],
  },
  {
    title: "Tremor Analysis", icon: Activity, metrics: [
      { key: "dominant_tremor_hz", label: "Dominant Frequency", unit: "Hz", min: 0, max: 4, precision: 1 },
      { key: "tremor_amplitude", label: "Amplitude", unit: "px", min: 0, max: 1.0, precision: 2 },
    ],
  },
  {
    title: "Voice Biomarkers", icon: Mic, metrics: [
      { key: "jitter_pct", label: "Jitter", unit: "%", min: 0, max: 1.0, precision: 2 },
      { key: "shimmer_pct", label: "Shimmer", unit: "%", min: 0, max: 3.0, precision: 2 },
      { key: "hnr_db", label: "HNR", unit: "dB", min: 15, max: 30, precision: 1 },
      { key: "mpt_sec", label: "Max Phonation Time", unit: "s", min: 15, max: 25, precision: 1 },
      { key: "f0_mean_hz", label: "Mean F0", unit: "Hz", min: 80, max: 300, precision: 1 },
      { key: "speech_rate_syl_per_sec", label: "Speech Rate", unit: "syl/s", min: 3, max: 6, precision: 1 },
    ],
  },
  {
    title: "Facial Structure", icon: Box, metrics: [
      { key: "facial_asymmetry_score", label: "Asymmetry", unit: "", min: 0, max: 0.2, precision: 3 },
      { key: "stress_structural_score", label: "Stress Score", unit: "", min: 0, max: 0.4, precision: 2 },
      { key: "muscle_tone_imbalance_score", label: "Muscle Tone", unit: "", min: 0, max: 0.3, precision: 2 },
      { key: "emotional_load_baseline", label: "Emotional Load", unit: "", min: 0, max: 0.4, precision: 2 },
    ],
  },
  {
    title: "Skin & Hydration", icon: Zap, metrics: [
      { key: "hydration_proxy_score", label: "Hydration Proxy", unit: "", min: 0.4, max: 1.0, precision: 2 },
    ],
  },
];

function getMetricStatus(value: number, min: number, max: number): "normal" | "warning" | "danger" {
  if (value >= min && value <= max) return "normal";
  const range = max - min;
  if (value < min - range * 0.3 || value > max + range * 0.3) return "danger";
  return "warning";
}

const statusColors = { normal: "bg-primary", warning: "bg-yellow-500", danger: "bg-destructive" };

const ResultsPage = () => {
  const navigate = useNavigate();
  const { results, profile, selectedModules, reset } = useAnalysis();
  const [expanded, setExpanded] = useState<string | null>("Cardio-Respiratory");

  const pulseChartData = useMemo(() => {
    const samples = results?.pulse_wave_samples || results?.biomarkers?.pulse_wave_samples || [];
    return samples.map((v, i) => ({ time: (i / 30).toFixed(2), value: v }));
  }, [results]);

  if (!results) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No analysis results available.</p>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  const { biomarkers, risk_report } = results;
  const wellness = risk_report?.overall_wellness_score ?? 50;
  const completeness = risk_report?.data_completeness_pct ?? 0;
  const signals = risk_report?.signals || [];
  const circumference = 2 * Math.PI * 54;

  const downloadReport = () => {
    const report = {
      platform: "Neuro-Virtual-X (NVX)",
      generated_at: new Date().toISOString(),
      session_id: results.session_id,
      profile: profile || "N/A",
      modules_analyzed: selectedModules,
      biomarkers,
      risk_report,
      disclaimer: "For informational purposes only. Consult a healthcare professional.",
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nvx-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const visibleCategories = METRIC_CATEGORIES.filter(cat =>
    cat.metrics.some(m => biomarkers[m.key] != null)
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-4 sticky top-0 bg-background/95 backdrop-blur z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
            </Button>
            <div className="h-4 w-px bg-border" />
            <span className="text-xs font-mono text-muted-foreground">ANALYSIS REPORT</span>
          </div>
          <Button variant="outline" size="sm" onClick={downloadReport}>
            <Download className="h-4 w-4 mr-1" /> Download Report
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Profile & Wellness */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Wellness Score */}
            <div className="md:col-span-1 flex flex-col items-center justify-center p-8 rounded-2xl border border-border/50 bg-card">
              <svg viewBox="0 0 120 120" className="w-40 h-40 mb-4">
                <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <motion.circle
                  cx="60" cy="60" r="54" fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${circumference}`}
                  strokeDashoffset={circumference}
                  animate={{ strokeDashoffset: circumference - (wellness / 100) * circumference }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  transform="rotate(-90 60 60)"
                />
                <text x="60" y="55" textAnchor="middle" dominantBaseline="central" className="text-3xl font-bold" fill="hsl(var(--foreground))" fontSize="28" fontWeight="bold">
                  {Math.round(wellness)}
                </text>
                <text x="60" y="78" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="10">
                  Wellness Score
                </text>
              </svg>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Data Completeness: <span className="text-foreground font-medium">{completeness.toFixed(0)}%</span></p>
                <p className="text-xs text-muted-foreground mt-1">Frames: <span className="text-foreground font-medium">{results.frames_processed}</span></p>
              </div>
            </div>

            {/* Risk Signals */}
            <div className="md:col-span-2 p-6 rounded-2xl border border-border/50 bg-card">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> Risk Assessment
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {signals.map((signal: BackendRiskSignal) => {
                  const SIcon = DOMAIN_ICONS[signal.domain] || Shield;
                  return (
                    <motion.div
                      key={signal.domain}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-4 rounded-xl border ${RISK_COLORS[signal.risk_level] || RISK_COLORS.unknown}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <SIcon className="h-4 w-4" />
                        <p className="text-[10px] font-mono uppercase tracking-wider">{signal.label}</p>
                      </div>
                      <p className="text-lg font-bold capitalize">{signal.risk_level}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-[10px] opacity-60">Prob: {(signal.probability * 100).toFixed(0)}%</p>
                        <p className="text-[10px] opacity-60">Conf: {(signal.confidence_score * 100).toFixed(0)}%</p>
                      </div>
                      {signal.uncertainty_flags.length > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-[9px] opacity-50">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          <span>{signal.uncertainty_flags.length} flag{signal.uncertainty_flags.length > 1 ? "s" : ""}</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Pulse Wave Chart */}
          {pulseChartData.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8 p-6 rounded-2xl border border-border/50 bg-card">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" /> rPPG Signal Waveform
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pulseChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} label={{ value: "Time (s)", position: "insideBottom", offset: -5, fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11, color: "hsl(var(--foreground))" }} />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} name="rPPG Signal" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.section>
          )}

          {/* Biomarker Details */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h3 className="text-lg font-bold text-foreground mb-4">Detailed Biomarkers</h3>
            <div className="space-y-3">
              {visibleCategories.map((cat) => {
                const isOpen = expanded === cat.title;
                const CIcon = cat.icon;
                const visibleMetrics = cat.metrics.filter(m => biomarkers[m.key] != null);
                return (
                  <div key={cat.title} className="rounded-xl border border-border/50 bg-card overflow-hidden">
                    <button onClick={() => setExpanded(isOpen ? null : cat.title)} className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <CIcon className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-foreground">{cat.title}</span>
                        <span className="text-xs text-muted-foreground">({visibleMetrics.length} metrics)</span>
                      </div>
                      {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                          <div className="px-5 pb-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {visibleMetrics.map(m => {
                              const val = biomarkers[m.key] as number;
                              const status = getMetricStatus(val, m.min, m.max);
                              const precision = m.precision ?? 1;
                              return (
                                <div key={m.key} className="p-4 rounded-xl bg-background border border-border/30">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
                                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{m.label}</p>
                                  </div>
                                  <p className="text-xl font-bold text-foreground">
                                    {typeof val === "number" ? val.toFixed(precision) : val}
                                    {m.unit && <span className="text-xs font-normal text-muted-foreground ml-1">{m.unit}</span>}
                                  </p>
                                  <p className="text-[9px] text-muted-foreground mt-1">
                                    Normal: {m.min}–{m.max} {m.unit}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                          {cat.title === "Tremor Analysis" && biomarkers.tremor_severity && (
                            <div className="px-5 pb-4">
                              <p className="text-xs text-muted-foreground">Severity: <span className="text-foreground font-medium capitalize">{biomarkers.tremor_severity}</span></p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Disclaimer */}
          <div className="mt-8 p-4 rounded-xl bg-warning/5 border border-warning/20">
            <p className="text-xs text-warning/80 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>This report is for informational and research purposes only. It is not a medical diagnosis. Always consult a qualified healthcare professional for medical advice. All metrics are estimates based on computer vision and audio analysis.</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8 mb-10">
            <Button onClick={() => { reset(); navigate("/dashboard"); }} variant="outline" className="font-mono text-xs tracking-wider">
              NEW SESSION
            </Button>
            <Button onClick={() => navigate("/dashboard")} className="font-mono text-xs tracking-wider">
              BACK TO DASHBOARD
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResultsPage;
