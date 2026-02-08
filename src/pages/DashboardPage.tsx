import { useNavigate } from "react-router-dom";
import { useAnalysis } from "@/context/AnalysisContext";
import { Button } from "@/components/ui/button";
import { Scan, ListChecks, FileText, ChevronRight, LogOut } from "lucide-react";

const actions = [
  {
    id: "full",
    icon: Scan,
    title: "Full System Analysis",
    description:
      "Comprehensive multi-modal biometric assessment across all analysis modules",
    path: "/intake",
  },
  {
    id: "individual",
    icon: ListChecks,
    title: "Individual Test Selection",
    description:
      "Choose and run specific analysis modules independently",
    path: "/test-selection",
  },
  {
    id: "reports",
    icon: FileText,
    title: "View Past Reports",
    description:
      "Access historical analysis data and longitudinal health trends",
    path: "/results",
  },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const { identityStatus, reset } = useAnalysis();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              NEURO<span className="text-primary">—</span>VITALS
            </h1>
            <div className="h-4 w-px bg-border" />
            <span className="text-xs font-mono text-muted-foreground">
              DASHBOARD
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-mono text-muted-foreground">
                {identityStatus === "matched" ? "Verified" : "New Session"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                reset();
                navigate("/");
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Select Action
          </h2>
          <p className="text-muted-foreground">
            Choose how you'd like to proceed with your biometric analysis.
          </p>
        </div>

        <div className="grid gap-4">
          {actions.map(({ id, icon: Icon, title, description, path }, idx) => (
            <button
              key={id}
              onClick={() => navigate(path)}
              className="group w-full text-left p-6 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:bg-card/80 transition-all duration-300 flex items-center gap-6 animate-slide-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors flex-shrink-0" />
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
