import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { 
  ArrowLeft, 
  BookOpen, 
  Info,
  Maximize2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Project } from '../data';
import { useLanguage } from '../LanguageContext';
import { soundManager } from '../utils/audio';
import { PageFlipBook, PageFlipBookRef } from './PageFlipBook';

interface AnimatedSketchbookProps {
  project: Project;
  originRect?: DOMRect | null;
  onClose: () => void;
}

export const AnimatedSketchbook: React.FC<AnimatedSketchbookProps> = ({ 
  project, 
  onClose 
}) => {
  const { t } = useLanguage();
  // Starts with Cover (0) for natural physical book opening animation
  const [currentSpread, setCurrentSpread] = useState(0);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [showSpecsDrawer, setShowSpecsDrawer] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const bookStageRef = useRef<HTMLDivElement>(null);
  const bookContainerRef = useRef<HTMLDivElement>(null);
  const flipBookRef = useRef<PageFlipBookRef>(null);
  const isExitingRef = useRef(false);

  const totalSpreads = 6; // 0: Portada, 1: Ex-Libris & Ficha, 2: Bocetos, 3: Lámina Final HD, 4: Taller & Certificado, 5: Contraportada

  // Safe GSAP Exit Sequence: smoothly glides out book and returns to gallery
  const handleSafeClose = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    if (e) {
      if ('preventDefault' in e) e.preventDefault();
      if ('stopPropagation' in e) e.stopPropagation();
    }
    if (isExitingRef.current) return;
    isExitingRef.current = true;

    // Close drawers and lightboxes first
    setZoomedImage(null);
    setShowSpecsDrawer(false);

    const overlay = overlayRef.current;
    const header = headerRef.current;
    const footer = footerRef.current;
    const bookStage = bookStageRef.current;

    if (!overlay || !bookStage) {
      setCurrentSpread(0);
      onClose();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentSpread(0);
        onClose();
      },
    });

    if (header) {
      tl.to(header, {
        y: -30,
        opacity: 0,
        duration: 0.22,
        ease: 'power2.in',
      }, 0);
    }

    if (footer) {
      tl.to(footer, {
        y: 30,
        opacity: 0,
        duration: 0.22,
        ease: 'power2.in',
      }, 0);
    }

    tl.to(bookStage, {
      scale: 0.85,
      y: 40,
      rotateX: 12,
      opacity: 0,
      duration: 0.32,
      ease: 'power2.in',
    }, 0)
    .to(overlay, {
      opacity: 0,
      duration: 0.28,
      ease: 'power2.in',
    }, '-=0.15');
  }, [onClose]);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomedImage) setZoomedImage(null);
        else if (showSpecsDrawer) setShowSpecsDrawer(false);
        else handleSafeClose(e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomedImage, showSpecsDrawer, handleSafeClose]);

  // Smooth GSAP Entrance Choreography:
  // 1. Closed cover lands with 3D elevation onto desk
  // 2. After settling, cover opens in 3D to reveal Spread 1 seamlessly!
  useEffect(() => {
    const overlay = overlayRef.current;
    const header = headerRef.current;
    const footer = footerRef.current;
    const bookStage = bookStageRef.current;
    if (!overlay || !bookStage) return;

    gsap.set(overlay, { opacity: 0 });
    if (header) gsap.set(header, { y: -30, opacity: 0 });
    if (footer) gsap.set(footer, { y: 30, opacity: 0 });
    gsap.set(bookStage, {
      opacity: 0,
      scale: 0.88,
      y: 45,
      rotateX: 14,
      rotateY: -3,
      transformPerspective: 2000,
      boxShadow: '0 50px 100px -20px rgba(0,0,0,0.95)',
    });

    const tl = gsap.timeline();

    tl.to(overlay, {
      opacity: 1,
      duration: 0.35,
      ease: 'power2.out',
    })
    .add(() => {
      soundManager.playBookOpen();
    }, 0.05)
    .to(bookStage, {
      opacity: 1,
      scale: 1,
      y: 0,
      rotateX: 0,
      rotateY: 0,
      duration: 0.7,
      ease: 'power3.out',
    }, '-=0.2')
    .to(header, {
      y: 0,
      opacity: 1,
      duration: 0.4,
      ease: 'power3.out',
    }, '-=0.35');

    if (footer) {
      tl.to(footer, {
        y: 0,
        opacity: 1,
        duration: 0.4,
        ease: 'power3.out',
      }, '-=0.35');
    }

    // Auto-open: after landing closed, smoothly flip the cover open to Spread 1
    const openTimer = setTimeout(() => {
      if (!isExitingRef.current && flipBookRef.current?.turnToSpread) {
        flipBookRef.current.turnToSpread(1);
      }
    }, 480);

    return () => {
      tl.kill();
      clearTimeout(openTimer);
    };
  }, []);

  const spreadTitles = [
    { es: "Portada", en: "Cover" },
    { es: "I. Ex-Libris & Ficha", en: "I. Ex-Libris & Dossier" },
    { es: "II. Bocetos & Estudios", en: "II. Sketches & Studies" },
    { es: "III. Lámina Final HD", en: "III. Final Art Plate" },
    { es: "IV. Taller & Certificado", en: "IV. Workshop & Certificate" },
    { es: "Contraportada", en: "Back Cover" }
  ];

  const finalImage = project.processImages.find(p => p.labelEs.toLowerCase().includes('final'))?.url || project.imageUrl;

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-[999999] bg-[#090b0a]/95 backdrop-blur-2xl text-bone flex flex-col justify-between overflow-hidden select-none"
      data-lenis-prevent="true"
      onClick={handleSafeClose} // Clicking anywhere outside the book on desk closes window
    >
      {/* Studio Desk & Paper Wash Atmosphere */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${project.accentColor}18 0%, rgba(10,12,11,0.95) 75%)`
        }}
      />
      
      {/* Subtle Studio Grain */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-15 mix-blend-overlay"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #000 0px, #000 2px, #1a1e1b 2px, #1a1e1b 4px)`
        }}
      />

      {/* Top Header Toolbar (Clean, minimal, NO magnifying glass / lupa, NO volume button) */}
      <header 
        ref={headerRef}
        className="relative z-40 w-full px-3 sm:px-6 md:px-8 py-2.5 sm:py-3.5 flex items-center justify-between border-b border-white/10 bg-black/70 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Volver Button */}
        <button 
          type="button"
          onClick={handleSafeClose}
          className="flex items-center gap-2.5 sm:gap-3 bg-transparent cursor-pointer group"
          title={t("Cerrar y volver a la galería (Esc)", "Close and return to gallery (Esc)")}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 relative flex items-center justify-center shrink-0">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md border border-white/20 rotate-45 transition-all duration-300 group-hover:bg-vampire-red group-hover:border-vampire-red group-hover:shadow-[0_0_15px_rgba(255,59,31,0.6)]"></div>
            <ArrowLeft size={15} className="text-white relative z-10 group-hover:-translate-x-1 transition-transform duration-300" />
          </div>
          <span className="text-bone uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[11px] sm:text-xs font-serif font-bold group-hover:text-vampire-red transition-colors">
            {t('VOLVER', 'BACK')}
          </span>
        </button>

        {/* Center: Title & Volume */}
        <div className="flex flex-col items-center text-center max-w-[50vw] sm:max-w-none">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] uppercase font-mono tracking-[0.2em] text-white/50">
            <BookOpen size={11} style={{ color: project.accentColor }} />
            <span className="truncate">{project.sketchbookVol}</span>
            <span>·</span>
            <span className="text-white/80">{project.year}</span>
          </div>
          <h2 className="text-sm sm:text-base md:text-lg font-serif italic font-bold text-bone truncate max-w-[200px] sm:max-w-md">
            {t(project.titleEs, project.titleEn)}
          </h2>
        </div>

        {/* Right Toolbar: Specs Drawer & Fullscreen Plate */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* HD Fullscreen Plate Button (Clean, NO lupa icon) */}
          <button
            type="button"
            onClick={() => setZoomedImage(finalImage)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-white/10 bg-black/40 hover:bg-white/10 text-bone transition-all flex items-center gap-1.5 text-xs font-mono cursor-pointer"
            title={t("Lámina en pantalla completa", "Fullscreen plate")}
          >
            <Maximize2 size={13} />
            <span className="hidden sm:inline">{t("LÁMINA HD", "HD PLATE")}</span>
          </button>

          {/* Technical Specs Toggle */}
          <button
            type="button"
            onClick={() => setShowSpecsDrawer(prev => !prev)}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-mono cursor-pointer ${
              showSpecsDrawer 
                ? 'bg-vampire-red border-vampire-red text-white shadow-[0_0_15px_rgba(255,59,31,0.5)]' 
                : 'border-white/10 bg-black/40 hover:bg-white/10 text-bone'
            }`}
            title={t("Ficha técnica completa", "Technical specs")}
          >
            <Info size={13} />
            <span className="hidden sm:inline">{t("FICHA", "SPECS")}</span>
          </button>
        </div>
      </header>

      {/* Floating Tactical Navigation Chevrons (100% Responsive: mobile, tablet & desktop) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (flipBookRef.current?.turnPrev) {
            flipBookRef.current.turnPrev();
          }
        }}
        disabled={currentSpread === 0}
        className={`flex fixed md:absolute left-1 sm:left-3 lg:left-8 top-1/2 -translate-y-1/2 z-50 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full border items-center justify-center transition-all duration-300 shadow-2xl ${
          currentSpread === 0
            ? 'opacity-20 border-white/10 text-white/30 cursor-not-allowed pointer-events-none'
            : 'border-white/25 bg-black/90 hover:bg-vampire-red hover:border-vampire-red text-white cursor-pointer hover:scale-110 active:scale-95 shadow-[0_8px_30px_rgba(0,0,0,0.85)]'
        }`}
        aria-label={t("Página anterior", "Previous page")}
        title={currentSpread > 0 ? t("Página anterior (←)", "Previous page (←)") : undefined}
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (flipBookRef.current?.turnNext) {
            flipBookRef.current.turnNext();
          }
        }}
        disabled={currentSpread >= totalSpreads - 1}
        className={`flex fixed md:absolute right-1 sm:right-3 lg:right-8 top-1/2 -translate-y-1/2 z-50 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full border items-center justify-center transition-all duration-300 shadow-2xl ${
          currentSpread >= totalSpreads - 1
            ? 'opacity-20 border-white/10 text-white/30 cursor-not-allowed pointer-events-none'
            : 'border-white/25 bg-black/90 hover:bg-vampire-red hover:border-vampire-red text-white cursor-pointer hover:scale-110 active:scale-95 shadow-[0_8px_30px_rgba(0,0,0,0.85)]'
        }`}
        aria-label={t("Página siguiente", "Next page")}
        title={currentSpread < totalSpreads - 1 ? t("Página siguiente (→)", "Next page (→)") : undefined}
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
      </button>

      {/* Main Sketchbook Stage (100% Responsive, centered viewport) */}
      <main className="relative z-30 flex-1 flex items-center justify-center p-2 sm:p-4 md:p-6 max-w-7xl mx-auto w-full overflow-hidden">
        <div 
          ref={bookStageRef}
          className="relative w-full flex items-center justify-center"
        >
          {/* 3D Physical Page Flip Book with stacked leaves */}
          <PageFlipBook
            project={project}
            currentSpread={currentSpread}
            onSpreadChange={setCurrentSpread}
            onOpenZoom={setZoomedImage}
            accentColor={project.accentColor}
            bookRef={bookContainerRef}
            flipBookRef={flipBookRef}
          />
        </div>
      </main>

      {/* Bottom Spread Navigation Ribbon & Pagination (100% Responsive) */}
      <footer 
        ref={footerRef}
        className="relative z-40 w-full px-3 md:px-8 py-2 sm:py-3 flex items-center justify-between border-t border-white/10 bg-black/80 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bookmark Spread Tabs */}
        <div className="flex items-center gap-1 sm:gap-2.5 overflow-x-auto flex-nowrap py-1 max-w-[60vw] sm:max-w-[70vw] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {spreadTitles.map((st, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (flipBookRef.current?.turnToSpread) {
                  flipBookRef.current.turnToSpread(idx);
                } else {
                  setCurrentSpread(idx);
                }
              }}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-serif transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                currentSpread === idx
                  ? 'bg-white/15 text-white font-bold border border-white/20 shadow-md'
                  : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <span 
                className="w-1.5 h-1.5 rounded-full" 
                style={{ backgroundColor: currentSpread === idx ? project.accentColor : 'transparent' }} 
              />
              <span>{t(st.es, st.en)}</span>
            </button>
          ))}
        </div>

        {/* Spread Steppers & Counter */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono text-white/50">
          <div className="hidden xl:flex items-center gap-2 text-[10px] text-white/40">
            <span>{t("Usa las flechas ◀ ▶ o haz clic en las páginas para hojear", "Use arrows ◀ ▶ or click pages to flip")}</span>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1 bg-black/60 border border-white/10 rounded-xl p-0.5 shadow-md">
            <button
              type="button"
              onClick={() => {
                if (flipBookRef.current?.turnPrev) {
                  flipBookRef.current.turnPrev();
                }
              }}
              disabled={currentSpread === 0}
              className="p-1 sm:p-1.5 text-white/70 hover:text-white disabled:opacity-20 cursor-pointer disabled:pointer-events-none transition-colors"
              aria-label={t("Anterior", "Prev")}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-1.5 sm:px-2 font-bold text-bone text-[10px] sm:text-xs min-w-[50px] sm:min-w-[64px] text-center">
              {currentSpread === 0 ? t("PORTADA", "COVER") : currentSpread === 5 ? t("FINAL", "BACK") : `${currentSpread} / 4`}
            </span>
            <button
              type="button"
              onClick={() => {
                if (flipBookRef.current?.turnNext) {
                  flipBookRef.current.turnNext();
                }
              }}
              disabled={currentSpread >= totalSpreads - 1}
              className="p-1 sm:p-1.5 text-white/70 hover:text-white disabled:opacity-20 cursor-pointer disabled:pointer-events-none transition-colors"
              aria-label={t("Siguiente", "Next")}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </footer>

      {/* Technical Dossier Slide-Over Drawer */}
      <AnimatePresence>
        {showSpecsDrawer && (
          <motion.div
            initial={{ opacity: 0, x: 350 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 350 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md z-50 bg-[#141815] border-l border-white/10 shadow-2xl p-6 md:p-8 overflow-y-auto flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-vampire-red" />
                  <h3 className="font-serif italic font-bold text-bone text-lg">
                    {t('Dossier del Cuaderno', 'Sketchbook Dossier')}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSpecsDrawer(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-vampire-red font-bold mb-1">
                    {t('OBRA & VOLUMEN', 'WORK & VOLUME')}
                  </h4>
                  <p className="font-serif italic font-bold text-xl text-bone">
                    {t(project.titleEs, project.titleEn)}
                  </p>
                  <p className="text-xs text-white/60 font-mono mt-0.5">
                    {project.sketchbookVol} · {project.year}
                  </p>
                </div>

                <div>
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-vampire-red font-bold mb-1">
                    {t('SINOPSIS ARTÍSTICA', 'ARTISTIC SYNOPSIS')}
                  </h4>
                  <p className="text-sm font-serif italic text-bone-muted leading-relaxed">
                    {t(project.descriptionEs, project.descriptionEn)}
                  </p>
                </div>

                <div>
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-vampire-red font-bold mb-2">
                    {t('HERRAMIENTAS & TÉCNICA', 'TOOLS & TECHNIQUE')}
                  </h4>
                  <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 space-y-1.5 text-xs text-bone">
                    <div><span className="text-white/40">Software: </span>{project.tools}</div>
                    <div><span className="text-white/40">Rol: </span>{t(project.roleEs, project.roleEn)}</div>
                    <div><span className="text-white/40">Categoría: </span>{t(project.categoryEs, project.categoryEn)}</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-vampire-red font-bold mb-2">
                    {t('PALETA DE PIGMENTOS', 'PIGMENT PALETTE')}
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {project.palette.map((col, idx) => (
                      <div key={idx} className="flex flex-col items-center text-center">
                        <div 
                          className="w-10 h-10 rounded-lg shadow-md border border-white/10 mb-1"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span className="text-[8px] font-mono text-white/60">{col.hex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 text-[10px] font-mono text-white/40 text-center">
              MARINA MARTÍN PRIETO · ARCHIVO PRIVADO DE ESTUDIO
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen HD Lightbox Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center p-4 md:p-8"
            onClick={(e) => {
              e.stopPropagation();
              setZoomedImage(null);
            }}
          >
            <button
              type="button"
              onClick={() => setZoomedImage(null)}
              className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-vampire-red text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
            <img
              src={zoomedImage}
              alt="Art Plate Fullscreen"
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.9)] border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedSketchbook;
