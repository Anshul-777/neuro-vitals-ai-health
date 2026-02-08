import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalysis } from "@/context/AnalysisContext";
import { MODULES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Play,
  Scan,
  Activity,
  Mic,
  Box,
  Clock,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  face_scan: Scan,
  body_scan: Activity,
  voice_scan: Mic,
  "3d_face": Box,
};

const TestSelectionPage = () => {
  const navigate = useNavigate();
  const { selectedModules, setSelectedModules } = useAnalysis();
  const [selected, setSelected] = useState<string[]>(
    selectedModules.length > 0 ? selectedModules : MODULES.map((m) => m.id)
  );

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleStart = () => {
    if (selected.length === 0) return;
    setSelectedModules(selected);
    navigate("/analysis");
  };

  const totalTime = MODULES.filter((m) => selected.includes(m.id)).reduce(
    (s, m) => s + m.duration,
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="h-4 w-px bg-border" />
          <span className="text-xs font-mono text-muted-foreground">
            MODULE SELECTION
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 animate-fade-in">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Select Analysis Modules
          </h2>
          <p className="text-sm text-muted-foreground">
            Choose which biometric modules to include in this session.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 mb-8">
          {MODULES.map((mod) => {
            const Icon = iconMap[mod.id] || Scan;
            const isSelected = selected.includes(mod.id);
            return (
              <button
                key={mod.id}
                onClick={() => toggle(mod.id)}
                className={`text-left p-5 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/50 bg-card hover:border-border"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground text-sm">
                        {mod.name}
                      </h3>
                      <Checkbox
                        checked={isSelected}
                        className="pointer-events-none"
                      />
                    </div>
                    <p className="text-[11px] font-mono text-primary/70 mb-1">
                      {mod.subtitle}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {mod.description}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-muted-foreground/60">
                      <Clock className="h-3 w-3" />
                      <span className="text-[10px] font-mono">
                        ~{mod.duration}s
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card">
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {selected.length}
            </span>{" "}
            modules selected
            <span className="mx-2">·</span>
            Est. time:{" "}
            <span className="font-mono text-primary">{totalTime}s</span>
          </div>
          <Button
            onClick={handleStart}
            disabled={selected.length === 0}
            className="font-mono tracking-wider"
          >
            <Play className="mr-2 h-4 w-4" />
            START ANALYSIS
          </Button>
        </div>
      </main>
    </div>
  );
};

export default TestSelectionPage;
