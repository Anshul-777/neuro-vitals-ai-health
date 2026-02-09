import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";
import {
  Fingerprint,
  ScanFace,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const {
    method,
    status,
    error,
    detectMethod,
    authenticateFingerprint,
    startFaceCapture,
    completeFaceAuth,
    reset,
  } = useBiometricAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"credentials" | "biometric">("credentials");
  const [faceScanning, setFaceScanning] = useState(false);
  const [formError, setFormError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    detectMethod();
  }, [detectMethod]);

  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!email.trim() || !password.trim()) {
      setFormError("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem("nvx_users") || "{}");
    const user = users[email];
    if (!user) {
      setFormError("No account found with this email. Please register first.");
      return;
    }
    if (user.password !== password) {
      setFormError("Incorrect password. Please try again.");
      return;
    }

    setStep("biometric");
  };

  const handleFingerprintAuth = async () => {
    const success = await authenticateFingerprint(email);
    if (success) {
      setTimeout(() => navigate("/dashboard"), 1000);
    }
  };

  const handleFaceAuth = async () => {
    if (!videoRef.current) return;
    const started = await startFaceCapture(videoRef.current);
    if (started) {
      setFaceScanning(true);
      const success = await completeFaceAuth(email, false);
      if (success) {
        setTimeout(() => navigate("/dashboard"), 1000);
      }
      setFaceScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 neuro-grid opacity-15" />
      <motion.div
        className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-primary/5 blur-[120px]"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="p-8 rounded-2xl border border-border bg-card shadow-sm">
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome Back
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Sign in to your Neuro-VX account
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`flex-1 h-1 rounded-full transition-colors ${step === "credentials" ? "bg-primary" : "bg-primary"}`} />
              <div className={`flex-1 h-1 rounded-full transition-colors ${step === "biometric" ? "bg-primary" : "bg-border"}`} />
            </div>

            <AnimatePresence mode="wait">
              {step === "credentials" && (
                <motion.form
                  key="credentials"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleCredentialSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-2 block">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="h-12 pl-10 bg-background"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-2 block">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="h-12 pl-10 pr-10 bg-background"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {formError && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                    >
                      <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                      <p className="text-sm text-destructive">{formError}</p>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 font-mono tracking-wider text-sm"
                  >
                    CONTINUE TO VERIFICATION
                  </Button>
                </motion.form>
              )}

              {step === "biometric" && (
                <motion.div
                  key="biometric"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <p className="text-xs font-mono text-muted-foreground tracking-wider mb-1">
                      VERIFYING IDENTITY FOR
                    </p>
                    <p className="text-foreground font-semibold">{email}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-xs text-muted-foreground text-center">
                      {method === "fingerprint"
                        ? "Fingerprint sensor detected. Use your fingerprint to verify identity."
                        : "No fingerprint sensor detected. Face recognition will be used."}
                    </p>
                  </div>

                  {/* Fingerprint option */}
                  {method === "fingerprint" && status !== "success" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                    >
                      <button
                        onClick={handleFingerprintAuth}
                        disabled={status === "authenticating"}
                        className="w-full p-6 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all duration-300 flex flex-col items-center gap-3 disabled:opacity-50"
                      >
                        {status === "authenticating" ? (
                          <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        ) : (
                          <Fingerprint className="h-10 w-10 text-primary" />
                        )}
                        <span className="text-sm font-mono text-foreground tracking-wider">
                          {status === "authenticating" ? "SCANNING..." : "TAP TO VERIFY FINGERPRINT"}
                        </span>
                      </button>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground/60">or</span>
                        <div className="flex-1 h-px bg-border" />
                      </div>

                      <button
                        onClick={handleFaceAuth}
                        disabled={status === "authenticating"}
                        className="w-full p-4 rounded-xl border border-border hover:border-primary/20 transition-all duration-300 flex items-center gap-3 disabled:opacity-50"
                      >
                        <ScanFace className="h-6 w-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Use face verification instead</span>
                      </button>
                    </motion.div>
                  )}

                  {/* Face fallback */}
                  {method === "face" && status !== "success" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                    >
                      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-primary/30 bg-muted/30">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                        {!faceScanning && (
                          <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
                            <ScanFace className="h-16 w-16 text-muted-foreground/30" />
                          </div>
                        )}
                        {faceScanning && (
                          <>
                            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
                            <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-primary/50 rounded-tl" />
                            <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-primary/50 rounded-tr" />
                            <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-primary/50 rounded-bl" />
                            <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-primary/50 rounded-br" />
                          </>
                        )}
                      </div>

                      {!faceScanning && (
                        <Button onClick={handleFaceAuth} disabled={status === "authenticating"} className="w-full h-12 font-mono tracking-wider text-sm">
                          <ScanFace className="mr-2 h-5 w-5" /> START FACE VERIFICATION
                        </Button>
                      )}
                      {faceScanning && (
                        <p className="text-center text-sm font-mono text-primary animate-pulse tracking-wider">
                          ANALYZING BIOMETRICS...
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* Success */}
                  {status === "success" && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 py-6">
                      <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/50 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-primary" />
                      </div>
                      <p className="font-mono text-sm text-foreground tracking-wider">IDENTITY VERIFIED</p>
                      <p className="text-xs text-muted-foreground">Redirecting to dashboard...</p>
                    </motion.div>
                  )}

                  {/* Error */}
                  {status === "error" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-destructive font-medium">Verification Failed</p>
                        <p className="text-xs text-destructive/70 mt-1">{error}</p>
                        <Button variant="ghost" size="sm" onClick={reset} className="mt-2 text-xs">Try Again</Button>
                      </div>
                    </motion.div>
                  )}

                  {status !== "success" && (
                    <button
                      onClick={() => { setStep("credentials"); reset(); }}
                      className="w-full text-center text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                    >
                      ← Back to credentials
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
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
