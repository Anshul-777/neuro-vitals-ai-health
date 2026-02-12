import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnalysisProvider } from "@/context/AnalysisContext";
import { AnimatePresence, motion } from "framer-motion";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AccountPage from "./pages/AccountPage";
import SettingsPage from "./pages/SettingsPage";
import IntakeFormPage from "./pages/IntakeFormPage";
import TestSelectionPage from "./pages/TestSelectionPage";
import AnalysisPage from "./pages/AnalysisPage";
import ResultsPage from "./pages/ResultsPage";
import AboutPage from "./pages/AboutPage";
import HelpContactPage from "./pages/HelpContactPage";
import NotFound from "./pages/NotFound";
import Chatbot from "./components/Chatbot";

const queryClient = new QueryClient();

const authenticatedRoutes = ["/dashboard", "/account", "/settings", "/intake", "/test-selection", "/analysis", "/results", "/about", "/help"];

function AnimatedRoutes() {
  const location = useLocation();
  const showChatbot = authenticatedRoutes.some((r) => location.pathname.startsWith(r));

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Routes location={location}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/intake" element={<IntakeFormPage />} />
            <Route path="/test-selection" element={<TestSelectionPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/help" element={<HelpContactPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      {showChatbot && <Chatbot />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AnalysisProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </AnalysisProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
