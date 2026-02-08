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
  UserPlus,
} from "lucide-react";

const RegisterPage = () => {
  const navigate = useNavigate();
  const {
    method,
    status,
    error,
    detectMethod,
    registerFingerprint,
    startFaceCapture,
    completeFaceAuth,
    reset,
  } = useBiometricAuth();

  const [userId, setUserId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [step, setStep] = useState<"info" | "biometric">("info");
  const [faceScanning, setFaceScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    detectMethod();
  }, [detectMethod]);

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !displayName.trim()) return;

    // Check if user already exists
    const existingCreds = JSON.parse(
      localStorage.getItem("nvx_credentials") || "{}"
    );
    const existingFaces = JSON.parse(
      localStorage.getItem("nvx_face_profiles") || "{}"
    );
    if (existingCreds[userId] || existingFaces[userId]) {
      alert("This User ID is already registered. Please login instead.");
      return;
    }

    // Store display name
    const profiles = JSON.parse(
      localStorage.getItem("nvx_profiles") || "{}"
    );
    profiles[userId] = { displayName, createdAt: Date.now() };
    localStorage.setItem("nvx_profiles", JSON.stringify(profiles));

    setStep("biometric");
  };

  const handleFingerprintRegister = async () => {
    const success = await registerFingerprint(userId);
    if (success) {
      setTimeout(() => navigate("/login"), 1500);
    }
  };

  const handleFaceRegister = async () => {
    if (!videoRef.current) return;
    const started = await startFaceCapture(videoRef.current);
    if (started) {
      setFaceScanning(true);
      const success = await completeFaceAuth(userId, true);
      if (success) {
        setTimeout(() => navigate("/login"), 1500);
      }
      setFaceScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 neuro-grid opacity-20" />
      <motion.div
        className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-primary/5 blur-[120px]"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 7, repeat: Infinity }}
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

          <div className="p-8 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <UserPlus className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Create Account
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Register with biometric verification
              </p>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-2 mb-8">
              <div
                className={`flex-1 h-1 rounded-full transition-colors ${
                  step === "info" ? "bg-primary" : "bg-primary"
                }`}
              />
              <div
                className={`flex-1 h-1 rounded-full transition-colors ${
                  step === "biometric" ? "bg-primary" : "bg-border/50"
                }`}
              />
            </div>

            <AnimatePresence mode="wait">
              {step === "info" && (
                <motion.form
                  key="info"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleInfoSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2 block">
                      User ID
                    </label>
                    <Input
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="Choose a unique user ID"
                      className="h-12 bg-background/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2 block">
                      Display Name
                    </label>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your display name"
                      className="h-12 bg-background/50"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 font-mono tracking-wider"
                  >
                    CONTINUE TO BIOMETRIC SETUP
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
                      REGISTERING AS
                    </p>
                    <p className="text-foreground font-semibold">
                      {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      @{userId}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-xs text-muted-foreground text-center">
                      {method === "fingerprint"
                        ? "Your device supports fingerprint authentication. Enroll your fingerprint for secure login."
                        : "No fingerprint sensor detected. Face recognition will be used for authentication."}
                    </p>
                  </div>

                  {/* Fingerprint registration */}
                  {method === "fingerprint" && status !== "success" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                    >
                      <button
                        onClick={handleFingerprintRegister}
                        disabled={status === "authenticating"}
                        className="w-full p-6 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all duration-300 flex flex-col items-center gap-3 disabled:opacity-50"
                      >
                        {status === "authenticating" ? (
                          <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        ) : (
                          <Fingerprint className="h-10 w-10 text-primary" />
                        )}
                        <span className="text-sm font-mono text-foreground tracking-wider">
                          {status === "authenticating"
                            ? "ENROLLING..."
                            : "TAP TO ENROLL FINGERPRINT"}
                        </span>
                      </button>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-border/50" />
                        <span className="text-xs text-muted-foreground/50">
                          or
                        </span>
                        <div className="flex-1 h-px bg-border/50" />
                      </div>

                      <button
                        onClick={handleFaceRegister}
                        disabled={status === "authenticating"}
                        className="w-full p-4 rounded-xl border border-border/50 hover:border-primary/20 transition-all duration-300 flex items-center gap-3 disabled:opacity-50"
                      >
                        <ScanFace className="h-6 w-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Register with face instead
                        </span>
                      </button>
                    </motion.div>
                  )}

                  {/* Face registration */}
                  {method === "face" && status !== "success" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                    >
                      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-primary/30 bg-background/50">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover scale-x-[-1]"
                        />
                        {!faceScanning && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
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
                        <Button
                          onClick={handleFaceRegister}
                          disabled={status === "authenticating"}
                          className="w-full h-12 font-mono tracking-wider"
                        >
                          <ScanFace className="mr-2 h-5 w-5" />
                          ENROLL FACE PROFILE
                        </Button>
                      )}
                      {faceScanning && (
                        <p className="text-center text-sm font-mono text-primary animate-pulse tracking-wider">
                          CAPTURING BIOMETRICS...
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* Success */}
                  {status === "success" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-4 py-6"
                    >
                      <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/50 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-primary" />
                      </div>
                      <p className="font-mono text-sm text-foreground tracking-wider">
                        REGISTRATION COMPLETE
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Redirecting to login...
                      </p>
                    </motion.div>
                  )}

                  {/* Error */}
                  {status === "error" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20"
                    >
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-destructive font-medium">
                          Registration Failed
                        </p>
                        <p className="text-xs text-destructive/70 mt-1">
                          {error}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={reset}
                          className="mt-2 text-xs"
                        >
                          Try Again
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {status !== "success" && (
                    <button
                      onClick={() => {
                        setStep("info");
                        reset();
                      }}
                      className="w-full text-center text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    >
                      ← Back to details
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
