import { motion } from "framer-motion";
import { BarChart3, LineChart, Bot, FileText } from "lucide-react";

const tiers = [
  {
    icon: BarChart3,
    tier: "Tier 1",
    title: "Summary Scores",
    desc: "At-a-glance overview of key metrics and color-coded risk signals — green for optimal, yellow for caution, red for attention needed.",
  },
  {
    icon: LineChart,
    tier: "Tier 2",
    title: "Interactive Visualizations",
    desc: "Deep-dive with rPPG waveform replays, HRV plots, audio spectrograms, interactive 3D skeleton, and rotatable face mesh.",
  },
  {
    icon: Bot,
    tier: "Tier 3",
    title: "Embedded AI Assistant",
    desc: "Context-aware AI that understands your current results. Ask questions directly — no need to re-explain your data.",
  },
  {
    icon: FileText,
    tier: "Tier 4",
    title: "AI Summary Reports",
    desc: "Generate comprehensive reports combining current analysis with historical data. Exportable as PDF for healthcare professionals.",
  },
];

const ResultsTiersSection = () => (
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
          Results Interface
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Multi-Tiered Results
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Complex health data rendered in layers of increasing depth, from
          quick summary to AI-powered explanations.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((t, idx) => (
          <motion.div
            key={t.tier}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="relative p-6 rounded-xl border border-border/30 bg-background/50 hover:border-primary/20 transition-all duration-500 group"
          >
            <div className="absolute top-4 right-4 text-[10px] font-mono text-primary/40 tracking-widest uppercase">
              {t.tier}
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
              <t.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{t.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ResultsTiersSection;
