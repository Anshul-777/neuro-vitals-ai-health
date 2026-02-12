import { Mail, Github } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border/50 bg-card/50 px-6 py-8 mt-12">
    <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <a href="mailto:anshulrathod999@gmail.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Mail className="h-4 w-4" />
          anshulrathod999@gmail.com
        </a>
        <a href="https://github.com/Anshul-777" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Github className="h-4 w-4" />
          Anshul-777
        </a>
      </div>
      <p className="text-xs text-muted-foreground">© 2026 Neuro-Vitals. All Rights Reserved.</p>
    </div>
  </footer>
);

export default Footer;
