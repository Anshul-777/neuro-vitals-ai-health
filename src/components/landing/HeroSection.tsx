import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, ChevronDown } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div className="absolute inset-0 neuro-grid opacity-30" />

      {/* Animated glow orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px]"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/8 blur-[100px]"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8"
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-mono tracking-[0.2em] text-primary/90 uppercase">
            Multi-Modal Digital Health Platform
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="text-6xl md:text-8xl font-extrabold text-foreground mb-6 tracking-tighter"
        >
          NEURO
          <span className="text-primary">—</span>VX
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed"
        >
          Non-invasive biometric health screening powered by computer vision,
          audio signal processing, and AI-driven risk stratification.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-sm text-muted-foreground/60 mb-12 max-w-xl mx-auto italic"
        >
          Not a diagnostic replacement — consult a healthcare professional for
          medical concerns.
        </motion.p>

        {/* Pulse line */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.9 }}
          className="mb-12 overflow-hidden"
        >
          <svg
            viewBox="0 0 400 50"
            className="w-full max-w-md mx-auto h-10 text-primary"
          >
            <path
              d="M0,25 L60,25 L80,25 L90,8 L100,42 L110,25 L140,25 L155,5 L165,45 L175,25 L250,25 L265,10 L275,40 L285,25 L400,25"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              className="animate-pulse-line"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            onClick={() => navigate("/login")}
            size="lg"
            className="px-8 h-14 text-base font-mono tracking-wider min-w-[200px]"
          >
            <LogIn className="mr-2 h-5 w-5" />
            LOGIN
          </Button>
          <Button
            onClick={() => navigate("/register")}
            size="lg"
            variant="outline"
            className="px-8 h-14 text-base font-mono tracking-wider min-w-[200px] border-primary/30 hover:bg-primary/10"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            REGISTER
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="h-6 w-6 text-muted-foreground/40" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
