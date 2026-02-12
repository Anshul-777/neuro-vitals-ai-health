import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, HelpCircle, Mail, Star, MessageSquare, ChevronDown, ChevronUp, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";

const FAQ_DATA = [
  { q: "What is Neuro-Vitals?", a: "Neuro-Vitals (NVX) is an AI-powered biometric health assessment platform that uses your device camera and microphone to measure cardiovascular, neurological, respiratory, and speech health indicators through non-invasive analysis." },
  { q: "How accurate are the results?", a: "Our algorithms are based on peer-reviewed research and validated against clinical instruments. However, results are for screening purposes only and should not replace professional medical diagnosis. Environmental factors like lighting and background noise can affect accuracy." },
  { q: "Is my data secure?", a: "Yes. All biometric data is processed locally on your device. Only extracted metrics (not raw video/audio) are stored, and all stored data is encrypted. You can export or delete your data at any time from Settings." },
  { q: "What do I need for the best results?", a: "A well-lit environment, a stable device position, a quiet room for voice analysis, and enough space to walk for body scan. Follow the pre-test instructions carefully for each module." },
  { q: "Can I run individual tests?", a: "Yes. You can choose Individual Test Selection from the dashboard to run specific modules independently. Results will only show metrics relevant to the selected tests." },
  { q: "What does the risk level mean?", a: "Risk levels (Low, Medium, High) are based on clinically-derived thresholds. They indicate areas that may warrant further professional evaluation but are NOT diagnoses. An 'Uncertain' level means insufficient data was captured for that domain." },
  { q: "How do I delete my account?", a: "Go to Account → Settings → Danger Zone → Delete Account. This permanently removes all your data including test history, biometric profiles, and account information." },
  { q: "Does it work on all devices?", a: "Neuro-Vitals works on devices with a front-facing camera and microphone. For best results, use a device with at least a 720p camera. Both desktop and mobile browsers are supported." },
];

const HelpContactPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactSubject || !contactMessage) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    // Store locally / placeholder for API
    const messages = JSON.parse(localStorage.getItem("nvx_contact_messages") || "[]");
    messages.push({ name: contactName, email: contactEmail, subject: contactSubject, message: contactMessage, created_at: new Date().toISOString() });
    localStorage.setItem("nvx_contact_messages", JSON.stringify(messages));
    toast({ title: "Message sent!", description: "We'll get back to you soon." });
    setContactName(""); setContactEmail(""); setContactSubject(""); setContactMessage("");
  };

  const handleFeedback = () => {
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }
    const feedbacks = JSON.parse(localStorage.getItem("nvx_feedback") || "[]");
    feedbacks.push({ rating, message: feedback, created_at: new Date().toISOString() });
    localStorage.setItem("nvx_feedback", JSON.stringify(feedbacks));
    toast({ title: "Thank you for your feedback!" });
    setRating(0); setFeedback("");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 px-6 py-4 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold tracking-tight text-foreground">Help & Contact</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* FAQ */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-2">
            {FAQ_DATA.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="rounded-xl border border-border/50 bg-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/30 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="px-4 pb-4"
                  >
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Contact Form */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div className="flex items-center gap-3 mb-6">
            <Mail className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Contact Us</h2>
          </div>
          <form onSubmit={handleContact} className="p-6 rounded-xl border border-border/50 bg-card space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input placeholder="Your Name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
              <Input placeholder="Your Email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>
            <Input placeholder="Subject" value={contactSubject} onChange={(e) => setContactSubject(e.target.value)} />
            <Textarea placeholder="Your message..." rows={4} value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} />
            <div className="flex items-center justify-between">
              <a href="mailto:anshulrathod999@gmail.com" className="text-sm text-primary hover:underline">
                Or email us directly
              </a>
              <Button type="submit">
                <Send className="h-4 w-4 mr-2" /> Send Message
              </Button>
            </div>
          </form>
        </motion.section>

        {/* Rating & Feedback */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Rate & Feedback</h2>
          </div>
          <div className="p-6 rounded-xl border border-border/50 bg-card space-y-6">
            <div>
              <p className="text-sm font-medium text-foreground mb-3">How would you rate your experience?</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        s <= (hoverRating || rating) ? "text-warning fill-warning" : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              placeholder="Tell us what you think... (optional)"
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <Button onClick={handleFeedback}>Submit Feedback</Button>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default HelpContactPage;
