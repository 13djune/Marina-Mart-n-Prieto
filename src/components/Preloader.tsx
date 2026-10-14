import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { galleryItems } from '../data';
import { getOptimizedImageUrl, preloadImages } from '../utils/imageOptimizer';

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(15);
  const { t } = useLanguage();

  useEffect(() => {
    let isMounted = true;

    // Preload critical images from the top gallery items
    const criticalUrls = galleryItems.slice(0, 3).map(item => 
      getOptimizedImageUrl(item.imageUrl, 800, 75)
    );

    // Track real assets
    const assetsPromise = Promise.all([
      preloadImages(criticalUrls, 1500),
      document.fonts ? document.fonts.ready : Promise.resolve(),
    ]);

    // Smooth snappy progress increments
    const stepInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 85) {
          return prev + Math.floor(Math.random() * 18) + 12;
        }
        return prev;
      });
    }, 60);

    assetsPromise.finally(() => {
      if (!isMounted) return;
      clearInterval(stepInterval);
      setProgress(100);
      setTimeout(() => {
        if (isMounted) onComplete();
      }, 250);
    });

    // Fallback safety timeout (max 1.2s so user never waits)
    const safetyTimeout = setTimeout(() => {
      if (!isMounted) return;
      clearInterval(stepInterval);
      setProgress(100);
      onComplete();
    }, 1200);

    return () => {
      isMounted = false;
      clearInterval(stepInterval);
      clearTimeout(safetyTimeout);
    };
  }, [onComplete]);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label={t("Cargando portafolio", "Loading portfolio")}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[1000] bg-vampire-bg flex flex-col items-center justify-center"
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Animated Diamond */}
        <motion.div
          animate={{ 
            rotate: [45, 225, 405],
            scale: [1, 1.15, 1]
          }}
          transition={{ 
            duration: 1.6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="w-14 h-14 sm:w-16 sm:h-16 border border-vampire-red rotate-45 flex items-center justify-center shadow-[0_0_30px_rgba(255,59,31,0.25)] mb-10 sm:mb-12 relative"
        >
          <motion.div 
            className="w-3.5 h-3.5 bg-vampire-red"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
        
        {/* Loading Text */}
        <div className="text-vampire-red font-mono text-xs uppercase tracking-[0.4em] font-bold mb-4">
          {t("Cargando", "Loading")}
        </div>
        
        {/* Progress Bar */}
        <div className="w-48 h-[2px] bg-white/10 relative overflow-hidden rounded-full">
          <motion.div 
            className="absolute top-0 left-0 bottom-0 bg-vampire-red shadow-[0_0_8px_rgba(255,59,31,0.8)]"
            animate={{ width: `${Math.min(100, progress)}%` }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.15 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
