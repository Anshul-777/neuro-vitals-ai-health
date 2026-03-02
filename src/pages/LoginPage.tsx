import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, AlertCircle, Shield, Mail, Lock, Eye, EyeOff, LogIn,
} from "lucide-react";
import loginBg from "@/assets/login-bg.jpg";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!email.trim() || !password.trim()) {
      setFormError("Please fill in all fields.");
      return;
    }

    if (!email.trim().toLowerCase().endsWith("@gmail.com")) {
      setFormError("Email must be a valid @gmail.com address.");
      return;
    }

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    const userKey = email.trim().toLowerCase();
    const users = JSON.parse(localStorage.getItem("nvx_users") || "{}");
    const user = users[userKey];
    if (!user) {
      setFormError("No account found with this email. Please register first.");
      return;
    }
    if (user.password !== password) {
      setFormError("Incorrect password. Please try again.");
      return;
    }

    setLoading(true);
    localStorage.setItem("nvx_current_user", userKey);
    sessionStorage.removeItem("nvx_disclaimer_shown");
    setTimeout(() => navigate("/dashboard"), 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${loginBg})` }} />
      <div className="absolute inset-0 bg-background/75 backdrop-blur-sm" />
      <div className="absolute inset-0 neuro-grid opacity-10" />

      <motion.div
        className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-primary/5 blur-[120px]"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>

          <div className="p-8 rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-lg">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
              <p className="text-sm text-muted-foreground mt-2">Sign in to your Neuro-VX account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-2 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-12 pl-10 bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 pl-10 pr-10 bg-background"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {formError && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{formError}</p>
                </motion.div>
              )}

              <Button type="submit" disabled={loading} className="w-full h-12 font-mono tracking-wider text-sm">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    SIGNING IN...
                  </span>
                ) : (
                  <span className="flex items-center gap-2"><LogIn className="h-4 w-4" /> SIGN IN</span>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:underline font-medium">Register</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
