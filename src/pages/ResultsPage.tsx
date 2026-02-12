import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalysis } from "@/context/AnalysisContext";
import { RiskLevel } from "@/lib/types";
import { generatePulseWaveData } from "@/lib/simulateResults";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
} from "recharts";
import {
  Heart, Footprints, Mic, Box, Shield, ArrowLeft, MessageSquare,
  FileText, AlertTriangle, ChevronDown, ChevronUp, Brain, Send, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Footer from "@/components/Footer";

const riskColorClass = (level: RiskLevel) => {
  switch (level) {
    case "low": return "text-success bg-success/10 border-success/20";
    case "medium": return "text-warning bg-warning/10 border-warning/20";
    case "high": return "text-destructive bg-destructive/10 border-destructive/20";
    case "uncertain": return "text-muted-foreground bg-muted border-border";
  }
};

const riskLabel = (l: RiskLevel) => l.charAt(0).toUpperCase() + l.slice(1);

const RISK_LABELS: Record<string, string> = {
  cardiovascular: "Cardiovascular", respiratory: "Respiratory",
  neuroMotorGait: "Neuro-Motor (Gait)", neuroMotorFace: "Neuro-Motor (Face)",
  speechPathology: "Speech Pathology",
};

const MODULE_SECTION_MAP: Record<string, string[]> = {
  face_scan: ["rppg"],
  body_scan: ["gait"],
  voice_scan: ["voice"],
  "3d_face": ["face"],
};

function getAIResponse(query: string, r: any): string {
  const q = query.toLowerCase();
  if (q.includes("heart") || q.includes("bpm") || q.includes("cardio"))
    return `Heart rate: ${r.rppg.bpm} BPM, HRV (SDNN): ${r.rppg.hrv_sdnn} ms. ${r.rppg.bpm > 80 ? "Slightly elevated resting HR." : "Within normal resting range."} HRV above 30ms indicates good autonomic function.`;
  if (q.includes("gait") || q.includes("walk") || q.includes("balance"))
    return `Gait symmetry: ${r.gait.symmetry}%, balance stability: ${r.gait.balanceStability}%, cadence: ${r.gait.cadence} steps/min. ${r.gait.symmetry < 85 ? "Some asymmetry detected." : "Symmetry within normal range."}`;
  if (q.includes("voice") || q.includes("speech"))
    return `MPT: ${r.voice.mptSeconds}s. ${r.voice.jitterPercent !== null ? `Jitter: ${r.voice.jitterPercent}%, Shimmer: ${r.voice.shimmerPercent}%.` : ""} ${r.voice.mptSeconds < 5 ? "Short MPT may indicate vocal fatigue." : "MPT within acceptable range."}`;
  if (q.includes("risk") || q.includes("overall")) {
    const high = Object.entries(r.risk.signals).filter(([, v]) => v === "high").map(([k]) => RISK_LABELS[k] || k);
    return high.length > 0
      ? `Elevated risk in: ${high.join(", ")}. Confidence: ${(r.risk.confidence * 100).toFixed(0)}%.`
      : `Overall favorable risk profile at ${(r.risk.confidence * 100).toFixed(0)}% confidence.`;
  }
  return `Current session: BPM ${r.rppg.bpm}, HRV ${r.rppg.hrv_sdnn}ms, Gait symmetry ${r.gait.symmetry}%. Try asking about "heart rate", "gait", "voice", or "overall risk".`;
}

function MetricTile({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="p-3 rounded-lg bg-background border border-border/30">
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-bold text-foreground">
        {value}{unit && <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>}
      </p>
    </div>
  );
}

const ResultsPage = () => {
  const navigate = useNavigate();
  const { results, profile, selectedModules, reset } = useAnalysis();
  const [showAI, setShowAI] = useState(false);
  const [aiMessages, setAIMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([]);
  const [aiInput, setAIInput] = useState("");
  const [expanded, setExpanded] = useState<string | null>("rppg");

  const pulseData = useMemo(() => generatePulseWaveData(results?.rppg.bpm || 72), [results]);

  // Determine visible sections based on selected modules
  const visibleSections = useMemo(() => {
    if (!selectedModules || selectedModules.length === 0 || selectedModules.length === 4) {
      return ["rppg", "gait", "voice", "face"];
    }
    const sections = new Set<string>();
    selectedModules.forEach((m) => {
      MODULE_SECTION_MAP[m]?.forEach((s) => sections.add(s));
    });
    return Array.from(sections);
  }, [selectedModules]);

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

  const sendAI = () => {
    if (!aiInput.trim()) return;
    const msg = aiInput.trim();
    setAIMessages((prev) => [...prev, { role: "user", text: msg }]);
    setAIInput("");
    setTimeout(() => {
      setAIMessages((prev) => [...prev, { role: "ai", text: getAIResponse(msg, results) }]);
    }, 600);
  };

  const downloadReport = () => {
    const report = {
      platform: "Neuro-Vitals (NVX)",
      timestamp: results.timestamp,
      profile: profile || "N/A",
      modules_analyzed: selectedModules,
      results: {
        ...(visibleSections.includes("rppg") && { cardioRespiratory: results.rppg }),
        ...(visibleSections.includes("gait") && { gaitBalance: results.gait }),
        ...(visibleSections.includes("voice") && { voiceAnalysis: results.voice }),
        ...(visibleSections.includes("face") && { facialStructure: results.face }),
      },
      riskAssessment: results.risk,
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

  const riskEntries = Object.entries(results.risk.signals) as [string, RiskLevel][];
  const toggleSection = (id: string) => setExpanded(expanded === id ? null : id);

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
            <span className="text-xs font-mono text-muted-foreground">RESULTS</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={downloadReport}>
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowAI(!showAI)}>
              <MessageSquare className="h-4 w-4 mr-1" /> AI Insights
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <main className={`flex-1 transition-all duration-300 ${showAI ? "lg:mr-80" : ""}`}>
          <div className="max-w-5xl mx-auto px-6 py-8">
            {/* Profile banner */}
            {profile && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl border border-border/50 bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{profile.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{profile.name}</p>
                    <p className="text-xs text-muted-foreground">{profile.age}y · {profile.sex} · {profile.height}cm · {profile.weight}kg</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">{new Date(results.timestamp).toLocaleString()}</span>
              </motion.div>
            )}

            {/* Risk Summary */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> Risk Assessment
                <span className="text-xs font-mono text-muted-foreground ml-auto">Confidence: {(results.risk.confidence * 100).toFixed(0)}%</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {riskEntries.map(([key, level]) => (
                  <div key={key} className={`p-3 rounded-xl border text-center ${riskColorClass(level)}`}>
                    <p className="text-[10px] font-mono uppercase tracking-wider mb-1 opacity-70">{RISK_LABELS[key] || key}</p>
                    <p className="text-sm font-bold">{riskLabel(level)}</p>
                  </div>
                ))}
              </div>
              {results.risk.uncertaintyFlags.length > 0 && (
                <div className="mt-3 flex items-center gap-2 text-xs text-warning/70">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Uncertain: {results.risk.uncertaintyFlags.join(", ")}</span>
                </div>
              )}
            </motion.section>

            {/* Conditional Sections */}
            {visibleSections.includes("rppg") && (
              <CollapsibleSection id="rppg" expanded={expanded} onToggle={toggleSection} icon={Heart} title="Cardio-Respiratory Metrics">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <MetricTile label="Heart Rate" value={`${results.rppg.bpm}`} unit="BPM" />
                  <MetricTile label="HRV (SDNN)" value={`${results.rppg.hrv_sdnn}`} unit="ms" />
                  <MetricTile label="Respiratory Rate" value={`${results.rppg.rr}`} unit="br/min" />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground mb-2 uppercase tracking-wider">rPPG Signal Waveform</p>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={pulseData.slice(0, 150)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                        <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11, color: "hsl(var(--foreground))" }} />
                        <Line type="monotone" dataKey="raw" stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth={1} dot={false} name="Raw" />
                        <Line type="monotone" dataKey="filtered" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Filtered" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CollapsibleSection>
            )}

            {visibleSections.includes("gait") && (
              <CollapsibleSection id="gait" expanded={expanded} onToggle={toggleSection} icon={Footprints} title="Gait & Balance Metrics">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <MetricTile label="Status" value={results.gait.status} />
                  <MetricTile label="Cadence" value={`${results.gait.cadence}`} unit="steps/min" />
                  <MetricTile label="Symmetry" value={`${results.gait.symmetry}`} unit="%" />
                  <MetricTile label="Balance" value={`${results.gait.balanceStability}`} unit="%" />
                </div>
              </CollapsibleSection>
            )}

            {visibleSections.includes("voice") && (
              <CollapsibleSection id="voice" expanded={expanded} onToggle={toggleSection} icon={Mic} title="Voice Analysis">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <MetricTile label="MPT" value={`${results.voice.mptSeconds}`} unit="s" />
                  <MetricTile label="Jitter" value={results.voice.jitterPercent !== null ? `${results.voice.jitterPercent}` : "—"} unit="%" />
                  <MetricTile label="Shimmer" value={results.voice.shimmerPercent !== null ? `${results.voice.shimmerPercent}` : "—"} unit="%" />
                  <MetricTile label="HNR" value={results.voice.hnrDb !== null ? `${results.voice.hnrDb}` : "—"} unit="dB" />
                </div>
              </CollapsibleSection>
            )}

            {visibleSections.includes("face") && (
              <CollapsibleSection id="face" expanded={expanded} onToggle={toggleSection} icon={Box} title="Facial Structure">
                <div className="grid grid-cols-2 gap-4">
                  <MetricTile label="Asymmetry Score" value={`${results.face.asymmetryScore}`} />
                  <MetricTile label="Eye Openness" value={`${results.face.eyeOpenness}`} />
                </div>
              </CollapsibleSection>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-10 mb-8">
              <Button onClick={() => { reset(); navigate("/dashboard"); }} variant="outline" className="font-mono text-xs tracking-wider">NEW SESSION</Button>
              <Button onClick={() => navigate("/dashboard")} className="font-mono text-xs tracking-wider">BACK TO DASHBOARD</Button>
            </div>
          </div>
        </main>

        {/* AI Panel */}
        {showAI && (
          <aside className="fixed right-0 top-0 bottom-0 w-80 border-l border-border/50 bg-card flex flex-col z-30">
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm text-foreground">AI Insights</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowAI(false)}>×</Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {aiMessages.length === 0 && (
                <div className="text-center py-8">
                  <Brain className="h-8 w-8 text-primary/30 mx-auto mb-3" />
                  <p className="text-xs text-muted-foreground">Ask about your results.</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">Try: "What about my heart rate?"</p>
                </div>
              )}
              {aiMessages.map((msg, i) => (
                <div key={i} className={`p-3 rounded-lg text-xs leading-relaxed ${msg.role === "user" ? "bg-primary/10 text-foreground ml-8" : "bg-muted text-foreground mr-4"}`}>
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border/50">
              <form onSubmit={(e) => { e.preventDefault(); sendAI(); }} className="flex gap-2">
                <Input value={aiInput} onChange={(e) => setAIInput(e.target.value)} placeholder="Ask about your results..." className="text-xs bg-background border-border/50" />
                <Button type="submit" size="sm" className="px-3"><Send className="h-3 w-3" /></Button>
              </form>
            </div>
          </aside>
        )}
      </div>

      <Footer />
    </div>
  );
};

function CollapsibleSection({ id, expanded, onToggle, icon: Icon, title, children }: {
  id: string; expanded: string | null; onToggle: (id: string) => void; icon: React.ElementType; title: string; children: React.ReactNode;
}) {
  const isOpen = expanded === id;
  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
      <button onClick={() => onToggle(id)} className="w-full flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card hover:border-border transition-colors">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {isOpen && <div className="mt-2 p-4 rounded-xl border border-border/30 bg-card/50 animate-fade-in">{children}</div>}
    </motion.section>
  );
}

export default ResultsPage;
