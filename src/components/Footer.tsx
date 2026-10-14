import { useLanguage } from '../LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#0a0a0a] px-6 border-t border-white/10 text-center relative overflow-hidden transition-all duration-700 py-10 opacity-100">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-40 bg-vampire-red/5 blur-[100px] pointer-events-none" aria-hidden="true" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center text-xs font-mono uppercase tracking-[0.25em] text-bone-muted gap-4 md:gap-0 font-medium">
          <div>© {new Date().getFullYear()} Marina Martín Prieto</div>
          <div className="flex items-center gap-6">
            <a 
              href="https://www.instagram.com/black_umi" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-vampire-red transition-colors min-h-[44px] flex items-center px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vampire-red"
              aria-label="Instagram de Marina Martín Prieto (abre en pestaña nueva)"
            >
              Instagram
            </a>
            <a 
              href="https://www.linkedin.com/in/marina-martin-prieto/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-vampire-red transition-colors min-h-[44px] flex items-center px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vampire-red"
              aria-label="LinkedIn de Marina Martín Prieto (abre en pestaña nueva)"
            >
              LinkedIn
            </a>
          </div>
          <div className="text-bone font-semibold">{t("Concept Artist", "Concept Artist")}</div>
        </div>
      </div>
    </footer>
  );
}
