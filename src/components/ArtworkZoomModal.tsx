import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  X, 
  BookOpen
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

interface ArtworkZoomModalProps {
  imageUrl: string;
  titleEs: string;
  titleEn: string;
  sketchbookVol?: string;
  year?: number;
  accentColor?: string;
  onClose: () => void;
}

export const ArtworkZoomModal: React.FC<ArtworkZoomModalProps> = ({
  imageUrl,
  titleEs,
  titleEn,
  sketchbookVol,
  year,
  accentColor = '#ff3b1f',
  onClose,
}) => {
  const { t } = useLanguage();
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDraggedRef = useRef<boolean>(false);

  // Safe close that strictly stops propagation and stays in sketchbook
  const handleSafeClose = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setScale(1);
    setPosition({ x: 0, y: 0 });
    onClose();
  }, [onClose]);

  // Zoom helpers with clamping
  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(4.5, +(prev + 0.5).toFixed(1)));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(1, +(prev - 0.5).toFixed(1));
      if (next === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Keyboard navigation (+, -, 0, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        handleSafeClose();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        zoomOut();
      } else if (e.key === '0' || e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetZoom();
      }
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [handleSafeClose, zoomIn, zoomOut, resetZoom]);

  // Mouse wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.deltaY < 0) {
        setScale((prev) => Math.min(4.5, +(prev + 0.25).toFixed(2)));
      } else {
        setScale((prev) => {
          const next = Math.max(1, +(prev - 0.25).toFixed(2));
          if (next === 1) setPosition({ x: 0, y: 0 });
          return next;
        });
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  // Double click to toggle zoom (1x <-> 2.5x)
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (scale > 1.05) {
      resetZoom();
    } else {
      setScale(2.5);
    }
  };

  // Mouse drag pan when zoomed in
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    hasDraggedRef.current = true;
    const maxBound = (scale - 1) * 450;
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    setPosition({
      x: Math.max(-maxBound, Math.min(maxBound, newX)),
      y: Math.max(-maxBound, Math.min(maxBound, newY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile pinch & pan
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartScaleRef = useRef<number>(1);
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch to zoom start
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      touchStartScaleRef.current = scale;
    } else if (e.touches.length === 1 && scale > 1) {
      // Single finger drag pan start
      touchStartPosRef.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      };
      hasDraggedRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      // Pinching
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / touchStartDistRef.current;
      const newScale = Math.max(1, Math.min(4.5, +(touchStartScaleRef.current * ratio).toFixed(2)));
      setScale(newScale);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && scale > 1) {
      // Panning
      hasDraggedRef.current = true;
      const maxBound = (scale - 1) * 450;
      const newX = e.touches[0].clientX - touchStartPosRef.current.x;
      const newY = e.touches[0].clientY - touchStartPosRef.current.y;
      setPosition({
        x: Math.max(-maxBound, Math.min(maxBound, newX)),
        y: Math.max(-maxBound, Math.min(maxBound, newY)),
      });
    }
  };

  const handleTouchEnd = () => {
    touchStartDistRef.current = null;
  };

  // Backdrop click closes only if scale is 1 and user didn't drag
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasDraggedRef.current && scale === 1) {
      handleSafeClose();
    }
  };

  const zoomPercent = Math.round(scale * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[9999999] bg-black/96 backdrop-blur-3xl flex flex-col justify-between overflow-hidden select-none"
      onClick={handleBackdropClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Floating Control Bar */}
      <header 
        className="relative z-50 w-full px-4 sm:px-6 py-3 flex items-center justify-between border-b border-white/10 bg-black/70 backdrop-blur-xl shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Project title & metadata info */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-vampire-red shrink-0">
            <BookOpen size={16} style={{ color: accentColor }} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase">
              {sketchbookVol || 'ARCHIVADO'} · {year || '2024'}
            </span>
            <h3 className="text-xs sm:text-sm font-serif italic font-bold text-bone truncate max-w-[200px] sm:max-w-md">
              {t(titleEs, titleEn)}
            </h3>
          </div>
        </div>

        {/* Right: The SINGLE close button for the entire screen (Min 44x44px for WCAG AAA) */}
        <button
          type="button"
          onClick={handleSafeClose}
          className="min-h-[44px] min-w-[44px] flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full border border-white/20 bg-black/70 hover:bg-vampire-red hover:border-vampire-red text-bone hover:text-white transition-all cursor-pointer shadow-xl active:scale-95 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vampire-red focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          aria-label={t("Cerrar y volver al cuaderno", "Close and return to sketchbook")}
          title={t("Cerrar y volver al cuaderno (Esc)", "Close and return to sketchbook (Esc)")}
        >
          <X size={18} className="group-hover:rotate-90 transition-transform duration-200" aria-hidden="true" />
          <span className="text-xs font-serif font-bold tracking-wider hidden sm:inline">
            {t("VOLVER AL CUADERNO", "RETURN TO SKETCHBOOK")}
          </span>
        </button>
      </header>

      {/* Main Interactive Zoom Stage */}
      <main 
        ref={containerRef}
        className="relative flex-1 min-h-0 w-full flex items-center justify-center p-2 sm:p-6 md:p-8 overflow-hidden touch-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="relative max-w-full max-h-full flex items-center justify-center"
          onDoubleClick={handleDoubleClick}
        >
          <motion.div
            animate={{
              scale: scale,
              x: position.x,
              y: position.y,
            }}
            transition={{
              scale: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
              x: isDragging ? { duration: 0 } : { duration: 0.22 },
              y: isDragging ? { duration: 0 } : { duration: 0.22 },
            }}
            className="relative flex items-center justify-center rounded-xl overflow-hidden border border-white/15 shadow-[0_20px_70px_rgba(0,0,0,0.9)] bg-black/90 max-w-[92vw] max-h-[76vh]"
          >
            <img 
              src={getOptimizedImageUrl(imageUrl, 2400, 88)} 
              alt={`${t("Lámina ampliada:", "Enlarged artwork:")} ${t(titleEs, titleEn)}`} 
              loading="eager"
              decoding="async"
              className="w-auto h-auto max-w-full max-h-[76vh] object-contain pointer-events-none select-none"
              draggable={false}
            />
          </motion.div>
        </div>
      </main>

      {/* Bottom Floating Control Bar with Zoom Buttons & Hint */}
      <footer 
        className="relative z-50 w-full px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 bg-black/80 backdrop-blur-xl shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Interaction Hint */}
        <div className="text-xs font-mono text-bone-muted text-center sm:text-left flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-vampire-red animate-pulse" aria-hidden="true" />
          <span>
            {scale > 1
              ? t("Arrastra para mover la lámina · Rueda del ratón para zoom", "Drag to pan image · Mouse wheel to zoom")
              : t("Rueda del ratón o doble clic para ampliar · Botones de zoom abajo", "Mouse wheel or double click to zoom · Zoom controls below")
            }
          </span>
        </div>

        {/* Floating Zoom Action Toolbar (All buttons minimum 44x44px for WCAG AAA) */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#181d19]/95 border border-white/20 shadow-2xl backdrop-blur-md">
          {/* Zoom Out */}
          <button
            type="button"
            onClick={zoomOut}
            disabled={scale <= 1}
            className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vampire-red ${
              scale <= 1 
                ? 'opacity-30 border-white/5 text-white/40 cursor-not-allowed' 
                : 'border-white/20 bg-white/5 hover:bg-white/15 text-bone cursor-pointer active:scale-95'
            }`}
            title={t("Reducir zoom (-)", "Zoom out (-)")}
            aria-label={t("Reducir zoom", "Zoom out")}
          >
            <ZoomOut size={18} aria-hidden="true" />
          </button>

          {/* Current Zoom Percentage Pill */}
          <button
            type="button"
            onClick={resetZoom}
            className="px-3.5 h-11 rounded-xl border border-white/20 bg-black/70 hover:bg-white/10 text-bone text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer min-w-[76px] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vampire-red"
            title={t("Restablecer zoom al 100% (0)", "Reset zoom to 100% (0)")}
            aria-label={`${t("Nivel de zoom actual:", "Current zoom level:")} ${zoomPercent}%. ${t("Haz clic para restablecer.", "Click to reset.")}`}
          >
            {zoomPercent}%
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={zoomIn}
            disabled={scale >= 4.5}
            className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vampire-red ${
              scale >= 4.5 
                ? 'opacity-30 border-white/5 text-white/40 cursor-not-allowed' 
                : 'border-white/20 bg-white/5 hover:bg-vampire-red hover:border-vampire-red text-bone cursor-pointer active:scale-95'
            }`}
            title={t("Aumentar zoom (+)", "Zoom in (+)")}
            aria-label={t("Aumentar zoom", "Zoom in")}
          >
            <ZoomIn size={18} aria-hidden="true" />
          </button>

          {/* Reset View */}
          <button
            type="button"
            onClick={resetZoom}
            disabled={scale === 1 && position.x === 0 && position.y === 0}
            className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vampire-red ${
              scale === 1 && position.x === 0 && position.y === 0
                ? 'opacity-30 border-white/5 text-white/40 cursor-not-allowed'
                : 'border-white/20 bg-white/5 hover:bg-white/15 text-bone cursor-pointer active:scale-95'
            }`}
            title={t("Restablecer encuadre original", "Reset view")}
            aria-label={t("Restablecer encuadre original", "Reset view")}
          >
            <RotateCcw size={17} aria-hidden="true" />
          </button>
        </div>
      </footer>
    </motion.div>
  );
};

export default ArtworkZoomModal;
