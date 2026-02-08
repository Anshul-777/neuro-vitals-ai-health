import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

const FooterSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 px-6 bg-background border-t border-border/20">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Begin Your Health Screening
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Create an account or log in with biometric verification to access
            the full Neuro-VX platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
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
          </div>
        </motion.div>

        <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground/30 border-t border-border/20 pt-6">
          <span>NEURO—VX v2.0</span>
          <span>NOT A DIAGNOSTIC TOOL</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </section>
  );
};

export default FooterSection;
