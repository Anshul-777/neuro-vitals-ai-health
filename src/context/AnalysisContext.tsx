import { createContext, useContext, useState, ReactNode } from "react";
import { UserProfile, BackendResults } from "@/lib/types";

interface AnalysisState {
  profile: UserProfile | null;
  selectedModules: string[];
  results: BackendResults | null;
  sessionId: string;
  setProfile: (p: UserProfile) => void;
  setSelectedModules: (m: string[]) => void;
  setResults: (r: BackendResults) => void;
  setSessionId: (s: string) => void;
  reset: () => void;
}

const Ctx = createContext<AnalysisState | null>(null);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [results, setResults] = useState<BackendResults | null>(null);
  const [sessionId, setSessionId] = useState<string>("");

  const reset = () => {
    setProfile(null);
    setSelectedModules([]);
    setResults(null);
    setSessionId("");
  };

  return (
    <Ctx.Provider value={{ profile, selectedModules, results, sessionId, setProfile, setSelectedModules, setResults, setSessionId, reset }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}
