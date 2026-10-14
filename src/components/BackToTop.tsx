import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-[80] w-12 h-12 flex items-center justify-center group cursor-none sm:cursor-pointer"
          aria-label={t("Volver arriba", "Back to top")}
        >
          <div className="absolute inset-0 bg-vampire-bg/80 backdrop-blur-sm border border-vampire-red/30 rotate-45 transition-all duration-300 group-hover:bg-vampire-red group-hover:border-vampire-red group-hover:shadow-[0_0_15px_rgba(255,59,31,0.5)]"></div>
          <ChevronUp size={20} className="text-vampire-red group-hover:text-white relative z-10 transition-colors duration-300" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
