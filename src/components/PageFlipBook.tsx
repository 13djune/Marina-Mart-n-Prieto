import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, CheckCircle2, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Project, Hotspot } from '../data';
import { useLanguage } from '../LanguageContext';
import { soundManager } from '../utils/audio';
import SketchbookTextureOverlay from './SketchbookTextureOverlay';

export interface PageFlipBookRef {
  turnToSpread: (spreadIndex: number) => void;
  turnNext: () => void;
  turnPrev: () => void;
}

interface PageFlipBookProps {
  project: Project;
  currentSpread: number;
  onSpreadChange: (index: number) => void;
  onOpenZoom: (url: string) => void;
  accentColor?: string;
  bookRef?: React.RefObject<HTMLDivElement | null>;
  flipBookRef?: React.Ref<PageFlipBookRef>;
}

export const PageFlipBook: React.FC<PageFlipBookProps> = ({
  project,
  currentSpread,
  onSpreadChange,
  onOpenZoom,
  accentColor = '#ff3b1f',
  bookRef,
  flipBookRef,
}) => {
  const { t } = useLanguage();
  const totalLeaves = 5; // Leaves 0 to 4. Spread index 0: Portada, 1: Ex-Libris & Ficha, 2: Bocetos, 3: Lámina Final HD, 4: Taller & Certificado, 5: Contraportada

  const [flippedCount, setFlippedCount] = useState<number>(currentSpread);
  const [animatingLeafIndex, setAnimatingLeafIndex] = useState<number | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const animTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sketchImage = project.processImages[0]?.url || project.imageUrl;
  const secondaryImage = project.processImages[1]?.url || project.imageUrl;
  const finalImage = project.processImages.find(p => p.labelEs.toLowerCase().includes('final'))?.url || project.imageUrl;

  const sketchHotspots = project.processImages[0]?.hotspots || [];
  const secondaryHotspots = project.processImages[1]?.hotspots || [];

  // Responsive screen detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync external currentSpread changes with internal flippedCount
  useEffect(() => {
    if (currentSpread !== flippedCount) {
      setFlippedCount(currentSpread);
    }
  }, [currentSpread]);

  // Handle page turn with tactile sound and high-z animation tracking
  const triggerFlip = useCallback((targetFlippedCount: number, leafIdxToAnimate: number) => {
    if (animTimeoutRef.current) {
      clearTimeout(animTimeoutRef.current);
    }
    soundManager.playPageTurn();
    setAnimatingLeafIndex(leafIdxToAnimate);
    setFlippedCount(targetFlippedCount);
    onSpreadChange(targetFlippedCount);
    setActiveHotspot(null);

    // 750ms matching CSS transition duration
    animTimeoutRef.current = setTimeout(() => {
      setAnimatingLeafIndex(null);
    }, 750);
  }, [onSpreadChange]);

  const turnNext = useCallback(() => {
    if (flippedCount >= totalLeaves) return;
    const leafIndex = totalLeaves - 1 - flippedCount;
    triggerFlip(flippedCount + 1, leafIndex);
  }, [flippedCount, totalLeaves, triggerFlip]);

  const turnPrev = useCallback(() => {
    if (flippedCount <= 0) return;
    const leafIndex = totalLeaves - flippedCount;
    triggerFlip(flippedCount - 1, leafIndex);
  }, [flippedCount, totalLeaves, triggerFlip]);

  const turnToSpread = useCallback((targetIndex: number) => {
    if (targetIndex === flippedCount || targetIndex < 0 || targetIndex > totalLeaves) return;
    const leafIndex = targetIndex > flippedCount 
      ? totalLeaves - 1 - flippedCount 
      : totalLeaves - flippedCount;
    triggerFlip(targetIndex, leafIndex);
  }, [flippedCount, totalLeaves, triggerFlip]);

  // Expose ref API to parent component
  useEffect(() => {
    if (flipBookRef) {
      const api: PageFlipBookRef = {
        turnToSpread,
        turnNext,
        turnPrev,
      };
      if (typeof flipBookRef === 'function') {
        flipBookRef(api);
      } else if ('current' in flipBookRef) {
        (flipBookRef as any).current = api;
      }
    }
  }, [flipBookRef, turnToSpread, turnNext, turnPrev]);

  // Copy color hex helper
  const handleCopyHex = (hex: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 2000);
    }
  };

  // Touch and pointer swipe handlers
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('.no-flip')) return;
    touchStartXRef.current = e.clientX;
    touchStartYRef.current = e.clientY;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (touchStartXRef.current === null) return;
    const deltaX = e.clientX - touchStartXRef.current;
    const deltaY = e.clientY - (touchStartYRef.current ?? e.clientY);
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    // Horizontal swipe threshold
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0) {
        turnNext();
      } else {
        turnPrev();
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        turnNext();
      } else if (e.key === 'ArrowLeft') {
        turnPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [turnNext, turnPrev]);

  const isCoverClosed = flippedCount === 0;
  const isBackClosed = flippedCount === totalLeaves;
  const isOpen = !isCoverClosed && !isBackClosed;

  // Smooth centering offset:
  // When cover (flippedCount === 0), shift left by 25% so right half is centered.
  // When back cover (flippedCount === 5), shift right by 25% so left half is centered.
  // When open (1..4), perfectly centered (0%).
  const getContainerShift = () => {
    if (isCoverClosed) return 'translateX(-25%)';
    if (isBackClosed) return 'translateX(25%)';
    return 'translateX(0%)';
  };

  return (
    <div 
      ref={bookRef}
      className="relative w-full flex flex-col items-center justify-center select-none py-2 md:py-4 px-2"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 3D Physical Book Container */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-[880px] aspect-[16/10.5] sm:aspect-[16/10] max-h-[70vh] rounded-2xl md:rounded-3xl transition-transform duration-700 ease-out"
        style={{
          perspective: isMobile ? '1400px' : '2200px',
          transform: getContainerShift(),
        }}
      >
        {/* ========================================================= */}
        {/* 3D STACKED LEAVES (The physical pages & cover)            */}
        {/* Ordered from Leaf 0 (Back cover) to Leaf 4 (Front cover)  */}
        {/* ========================================================= */}

        {/* --------------------------------------------------------- */}
        {/* LEAF 0 (Bottom leaf: Certificado & Back Cover)            */}
        {/* --------------------------------------------------------- */}
        {(() => {
          const leafIndex = 0;
          const isFlipped = leafIndex >= (totalLeaves - flippedCount);
          const zIndex = animatingLeafIndex === leafIndex 
            ? 100 
            : isFlipped ? (totalLeaves - leafIndex) : (leafIndex + 1);

          return (
            <div
              className={`book-leaf absolute top-0 right-0 w-1/2 h-full transition-transform duration-700 ease-in-out ${isFlipped ? 'flip' : ''}`}
              style={{
                transformOrigin: 'left center',
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                zIndex,
              }}
              onClick={() => {
                if (!isFlipped) turnNext();
                else turnPrev();
              }}
            >
              {/* FRONT: Page 4 Right (Certificado de Autenticidad) */}
              <figure 
                className="front absolute inset-0 m-0 w-full h-full bg-[#f8f5ee] rounded-r-xl sm:rounded-r-2xl overflow-hidden shadow-2xl p-4 sm:p-6 md:p-8 flex flex-col justify-between border-l border-[#2b2b2b]/15"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                {/* Antique Paper & Ink Stains Overlay */}
                <SketchbookTextureOverlay variant="all" seed={7} opacity={0.18} />

                <div className="border border-[#3d362e]/30 p-3 sm:p-5 rounded-lg h-full flex flex-col justify-between bg-[#fbf9f4] shadow-inner relative z-10">
                  <div className="text-center pb-2 border-b border-[#3d362e]/20">
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.25em] text-[#8c744f] font-bold">
                      {t("CERTIFICADO DE AUTENTICIDAD", "CERTIFICATE OF AUTHENTICITY")}
                    </span>
                    <h3 className="font-serif italic font-bold text-sm sm:text-base md:text-lg text-[#201d18] mt-0.5">
                      {t(project.titleEs, project.titleEn)}
                    </h3>
                  </div>

                  <div className="my-auto text-center space-y-2 py-2">
                    <p className="text-[10px] sm:text-xs font-serif italic text-[#4a4237] leading-relaxed max-w-xs mx-auto">
                      {t(
                        "Por la presente se certifica que esta obra conceptual y sus estudios exploratorios forman parte del archivo oficial de la artista conceptual e ilustradora Marina Martín Prieto.",
                        "This certifies that this concept artwork and exploratory studies belong to the official archive of concept artist and illustrator Marina Martín Prieto."
                      )}
                    </p>
                    <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono text-[#8c744f]">
                      <Sparkles size={11} />
                      <span>REF: MMP-ART-{project.year}-00{project.id}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#3d362e]/20 flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-[#5c5346]">
                    <div className="text-left">
                      <div className="text-[8px] text-[#8c744f] uppercase">{t("Firma de la Autora", "Artist Signature")}</div>
                      <div className="font-serif italic text-xs sm:text-sm font-bold text-[#201d18]">Marina Martín Prieto</div>
                    </div>
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-[#8c744f]/60 flex items-center justify-center text-[7px] uppercase font-mono text-[#8c744f] tracking-tighter text-center bg-[#8c744f]/10 shadow-xs">
                      STUDIO<br/>SEAL
                    </div>
                  </div>
                </div>

                <div className="text-right text-[8px] sm:text-[9px] font-mono text-[#8c744f] pt-1 relative z-10">
                  PÁG. 07 · COLOFÓN
                </div>
              </figure>

              {/* BACK: Contraportada (Back Cover) */}
              <figure 
                className="back absolute inset-0 m-0 w-full h-full rounded-l-xl sm:rounded-l-2xl overflow-hidden shadow-2xl p-6 sm:p-8 flex flex-col justify-between border border-white/15"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  backgroundColor: project.coverColor,
                  backgroundImage: `
                    radial-gradient(circle at 50% 40%, rgba(255, 255, 255, 0.08) 0%, transparent 70%),
                    linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.75) 100%)
                  `
                }}
              >
                {/* Antique Paper Overlay on Back Cover */}
                <SketchbookTextureOverlay variant="paper" seed={0} opacity={0.12} />
                {/* Texture */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseBack'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseBack)'/%3E%3C/svg%3E")`
                  }}
                />

                {/* Right Edge Spine Strip */}
                <div 
                  className="absolute top-0 bottom-0 right-0 w-7 sm:w-9 border-l border-black/50"
                  style={{ backgroundColor: project.spineColor }}
                />

                {/* Center Embossed Monogram */}
                <div className="my-auto flex flex-col items-center justify-center text-center z-10">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-white/20 flex items-center justify-center text-white/70 font-serif italic text-xl sm:text-2xl shadow-inner mb-3 bg-black/40">
                    MMP
                  </div>
                  <h4 className="font-serif italic text-bone text-base sm:text-lg font-bold">
                    Marina Martín Prieto
                  </h4>
                  <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.25em] text-white/50 mt-1">
                    {t("ARCHIVO PRIVADO DE ESTUDIO", "PRIVATE STUDIO ARCHIVE")}
                  </p>
                </div>

                {/* Bottom Colophon Footer */}
                <div className="z-10 flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-white/40 border-t border-white/10 pt-3">
                  <span>MMP · ARCHIVO DE ESTUDIO</span>
                  <span>{project.year} · ALL RIGHTS RESERVED</span>
                </div>
              </figure>
            </div>
          );
        })()}

        {/* --------------------------------------------------------- */}
        {/* LEAF 1: Lámina Final HD & Detalles de Taller               */}
        {/* --------------------------------------------------------- */}
        {(() => {
          const leafIndex = 1;
          const isFlipped = leafIndex >= (totalLeaves - flippedCount);
          const zIndex = animatingLeafIndex === leafIndex 
            ? 100 
            : isFlipped ? (totalLeaves - leafIndex) : (leafIndex + 1);

          return (
            <div
              className={`book-leaf absolute top-0 right-0 w-1/2 h-full transition-transform duration-700 ease-in-out ${isFlipped ? 'flip' : ''}`}
              style={{
                transformOrigin: 'left center',
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                zIndex,
              }}
              onClick={() => {
                if (!isFlipped) turnNext();
                else turnPrev();
              }}
            >
              {/* FRONT: Page 3 Right (Lámina Final HD / Masterpiece Plate) */}
              <figure 
                className="front absolute inset-0 m-0 w-full h-full bg-[#f8f5ee] rounded-r-xl sm:rounded-r-2xl overflow-hidden shadow-2xl p-3 sm:p-5 md:p-6 flex flex-col justify-between border-l border-[#2b2b2b]/15"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                {/* Antique Paper & Ink Stains Overlay */}
                <SketchbookTextureOverlay variant="all" seed={5} opacity={0.16} />

                {/* Header */}
                <div className="flex items-center justify-between pb-1.5 border-b border-[#2b2b2b]/10 text-[9px] sm:text-[10px] font-mono text-[#8c744f] relative z-10">
                  <span className="font-bold tracking-wider uppercase">
                    {t("V. LÁMINA FINAL HD", "V. FINAL HD PLATE")}
                  </span>
                  <span>{project.sketchbookVol}</span>
                </div>

                {/* Museum Matting & Archival Plate */}
                <div className="relative my-auto flex-1 max-h-[75%] rounded-lg overflow-hidden bg-black/90 border border-[#2b2b2b]/20 shadow-xl group z-10">
                  <img 
                    src={project.imageUrl} 
                    alt={project.titleEs} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Clean Fullscreen Expand Button (NO lupa icon!) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenZoom(project.imageUrl);
                    }}
                    className="no-flip absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-black/80 hover:bg-vampire-red text-white text-[9px] sm:text-[10px] font-mono flex items-center gap-1.5 transition-all shadow-lg border border-white/10 cursor-pointer"
                    title={t("Ver lámina en pantalla completa", "View full resolution plate")}
                  >
                    <Maximize2 size={12} />
                    <span>{t("PANTALLA COMPLETA", "FULLSCREEN")}</span>
                  </button>
                </div>

                {/* Plate Caption */}
                <div className="pt-2 border-t border-[#2b2b2b]/10 flex items-center justify-between text-[9px] sm:text-[10px] font-serif relative z-10">
                  <div className="italic text-[#332e26]">
                    «{t(project.titleEs, project.titleEn)}» — Marina Martín Prieto
                  </div>
                  <span className="font-mono text-[#8c744f] text-[8px] sm:text-[9px]">
                    PÁG. 05
                  </span>
                </div>
              </figure>

              {/* BACK: Page 4 Left (Detalles de Taller & Render) */}
              <figure 
                className="back absolute inset-0 m-0 w-full h-full bg-[#f8f5ee] rounded-l-xl sm:rounded-l-2xl overflow-hidden shadow-2xl p-4 sm:p-6 md:p-7 flex flex-col justify-between border-r border-[#2b2b2b]/15"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                {/* Antique Paper & Ink Stains Overlay */}
                <SketchbookTextureOverlay variant="all" seed={6} opacity={0.16} />
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#2b2b2b]/10 text-[9px] sm:text-[10px] font-mono text-[#8c744f]">
                    <span>PÁG. 06</span>
                    <span className="font-bold uppercase tracking-wider">
                      {t("VI. REVISIÓN DE TALLER", "VI. WORKSHOP REVIEW")}
                    </span>
                  </div>

                  <h3 className="font-serif italic font-bold text-sm sm:text-base md:text-lg text-[#201d18] mt-2 mb-1">
                    {t("Metodología & Ejecución", "Methodology & Execution")}
                  </h3>
                  <p className="text-[10px] sm:text-xs font-serif italic text-[#4a4237] leading-relaxed mb-3">
                    {t(project.techniqueEs, project.techniqueEn)}
                  </p>

                  <div className="p-2.5 sm:p-3 rounded-lg bg-[#efe9d9] border border-[#3d362e]/15 text-[9px] sm:text-[10px] font-mono text-[#332e26] space-y-1.5">
                    <div className="font-bold text-[#8c744f] uppercase tracking-wider text-[8px]">
                      {t("PARÁMETROS TÉCNICOS", "TECHNICAL PARAMETERS")}
                    </div>
                    <div><span className="text-[#8c744f]">Software:</span> {project.tools}</div>
                    <div><span className="text-[#8c744f]">Rol:</span> {t(project.roleEs, project.roleEn)}</div>
                    <div><span className="text-[#8c744f]">Categoría:</span> {t(project.categoryEs, project.categoryEn)}</div>
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-lg border-l-2 border-vampire-red bg-white/50 text-[10px] sm:text-xs font-serif italic text-[#2c2822]">
                  «{t(
                    "La comprensión de la luz y el color es la clave para traducir las ideas en ilustraciones llenas de vida, movimiento y color.",
                    "Understanding light and color is key to translating people's ideas into illustrations full of life, movement and color."
                  )}»
                  <div className="text-right text-[9px] font-mono text-[#8c744f] mt-1 not-italic">
                    — Marina Martín Prieto
                  </div>
                </div>
              </figure>
            </div>
          );
        })()}

        {/* --------------------------------------------------------- */}
        {/* LEAF 2: Clave Tonal (Front) & Estudio Secundario (Back)   */}
        {/* --------------------------------------------------------- */}
        {(() => {
          const leafIndex = 2;
          const isFlipped = leafIndex >= (totalLeaves - flippedCount);
          const zIndex = animatingLeafIndex === leafIndex 
            ? 100 
            : isFlipped ? (totalLeaves - leafIndex) : (leafIndex + 1);

          return (
            <div
              className={`book-leaf absolute top-0 right-0 w-1/2 h-full transition-transform duration-700 ease-in-out ${isFlipped ? 'flip' : ''}`}
              style={{
                transformOrigin: 'left center',
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                zIndex,
              }}
              onClick={() => {
                if (!isFlipped) turnNext();
                else turnPrev();
              }}
            >
              {/* FRONT: Page 3 Right (III. Clave Tonal & Iluminación) */}
              <figure 
                className="front absolute inset-0 m-0 w-full h-full bg-[#f8f5ee] rounded-r-xl sm:rounded-r-2xl overflow-hidden shadow-2xl p-4 sm:p-6 md:p-7 flex flex-col justify-between border-l border-[#2b2b2b]/15"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                {/* Antique Paper & Ink Stains Overlay */}
                <SketchbookTextureOverlay variant="all" seed={3} opacity={0.16} />

                <div className="relative z-10">
                  <div className="flex items-center justify-between pb-2 border-b border-[#2b2b2b]/10 text-[9px] sm:text-[10px] font-mono text-[#8c744f]">
                    <span className="font-bold uppercase tracking-wider">
                      {t("III. CLAVE TONAL & ILUMINACIÓN", "III. TONAL KEY & LIGHTING")}
                    </span>
                    <span>PÁG. 03</span>
                  </div>

                  <h3 className="font-serif italic font-bold text-sm sm:text-base md:text-lg text-[#201d18] mt-2 mb-2">
                    {t("Estudio Atmosférico", "Atmospheric Study")}
                  </h3>

                  {/* Value Steps Bar */}
                  <div className="mb-4">
                    <div className="text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-[#8c744f] mb-1">
                      {t("ESCALA DE VALORES (0-100%)", "VALUE SCALE (0-100%)")}
                    </div>
                    <div className="grid grid-cols-5 h-5 rounded-md overflow-hidden border border-[#2b2b2b]/20 shadow-xs">
                      <div className="bg-[#121212]" />
                      <div className="bg-[#383838]" />
                      <div className="bg-[#787878]" />
                      <div className="bg-[#b8b8b8]" />
                      <div className="bg-[#f0f0f0]" />
                    </div>
                  </div>

                  <p className="text-[10px] sm:text-xs font-serif italic text-[#4a4237] leading-relaxed">
                    {t(
                      "La clave tonal busca un rango dinámico donde las sombras profundas aporten tensión narrativa y la luz de recorte defina las siluetas principales.",
                      "The tonal key maintains a high dynamic range where deep shadows provide narrative tension and the rim light carves the primary silhouettes."
                    )}
                  </p>
                </div>

                <div className="p-2 sm:p-3 rounded-lg bg-[#efe9d9] border border-[#3d362e]/15 text-[9px] sm:text-[10px] font-mono text-[#4a4237] relative z-10">
                  <span className="text-vampire-red font-bold">✦ NOTA DE PALETA:</span>{' '}
                  {project.palette.map(p => t(p.nameEs, p.nameEn)).join(' · ')}
                </div>
              </figure>

              {/* BACK: Page 4 Left (IV. Estudio Secundario & Color) */}
              <figure 
                className="back absolute inset-0 m-0 w-full h-full bg-[#f8f5ee] rounded-l-xl sm:rounded-l-2xl overflow-hidden shadow-2xl p-3 sm:p-5 md:p-6 flex flex-col justify-between border-r border-[#2b2b2b]/15"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                {/* Antique Paper & Ink Stains Overlay */}
                <SketchbookTextureOverlay variant="all" seed={4} opacity={0.16} />
                <div className="flex items-center justify-between pb-1.5 border-b border-[#2b2b2b]/10 text-[9px] sm:text-[10px] font-mono text-[#8c744f]">
                  <span>PÁG. 04</span>
                  <span className="font-bold tracking-wider uppercase">
                    {t("IV. ESTUDIO SECUNDARIO & COLOR", "IV. SECONDARY STUDY & COLOR")}
                  </span>
                </div>

                {/* Secondary Image Plate */}
                <div className="relative my-auto flex-1 max-h-[70%] rounded-lg overflow-hidden bg-black/90 border border-[#2b2b2b]/20 shadow-md">
                  <img 
                    src={secondaryImage} 
                    alt={t(project.processImages[1]?.labelEs || "Estudio", project.processImages[1]?.labelEn || "Study")}
                    className="w-full h-full object-cover"
                  />
                  {/* Clean Fullscreen Expand Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenZoom(secondaryImage);
                    }}
                    className="no-flip absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 hover:bg-vampire-red text-white text-[9px] font-mono flex items-center gap-1 transition-all shadow-md border border-white/10 cursor-pointer"
                    title={t("Ver lámina en pantalla completa", "View full resolution plate")}
                  >
                    <Maximize2 size={11} />
                    <span>HD</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-[#2b2b2b]/10 flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-[#5c5346]">
                  <span>{t(project.processImages[1]?.labelEs || "Acabado preliminar", project.processImages[1]?.labelEn || "Preliminary finish")}</span>
                  <span className="text-[#8c744f]">PLATE 02 · MMP</span>
                </div>
              </figure>
            </div>
          );
        })()}

        {/* --------------------------------------------------------- */}
        {/* LEAF 3: Ficha Técnica & Bocetos                            */}
        {/* --------------------------------------------------------- */}
        {(() => {
          const leafIndex = 3;
          const isFlipped = leafIndex >= (totalLeaves - flippedCount);
          const zIndex = animatingLeafIndex === leafIndex 
            ? 100 
            : isFlipped ? (totalLeaves - leafIndex) : (leafIndex + 1);

          return (
            <div
              className={`book-leaf absolute top-0 right-0 w-1/2 h-full transition-transform duration-700 ease-in-out ${isFlipped ? 'flip' : ''}`}
              style={{
                transformOrigin: 'left center',
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                zIndex,
              }}
              onClick={() => {
                if (!isFlipped) turnNext();
                else turnPrev();
              }}
            >
              {/* FRONT: Page 1 Right (Ficha Técnica & Memoria de Proyecto) */}
              <figure 
                className="front absolute inset-0 m-0 w-full h-full bg-[#f8f5ee] rounded-r-xl sm:rounded-r-2xl overflow-hidden shadow-2xl p-4 sm:p-6 md:p-7 flex flex-col justify-between border-l border-[#2b2b2b]/15"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                {/* Antique Paper & Ink Stains Overlay */}
                <SketchbookTextureOverlay variant="all" seed={1} opacity={0.16} />

                <div className="relative z-10">
                  <div className="flex items-center justify-between pb-2 border-b border-[#2b2b2b]/10 text-[9px] sm:text-[10px] font-mono text-[#8c744f]">
                    <span className="font-bold uppercase tracking-wider">
                      {t("I. DOSSIER CONCEPTUAL", "I. CONCEPT DOSSIER")}
                    </span>
                    <span>EXP. {project.sketchbookVol}</span>
                  </div>

                  <h3 className="font-serif italic font-bold text-sm sm:text-base md:text-xl text-[#201d18] mt-2 mb-1">
                    {t(project.titleEs, project.titleEn)}
                  </h3>

                  <p className="text-[10px] sm:text-xs font-serif italic text-[#4a4237] leading-relaxed mb-3">
                    {t(project.descriptionEs, project.descriptionEn)}
                  </p>

                  {/* Pigment Palette Chips */}
                  <div className="mb-3">
                    <div className="text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-[#8c744f] mb-1.5 flex items-center justify-between">
                      <span>{t("PALETA DE PIGMENTOS", "PIGMENT PALETTE")}</span>
                      {copiedHex && <span className="text-vampire-red">✓ {copiedHex}</span>}
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {project.palette.map((color, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyHex(color.hex);
                          }}
                          className="no-flip group/chip p-1 rounded-md bg-[#efe9d9] border border-[#3d362e]/15 hover:border-vampire-red transition-all text-center cursor-pointer"
                          title={`${t(color.nameEs, color.nameEn)} (${color.hex})`}
                        >
                          <div 
                            className="w-full h-4 sm:h-5 rounded-xs shadow-xs mb-1 group-hover/chip:scale-105 transition-transform"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-[8px] font-mono text-[#5c5346] truncate block">
                            {color.hex}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Artist Notes */}
                <div className="pt-2 border-t border-[#2b2b2b]/10 relative z-10">
                  <div className="text-[8px] sm:text-[9px] font-mono text-[#8c744f] uppercase mb-0.5">
                    {t("NOTAS DE LA ARTISTA", "ARTIST NOTES")}
                  </div>
                  <p className="text-[10px] sm:text-xs font-serif italic text-[#332e26] line-clamp-2">
                    {t(project.notesEs, project.notesEn)}
                  </p>
                  <div className="text-right text-[8px] sm:text-[9px] font-mono text-[#8c744f] mt-1">
                    PÁG. 01
                  </div>
                </div>
              </figure>

              {/* BACK: Page 2 Left (Bocetos & Línea) */}
              <figure 
                className="back absolute inset-0 m-0 w-full h-full bg-[#f8f5ee] rounded-l-xl sm:rounded-l-2xl overflow-hidden shadow-2xl p-3 sm:p-5 md:p-6 flex flex-col justify-between border-r border-[#2b2b2b]/15"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                {/* Antique Paper & Ink Stains Overlay */}
                <SketchbookTextureOverlay variant="all" seed={2} opacity={0.16} />
                <div className="flex items-center justify-between pb-1.5 border-b border-[#2b2b2b]/10 text-[9px] sm:text-[10px] font-mono text-[#8c744f]">
                  <span>PÁG. 02</span>
                  <span className="font-bold uppercase tracking-wider">
                    {t("II. BOCETOS & LÍNEA", "II. SKETCHES & LINE")}
                  </span>
                </div>

                {/* Sketch Plate with Interactive Hotspots */}
                <div className="relative my-auto flex-1 max-h-[72%] rounded-lg overflow-hidden bg-black/90 border border-[#2b2b2b]/20 shadow-md">
                  <img 
                    src={sketchImage} 
                    alt={t(project.processImages[0]?.labelEs || "Boceto", project.processImages[0]?.labelEn || "Sketch")}
                    className="w-full h-full object-cover"
                  />

                  {/* Hotspots */}
                  {sketchHotspots.map((hs, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveHotspot(hs);
                      }}
                      className="no-flip absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-400 bg-black/80 text-amber-300 flex items-center justify-center text-[10px] font-bold shadow-lg hover:scale-125 transition-transform cursor-pointer"
                      style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                      title={t(hs.titleEs, hs.titleEn)}
                    >
                      ✦
                    </button>
                  ))}

                  {/* Clean Fullscreen Expand Button (NO lupa icon!) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenZoom(sketchImage);
                    }}
                    className="no-flip absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 hover:bg-vampire-red text-white text-[9px] font-mono flex items-center gap-1 transition-all shadow-md border border-white/10 cursor-pointer"
                    title={t("Ver lámina en pantalla completa", "View full resolution plate")}
                  >
                    <Maximize2 size={11} />
                    <span>HD</span>
                  </button>
                </div>

                {/* Hotspot Drawer / Caption */}
                {activeHotspot ? (
                  <div className="p-2 rounded-lg bg-black/90 text-white text-[9px] sm:text-[10px] border border-amber-400/40 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-amber-400 font-bold mb-0.5">
                      <span>✦ {t(activeHotspot.titleEs, activeHotspot.titleEn)}</span>
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); setActiveHotspot(null); }}
                        className="text-white/60 hover:text-white px-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="font-serif italic text-white/90">
                      {t(activeHotspot.descriptionEs, activeHotspot.descriptionEn)}
                    </p>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-[#2b2b2b]/10 flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-[#5c5346]">
                    <span>{t(project.processImages[0]?.labelEs || "Boceto y Composición", project.processImages[0]?.labelEn || "Sketch & Composition")}</span>
                    <span className="text-[#8c744f]">{sketchHotspots.length} {t("Anotaciones", "Notes")}</span>
                  </div>
                )}
              </figure>
            </div>
          );
        })()}

        {/* --------------------------------------------------------- */}
        {/* LEAF 4 (Top leaf: FRONT COVER & Inside Front Cover)       */}
        {/* --------------------------------------------------------- */}
        {(() => {
          const leafIndex = 4;
          const isFlipped = leafIndex >= (totalLeaves - flippedCount);
          const zIndex = animatingLeafIndex === leafIndex 
            ? 100 
            : isFlipped ? (totalLeaves - leafIndex) : (leafIndex + 1);

          return (
            <div
              className={`book-leaf absolute top-0 right-0 w-1/2 h-full transition-transform duration-700 ease-in-out ${isFlipped ? 'flip' : ''}`}
              style={{
                transformOrigin: 'left center',
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                zIndex,
              }}
              onClick={() => {
                if (!isFlipped) turnNext();
                else turnPrev();
              }}
            >
              {/* FRONT: THE FRONT COVER (#cover)                           */}
              {/* Matches SketchbookCoverCard with 100% aesthetic precision */}
              <figure 
                id="cover"
                className="front absolute inset-0 m-0 w-full h-full rounded-r-xl sm:rounded-r-2xl overflow-hidden shadow-2xl p-4 sm:p-6 md:p-7 flex flex-col justify-between border border-white/20 select-none cursor-pointer"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  backgroundColor: project.coverColor,
                  backgroundImage: `
                    radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.08) 0%, transparent 70%),
                    linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.72) 100%)
                  `
                }}
              >
                {/* Antique Paper Overlay on Cover */}
                <SketchbookTextureOverlay variant="paper" seed={9} opacity={0.12} />
                {/* Organic Leather Texture */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseCover'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseCover)'/%3E%3C/svg%3E")`
                  }}
                />

                {/* Left Spine Strip */}
                <div 
                  className="absolute top-0 bottom-0 left-0 w-7 sm:w-9 md:w-10 z-20 flex flex-col justify-center items-center border-r border-black/50 shadow-[2px_0_10px_rgba(0,0,0,0.5)]"
                  style={{ 
                    backgroundColor: project.spineColor,
                    backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.6), rgba(255,255,255,0.1) 50%, rgba(0,0,0,0.5))' 
                  }}
                >
                  <div className="transform -rotate-90 whitespace-nowrap text-[8px] sm:text-[9px] uppercase tracking-[0.25em] text-white/50 font-serif font-bold pointer-events-none">
                    <span>{project.sketchbookVol}</span>
                  </div>
                </div>

                {/* Spine Hinge Groove */}
                <div className="absolute top-0 bottom-0 left-[30px] sm:left-[38px] md:left-[42px] w-[2px] bg-black/60 border-r border-white/10 pointer-events-none z-20 shadow-inner" />

                {/* Cover Header Details */}
                <div className="relative z-10 pl-9 sm:pl-12 pr-2 sm:pr-4 pt-1 sm:pt-2 flex items-center justify-between text-[9px] sm:text-[10px] font-mono tracking-widest text-white/70">
                  <span className="uppercase font-semibold tracking-[0.2em]">{project.sketchbookVol}</span>
                  <span className="font-semibold text-white/50">{project.year}</span>
                </div>

                {/* Prominent Center Artwork Plate */}
                <div className="relative z-10 pl-9 sm:pl-12 pr-2 sm:pr-4 my-auto py-1">
                  <div className="relative p-1 rounded-xl bg-black/70 border border-white/20 shadow-2xl transition-all duration-300">
                    <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-black/90">
                      <img 
                        src={project.imageUrl} 
                        alt={project.titleEs} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Cover Footer & Artist Signature */}
                <div className="relative z-10 pl-9 sm:pl-12 pr-2 sm:pr-4 pb-1 sm:pb-2">
                  <div className="text-[8px] sm:text-[9px] font-mono tracking-[0.2em] uppercase text-vampire-red font-bold mb-1 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-vampire-red" />
                    <span>{t(project.categoryEs, project.categoryEn)}</span>
                  </div>
                  <h3 className="font-serif italic font-bold text-sm sm:text-lg md:text-xl text-bone leading-tight drop-shadow-sm mb-1.5">
                    {t(project.titleEs, project.titleEn)}
                  </h3>
                  <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-white/60">
                    <span className="tracking-wider">MARINA MARTÍN PRIETO</span>
                    <span className="text-vampire-red font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      {t("ABRIR", "OPEN")} ➔
                    </span>
                  </div>
                </div>
              </figure>

              {/* BACK: Page 00 Left (Estudio Preliminar & Guarda de Bocetos) */}
              <figure 
                className="back absolute inset-0 m-0 w-full h-full bg-[#fdfbf7] rounded-l-xl sm:rounded-l-2xl overflow-hidden shadow-2xl p-3 sm:p-5 md:p-6 flex flex-col justify-between border-r border-[#2b2b2b]/15"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                {/* Antique Paper & Ink Stains Overlay */}
                <SketchbookTextureOverlay variant="all" seed={8} opacity={0.16} />
                <div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#2b2b2b]/10 text-[9px] sm:text-[10px] font-mono text-[#8c744f]">
                    <span className="font-bold uppercase tracking-wider">
                      {t("ESTUDIO PRELIMINAR", "PRELIMINARY STUDY")}
                    </span>
                    <span>PÁG. 00 · {project.sketchbookVol}</span>
                  </div>

                  {/* Title & Concept Header */}
                  <div className="mt-2 mb-1.5">
                    <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-[0.2em] text-[#8c744f]">
                      {t("NOTAS DE TALLER & BOCETO INICIAL", "STUDIO NOTES & INITIAL SKETCH")}
                    </span>
                    <h4 className="font-serif italic font-bold text-sm sm:text-base text-[#201d18]">
                      {t("Génesis y Composición", "Genesis & Composition")}
                    </h4>
                  </div>

                  {/* Artwork Sketch Vignette */}
                  <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border border-[#2b2b2b]/20 shadow-sm bg-[#ece5d5]/80 my-1">
                    <img 
                      src={project.sketchbookArtworks?.[0]?.url || project.imageUrl} 
                      alt={project.titleEs} 
                      className="w-full h-full object-cover filter contrast-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute bottom-1 right-2 text-[7px] sm:text-[8px] font-mono text-white/90">
                      REF. SK-001
                    </span>
                  </div>
                </div>

                {/* Handwritten Artist Notes & Ex-Libris Seal */}
                <div className="my-auto py-1">
                  <p className="font-serif italic text-[9.5px] sm:text-[10.5px] text-[#4a4237] leading-relaxed">
                    {t(
                      "«Primeras anotaciones de atmósfera, valores tonales y estructura geométrica preliminar.»",
                      "«Initial notes on atmosphere, tonal values, and preliminary geometric structure.»"
                    )}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#2b2b2b]/10 flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-[#5c5346]">
                  <div>
                    <span className="text-[#8c744f] uppercase">{t("ARCHIVO", "ARCHIVE")}:</span> {project.year} · MMP
                  </div>
                  <div className="text-[#8c744f] uppercase tracking-wider">
                    ✦ {t("CUADERNO ORIGINAL", "ORIGINAL SKETCHBOOK")}
                  </div>
                </div>
              </figure>
            </div>
          );
        })()}
      </div>

      {/* Touch & Swipe Helper Hint on Mobile */}
      {isMobile && (
        <div className="mt-3 flex items-center gap-3 text-[11px] font-mono text-white/50">
          <button 
            type="button" 
            onClick={turnPrev} 
            disabled={flippedCount <= 0}
            className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-20 flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft size={14} /> {t("Ant.", "Prev")}
          </button>
          <span>{flippedCount === 0 ? t("PORTADA", "COVER") : flippedCount === 5 ? t("FINAL", "END") : `${flippedCount} / 4`}</span>
          <button 
            type="button" 
            onClick={turnNext} 
            disabled={flippedCount >= totalLeaves}
            className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-20 flex items-center gap-1 cursor-pointer"
          >
            {t("Sig.", "Next")} <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PageFlipBook;
