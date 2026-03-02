import { Link } from "react-router-dom";
import { Mail, Github, Heart } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border/50 bg-card/30 px-6 py-10 mt-auto">
    <div className="max-w-6xl mx-auto">
      <div className="grid sm:grid-cols-3 gap-8 mb-8">
        {/* Brand */}
        <div>
          <h3 className="text-lg font-extrabold tracking-tighter text-foreground mb-2">
            NEURO<span className="text-primary">—</span>VITALS
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            AI-powered non-invasive biometric health screening platform.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Navigation</h4>
          <div className="flex flex-col gap-2">
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/history" className="text-sm text-muted-foreground hover:text-foreground transition-colors">History</Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link to="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help & Contact</Link>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contact</h4>
          <div className="flex flex-col gap-2">
            <a href="mailto:anshulrathod999@gmail.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="h-4 w-4" />
              anshulrathod999@gmail.com
            </a>
            <a href="https://github.com/Anshul-777" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Github className="h-4 w-4" />
              Anshul-777
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          © 2026 Neuro-Vitals. All Rights Reserved. Made with <Heart className="h-3 w-3 text-destructive" /> by Anshul
        </p>
        <p className="text-[10px] font-mono text-muted-foreground/50">NOT A DIAGNOSTIC TOOL · FOR INFORMATIONAL PURPOSES ONLY</p>
      </div>
    </div>
  </footer>
);

export default Footer;
