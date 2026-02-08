import { createContext, useContext, useState, ReactNode } from "react";
import { UserProfile, AnalysisResults } from "@/lib/types";

interface AnalysisState {
  profile: UserProfile | null;
  selectedModules: string[];
  results: AnalysisResults | null;
  identityStatus: "matched" | "new" | null;
  setProfile: (p: UserProfile) => void;
  setSelectedModules: (m: string[]) => void;
  setResults: (r: AnalysisResults) => void;
  setIdentityStatus: (s: "matched" | "new" | null) => void;
  reset: () => void;
}

const Ctx = createContext<AnalysisState | null>(null);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [identityStatus, setIdentityStatus] = useState<
    "matched" | "new" | null
  >(null);

  const reset = () => {
    setProfile(null);
    setSelectedModules([]);
    setResults(null);
    setIdentityStatus(null);
  };

  return (
    <Ctx.Provider
      value={{
        profile,
        selectedModules,
        results,
        identityStatus,
        setProfile,
        setSelectedModules,
        setResults,
        setIdentityStatus,
        reset,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}
