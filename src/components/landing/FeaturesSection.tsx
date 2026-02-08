import { motion } from "framer-motion";
import {
  Heart,
  Activity,
  Mic,
  ScanFace,
  Brain,
  Shield,
  Fingerprint,
  Eye,
} from "lucide-react";

const modules = [
  {
    icon: Heart,
    title: "Face — Cardio/Respiratory",
    desc: "rPPG technology analyzes subtle skin color changes to extract Heart Rate, HRV, Respiratory Rate, pulse wave features, and estimated SpO₂ and Blood Pressure surrogates.",
    color: "text-red-400",
    bgColor: "bg-red-400/10 border-red-400/20",
  },
  {
    icon: Activity,
    title: "Body — Neuro-Motor",
    desc: "Advanced pose estimation and 3D skeleton tracking measure gait analysis (stride, cadence, symmetry, balance), tremor frequency, and posture assessment.",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10 border-emerald-400/20",
  },
  {
    icon: Mic,
    title: "Voice — Audio Biomarkers",
    desc: "Calibrated speech analysis extracts Jitter, Shimmer, Harmonics-to-Noise Ratio (HNR), and Maximum Phonation Time (MPT) from vocal recordings.",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10 border-amber-400/20",
  },
  {
    icon: ScanFace,
    title: "3D Face — Psychometric",
    desc: "Monocular 3D face mesh construction analyzes facial asymmetry, muscle tone imbalance, stress-related structural markers, and baseline emotional load.",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10 border-purple-400/20",
  },
];

const features = [
  {
    icon: Brain,
    title: "AI Risk Stratification",
    desc: "Cross-modal pattern correlation produces probabilistic medical risk signals with confidence scores and uncertainty flags.",
  },
  {
    icon: Shield,
    title: "Biometric Identity",
    desc: "Face-first identity management ensures data integrity. Different faces always create separate profiles, preventing data contamination.",
  },
  {
    icon: Fingerprint,
    title: "Secure Authentication",
    desc: "Fingerprint or face verification via WebAuthn ensures only verified users access their health data.",
  },
  {
    icon: Eye,
    title: "Non-Invasive Screening",
    desc: "Uses only a standard webcam and microphone — no wearables, no blood draws, no physical contact required.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const FeaturesSection = () => (
  <>
    {/* Modules Section */}
    <section className="relative py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-mono tracking-[0.2em] text-primary/70 uppercase mb-4 block">
            Core Modules
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Multi-Modal Biomarker Extraction
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Four specialized analysis modules work in concert, each extracting
            distinct biomarkers from different sensory inputs.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6"
        >
          {modules.map((m) => (
            <motion.div
              key={m.title}
              variants={item}
              className="group p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-500"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-lg ${m.bgColor} border flex items-center justify-center flex-shrink-0`}
                >
                  <m.icon className={`h-6 w-6 ${m.color}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {m.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* Platform Features */}
    <section className="relative py-24 px-6 bg-card/30">
      <div className="absolute inset-0 neuro-grid opacity-10" />
      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-mono tracking-[0.2em] text-primary/70 uppercase mb-4 block">
            Platform Capabilities
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Intelligent Health Monitoring
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className="text-center p-6 rounded-xl border border-border/30 bg-background/50 hover:border-primary/20 transition-all duration-500"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  </>
);

export default FeaturesSection;
