import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, LogOut, Shield, Bell, HelpCircle, FileText, Trash2,
  Globe, Lock, Info, ChevronRight, ToggleLeft, ToggleRight,
  Download, History, Eye, EyeOff,
} from "lucide-react";
import { useAnalysis } from "@/context/AnalysisContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { reset } = useAnalysis();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showClearHistory, setShowClearHistory] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [language, setLanguage] = useState("English (US)");

  useEffect(() => {
    setNotifications(localStorage.getItem("nvx_notifications") !== "false");
    setDataSharing(localStorage.getItem("nvx_data_sharing") === "true");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("nvx_current_user");
    sessionStorage.removeItem("nvx_disclaimer_shown");
    reset();
    navigate("/");
  };

  const toggleNotifications = () => {
    const next = !notifications;
    setNotifications(next);
    localStorage.setItem("nvx_notifications", String(next));
    toast({ title: next ? "Notifications enabled" : "Notifications disabled" });
  };

  const toggleDataSharing = () => {
    const next = !dataSharing;
    setDataSharing(next);
    localStorage.setItem("nvx_data_sharing", String(next));
    toast({ title: next ? "Data sharing enabled" : "Data sharing disabled" });
  };

  const handleExportData = () => {
    const currentUser = localStorage.getItem("nvx_current_user");
    const users = JSON.parse(localStorage.getItem("nvx_users") || "{}");
    const history = JSON.parse(localStorage.getItem("nvx_test_history") || "[]");
    const data = { user: users[currentUser || ""] || {}, testHistory: history, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nvx-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Data exported successfully" });
  };

  const handleClearHistory = () => {
    localStorage.removeItem("nvx_test_history");
    setShowClearHistory(false);
    toast({ title: "History cleared" });
  };

  const handleChangePassword = () => {
    const currentUser = localStorage.getItem("nvx_current_user");
    if (!currentUser) return;
    const users = JSON.parse(localStorage.getItem("nvx_users") || "{}");
    const user = users[currentUser];
    if (!user || user.password !== oldPassword) {
      toast({ title: "Incorrect current password", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    user.password = newPassword;
    users[currentUser] = user;
    localStorage.setItem("nvx_users", JSON.stringify(users));
    setShowChangePassword(false);
    setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    toast({ title: "Password changed successfully" });
  };

  const handleDeleteAccount = () => {
    const currentUser = localStorage.getItem("nvx_current_user");
    if (!currentUser) return;
    const users = JSON.parse(localStorage.getItem("nvx_users") || "{}");
    delete users[currentUser];
    localStorage.setItem("nvx_users", JSON.stringify(users));
    ["nvx_avatars"].forEach((key) => {
      const data = JSON.parse(localStorage.getItem(key) || "{}");
      delete data[currentUser];
      localStorage.setItem(key, JSON.stringify(data));
    });
    localStorage.removeItem("nvx_current_user");
    localStorage.removeItem("nvx_test_history");
    sessionStorage.removeItem("nvx_disclaimer_shown");
    reset();
    navigate("/");
  };

  const sections = [
    {
      title: "General",
      items: [
        { icon: Bell, label: "Notifications", description: "Receive alerts for analysis results and health updates", action: <button onClick={toggleNotifications} className="text-primary">{notifications ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}</button> },
        { icon: Globe, label: "Language", description: language, action: <ChevronRight className="h-4 w-4 text-muted-foreground" /> },
      ],
    },
    {
      title: "Privacy & Security",
      items: [
        { icon: Shield, label: "Data Privacy", description: "Manage how your health data is stored and processed", action: <ChevronRight className="h-4 w-4 text-muted-foreground" /> },
        { icon: Lock, label: "Change Password", description: "Update your account password", action: <ChevronRight className="h-4 w-4 text-muted-foreground" />, onClick: () => setShowChangePassword(true) },
        { icon: ToggleLeft, label: "Data Sharing", description: "Share anonymized data for research", action: <button onClick={toggleDataSharing} className="text-primary">{dataSharing ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}</button> },
      ],
    },
    {
      title: "Data Management",
      items: [
        { icon: Download, label: "Export Data", description: "Download all health data as JSON", action: <ChevronRight className="h-4 w-4 text-muted-foreground" />, onClick: handleExportData },
        { icon: Trash2, label: "Clear History", description: "Remove all past test records", action: <ChevronRight className="h-4 w-4 text-muted-foreground" />, onClick: () => setShowClearHistory(true) },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help & FAQ", description: "Common questions and troubleshooting", action: <ChevronRight className="h-4 w-4 text-muted-foreground" />, onClick: () => navigate("/help") },
        { icon: Info, label: "About Neuro-Vitals", description: "Version 1.0.0 — AI-powered health platform", action: <ChevronRight className="h-4 w-4 text-muted-foreground" />, onClick: () => navigate("/about") },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10 flex-1 w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your account preferences and privacy settings</p>
        </motion.div>

        {sections.map((section, sIdx) => (
          <motion.div key={section.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: sIdx * 0.1 }} className="mb-8">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{section.title}</h3>
            <div className="rounded-xl border border-border/50 bg-card divide-y divide-border/50">
              {section.items.map((item, iIdx) => (
                <motion.div key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: sIdx * 0.1 + iIdx * 0.05 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-accent/30 transition-colors cursor-pointer"
                  onClick={(item as any).onClick}
                >
                  <item.icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  {item.action}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Change Password Modal */}
        {showChangePassword && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-6 shadow-xl">
              <h3 className="text-lg font-bold text-foreground mb-4">Change Password</h3>
              <div className="space-y-3">
                <div className="relative">
                  <Input type={showOld ? "text" : "password"} placeholder="Current Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                  <button onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2">{showOld ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}</button>
                </div>
                <div className="relative">
                  <Input type={showNew ? "text" : "password"} placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2">{showNew ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}</button>
                </div>
                <Input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => { setShowChangePassword(false); setOldPassword(""); setNewPassword(""); setConfirmPassword(""); }} className="flex-1">Cancel</Button>
                <Button onClick={handleChangePassword} className="flex-1">Update Password</Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Clear History Confirm */}
        {showClearHistory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-sm rounded-2xl border border-border/50 bg-card p-6 shadow-xl text-center">
              <History className="h-10 w-10 text-warning mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground mb-2">Clear All History?</h3>
              <p className="text-sm text-muted-foreground mb-6">This will permanently remove all past test records.</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowClearHistory(false)} className="flex-1">Cancel</Button>
                <Button variant="destructive" onClick={handleClearHistory} className="flex-1">Clear History</Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Danger Zone */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }} className="mb-8">
          <h3 className="text-sm font-semibold text-destructive uppercase tracking-wider mb-3">Danger Zone</h3>
          <div className="space-y-3">
            <button onClick={handleLogout} className="w-full p-4 rounded-xl border border-border/50 bg-card hover:border-destructive/30 hover:bg-destructive/5 transition-all flex items-center gap-4">
              <LogOut className="h-5 w-5 text-destructive" />
              <div className="text-left">
                <p className="text-sm font-semibold text-destructive">Log Out</p>
                <p className="text-xs text-muted-foreground">Sign out of your account</p>
              </div>
            </button>
            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)} className="w-full p-4 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-all flex items-center gap-4">
                <Trash2 className="h-5 w-5 text-destructive" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-destructive">Delete Account</p>
                  <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
                </div>
              </button>
            ) : (
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-5 rounded-xl border border-destructive/50 bg-destructive/10">
                <p className="text-sm text-destructive font-medium mb-4">Are you sure? This cannot be undone.</p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1">Cancel</Button>
                  <Button variant="destructive" onClick={handleDeleteAccount} className="flex-1">Delete Forever</Button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default SettingsPage;
