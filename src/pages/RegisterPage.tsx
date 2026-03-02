import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, AlertCircle, UserPlus, Mail, Lock, User, Phone,
  Eye, EyeOff, Calendar, CheckCircle2,
} from "lucide-react";
import registerBg from "@/assets/register-bg.jpg";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!fullName.trim() || !email.trim() || !phone.trim() || !dob.trim() || !password.trim() || !confirmPassword.trim()) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (fullName.trim().length < 2 || fullName.trim().length > 50) {
      setFormError("Full name must be between 2 and 50 characters.");
      return;
    }
    if (!email.trim().toLowerCase().endsWith("@gmail.com")) {
      setFormError("Email must be a valid @gmail.com address.");
      return;
    }
    if (phone.length !== 10) {
      setFormError("Phone number must be exactly 10 digits.");
      return;
    }
    const dobDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - dobDate.getFullYear();
    if (age < 13 || age > 120) {
      setFormError("You must be at least 13 years old to register.");
      return;
    }
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setFormError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[a-z]/.test(password)) {
      setFormError("Password must contain at least one lowercase letter.");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setFormError("Password must contain at least one number.");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setFormError("Password must contain at least one special character.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("nvx_users") || "{}");
    const userKey = email.trim().toLowerCase();
    if (users[userKey]) {
      setFormError("An account with this email already exists.");
      return;
    }

    users[userKey] = {
      fullName: fullName.trim(),
      email: userKey,
      phone,
      dob,
      password,
      createdAt: Date.now(),
    };
    localStorage.setItem("nvx_users", JSON.stringify(users));
    localStorage.setItem("nvx_current_user", userKey);
    sessionStorage.removeItem("nvx_disclaimer_shown");

    setLoading(true);
    setTimeout(() => navigate("/dashboard"), 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${registerBg})` }} />
      <div className="absolute inset-0 bg-background/75 backdrop-blur-sm" />
      <div className="absolute inset-0 neuro-grid opacity-10" />

      <motion.div
        className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-primary/5 blur-[120px]"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 7, repeat: Infinity }}
      />

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>

          <div className="p-8 rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-lg">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
              <p className="text-sm text-muted-foreground mt-2">Register for your Neuro-VX health profile</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-2 block">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" className="h-12 pl-10 bg-background" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-2 block">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="h-12 pl-10 bg-background" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-2 block">Phone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="tel" value={phone} onChange={handlePhoneChange} placeholder="10 digits" maxLength={10} className="h-12 pl-10 bg-background" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-2 block">Date of Birth *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="h-12 pl-10 bg-background" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-2 block">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 chars, uppercase, number, special" className="h-12 pl-10 pr-10 bg-background" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="flex gap-1 mt-2">
                  <div className={`flex-1 h-1 rounded-full ${password.length >= 8 ? "bg-primary" : "bg-border"}`} />
                  <div className={`flex-1 h-1 rounded-full ${/[A-Z]/.test(password) ? "bg-primary" : "bg-border"}`} />
                  <div className={`flex-1 h-1 rounded-full ${/[0-9]/.test(password) ? "bg-primary" : "bg-border"}`} />
                  <div className={`flex-1 h-1 rounded-full ${/[^A-Za-z0-9]/.test(password) ? "bg-primary" : "bg-border"}`} />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-2 block">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className="h-12 pl-10 pr-10 bg-background" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && <p className="text-[11px] text-destructive mt-1">Passwords do not match</p>}
                {confirmPassword && password === confirmPassword && <p className="text-[11px] text-primary mt-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Passwords match</p>}
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
                    CREATING ACCOUNT...
                  </span>
                ) : (
                  <span className="flex items-center gap-2"><UserPlus className="h-4 w-4" /> CREATE ACCOUNT</span>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
