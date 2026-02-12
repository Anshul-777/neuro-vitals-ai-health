import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Brain, Shield, Eye, Activity, Heart, Mic, Box, Target, Sparkles } from "lucide-react";
import Footer from "@/components/Footer";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 px-6 py-4 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold tracking-tight text-foreground">About Neuro-Vitals</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* Mission */}
        <motion.section {...fadeUp}>
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Our Mission</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Neuro-Vitals (NVX) is an advanced AI-powered biometric health assessment platform designed to bring clinical-grade physiological screening directly to your device. Our mission is to democratize access to early health detection by leveraging cutting-edge computer vision, audio signal processing, and machine learning — all without the need for specialized medical equipment or invasive procedures.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We believe that every person deserves proactive insight into their own health. By harnessing the sensors already present in modern devices — cameras and microphones — Neuro-Vitals transforms routine self-checks into comprehensive, multi-modal health assessments that were previously only available in controlled clinical environments. Our platform empowers users to monitor cardiovascular fitness, neurological function, respiratory health, and speech pathology indicators from the comfort of their homes.
          </p>
        </motion.section>

        {/* Technology */}
        <motion.section {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Technology & Methodology</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Neuro-Vitals employs a sophisticated multi-modal analysis pipeline that integrates four distinct biomarker extraction modules, each targeting a specific physiological domain. These modules operate sequentially or independently depending on the user's selection, producing a comprehensive health profile that is then passed through our proprietary risk stratification engine.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-border/50 bg-card">
              <div className="flex items-center gap-3 mb-3">
                <Heart className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Remote Photoplethysmography (rPPG)</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our Face Scan module uses remote photoplethysmography to detect subtle color changes in facial skin caused by blood volume pulse. By analyzing the green channel of the RGB video feed captured through your device camera, the algorithm extracts heart rate (BPM), heart rate variability (HRV measured as SDNN), and respiratory rate (RR). This technique has been validated against clinical pulse oximetry with correlations exceeding 0.95 in controlled studies. The signal processing pipeline includes bandpass filtering, independent component analysis (ICA), and peak detection algorithms optimized for real-time performance.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/50 bg-card">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Gait & Neuro-Motor Analysis</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Body Scan module leverages MediaPipe's pose estimation framework to track 33 skeletal key points in real-time. From this data, we compute gait metrics including cadence (steps per minute), stride length, gait symmetry index, and dynamic balance stability. Asymmetry in gait patterns can indicate neurological conditions such as early-stage Parkinson's disease, multiple sclerosis, or peripheral neuropathy. Our algorithms compare the user's gait signature against population-normalized baselines adjusted for age, sex, and body proportions.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/50 bg-card">
              <div className="flex items-center gap-3 mb-3">
                <Mic className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Voice & Speech Biomarkers</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Voice Scan module captures audio through the device microphone and applies librosa-based spectral analysis to extract clinically relevant vocal biomarkers. Key metrics include Maximum Phonation Time (MPT), jitter (frequency perturbation), shimmer (amplitude perturbation), and Harmonics-to-Noise Ratio (HNR). These parameters are established indicators in speech pathology for conditions including vocal cord dysfunction, laryngeal pathology, and neurological speech disorders such as dysarthria. The analysis pipeline includes noise reduction, voice activity detection, and fundamental frequency extraction.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/50 bg-card">
              <div className="flex items-center gap-3 mb-3">
                <Box className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">3D Facial Structure Analysis</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The 3D Face Scan module performs a multi-angle facial geometry assessment using depth estimation from monocular video. By analyzing facial landmarks across different head orientations, we compute facial asymmetry scores and eye openness ratios. Facial asymmetry beyond certain thresholds may indicate conditions such as Bell's palsy, stroke sequelae, or congenital structural variations. The 3D reconstruction uses a dense face alignment network trained on over 300,000 facial scans to achieve sub-millimeter accuracy in landmark positioning.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Risk Stratification */}
        <motion.section {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
          <div className="flex items-center gap-3 mb-4">
            <Brain className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Risk Stratification Engine</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-4">
            All extracted biomarkers are fed into our multi-domain risk stratification engine, which evaluates five distinct health domains: cardiovascular health, respiratory function, neuro-motor gait patterns, neuro-motor facial indicators, and speech pathology. Each domain receives a risk classification (Low, Medium, High, or Uncertain) based on clinically-derived thresholds. The engine also computes an overall confidence score that reflects the completeness and quality of the input data. When insufficient data is available for a particular domain — for example, when a user skips the Voice Scan — that domain is flagged as "uncertain" rather than receiving a potentially misleading classification.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The stratification model incorporates established clinical thresholds: resting heart rate above 100 BPM triggers a high cardiovascular flag, HRV below 20ms SDNN raises a medium alert, gait symmetry below 80% suggests neuro-motor concerns, and vocal jitter above 1.0% indicates potential speech pathology. These thresholds are based on peer-reviewed literature and clinical practice guidelines, though they are calibrated for screening purposes rather than diagnostic confirmation.
          </p>
        </motion.section>

        {/* Privacy */}
        <motion.section {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.3 }}>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Privacy & Security</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Your health data is sensitive, and we treat it with the highest standards of security and privacy. Neuro-Vitals processes all biometric data locally on your device whenever possible. Video and audio feeds are analyzed in real-time and are never stored on external servers. Only the extracted numerical metrics — not raw biometric data — are optionally stored for longitudinal tracking, and this data is encrypted at rest using AES-256 encryption.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Our platform adheres to HIPAA-compliant data handling practices and follows GDPR principles for data minimization and purpose limitation. Users retain full control over their data at all times, with the ability to export all records in standard formats or permanently delete their account and all associated data through the Settings page. We never sell, share, or monetize user health data. Any anonymized data contributions for research improvement are strictly opt-in and require explicit user consent.
          </p>
        </motion.section>

        {/* Vision */}
        <motion.section {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.4 }}>
          <div className="flex items-center gap-3 mb-4">
            <Eye className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Vision & Future Roadmap</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Neuro-Vitals is at the forefront of a paradigm shift in personal health monitoring. Our vision extends beyond passive health tracking to active, intelligent health companionship. Future releases will incorporate longitudinal trend analysis that can detect subtle changes in health markers over weeks and months — identifying patterns that might be invisible in single-session snapshots. We are also developing an AI health advisor powered by large language models that can interpret results in the context of a user's complete health history.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Upcoming features include integration with wearable devices for continuous monitoring, clinician dashboards for remote patient monitoring, multi-language support, and a clinical validation program in partnership with research hospitals. We are also exploring the addition of new analysis modules including dermatological screening, pupillometry for cognitive load assessment, and blood oxygen estimation through enhanced rPPG techniques.
          </p>
        </motion.section>

        {/* Disclaimer */}
        <motion.section {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.5 }}>
          <div className="p-6 rounded-xl border border-warning/30 bg-warning/5">
            <h3 className="font-semibold text-foreground mb-3">⚠️ Medical Disclaimer</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Neuro-Vitals is designed as a screening and monitoring tool for informational purposes only. It is not intended to diagnose, treat, cure, or prevent any disease or medical condition. The results generated by this platform should not be interpreted as medical advice and should not replace professional medical evaluation, diagnosis, or treatment. Always consult a qualified healthcare professional regarding any health concerns or before making any decisions related to your health or treatment. If you are experiencing a medical emergency, please call emergency services immediately. The accuracy of results may be affected by environmental conditions, device quality, and user compliance with testing instructions.
            </p>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
