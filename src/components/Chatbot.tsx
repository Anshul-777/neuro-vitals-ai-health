import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "bot";
  text: string;
}

const FALLBACK_RESPONSES: Record<string, string> = {
  hello: "Hello! I'm the Neuro-Vitals assistant. How can I help you today?",
  help: "I can help you with: navigating the platform, understanding your results, test preparation tips, and general health questions. What would you like to know?",
  test: "Neuro-Vitals offers 4 analysis modules: Face Scan (cardio-respiratory), Body Scan (gait & neuro-motor), Voice Scan (speech biomarkers), and 3D Face Scan (structural analysis). You can run them individually or as a full system analysis.",
  results: "Your results show risk levels for 5 health domains. Low = normal range, Medium = monitor closely, High = consult a professional. Results are for screening only.",
  privacy: "Your data is processed locally on your device. We never store raw video or audio. Only extracted metrics are saved, encrypted, and under your full control.",
};

function getBotResponse(msg: string): string {
  const lower = msg.toLowerCase();
  for (const [key, val] of Object.entries(FALLBACK_RESPONSES)) {
    if (lower.includes(key)) return val;
  }
  return "I understand your question. For detailed medical advice, please consult a healthcare professional. Is there anything else about the Neuro-Vitals platform I can help with?";
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hi! I'm the NVX assistant. Ask me anything about the platform or your health analysis." },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsTyping(true);

    // Placeholder for Gemini API — currently uses local fallback
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "bot", text: getBotResponse(userMsg) }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[28rem] rounded-2xl border border-border/50 bg-card shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/50 bg-primary/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">NVX Assistant</p>
                <p className="text-[10px] text-muted-foreground">AI-powered health companion</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "bot" && (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="h-3 w-3 text-accent-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                  <div className="bg-muted px-3 py-2 rounded-xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="p-3 border-t border-border/50 flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something..."
                className="flex-1 px-3 py-2 rounded-lg bg-background border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <button
                type="submit"
                className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
