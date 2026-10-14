import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Maximize2, 
  BookOpen, 
  Check
} from 'lucide-react';
import { Project, Hotspot } from '../data';
import { useLanguage } from '../LanguageContext';
import { soundManager } from '../utils/audio';
import ProgressiveImage from './ui/ProgressiveImage';
import gsap from 'gsap';
import SketchbookTextureOverlay, { PaperTextureType } from './SketchbookTextureOverlay';

interface SketchbookProps {
  project: Project;
  onOpenDetail?: () => void;
  onOpenZoom?: (url: string) => void;
  className?: string;
  autoOpenSpread?: boolean;
  isDetail?: boolean;
}

const PaperTextureOverlay: React.FC<{
  type?: PaperTextureType;
  seed?: number;
  opacity?: number;
}> = ({
  type = 'rag',
  seed = 1,
  opacity,
}) => (
  <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-[4]" aria-hidden="true">
    <SketchbookTextureOverlay type={type} seed={seed} opacity={opacity} />
  </div>
);

export const Sketchbook: React.FC<SketchbookProps> = ({
  project,
  onOpenDetail,
  onOpenZoom,
  className = '',
  autoOpenSpread = false,
  isDetail = false,
}) => {
  const { t } = useLanguage();
  const totalLeaves = 5; // Leaves 0 to 4. Leaf 4 is the front cover.

  // State
  const [flippedCount, setFlippedCount] = useState<number>(0);
  const [turningLeaf, setTurningLeaf] = useState<number | null>(null);
  const [turnDirection, setTurnDirection] = useState<'forward' | 'backward' | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const isTurningRef = useRef<boolean>(false);
  const hasAutoOpenedRef = useRef<boolean>(false);

  // GSAP 3D mouse-following parallax effect for physical depth and tactile feel
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const stageEl = stageRef.current;
    const parallaxEl = parallaxRef.current;
    const shadowEl = shadowRef.current;
    const sheenEl = sheenRef.current;
    if (!stageEl || !parallaxEl) return;

    gsap.set(parallaxEl, {
      transformPerspective: 1800,
      transformStyle: 'preserve-3d',
    });

    // GSAP quickTo for silky 60/120fps tracking
    const rotXTo = gsap.quickTo(parallaxEl, 'rotationX', { duration: 0.65, ease: 'power2.out' });
    const rotYTo = gsap.quickTo(parallaxEl, 'rotationY', { duration: 0.65, ease: 'power2.out' });
    const rotZTo = gsap.quickTo(parallaxEl, 'rotation', { duration: 0.75, ease: 'power2.out' });
    const xTo = gsap.quickTo(parallaxEl, 'x', { duration: 0.65, ease: 'power2.out' });
    const yTo = gsap.quickTo(parallaxEl, 'y', { duration: 0.65, ease: 'power2.out' });
    const zTo = gsap.quickTo(parallaxEl, 'z', { duration: 0.65, ease: 'power2.out' });

    const shadowXTo = shadowEl ? gsap.quickTo(shadowEl, 'x', { duration: 0.75, ease: 'power2.out' }) : null;
    const shadowYTo = shadowEl ? gsap.quickTo(shadowEl, 'y', { duration: 0.75, ease: 'power2.out' }) : null;
    const shadowScaleTo = shadowEl ? gsap.quickTo(shadowEl, 'scaleX', { duration: 0.75, ease: 'power2.out' }) : null;

    const sheenXTo = sheenEl ? gsap.quickTo(sheenEl, 'x', { duration: 0.6, ease: 'power2.out' }) : null;
    const sheenYTo = sheenEl ? gsap.quickTo(sheenEl, 'y', { duration: 0.6, ease: 'power2.out' }) : null;
    const sheenOpTo = sheenEl ? gsap.quickTo(sheenEl, 'opacity', { duration: 0.6, ease: 'power2.out' }) : null;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = stageEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const relX = (e.clientX - centerX) / (rect.width / 2);
      const relY = (e.clientY - centerY) / (rect.height / 2);

      const clampX = Math.max(-1.25, Math.min(1.25, relX));
      const clampY = Math.max(-1.25, Math.min(1.25, relY));

      // Delicate tactile 3D tilt & gentle translation
      rotYTo(clampX * 8.5);
      rotXTo(-clampY * 6.5);
      rotZTo(clampX * 0.75);
      xTo(clampX * 12);
      yTo(clampY * 8);
      zTo(10);

      // Realistic counter-directional shadow physics
      if (shadowXTo && shadowYTo) {
        shadowXTo(-clampX * 22);
        shadowYTo(-clampY * 14);
      }
      if (shadowScaleTo) {
        shadowScaleTo(1 + Math.abs(clampX) * 0.06);
      }

      // Specular tactile ambient lighting sheen
      if (sheenXTo && sheenYTo && sheenOpTo) {
        sheenXTo(clampX * 45);
        sheenYTo(clampY * 30);
        sheenOpTo(0.18 + Math.abs(clampX) * 0.08);
      }
    };

    const handleMouseLeave = () => {
      gsap.to(parallaxEl, {
        rotationX: 0,
        rotationY: 0,
        rotation: 0,
        x: 0,
        y: 0,
        z: 0,
        duration: 0.85,
        ease: 'power3.out',
      });
      if (shadowEl) {
        gsap.to(shadowEl, {
          x: 0,
          y: 0,
          scaleX: 1,
          duration: 0.85,
          ease: 'power3.out',
        });
      }
      if (sheenEl) {
        gsap.to(sheenEl, {
          x: 0,
          y: 0,
          opacity: 0.08,
          duration: 0.85,
          ease: 'power3.out',
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    stageEl.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      stageEl.removeEventListener('mouseleave', handleMouseLeave);
      gsap.killTweensOf([parallaxEl, shadowEl, sheenEl].filter(Boolean));
    };
  }, []);

  // Process images
  const sketchImage = project.processImages[0]?.url || project.imageUrl;
  const secondaryImage = project.processImages[1]?.url || project.imageUrl;
  const sketchHotspots = project.processImages[0]?.hotspots || [];

  // Responsive check
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset state on project change
  useEffect(() => {
    hasAutoOpenedRef.current = false;
    setFlippedCount(0);
    setTurningLeaf(null);
    setTurnDirection(null);
    isTurningRef.current = false;
    setActiveHotspot(null);
  }, [project]);

  // Natural tactile flip physics constants
  const FLIP_DURATION = 0.72;
  const FLIP_EASE = [0.37, 0, 0.21, 1]; // Smooth natural cubic-bezier curve

  // Framer Motion Page Turning Logic with synchronized sound, direction & z-index
  const turnRight = useCallback(() => {
    if (isTurningRef.current || flippedCount >= totalLeaves) return;
    isTurningRef.current = true;
    const leafToFlip = totalLeaves - 1 - flippedCount;
    setTurnDirection('forward');
    setTurningLeaf(leafToFlip);
    setFlippedCount((prev) => prev + 1);
    soundManager.playPageTurn();
    setTimeout(() => {
      setTurningLeaf(null);
      setTurnDirection(null);
      isTurningRef.current = false;
    }, 760);
    setActiveHotspot(null);
  }, [flippedCount, totalLeaves]);

  const turnLeft = useCallback(() => {
    if (isTurningRef.current || flippedCount <= 0) return;
    isTurningRef.current = true;
    const leafToUnflip = totalLeaves - flippedCount;
    setTurnDirection('backward');
    setTurningLeaf(leafToUnflip);
    setFlippedCount((prev) => prev - 1);
    soundManager.playPageTurn();
    setTimeout(() => {
      setTurningLeaf(null);
      setTurnDirection(null);
      isTurningRef.current = false;
    }, 760);
    setActiveHotspot(null);
  }, [flippedCount, totalLeaves]);

  // Optional auto-open on initial display
  useEffect(() => {
    if (autoOpenSpread && !hasAutoOpenedRef.current && flippedCount === 0) {
      hasAutoOpenedRef.current = true;
      const timer = setTimeout(() => {
        turnRight();
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [autoOpenSpread, flippedCount, turnRight]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') turnRight();
      if (e.key === 'ArrowLeft') turnLeft();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [turnRight, turnLeft]);

  // Color hex copy
  const handleCopyHex = (hex: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 2000);
    }
  };

  const isCoverClosed = flippedCount === 0;
  const isBackClosed = flippedCount === totalLeaves;

  // Accessible description for screen readers (WCAG AAA)
  const getSpreadAnnouncement = () => {
    switch (flippedCount) {
      case 0:
        return `${t("Portada cerrada de", "Front cover closed of")} ${t(project.titleEs, project.titleEn)}`;
      case 1:
        return t("Páginas 00 y 01: Estudio Preliminar y Dossier Conceptual", "Pages 00 and 01: Preliminary Study and Concept Dossier");
      case 2:
        return t("Páginas 02 y 03: Bocetos e Iluminación Clave Tonal", "Pages 02 and 03: Sketches and Tonal Key Lighting");
      case 3:
        return t("Páginas 04 y 05: Estudio Secundario y Lámina Final HD", "Pages 04 and 05: Secondary Study and Final HD Plate");
      case 4:
        return t("Páginas 06 y 07: Revisión de Taller y Certificado de Autenticidad", "Pages 06 and 07: Workshop Review and Certificate of Authenticity");
      case 5:
        return t("Contraportada cerrada", "Back cover closed");
      default:
        return "";
    }
  };

  // Z-index calculation to avoid visual overlays
  const getLeafZIndex = (leafIndex: number) => {
    if (turningLeaf === leafIndex) return 50;
    const isFlipped = leafIndex >= totalLeaves - flippedCount;
    return isFlipped ? (totalLeaves - leafIndex) : (leafIndex + 1);
  };

  // Responsive book dimensions - Expanded for large screens while preserving margins top & bottom
  const containerMaxWidth = isDetail 
    ? 'min(1420px, 95vw, calc((100vh - 90px) * 1.58))'
    : 'min(1300px, 93vw, calc((100vh - 110px) * 1.58))';
  const containerMaxHeight = isDetail 
    ? 'calc(100vh - 90px)'
    : 'calc(100vh - 110px)';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 25 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      className={`book-section relative w-full flex flex-col items-center justify-center select-none py-1 ${className}`}
      role="region"
      aria-roledescription={t("Cuaderno interactivo", "Interactive sketchbook")}
      aria-label={`${t("Cuaderno de bocetos 3D:", "3D sketchbook:")} ${t(project.titleEs, project.titleEn)}`}
    >
      {/* Screen reader live announcement for WCAG AAA */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {getSpreadAnnouncement()}
      </div>

      {/* ========================================================================= */}
      {/* 3D BOOK STAGE WITH REALISTIC PHYSICAL SHADOWS & VERTICALLY CENTERED ARROWS */}
      {/* ========================================================================= */}
      <div 
        ref={stageRef}
        className="relative w-full flex items-center justify-center"
        style={{
          maxWidth: containerMaxWidth,
          maxHeight: containerMaxHeight,
        }}
      >
        {/* GSAP Mouse-Following 3D Parallax Layer */}
        <div
          ref={parallaxRef}
          className="relative w-full h-full flex items-center justify-center"
          style={{
            transformStyle: 'preserve-3d',
            perspective: isMobile ? '1400px' : '2200px',
          }}
        >
          {/* Physical Ground & Desk Drop Shadows */}
          <div 
            ref={shadowRef}
            className="absolute -inset-4 sm:-inset-6 -bottom-8 rounded-[2rem] pointer-events-none z-0 transition-opacity duration-700"
            style={{
              background: 'radial-gradient(ellipse at 50% 60%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 45%, transparent 75%)',
              filter: 'blur(24px)',
              opacity: 0.95,
            }}
            aria-hidden="true"
          />
          <div 
            className="absolute inset-x-6 -bottom-5 h-14 rounded-full pointer-events-none z-0"
            style={{
              boxShadow: '0 30px 60px -5px rgba(0,0,0,0.95), 0 12px 24px -5px rgba(0,0,0,0.85)',
            }}
            aria-hidden="true"
          />

          {/* 3D BOOK CONTAINER (Framed with Framer Motion perspective & centering shift) */}
          <motion.div 
            ref={containerRef}
            className="book-container relative w-full h-full aspect-[16/10.5] sm:aspect-[16/10]"
            style={{
              perspective: isMobile ? '1400px' : '2200px',
              maxHeight: containerMaxHeight,
            }}
          onClick={(e) => e.stopPropagation()}
          animate={{
            x: isCoverClosed ? (isMobile ? '-14%' : '-20%') : isBackClosed ? (isMobile ? '14%' : '20%') : '0%',
          }}
          transition={{
            duration: FLIP_DURATION,
            ease: FLIP_EASE,
          }}
          onPanEnd={(e, info) => {
            if (info.offset.x < -35) turnRight();
            else if (info.offset.x > 35) turnLeft();
          }}
        >
          {/* ======================================================================= */}
          {/* MULTI-STAGE REALISTIC SHADOWS DURING TURNING & OPEN SPREAD               */}
          {/* ======================================================================= */}

          {/* Central Gutter Crease & Deep Ambient Occlusion */}
          {!isCoverClosed && !isBackClosed && (
            <>
              {/* Deep Central Spine Trough Shadow */}
              <div 
                className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-12 sm:w-16 pointer-events-none z-35 bg-gradient-to-r from-transparent via-black/45 to-transparent mix-blend-multiply opacity-80" 
                aria-hidden="true"
              />
              {/* Center Spine Seam Line */}
              <div 
                className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1.5px] pointer-events-none z-40 bg-black/60 shadow-[0_0_5px_rgba(0,0,0,0.8)]" 
                aria-hidden="true"
              />
              {/* Left Page Inner Gutter Curve Shadow */}
              <div 
                className="absolute top-0 bottom-0 left-[calc(50%-44px)] sm:left-[calc(50%-56px)] w-11 sm:w-14 pointer-events-none z-30 bg-gradient-to-r from-transparent via-black/10 to-black/28 mix-blend-multiply" 
                aria-hidden="true"
              />
              {/* Right Page Inner Gutter Curve Shadow */}
              <div 
                className="absolute top-0 bottom-0 left-1/2 w-11 sm:w-14 pointer-events-none z-30 bg-gradient-to-r from-black/28 via-black/10 to-transparent mix-blend-multiply" 
                aria-hidden="true"
              />
            </>
          )}

          {/* Gentle Ambient Shadow on Underlying Stacks during Page Turns */}
          <motion.div
            className="pointer-events-none absolute top-0 bottom-0 right-0 w-1/2 z-10"
            style={{
              background: 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 25%, transparent 60%)',
            }}
            animate={{
              opacity: turningLeaf !== null 
                ? (turnDirection === 'forward' ? [0.35, 0.15, 0] : [0, 0.15, 0.35])
                : 0,
            }}
            transition={{ duration: FLIP_DURATION, ease: FLIP_EASE }}
            aria-hidden="true"
          />
          <motion.div
            className="pointer-events-none absolute top-0 bottom-0 left-0 w-1/2 z-10"
            style={{
              background: 'linear-gradient(to left, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 25%, transparent 60%)',
            }}
            animate={{
              opacity: turningLeaf !== null 
                ? (turnDirection === 'forward' ? [0, 0.2, 0] : [0.2, 0.1, 0])
                : 0,
            }}
            transition={{ duration: FLIP_DURATION, ease: FLIP_EASE }}
            aria-hidden="true"
          />

          {/* Centered Left Navigation Arrow (Min 44x44px for WCAG AAA) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              turnLeft();
            }}
            disabled={flippedCount === 0}
            className={`absolute -left-4 sm:-left-6 md:-left-7 top-1/2 -translate-y-1/2 z-[60] w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border flex items-center justify-center transition-all duration-300 shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vampire-red focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
              flippedCount === 0
                ? 'opacity-0 pointer-events-none'
                : 'border-white/30 bg-black/90 hover:bg-vampire-red hover:border-vampire-red text-bone hover:text-white cursor-pointer hover:scale-110 active:scale-95 shadow-[0_4px_25px_rgba(0,0,0,0.85)] backdrop-blur-md'
            }`}
            aria-label={t("Página anterior", "Previous page")}
            title={t("Página anterior (←)", "Previous page (←)")}
          >
            <ChevronLeft className="w-6 h-6" aria-hidden="true" />
          </button>

          {/* Centered Right Navigation Arrow (Min 44x44px for WCAG AAA) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              turnRight();
            }}
            disabled={flippedCount >= totalLeaves}
            className={`absolute -right-4 sm:-right-6 md:-right-7 top-1/2 -translate-y-1/2 z-[60] w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border flex items-center justify-center transition-all duration-300 shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vampire-red focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
              flippedCount >= totalLeaves
                ? 'opacity-0 pointer-events-none'
                : 'border-white/30 bg-black/90 hover:bg-vampire-red hover:border-vampire-red text-bone hover:text-white cursor-pointer hover:scale-110 active:scale-95 shadow-[0_4px_25px_rgba(0,0,0,0.85)] backdrop-blur-md'
            }`}
            aria-label={t("Página siguiente", "Next page")}
            title={t("Página siguiente (→)", "Next page (→)")}
          >
            <ChevronRight className="w-6 h-6" aria-hidden="true" />
          </button>

        {/* ======================================================================= */}
        {/* STACKED 3D LEAVES                                                       */}
        {/* Leaf 0 = Back cover; Leaf 4 = Front cover                               */}
        {/* ======================================================================= */}

        {/* --------------------------------------------------------------------- */}
        {/* LEAF 0: Certificado & Back Cover                                      */}
        {/* --------------------------------------------------------------------- */}
        <motion.div
          key="leaf-0"
          className="right book-leaf absolute top-0 right-0 w-1/2 h-full cursor-pointer select-none"
          style={{
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
            pointerEvents: isCoverClosed ? 'none' : 'auto',
          }}
          animate={{
            rotateY: (0 >= totalLeaves - flippedCount) ? -180 : 0,
            zIndex: getLeafZIndex(0),
          }}
          transition={{
            rotateY: { duration: FLIP_DURATION, ease: FLIP_EASE },
            zIndex: { duration: 0 },
          }}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('button') || target.closest('a') || target.closest('.no-flip')) return;
            if (0 >= totalLeaves - flippedCount) turnLeft();
            else turnRight();
          }}
        >
          {/* Front: Certificado de Autenticidad (PÁG. 07) */}
          <figure 
            className="front absolute inset-0 m-0 w-full h-full bg-[#fdfbf7] rounded-r-xl sm:rounded-r-2xl overflow-hidden shadow-2xl p-4 sm:p-6 md:p-8 flex flex-col justify-between border-l border-[#2b2b2b]/15"
            style={{ 
              backfaceVisibility: 'hidden', 
              WebkitBackfaceVisibility: 'hidden', 
              transform: 'translateZ(1px)',
              boxShadow: turningLeaf === 0 ? '-14px 10px 24px rgba(0,0,0,0.35)' : undefined,
            }}
          >
            {/* Antique Fine Parchment Paper Overlay */}
            <PaperTextureOverlay type="parchment" seed={7} opacity={0.05} />

            {/* Spine Crease Shadow */}
            <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-10 pointer-events-none bg-gradient-to-r from-black/25 via-black/10 to-transparent z-10" aria-hidden="true" />

            {/* Subtle Natural Curvature Shadow on Turning Page */}
            <motion.div
              className="pointer-events-none absolute inset-0 z-30"
              style={{
                background: 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 30%, transparent 70%)',
              }}
              animate={{
                opacity: turningLeaf === 0
                  ? (turnDirection === 'forward' ? [0.1, 0.35, 0.1] : [0.1, 0.35, 0.1])
                  : 0,
              }}
              transition={{ duration: FLIP_DURATION, ease: FLIP_EASE }}
              aria-hidden="true"
            />

            <div className="border border-[#3d362e]/30 p-3 sm:p-5 md:p-6 rounded-xl h-full flex flex-col justify-between bg-[#fcfaf4] shadow-inner relative z-10">
              <div className="text-center pb-2.5 border-b border-[#3d362e]/20">
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#54422b] font-bold">
                  {t("VII. CERTIFICADO DE AUTENTICIDAD", "VII. CERTIFICATE OF AUTHENTICITY")}
                </span>
                <h3 className="font-serif italic font-bold text-base sm:text-lg md:text-xl text-[#1c1917] mt-1">
                  {t(project.titleEs, project.titleEn)}
                </h3>
              </div>

              <div className="my-auto text-center space-y-2.5 py-2">
                <p className="text-xs sm:text-sm font-serif italic text-[#332e26] leading-relaxed max-w-sm mx-auto">
                  {t(
                    "Por la presente se certifica que esta obra conceptual forma parte del archivo original de Marina Martín Prieto.",
                    "This certifies that this concept artwork belongs to the original archive of Marina Martín Prieto."
                  )}
                </p>
                <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-mono text-[#54422b] font-bold">
                  <Sparkles size={14} aria-hidden="true" />
                  <span>REF: MMP-ART-{project.year}-00{project.id}</span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-[#3d362e]/20 flex items-center justify-between text-[10px] sm:text-xs font-mono text-[#3d372e]">
                <div className="text-left">
                  <div className="text-[9px] sm:text-[10px] text-[#54422b] uppercase tracking-wider font-bold">{t("Firma", "Signature")}</div>
                  <div className="font-serif italic text-sm sm:text-base font-bold text-[#1c1917]">Marina Martín Prieto</div>
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-[#54422b] flex items-center justify-center text-[9px] sm:text-[10px] uppercase font-mono font-bold text-[#54422b] bg-[#54422b]/10 shadow-xs">
                  SEAL
                </div>
              </div>
            </div>

            <div className="text-right text-[10px] sm:text-xs font-mono text-[#54422b] pt-1.5 font-bold relative z-10">
              PÁG. 07 · COLOFÓN
            </div>
          </figure>

          {/* Back: Contraportada (#back-cover) */}
          <figure 
            id="back-cover"
            className="back absolute inset-0 m-0 w-full h-full rounded-l-xl sm:rounded-l-2xl overflow-hidden shadow-2xl p-6 sm:p-8 md:p-10 flex flex-col justify-between border border-white/20"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg) translateZ(1px)',
              boxShadow: turningLeaf === 0 ? '14px 10px 24px rgba(0,0,0,0.35)' : undefined,
              backgroundColor: project.coverColor,
              backgroundImage: `
                radial-gradient(circle at 50% 40%, rgba(255, 255, 255, 0.08) 0%, transparent 70%),
                linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.75) 100%)
              `
            }}
          >
            {/* Subtle Natural Landing Shading */}
            <motion.div
              className="pointer-events-none absolute inset-0 z-30"
              style={{
                background: 'linear-gradient(to left, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 30%, transparent 70%)',
              }}
              animate={{
                opacity: turningLeaf === 0
                  ? (turnDirection === 'forward' ? [0.25, 0.1, 0] : [0, 0.1, 0.25])
                  : 0,
              }}
              transition={{ duration: FLIP_DURATION, ease: FLIP_EASE }}
              aria-hidden="true"
            />

            <div className="my-auto flex flex-col items-center justify-center text-center z-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-white/20 flex items-center justify-center text-bone font-serif italic text-xl sm:text-2xl shadow-inner mb-3 bg-black/40">
                MMP
              </div>
              <h4 className="font-serif italic text-bone text-base sm:text-lg font-bold">
                Marina Martín Prieto
              </h4>
              <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-bone-muted mt-1.5 font-semibold">
                {t("ARCHIVO PRIVADO DE ESTUDIO", "PRIVATE STUDIO ARCHIVE")}
              </p>
            </div>

            <div className="z-10 flex items-center justify-between text-[10px] sm:text-xs font-mono text-bone-muted border-t border-white/15 pt-2.5">
              <span>{t("ARCHIVO VISUAL · MMP", "VISUAL ARCHIVE · MMP")}</span>
              <span>{project.year}</span>
            </div>
          </figure>
        </motion.div>

        {/* --------------------------------------------------------------------- */}
        {/* LEAF 1: Lámina Final HD & Revisión de Taller (PÁG. 05 & PÁG. 06)       */}
        {/* --------------------------------------------------------------------- */}
        <motion.div
          key="leaf-1"
          className="right book-leaf absolute top-0 right-0 w-1/2 h-full cursor-pointer select-none"
          style={{
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
            pointerEvents: isCoverClosed || isBackClosed ? 'none' : 'auto',
          }}
          animate={{
            rotateY: (1 >= totalLeaves - flippedCount) ? -180 : 0,
            zIndex: getLeafZIndex(1),
          }}
          transition={{
            rotateY: { duration: FLIP_DURATION, ease: FLIP_EASE },
            zIndex: { duration: 0 },
          }}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('button') || target.closest('a') || target.closest('.no-flip')) return;
            if (1 >= totalLeaves - flippedCount) turnLeft();
            else turnRight();
          }}
        >
          {/* Front: Page 5 Right (Lámina Final HD) */}
          <figure 
            className="front absolute inset-0 m-0 w-full h-full bg-[#fdfbf7] rounded-r-xl sm:rounded-r-2xl overflow-hidden shadow-2xl p-4 sm:p-6 flex flex-col justify-between border-l border-[#2b2b2b]/15"
            style={{ 
              backfaceVisibility: 'hidden', 
              WebkitBackfaceVisibility: 'hidden', 
              transform: 'translateZ(1px)',
              boxShadow: turningLeaf === 1 ? '-14px 10px 24px rgba(0,0,0,0.35)' : undefined,
            }}
          >
            {/* Delicate Linen Woven Paper Overlay */}
            <PaperTextureOverlay type="woven" seed={5} opacity={0.05} />

            {/* Subtle Natural Curvature Shadow on Turning Page */}
            <motion.div
              className="pointer-events-none absolute inset-0 z-30"
              style={{
                background: 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 30%, transparent 70%)',
              }}
              animate={{
                opacity: turningLeaf === 1
                  ? (turnDirection === 'forward' ? [0.1, 0.35, 0.1] : [0.1, 0.35, 0.1])
                  : 0,
              }}
              transition={{ duration: FLIP_DURATION, ease: FLIP_EASE }}
              aria-hidden="true"
            />

            <div className="flex items-center justify-between pb-2 border-b border-[#2b2b2b]/10 text-xs sm:text-sm font-mono text-[#54422b] relative z-10">
              <span className="font-bold tracking-wider uppercase">
                {t("V. LÁMINA FINAL HD", "V. FINAL HD PLATE")}
              </span>
              <span className="font-semibold">{project.sketchbookVol}</span>
            </div>

            {/* Archival Artwork Plate with ProgressiveImage */}
            <div className="relative my-auto flex-1 max-h-[76%] rounded-xl overflow-hidden bg-black/90 border border-[#2b2b2b]/20 shadow-xl group z-10">
              <ProgressiveImage 
                src={project.imageUrl} 
                alt={`${t("Lámina final HD de", "Final HD plate of")} ${t(project.titleEs, project.titleEn)}`}
                widthParam={900}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                containerClassName="w-full h-full"
              />
              
              {/* Fullscreen Expand Button (Min 44x44px for WCAG AAA) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenZoom) onOpenZoom(project.imageUrl);
                  else if (onOpenDetail) onOpenDetail();
                }}
                className="no-flip absolute bottom-2.5 right-2.5 min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-lg bg-black/85 hover:bg-vampire-red text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-lg border border-white/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label={t("Ver lámina en pantalla completa", "Fullscreen plate")}
                title={t("Ver lámina en pantalla completa", "Fullscreen plate")}
              >
                <Maximize2 size={15} aria-hidden="true" />
                <span>{t("HD", "HD")}</span>
              </button>
            </div>

            <div className="pt-2 border-t border-[#2b2b2b]/10 flex items-center justify-between text-xs sm:text-sm font-serif relative z-10">
              <div className="italic text-[#1c1917] truncate max-w-[220px] font-semibold">
                «{t(project.titleEs, project.titleEn)}» — Marina Martín Prieto
              </div>
              <span className="font-mono text-[#54422b] text-[10px] sm:text-xs font-bold">
                PÁG. 05
              </span>
            </div>
          </figure>

          {/* Back: Page 6 Left (Revisión de Taller) */}
          <figure 
            className="back absolute inset-0 m-0 w-full h-full bg-[#fdfbf7] rounded-l-xl sm:rounded-l-2xl overflow-hidden shadow-2xl p-4 sm:p-6 md:p-7 flex flex-col justify-between border-r border-[#2b2b2b]/15"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg) translateZ(1px)',
              boxShadow: turningLeaf === 1 ? '14px 10px 24px rgba(0,0,0,0.35)' : undefined,
            }}
          >
            {/* Antique Laid Paper Overlay */}
            <PaperTextureOverlay type="laid" seed={6} opacity={0.05} />
            {/* Subtle Natural Landing Shading */}
            <motion.div
              className="pointer-events-none absolute inset-0 z-30"
              style={{
                background: 'linear-gradient(to left, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 30%, transparent 70%)',
              }}
              animate={{
                opacity: turningLeaf === 1
                  ? (turnDirection === 'forward' ? [0.25, 0.1, 0] : [0, 0.1, 0.25])
                  : 0,
              }}
              transition={{ duration: FLIP_DURATION, ease: FLIP_EASE }}
              aria-hidden="true"
            />

            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#2b2b2b]/15 text-xs sm:text-sm font-mono text-[#54422b]">
                  <span className="font-bold tracking-wider uppercase">
                    {t("VI. REVISIÓN DE TALLER", "VI. WORKSHOP REVIEW")}
                  </span>
                  <span className="font-bold">PÁG. 06</span>
                </div>

                <h3 className="font-serif italic font-bold text-base sm:text-lg md:text-xl text-[#1c1917] mt-3 mb-2">
                  {t("Metodología & Ejecución", "Methodology & Execution")}
                </h3>
                <p className="text-xs sm:text-sm font-serif italic text-[#332e26] leading-relaxed mb-4">
                  {t(project.techniqueEs, project.techniqueEn)}
                </p>

                {/* 2x2 Clean Technical Specs Grid */}
                <div className="grid grid-cols-2 gap-2 p-3 sm:p-3.5 rounded-xl bg-[#efe9d9]/90 border border-[#3d362e]/20 text-xs font-mono text-[#1c1917]">
                  <div>
                    <span className="text-[#54422b] font-bold block text-[10px] uppercase">{t("Software", "Software")}:</span>
                    <span className="font-semibold truncate block">{project.tools}</span>
                  </div>
                  <div>
                    <span className="text-[#54422b] font-bold block text-[10px] uppercase">{t("Rol Artístico", "Artistic Role")}:</span>
                    <span className="font-semibold truncate block">{t(project.roleEs, project.roleEn)}</span>
                  </div>
                  <div>
                    <span className="text-[#54422b] font-bold block text-[10px] uppercase">{t("Categoría", "Category")}:</span>
                    <span className="font-semibold truncate block">{t(project.categoryEs, project.categoryEn)}</span>
                  </div>
                  <div>
                    <span className="text-[#54422b] font-bold block text-[10px] uppercase">{t("Expediente", "Dossier")}:</span>
                    <span className="font-semibold truncate block">{project.sketchbookVol}</span>
                  </div>
                </div>
              </div>

              <div className="my-2 p-3 rounded-xl border-l-4 border-vampire-red bg-white/85 text-xs sm:text-sm font-serif italic text-[#1c1917] font-semibold shadow-xs">
                «{t(
                  "La comprensión de la luz y el color traduce las ideas en movimiento.",
                  "Understanding light and color brings ideas to life."
                )}»
              </div>

              <div className="pt-2 border-t border-[#2b2b2b]/15 flex items-center justify-between text-[10px] sm:text-xs font-mono text-[#54422b]">
                <span className="font-semibold">{t("PROCESO Y DESARROLLO VISUAL", "VISUAL PROCESS & DEVELOPMENT")}</span>
                <span className="font-bold">MMP · {project.year}</span>
              </div>
            </div>
          </figure>
        </motion.div>

        {/* --------------------------------------------------------------------- */}
        {/* LEAF 2: Clave Tonal & Estudio Secundario (PÁG. 03 & PÁG. 04)           */}
        {/* --------------------------------------------------------------------- */}
        <motion.div
          key="leaf-2"
          className="right book-leaf absolute top-0 right-0 w-1/2 h-full cursor-pointer select-none"
          style={{
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
            pointerEvents: isCoverClosed || isBackClosed ? 'none' : 'auto',
          }}
          animate={{
            rotateY: (2 >= totalLeaves - flippedCount) ? -180 : 0,
            zIndex: getLeafZIndex(2),
          }}
          transition={{
            rotateY: { duration: FLIP_DURATION, ease: FLIP_EASE },
            zIndex: { duration: 0 },
          }}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('button') || target.closest('a') || target.closest('.no-flip')) return;
            if (2 >= totalLeaves - flippedCount) turnLeft();
            else turnRight();
          }}
        >
          {/* Front: Page 03 Right (Clave Tonal & Iluminación) */}
          <figure 
            className="front absolute inset-0 m-0 w-full h-full bg-[#fdfbf7] rounded-r-xl sm:rounded-r-2xl overflow-hidden shadow-2xl p-4 sm:p-6 md:p-7 flex flex-col justify-between border-l border-[#2b2b2b]/15"
            style={{ 
              backfaceVisibility: 'hidden', 
              WebkitBackfaceVisibility: 'hidden', 
              transform: 'translateZ(1px)',
              boxShadow: turningLeaf === 2 ? '-14px 10px 24px rgba(0,0,0,0.35)' : undefined,
            }}
          >
            {/* Fine Cold-Press Watercolor Paper Overlay */}
            <PaperTextureOverlay type="watercolor" seed={3} opacity={0.055} />

            {/* Subtle Natural Curvature Shadow on Turning Page */}
            <motion.div
              className="pointer-events-none absolute inset-0 z-30"
              style={{
                background: 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 30%, transparent 70%)',
              }}
              animate={{
                opacity: turningLeaf === 2
                  ? (turnDirection === 'forward' ? [0.1, 0.35, 0.1] : [0.1, 0.35, 0.1])
                  : 0,
              }}
              transition={{ duration: FLIP_DURATION, ease: FLIP_EASE }}
              aria-hidden="true"
            />

            <div className="flex-1 flex flex-col justify-between py-1 relative z-10">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#2b2b2b]/15 text-xs sm:text-sm font-mono text-[#54422b]">
                  <span className="font-bold uppercase tracking-wider">
                    {t("III. CLAVE TONAL & ILUMINACIÓN", "III. TONAL KEY & LIGHTING")}
                  </span>
                  <span className="font-bold">PÁG. 03</span>
                </div>

                <h3 className="font-serif italic font-bold text-base sm:text-lg md:text-xl text-[#1c1917] mt-3 mb-2">
                  {t("Estudio Atmosférico & Contraste", "Atmospheric Study & Contrast")}
                </h3>

                {/* Tonal scale with value labels */}
                <div className="mb-4 p-3 rounded-xl bg-[#efe9d9]/70 border border-[#3d362e]/20">
                  <div className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#54422b] mb-2 flex items-center justify-between font-bold">
                    <span>{t("ESCALA TONAL DINÁMICA", "DYNAMIC TONAL SCALE")}</span>
                    <span>0% — 100%</span>
                  </div>
                  <div className="grid grid-cols-5 h-7 sm:h-8 rounded-lg overflow-hidden border border-[#2b2b2b]/30 shadow-xs mb-1.5">
                    <div className="bg-[#0e0e0e] flex items-center justify-center text-[9px] font-mono text-white/90 font-bold">0%</div>
                    <div className="bg-[#383838] flex items-center justify-center text-[9px] font-mono text-white/90 font-bold">25%</div>
                    <div className="bg-[#6c6c6c] flex items-center justify-center text-[9px] font-mono text-white/90 font-bold">50%</div>
                    <div className="bg-[#b0b0b0] flex items-center justify-center text-[9px] font-mono text-[#1c1917] font-bold">75%</div>
                    <div className="bg-[#f5f5f5] flex items-center justify-center text-[9px] font-mono text-[#1c1917] font-bold">100%</div>
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-[#54422b]">
                    <span>{t("Sombra Profunda", "Deep Shadow")}</span>
                    <span>{t("Medio Tono", "Midtone")}</span>
                    <span>{t("Alta Luz", "Highlight")}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-serif italic text-[#332e26] leading-relaxed mb-3">
                  {t(
                    "La clave tonal busca un rango dinámico donde las sombras profundas definan la atmósfera y los puntos de luz guíen la narrativa visual.",
                    "The tonal key provides dynamic contrast where deep shadows shape atmosphere and focal highlights guide narrative focus."
                  )}
                </p>
              </div>

              <div>
                {/* Artist Pigment Wells */}
                <div className="p-3 rounded-xl bg-[#efe9d9] border border-[#3d362e]/20 text-xs font-mono text-[#1c1917] mb-2">
                  <span className="text-vampire-red font-bold block text-[10px] uppercase tracking-wider mb-1.5">
                    ✦ {t("PIGMENTOS DOMINANTES", "DOMINANT PIGMENTS")}:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {project.palette.slice(0, 3).map((p, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-white/80 px-2 py-1 rounded-md border border-[#3d362e]/15 text-[11px]">
                        <span className="w-3 h-3 rounded-full shrink-0 shadow-xs border border-black/20" style={{ backgroundColor: p.hex }} />
                        <span className="font-semibold text-[#1c1917]">{t(p.nameEs, p.nameEn)}</span>
                        <span className="text-[#54422b] text-[10px] font-mono">{p.hex}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#2b2b2b]/15 flex items-center justify-between text-[10px] sm:text-xs font-mono text-[#54422b]">
                  <span className="font-serif italic text-[#3d372e] font-semibold">{t("Valores Tonales & Temperatura", "Tonal Values & Temperature")}</span>
                  <span className="font-bold">EXP. {project.sketchbookVol}</span>
                </div>
              </div>
            </div>
          </figure>

          {/* Back: Page 04 Left (Estudio Secundario & Color) */}
          <figure 
            className="back absolute inset-0 m-0 w-full h-full bg-[#fdfbf7] rounded-l-xl sm:rounded-l-2xl overflow-hidden shadow-2xl p-4 sm:p-6 flex flex-col justify-between border-r border-[#2b2b2b]/15"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg) translateZ(1px)',
              boxShadow: turningLeaf === 2 ? '14px 10px 24px rgba(0,0,0,0.35)' : undefined,
            }}
          >
            {/* Silky Vellum Paper Overlay */}
            <PaperTextureOverlay type="vellum" seed={4} opacity={0.045} />
            {/* Subtle Natural Landing Shading */}
            <motion.div
              className="pointer-events-none absolute inset-0 z-30"
              style={{
                background: 'linear-gradient(to left, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 30%, transparent 70%)',
              }}
              animate={{
                opacity: turningLeaf === 2
                  ? (turnDirection === 'forward' ? [0.25, 0.1, 0] : [0, 0.1, 0.25])
                  : 0,
              }}
              transition={{ duration: FLIP_DURATION, ease: FLIP_EASE }}
              aria-hidden="true"
            />

            <div className="flex items-center justify-between pb-2 border-b border-[#2b2b2b]/10 text-xs sm:text-sm font-mono text-[#54422b]">
              <span className="font-bold">PÁG. 04</span>
              <span className="font-bold tracking-wider uppercase">
                {t("IV. ESTUDIO SECUNDARIO & COLOR", "IV. SECONDARY STUDY & COLOR")}
              </span>
            </div>

            <div className="relative my-auto flex-1 max-h-[76%] rounded-xl overflow-hidden bg-black/90 border border-[#2b2b2b]/20 shadow-lg group">
              <ProgressiveImage 
                src={secondaryImage} 
                alt={`${t("Estudio secundario de", "Secondary study of")} ${t(project.titleEs, project.titleEn)}`}
                widthParam={900}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                containerClassName="w-full h-full"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenZoom) onOpenZoom(secondaryImage);
                }}
                className="no-flip absolute bottom-2.5 right-2.5 min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-lg bg-black/85 hover:bg-vampire-red text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md border border-white/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label={t("Ver lámina en pantalla completa", "Fullscreen")}
                title={t("Ver lámina en pantalla completa", "Fullscreen")}
              >
                <Maximize2 size={15} aria-hidden="true" />
                <span>HD</span>
              </button>
            </div>

            <div className="pt-2 border-t border-[#2b2b2b]/10 flex items-center justify-between text-xs sm:text-sm font-mono text-[#3d372e]">
              <span className="font-serif italic font-semibold">{t(project.processImages[1]?.labelEs || "Fase de Acabado", project.processImages[1]?.labelEn || "Finish Phase")}</span>
              <span className="text-[#54422b] font-bold">PLATE 02 · MMP</span>
            </div>
          </figure>
        </motion.div>

        {/* --------------------------------------------------------------------- */}
        {/* LEAF 3: Dossier Conceptual & Bocetos (PÁG. 01 & PÁG. 02)               */}
        {/* --------------------------------------------------------------------- */}
        <motion.div
          key="leaf-3"
          className="right book-leaf absolute top-0 right-0 w-1/2 h-full cursor-pointer select-none"
          style={{
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
            pointerEvents: isCoverClosed || isBackClosed ? 'none' : 'auto',
          }}
          animate={{
            rotateY: (3 >= totalLeaves - flippedCount) ? -180 : 0,
            zIndex: getLeafZIndex(3),
          }}
          transition={{
            rotateY: { duration: FLIP_DURATION, ease: FLIP_EASE },
            zIndex: { duration: 0 },
          }}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('button') || target.closest('a') || target.closest('.no-flip')) return;
            if (3 >= totalLeaves - flippedCount) turnLeft();
            else turnRight();
          }}
        >
          {/* Front: Page 01 Right (I. Dossier Conceptual & Paleta) */}
          <figure 
            className="front absolute inset-0 m-0 w-full h-full bg-[#fdfbf7] rounded-r-xl sm:rounded-r-2xl overflow-hidden shadow-2xl p-4 sm:p-6 md:p-7 flex flex-col justify-between border-l border-[#2b2b2b]/15"
            style={{ 
              backfaceVisibility: 'hidden', 
              WebkitBackfaceVisibility: 'hidden', 
              transform: 'translateZ(1px)',
              boxShadow: turningLeaf === 3 ? '-14px 10px 24px rgba(0,0,0,0.35)' : undefined,
            }}
          >
            {/* Fine Cotton Rag Paper Overlay */}
            <PaperTextureOverlay type="rag" seed={1} opacity={0.05} />

            {/* Subtle Natural Curvature Shadow on Turning Page */}
            <motion.div
              className="pointer-events-none absolute inset-0 z-30"
              style={{
                background: 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 30%, transparent 70%)',
              }}
              animate={{
                opacity: turningLeaf === 3
                  ? (turnDirection === 'forward' ? [0.1, 0.35, 0.1] : [0.1, 0.35, 0.1])
                  : 0,
              }}
              transition={{ duration: FLIP_DURATION, ease: FLIP_EASE }}
              aria-hidden="true"
            />

            <div className="flex-1 flex flex-col justify-between py-1 relative z-10">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#2b2b2b]/15 text-xs sm:text-sm font-mono text-[#54422b]">
                  <span className="font-bold uppercase tracking-wider">
                    {t("I. DOSSIER CONCEPTUAL", "I. CONCEPT DOSSIER")}
                  </span>
                  <span className="font-bold">PÁG. 01</span>
                </div>

                <div className="mt-3 mb-2">
                  <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-[#ff3b1f] font-bold block mb-0.5">
                    {t(project.categoryEs, project.categoryEn)} · {project.year}
                  </span>
                  <h3 className="font-serif italic font-bold text-lg sm:text-xl md:text-2xl text-[#1c1917] truncate">
                    «{t(project.titleEs, project.titleEn)}»
                  </h3>
                </div>

                <p className="text-xs sm:text-sm font-serif italic text-[#332e26] leading-relaxed mb-3">
                  {t(project.descriptionEs, project.descriptionEn)}
                </p>

                {/* Palette Chips (Min 44x44px hit target for WCAG AAA) */}
                <div className="mb-3 p-3 rounded-xl bg-[#efe9d9]/70 border border-[#3d362e]/20">
                  <div className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#54422b] mb-2 flex items-center justify-between font-bold">
                    <span>{t("PALETA DE PIGMENTOS", "PIGMENT PALETTE")}</span>
                    {copiedHex && (
                      <span className="text-vampire-red flex items-center gap-1 font-mono font-bold">
                        <Check size={13} aria-hidden="true" /> {copiedHex}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {project.palette.map((color, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyHex(color.hex);
                        }}
                        className="no-flip group/chip min-h-[44px] p-2 rounded-lg bg-white/80 border border-[#3d362e]/20 hover:border-vampire-red transition-all text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vampire-red flex items-center gap-2"
                        title={`${t(color.nameEs, color.nameEn)} (${color.hex})`}
                        aria-label={`${t("Copiar código de color", "Copy color code")}: ${t(color.nameEs, color.nameEn)} (${color.hex})`}
                      >
                        <div 
                          className="w-5 h-5 rounded-md shadow-xs shrink-0 border border-black/20 group-hover/chip:scale-105 transition-transform"
                          style={{ backgroundColor: color.hex }}
                          aria-hidden="true"
                        />
                        <div className="overflow-hidden">
                          <span className="text-[10px] sm:text-[11px] font-sans font-bold text-[#1c1917] truncate block leading-tight">
                            {t(color.nameEs, color.nameEn)}
                          </span>
                          <span className="text-[9px] font-mono text-[#54422b] font-semibold block">
                            {color.hex}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Artist Field Notes Callout */}
              <div className="my-1 p-3 sm:p-3.5 rounded-xl bg-[#f7f2e7] border-l-3 border-[#54422b] shadow-xs">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#54422b] font-bold mb-1">
                  <Sparkles size={13} className="text-vampire-red" aria-hidden="true" />
                  <span>{t("NOTAS DE LA ARTISTA", "ARTIST FIELD NOTES")}</span>
                </div>
                <p className="font-serif italic text-xs sm:text-sm text-[#2b251e] leading-relaxed">
                  «{t(project.notesEs, project.notesEn)}»
                </p>
              </div>

              <div className="pt-2 border-t border-[#2b2b2b]/15 flex items-center justify-between text-[10px] sm:text-xs font-mono text-[#54422b]">
                <span className="font-serif italic text-[#3d372e] font-semibold">{t("Registro Conceptual", "Concept Record")}</span>
                <span className="font-bold">EXP. {project.sketchbookVol}</span>
              </div>
            </div>
          </figure>

          {/* Back: Page 02 Left (II. Bocetos & Línea Exploratoria) */}
          <figure 
            className="back absolute inset-0 m-0 w-full h-full bg-[#fdfbf7] rounded-l-xl sm:rounded-l-2xl overflow-hidden shadow-2xl p-4 sm:p-6 flex flex-col justify-between border-r border-[#2b2b2b]/15"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg) translateZ(1px)',
              boxShadow: turningLeaf === 3 ? '14px 10px 24px rgba(0,0,0,0.35)' : undefined,
            }}
          >
            {/* Antique Laid Paper Overlay */}
            <PaperTextureOverlay type="laid" seed={2} opacity={0.05} />
            {/* Subtle Natural Landing Shading */}
            <motion.div
              className="pointer-events-none absolute inset-0 z-30"
              style={{
                background: 'linear-gradient(to left, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 30%, transparent 70%)',
              }}
              animate={{
                opacity: turningLeaf === 3
                  ? (turnDirection === 'forward' ? [0.25, 0.1, 0] : [0, 0.1, 0.25])
                  : 0,
              }}
              transition={{ duration: FLIP_DURATION, ease: FLIP_EASE }}
              aria-hidden="true"
            />

            <div className="flex items-center justify-between pb-2 border-b border-[#2b2b2b]/10 text-xs sm:text-sm font-mono text-[#54422b]">
              <span className="font-bold">PÁG. 02</span>
              <span className="font-bold uppercase tracking-wider">
                {t("II. BOCETOS & LÍNEA EXPLORATORIA", "II. SKETCHES & LINE EXPLORATION")}
              </span>
            </div>

            <div className="relative my-auto flex-1 max-h-[76%] rounded-xl overflow-hidden bg-black/90 border border-[#2b2b2b]/20 shadow-md">
              <ProgressiveImage 
                src={sketchImage} 
                alt={`${t("Boceto y trazo preliminar de", "Preliminary sketch of")} ${t(project.titleEs, project.titleEn)}`}
                widthParam={900}
                className="w-full h-full object-cover"
                containerClassName="w-full h-full"
              />

              {sketchHotspots.map((hs, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHotspot(hs);
                  }}
                  className="no-flip absolute w-11 h-11 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer group/hs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                  aria-label={`${t("Anotación técnica:", "Technical note:")} ${t(hs.titleEs, hs.titleEn)}`}
                >
                  <span className="w-6 h-6 rounded-full border-2 border-amber-300 bg-black/90 text-amber-300 flex items-center justify-center text-xs font-bold shadow-xl group-hover/hs:scale-125 transition-transform">
                    ✦
                  </span>
                </button>
              ))}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenZoom) onOpenZoom(sketchImage);
                }}
                className="no-flip absolute bottom-2.5 right-2.5 min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-lg bg-black/85 hover:bg-vampire-red text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md border border-white/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label={t("Ver boceto en pantalla completa", "Fullscreen sketch")}
                title={t("Ver boceto en pantalla completa", "Fullscreen sketch")}
              >
                <Maximize2 size={15} aria-hidden="true" />
                <span>HD</span>
              </button>
              {/* Floating Hotspot Callout pinned inside image plate */}
              <AnimatePresence>
                {activeHotspot && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="no-flip absolute bottom-2 left-2 right-16 p-2.5 rounded-lg bg-black/95 backdrop-blur-md text-white text-xs border border-amber-400/40 shadow-2xl z-20" 
                    role="region" 
                    aria-label={t(activeHotspot.titleEs, activeHotspot.titleEn)}
                  >
                    <div className="flex items-center justify-between text-amber-300 font-bold mb-0.5 text-[11px]">
                      <span>✦ {t(activeHotspot.titleEs, activeHotspot.titleEn)}</span>
                      <button 
                        type="button" 
                        onClick={() => setActiveHotspot(null)} 
                        className="w-5 h-5 flex items-center justify-center text-white/80 hover:text-white cursor-pointer"
                        aria-label={t("Cerrar nota", "Close note")}
                      >
                        ✕
                      </button>
                    </div>
                    <p className="font-serif italic text-white/95 text-[11px] leading-tight line-clamp-2">{t(activeHotspot.descriptionEs, activeHotspot.descriptionEn)}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="pt-2 border-t border-[#2b2b2b]/15 flex items-center justify-between text-[10px] sm:text-xs font-mono text-[#3d372e]">
              <span className="font-serif italic font-semibold">{t(project.processImages[0]?.labelEs || "Boceto y Trazo", project.processImages[0]?.labelEn || "Sketch & Stroke")}</span>
              <span className="text-[#54422b] font-bold">PÁG. 02 · {sketchHotspots.length} {t("ANOTACIONES", "NOTES")}</span>
            </div>
          </figure>
        </motion.div>

        {/* --------------------------------------------------------------------- */}
        {/* LEAF 4: FRONT COVER #cover & Inside Front Cover PÁG. 00                */}
        {/* --------------------------------------------------------------------- */}
        <motion.div
          key="leaf-4"
          className="right book-leaf absolute top-0 right-0 w-1/2 h-full cursor-pointer select-none"
          style={{
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
            pointerEvents: isBackClosed ? 'none' : 'auto',
          }}
          animate={{
            rotateY: (4 >= totalLeaves - flippedCount) ? -180 : 0,
            zIndex: getLeafZIndex(4),
          }}
          transition={{
            rotateY: { duration: FLIP_DURATION, ease: FLIP_EASE },
            zIndex: { duration: 0 },
          }}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('button') || target.closest('a') || target.closest('.no-flip')) return;
            if (4 >= totalLeaves - flippedCount) turnLeft();
            else turnRight();
          }}
        >
          {/* Front: FRONT COVER (#cover) */}
          <figure 
            id="cover"
            className="front absolute inset-0 m-0 w-full h-full rounded-r-xl sm:rounded-r-2xl overflow-hidden shadow-2xl p-4 sm:p-6 md:p-8 flex flex-col justify-between border border-white/20 select-none cursor-pointer"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'translateZ(1px)',
              boxShadow: turningLeaf === 4 ? '-14px 10px 24px rgba(0,0,0,0.35)' : undefined,
              backgroundColor: project.coverColor,
              backgroundImage: `
                radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.08) 0%, transparent 70%),
                linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.72) 100%)
              `
            }}
          >
            {/* Subtle Natural Curvature Shadow on Turning Cover */}
            <motion.div
              className="pointer-events-none absolute inset-0 z-30"
              style={{
                background: 'linear-gradient(to right, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.12) 30%, transparent 70%)',
              }}
              animate={{
                opacity: turningLeaf === 4
                  ? (turnDirection === 'forward' ? [0.15, 0.4, 0.15] : [0.15, 0.4, 0.15])
                  : 0,
              }}
              transition={{ duration: FLIP_DURATION, ease: FLIP_EASE }}
              aria-hidden="true"
            />

            {/* Left Spine Strip */}
            <div 
              className="absolute top-0 bottom-0 left-0 w-8 sm:w-10 z-20 flex flex-col justify-center items-center border-r border-black/50 shadow-[2px_0_10px_rgba(0,0,0,0.5)]"
              style={{ 
                backgroundColor: project.spineColor,
                backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.6), rgba(255,255,255,0.1) 50%, rgba(0,0,0,0.5))' 
              }}
            >
              <div className="transform -rotate-90 whitespace-nowrap text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-white/80 font-serif font-bold pointer-events-none">
                <span>{project.sketchbookVol}</span>
              </div>
            </div>

            {/* Spine Hinge Indentation */}
            <div className="absolute top-0 bottom-0 left-[34px] sm:left-[42px] w-[2px] bg-black/60 border-r border-white/10 pointer-events-none z-20 shadow-inner" />

            {/* Cover Header */}
            <div className="relative z-10 pl-10 sm:pl-14 pr-2 sm:pr-4 pt-1 sm:pt-2 flex items-center justify-between text-xs sm:text-sm font-mono tracking-widest text-bone">
              <span className="uppercase font-semibold tracking-[0.2em]">{project.sketchbookVol}</span>
              <span className="font-semibold text-bone-muted">{project.year}</span>
            </div>

            {/* Center Artwork Plate */}
            <div className="relative z-10 pl-10 sm:pl-14 pr-2 sm:pr-4 my-auto py-1.5">
              <div className="relative p-1.5 rounded-xl bg-black/70 border border-white/20 shadow-2xl">
                <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-black/90">
                  <ProgressiveImage 
                    src={project.imageUrl} 
                    alt={`${t("Lámina de portada de", "Cover artwork of")} ${t(project.titleEs, project.titleEn)}`} 
                    widthParam={900}
                    priority={true}
                    className="w-full h-full object-cover"
                    containerClassName="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Cover Footer & Artist */}
            <div className="relative z-10 pl-10 sm:pl-14 pr-2 sm:pr-4 pb-1 sm:pb-2">
              <div className="text-[10px] sm:text-xs font-mono tracking-[0.2em] uppercase text-[#ff6e58] font-bold mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff6e58]" aria-hidden="true" />
                <span>{t(project.categoryEs, project.categoryEn)}</span>
              </div>
              <h3 className="font-serif italic font-bold text-base sm:text-xl md:text-2xl text-bone leading-tight drop-shadow-sm mb-2">
                {t(project.titleEs, project.titleEn)}
              </h3>
              <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs sm:text-sm font-mono text-bone-muted">
                <span className="tracking-wider">MARINA MARTÍN PRIETO</span>
                <span className="text-[#ff6e58] font-bold flex items-center gap-1">
                  {t("ABRIR", "OPEN")} ➔
                </span>
              </div>
            </div>
          </figure>

          {/* Back: Page 00 Left (Estudio Preliminar & Guarda de Bocetos) */}
          <figure 
            className="back absolute inset-0 m-0 w-full h-full bg-[#fdfbf7] rounded-l-xl sm:rounded-l-2xl overflow-hidden shadow-2xl p-4 sm:p-6 md:p-7 flex flex-col justify-between border-r border-[#2b2b2b]/15"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg) translateZ(1px)',
              boxShadow: turningLeaf === 4 ? '14px 10px 24px rgba(0,0,0,0.35)' : undefined,
            }}
          >
            {/* Handcrafted Botanical Paper Overlay */}
            <PaperTextureOverlay type="botanical" seed={8} opacity={0.05} />
            {/* Subtle Natural Landing Shading */}
            <motion.div
              className="pointer-events-none absolute inset-0 z-30"
              style={{
                background: 'linear-gradient(to left, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 30%, transparent 70%)',
              }}
              animate={{
                opacity: turningLeaf === 4
                  ? (turnDirection === 'forward' ? [0.25, 0.1, 0] : [0, 0.1, 0.25])
                  : 0,
              }}
              transition={{ duration: FLIP_DURATION, ease: FLIP_EASE }}
              aria-hidden="true"
            />

            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#2b2b2b]/15 text-xs sm:text-sm font-mono text-[#54422b]">
                  <span className="font-bold uppercase tracking-wider">
                    {t("ESTUDIO PRELIMINAR", "PRELIMINARY STUDY")}
                  </span>
                  <span className="font-bold">PÁG. 00</span>
                </div>

                {/* Title & Concept Header */}
                <div className="mt-3 mb-2">
                  <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-[#ff3b1f] font-bold block mb-0.5">
                    {t("NOTAS DE TALLER & GÉNESIS", "STUDIO NOTES & GENESIS")}
                  </span>
                  <h4 className="font-serif italic font-bold text-lg sm:text-xl text-[#1c1917]">
                    «{t(project.titleEs, project.titleEn)}»
                  </h4>
                </div>

                {/* Artwork Sketch Vignette */}
                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-[#2b2b2b]/20 shadow-sm bg-[#ece5d5]/80 my-2">
                  <ProgressiveImage 
                    src={sketchImage} 
                    alt={`${t("Estudio preliminar de", "Preliminary study of")} ${t(project.titleEs, project.titleEn)}`} 
                    widthParam={900}
                    className="w-full h-full object-cover filter contrast-105"
                    containerClassName="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-1.5 right-2.5 text-[9px] font-mono text-white/95 font-bold">
                    REF. SK-001 · MMP
                  </span>
                </div>
              </div>

              {/* Handwritten Artist Notes Callout */}
              <div className="my-1 p-3 sm:p-3.5 rounded-xl bg-[#f7f2e7] border-l-3 border-[#54422b] shadow-xs">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#54422b] font-bold mb-1">
                  <Sparkles size={13} className="text-vampire-red" aria-hidden="true" />
                  <span>{t("PLANTEAMIENTO PLÁSTICO", "PLASTIC APPROACH")}</span>
                </div>
                <p className="font-serif italic text-xs sm:text-sm text-[#2b251e] leading-relaxed">
                  {t(
                    "«Primeras anotaciones de atmósfera, valores tonales y estructura geométrica preliminar.»",
                    "«Initial notes on atmosphere, tonal values, and preliminary geometric structure.»"
                  )}
                </p>
              </div>

              <div className="pt-2 border-t border-[#2b2b2b]/15 flex items-center justify-between text-[10px] sm:text-xs font-mono text-[#3d372e]">
                <div>
                  <span className="text-[#54422b] uppercase font-bold">{t("REGISTRO", "RECORD")}:</span> {project.year} · MMP
                </div>
                <div className="text-[#54422b] uppercase tracking-wider font-bold">
                  ✦ {project.sketchbookVol}
                </div>
              </div>
            </div>
          </figure>
        </motion.div>
      </motion.div>

          {/* Subtle Specular Tactile Lighting Sheen that reacts dynamically to mouse position */}
          <div
            ref={sheenRef}
            className="pointer-events-none absolute inset-0 z-45 rounded-2xl opacity-10 transition-opacity"
            style={{
              background: 'radial-gradient(circle at 50% 35%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.08) 45%, transparent 75%)',
              mixBlendMode: 'overlay',
            }}
            aria-hidden="true"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Sketchbook;
