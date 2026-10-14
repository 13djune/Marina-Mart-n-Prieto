import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { lang, toggleLang, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { nameEs: 'Portfolio', nameEn: 'Portfolio', href: '#portfolio' },
    { nameEs: 'Sobre Mí', nameEn: 'About', href: '#about' },
    { nameEs: 'Contacto', nameEn: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const targetId = href.replace('#', '');
    if (!targetId) {
      const lenis = (window as any).lenis;
      if (lenis) lenis.scrollTo(0, { duration: 1.2 });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(targetId);
    if (element) {
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.scrollTo(element, { offset: -60, duration: 1.2 });
      } else {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-vampire-bg/90 backdrop-blur-md py-4 border-b border-white/5' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        <a 
          href="#" 
          onClick={(e) => handleNavClick(e, '#')}
          className="text-xl md:text-2xl font-bold tracking-tighter uppercase border-b-2 border-vampire-red pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vampire-red text-bone"
          aria-label="Marina Martín Prieto · Inicio"
        >
          MARINA • MARTÍN PRIETO
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.3em] font-sans text-bone font-medium">
          {navLinks.map((link) => (
            <a
              key={link.nameEn}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="hover:text-vampire-red transition-colors min-h-[44px] flex items-center px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vampire-red"
            >
              {t(link.nameEs, link.nameEn)}
            </a>
          ))}
          <button 
            type="button"
            onClick={toggleLang}
            className="flex items-center gap-2 hover:text-vampire-red transition-colors ml-2 border border-white/30 px-3.5 min-h-[44px] rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vampire-red cursor-pointer font-bold text-bone"
            aria-label={lang === 'es' ? 'Cambiar idioma a Inglés (EN)' : 'Switch language to Spanish (ES)'}
            title={lang === 'es' ? 'Cambiar idioma a Inglés (EN)' : 'Switch language to Spanish (ES)'}
          >
            <Globe size={15} aria-hidden="true" />
            <span>{lang === 'es' ? 'EN' : 'ES'}</span>
          </button>
        </div>

        {/* Mobile Toggle (Min 44x44px for WCAG AAA) */}
        <button
          type="button"
          className="md:hidden flex items-center justify-center w-11 h-11 relative group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vampire-red"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? t("Cerrar menú de navegación", "Close navigation menu") : t("Abrir menú de navegación", "Open navigation menu")}
        >
          <div className="absolute inset-0 bg-transparent border border-white/20 rotate-45 transition-all duration-300 group-hover:border-vampire-red group-hover:bg-vampire-red/10"></div>
          <div className="relative z-10 text-bone group-hover:text-vampire-red transition-colors duration-300">
            {isMobileMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </div>
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden bg-vampire-bg border-b border-white/10 absolute top-full left-0 right-0 py-4 px-6 flex flex-col gap-2"
        >
          {navLinks.map((link) => (
            <a
              key={link.nameEn}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-lg font-serif text-bone hover:text-vampire-red min-h-[44px] flex items-center"
            >
              {t(link.nameEs, link.nameEn)}
            </a>
          ))}
          <button 
            type="button"
            onClick={toggleLang}
            className="flex items-center gap-2 hover:text-vampire-red transition-colors w-fit border border-white/30 px-4 min-h-[44px] rounded-full mt-2 font-bold text-bone cursor-pointer"
            aria-label={lang === 'es' ? 'Cambiar a English' : 'Switch to Español'}
          >
            <Globe size={16} aria-hidden="true" />
            <span>{lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}</span>
          </button>
        </motion.div>
      )}
    </motion.nav>
  );
}
