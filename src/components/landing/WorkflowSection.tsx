import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Biometric Login",
    desc: "Authenticate via fingerprint sensor or face recognition. Your identity is verified before accessing any health data.",
  },
  {
    num: "02",
    title: "Passive Face Match",
    desc: "The system generates a facial embedding to match against stored profiles, ensuring data continuity across sessions.",
  },
  {
    num: "03",
    title: "Medical Intake",
    desc: "Provide demographic context (age, sex, height, weight) only when running a full analysis. Partial tests skip this step.",
  },
  {
    num: "04",
    title: "Module Selection",
    desc: "Choose which analysis modules to run — Face, Body, Voice, or 3D Face — based on your screening needs.",
  },
  {
    num: "05",
    title: "Real-Time Analysis",
    desc: "Selected modules execute sequentially, extracting biomarkers from your camera and microphone feed.",
  },
  {
    num: "06",
    title: "AI-Powered Results",
    desc: "View multi-tiered results: summary scores, interactive visualizations, embedded AI explanations, and exportable reports.",
  },
];

const WorkflowSection = () => (
  <section className="relative py-24 px-6 bg-background">
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <span className="text-xs font-mono tracking-[0.2em] text-primary/70 uppercase mb-4 block">
          User Flow
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          How It Works
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          A streamlined 6-step workflow from authentication to comprehensive
          health insights.
        </p>
      </motion.div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-border/50 -translate-x-1/2" />

        {steps.map((step, idx) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className={`relative flex items-start gap-6 mb-12 md:w-1/2 ${
              idx % 2 === 0
                ? "md:pr-12 md:ml-0"
                : "md:pl-12 md:ml-auto md:text-left"
            }`}
          >
            {/* Node dot */}
            <div
              className={`absolute ${
                idx % 2 === 0
                  ? "left-6 md:left-auto md:right-0 md:translate-x-1/2"
                  : "left-6 md:left-0 md:-translate-x-1/2"
              } top-1 w-3 h-3 rounded-full bg-primary border-2 border-background z-10`}
            />

            <div className="ml-12 md:ml-0">
              <span className="text-xs font-mono text-primary/60 tracking-widest">
                {step.num}
              </span>
              <h3 className="text-lg font-semibold text-foreground mt-1 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default WorkflowSection;
