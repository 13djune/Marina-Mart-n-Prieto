import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen, Info, Maximize2, X, Sparkles } from 'lucide-react';
import { Project } from '../data';
import { useLanguage } from '../LanguageContext';
import Sketchbook from './Sketchbook';
import ArtworkZoomModal from './ArtworkZoomModal';
import { preloadImages, getOptimizedImageUrl } from '../utils/imageOptimizer';

interface ProjectDetailProps {
  project: Project;
  originRect?: DOMRect | null;
  onClose: () => void;
}

export default function ProjectDetail({ project, onClose }: ProjectDetailProps) {
  const { t } = useLanguage();
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Preload project images immediately so page flips and views are instant
  useEffect(() => {
    const urlsToPreload = [
      getOptimizedImageUrl(project.imageUrl, 1000, 80),
      ...project.processImages.map(p => getOptimizedImageUrl(p.url, 1000, 80))
    ];
    preloadImages(urlsToPreload, 2000);
  }, [project]);

  // Safe Lenis & scroll freeze handler
  useEffect(() => {
    const w = window as any;
    if (w.lenis) {
      w.lenis.stop();
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      if (w.lenis) {
        w.lenis.start();
      }
      document.body.style.overflow = prevOverflow || 'unset';
    };
  }, []);

  // Keyboard navigation & Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomedImage) {
          setZoomedImage(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomedImage, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If zoomed image lightbox is active, let it handle its own state
    if (zoomedImage) return;

    const target = e.target as HTMLElement;
    // Don't close if clicking inside the 3D book itself, the top header, or an interactive control
    if (
      target.closest('.book-container') ||
      target.closest('header') ||
      target.closest('.interactive-control') ||
      target.closest('[role="button"]')
    ) {
      return;
    }

    // Clicked outside the sketchbook: close popup
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <motion.div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${t("Cuaderno de estudio 3D", "3D studio sketchbook")}: ${t(project.titleEs, project.titleEn)}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="fixed inset-0 z-[999999] overflow-hidden select-none bg-[#090b0a]/96 backdrop-blur-2xl text-bone flex flex-col justify-between cursor-pointer"
      data-lenis-prevent="true"
      onClick={handleBackdropClick}
    >
      {/* Studio Desk Atmospheric Glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${project.accentColor}22 0%, rgba(10,12,11,0.95) 75%)`
        }}
      />

      {/* Subtle Studio Desk Texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #000 0px, #000 2px, #1a1e1b 2px, #1a1e1b 4px)`
        }}
      />

      {/* Top Header Toolbar */}
      <header 
        className="relative z-40 w-full px-4 sm:px-6 md:px-8 py-2.5 flex items-center justify-between border-b border-white/10 bg-black/70 backdrop-blur-md cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Volver Button - Min 44x44px Touch Target for WCAG AAA */}
        <button 
          type="button"
          onClick={() => onClose()}
          className="min-h-[44px] min-w-[44px] flex items-center gap-2.5 sm:gap-3 bg-transparent cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vampire-red focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg px-2"
          aria-label={t("Cerrar y volver a la galería", "Close and return to gallery")}
          title={t("Cerrar y volver a la galería (Esc)", "Close and return to gallery (Esc)")}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 relative flex items-center justify-center shrink-0">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md border border-white/20 rotate-45 transition-all duration-300 group-hover:bg-vampire-red group-hover:border-vampire-red group-hover:shadow-[0_0_15px_rgba(255,59,31,0.6)]" />
            <ArrowLeft size={16} className="text-white relative z-10 group-hover:-translate-x-1 transition-transform duration-300" />
          </div>
          <span className="text-bone uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[11px] sm:text-xs font-serif font-bold group-hover:text-vampire-red transition-colors">
            {t('VOLVER', 'BACK')}
          </span>
        </button>

        {/* Center: Title & Volume */}
        <div className="flex flex-col items-center text-center max-w-[45vw] sm:max-w-none">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] uppercase font-mono tracking-[0.2em] text-bone-muted font-semibold">
            <BookOpen size={12} style={{ color: project.accentColor }} aria-hidden="true" />
            <span>{project.sketchbookVol} · {project.year}</span>
          </div>
          <h2 className="text-xs sm:text-sm md:text-base font-serif italic font-bold text-bone truncate max-w-xs sm:max-w-md">
            {t(project.titleEs, project.titleEn)}
          </h2>
        </div>

        {/* Right: Spacer to maintain balance so VOLVER is the exclusive button */}
        <div className="w-16 sm:w-24 hidden sm:block" aria-hidden="true" />
      </header>

      {/* Main Studio Stage with the 3D Sketchbook Preview Style */}
      <main 
        className="relative z-30 flex-1 min-h-0 flex flex-col items-center justify-center px-2 sm:px-4 md:px-6 py-1 sm:py-2 w-full max-w-[1520px] mx-auto overflow-visible cursor-pointer"
      >
        <Sketchbook 
          project={project}
          autoOpenSpread={true}
          isDetail={true}
          onOpenZoom={(url) => setZoomedImage(url)}
          className="my-auto w-full cursor-default"
        />

        {/* Subtle Accessible Outside-Click Dismiss Cue */}
        <div 
          className="mt-2 text-center text-[10px] sm:text-[11px] font-mono tracking-wider text-bone-muted/60 pointer-events-none select-none transition-opacity duration-300 hidden sm:block"
          aria-hidden="true"
        >
          {t("✦ Haz clic fuera del cuaderno o pulsa Esc para salir", "✦ Click outside the sketchbook or press Esc to exit")}
        </div>
      </main>

      {/* High-Resolution Interactive Artwork Zoom Lightbox Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <ArtworkZoomModal
            imageUrl={zoomedImage}
            titleEs={project.titleEs}
            titleEn={project.titleEn}
            sketchbookVol={project.sketchbookVol}
            year={project.year}
            accentColor={project.accentColor}
            onClose={() => setZoomedImage(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>,
    document.body
  );
}
