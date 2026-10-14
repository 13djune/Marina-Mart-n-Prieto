import React, { memo, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate, PanInfo } from 'motion/react';

export interface PageFlipLeaf {
  id?: string;
  front: string;
  back: string;
  frontAlt?: string;
  backAlt?: string;
  frontContent?: React.ReactNode;
  backContent?: React.ReactNode;
}

export type PageFlipEase = 'easeInOut' | 'easeOut' | 'circOut' | 'backOut';

const EASE_CURVES: Record<PageFlipEase, [number, number, number, number]> = {
  easeInOut: [0.65, 0, 0.35, 1],
  easeOut: [0.16, 1, 0.3, 1],
  circOut: [0, 0.55, 0.45, 1],
  backOut: [0.34, 1.56, 0.64, 1],
};

const DEFAULT_PAGES: PageFlipLeaf[] = [
  {
    id: 'atrium',
    front: 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?q=80&w=700&auto=format&fit=crop',
    back: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=700&auto=format&fit=crop',
    frontAlt: 'Glass atrium seen from below',
    backAlt: 'Corporate tower against an open sky',
  },
  {
    id: 'vault',
    front: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=700&auto=format&fit=crop',
    back: 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?q=80&w=700&auto=format&fit=crop',
    frontAlt: 'White concrete facade in daylight',
    backAlt: 'Repeating window lattice on a high rise',
  },
  {
    id: 'terrace',
    front: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=700&auto=format&fit=crop',
    back: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=700&auto=format&fit=crop',
    frontAlt: 'Terraced building stepping into the sky',
    backAlt: 'Row of arches along a shaded walkway',
  },
  {
    id: 'canopy',
    front: 'https://images.unsplash.com/photo-1470075801209-17f9ec0cada6?q=80&w=700&auto=format&fit=crop',
    back: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?q=80&w=700&auto=format&fit=crop',
    frontAlt: 'Steel canopy over a public square',
    backAlt: 'Concrete stairwell curving upward',
  },
  {
    id: 'ridge',
    front: 'https://images.unsplash.com/photo-1470723710355-95304d8aece4?q=80&w=700&auto=format&fit=crop',
    back: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=700&auto=format&fit=crop',
    frontAlt: 'Roofline ridge cutting across the skyline',
    backAlt: 'Modern house framed by clean geometry',
  },
];

interface PageLeafProps {
  index: number;
  total: number;
  front: string;
  back: string;
  frontAlt?: string;
  backAlt?: string;
  frontContent?: React.ReactNode;
  backContent?: React.ReactNode;
  turned: boolean;
  peek: boolean;
  delay: number;
  width: number;
  height: number;
  radius: number;
  paper: string;
  turnAngle: number;
  peekAngle: number;
  duration: number;
  curve: [number, number, number, number];
  shadow: number;
  interactive: boolean;
  onSelect: (index: number) => void;
  onReach: (index: number) => void;
  onRelease: () => void;
  onDragFlip?: (index: number, turnForward: boolean) => void;
}

const PageLeaf = memo(function PageLeaf({
  index,
  total,
  front,
  back,
  frontAlt = '',
  backAlt = '',
  frontContent,
  backContent,
  turned,
  peek,
  delay,
  width,
  height,
  radius,
  paper,
  turnAngle,
  peekAngle,
  duration,
  curve,
  shadow,
  interactive,
  onSelect,
  onReach,
  onRelease,
  onDragFlip,
}: PageLeafProps) {
  const rotateY = useMotionValue(turned ? -turnAngle : 0);
  const isDraggingRef = useRef(false);
  const dragStartAngleRef = useRef(0);
  const dragStartXRef = useRef(0);
  const hasDraggedFarRef = useRef(false);

  // Dynamic z-index layering so turned leaves stack naturally over prior leaves
  const zIndex = useTransform(rotateY, (val) => {
    return val < -turnAngle / 2 ? total + index + 1 : total - index;
  });

  // Keep motion value in sync with state when not being actively dragged
  useEffect(() => {
    if (isDraggingRef.current) return;
    const targetAngle = turned ? -turnAngle : peek ? -peekAngle : 0;
    const controls = animate(rotateY, targetAngle, {
      duration,
      delay,
      ease: curve,
    });
    return () => controls.stop();
  }, [turned, peek, turnAngle, peekAngle, duration, delay, curve, rotateY]);

  const handlePanStart = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!interactive) return;
    isDraggingRef.current = true;
    dragStartAngleRef.current = rotateY.get();
    dragStartXRef.current = info.point.x;
    hasDraggedFarRef.current = false;
  };

  const handlePan = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!interactive || !isDraggingRef.current) return;
    const deltaX = info.point.x - dragStartXRef.current;
    if (Math.abs(deltaX) > 6) {
      hasDraggedFarRef.current = true;
    }

    // Convert pixel delta to angle
    const angleDelta = (deltaX / width) * turnAngle;
    const nextAngle = Math.max(-turnAngle, Math.min(0, dragStartAngleRef.current + angleDelta));
    rotateY.set(nextAngle);
  };

  const handlePanEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!interactive) return;
    isDraggingRef.current = false;

    const currentAngle = rotateY.get();
    const velocityX = info.velocity.x;

    if (!hasDraggedFarRef.current) {
      // It was a tap / click
      onSelect(index);
      return;
    }

    // Determine completion based on drag progress and velocity
    if (!turned) {
      // Dragging from right to left (turning forward)
      const shouldTurn = currentAngle < -turnAngle * 0.35 || velocityX < -250;
      if (shouldTurn) {
        animate(rotateY, -turnAngle, { duration: duration * 0.7, ease: 'easeOut' });
        onDragFlip?.(index, true);
      } else {
        animate(rotateY, 0, { duration: duration * 0.7, ease: 'easeOut' });
      }
    } else {
      // Dragging from left to right (turning backward)
      const shouldUnturn = currentAngle > -turnAngle * 0.65 || velocityX > 250;
      if (shouldUnturn) {
        animate(rotateY, 0, { duration: duration * 0.7, ease: 'easeOut' });
        onDragFlip?.(index, false);
      } else {
        animate(rotateY, -turnAngle, { duration: duration * 0.7, ease: 'easeOut' });
      }
    }
  };

  const computedBoxShadow = useMemo(() => {
    if (shadow <= 0) return 'none';
    const ox = Math.round(4 * shadow);
    const oy = Math.round(6 * shadow);
    const blur = Math.round(34 * shadow);
    const alpha = Math.min(0.75 * shadow, 1);
    return `${ox}px ${oy}px ${blur}px rgba(0, 0, 0, ${alpha})`;
  }, [shadow]);

  return (
    <motion.div
      className="absolute top-0 select-none will-change-transform"
      style={{
        width,
        height,
        left: 0,
        rotateY,
        zIndex,
        transformOrigin: 'left center',
        transformStyle: 'preserve-3d',
        borderRadius: radius,
        cursor: interactive ? 'grab' : 'default',
        boxShadow: computedBoxShadow,
        touchAction: 'none',
      }}
      whileTap={{ cursor: interactive ? 'grabbing' : 'default' }}
      onPanStart={handlePanStart}
      onPan={handlePan}
      onPanEnd={handlePanEnd}
      onPointerEnter={() => onReach(index)}
      onPointerLeave={onRelease}
      onClick={(e) => {
        e.stopPropagation();
        if (!hasDraggedFarRef.current) {
          onSelect(index);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(index);
        }
      }}
      role={interactive ? 'button' : undefined}
      aria-pressed={interactive ? turned : undefined}
      tabIndex={interactive ? 0 : -1}
    >
      {/* FRONT OF LEAF */}
      <div
        className="absolute inset-0 h-full w-full overflow-hidden"
        style={{
          background: paper,
          borderRadius: radius,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        {frontContent ? (
          frontContent
        ) : (
          <img
            src={front}
            alt={frontAlt}
            draggable={false}
            className="h-full w-full object-cover pointer-events-none"
            style={{ background: paper, borderRadius: radius }}
          />
        )}
        {/* Subtle paper specular spine sheen */}
        <div 
          className="absolute inset-y-0 left-0 w-8 pointer-events-none opacity-30" 
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.2), transparent)' }} 
        />
      </div>

      {/* BACK OF LEAF (turned) */}
      <div
        className="absolute inset-0 h-full w-full overflow-hidden"
        style={{
          background: paper,
          borderRadius: radius,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg) translateZ(1px)',
        }}
      >
        {backContent ? (
          backContent
        ) : (
          <img
            src={back}
            alt={backAlt}
            draggable={false}
            className="h-full w-full object-cover pointer-events-none"
            style={{ background: paper, borderRadius: radius }}
          />
        )}
        {/* Spine shadow on the back face */}
        <div 
          className="absolute inset-y-0 right-0 w-8 pointer-events-none opacity-30" 
          style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.2), transparent)' }} 
        />
      </div>
    </motion.div>
  );
});

export interface PageFlipProps {
  pages?: PageFlipLeaf[];
  pageWidth?: number;
  pageHeight?: number;
  pageRadius?: number;
  pageColor?: string;
  perspective?: number;
  spineShift?: number;
  turnAngle?: number;
  peekAngle?: number;
  duration?: number;
  stagger?: number;
  ease?: PageFlipEase;
  shadow?: number;
  trigger?: 'click' | 'hover';
  closeOnLeave?: boolean;
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onTurnSound?: () => void;
}

export const PageFlip: React.FC<PageFlipProps> = ({
  pages = DEFAULT_PAGES,
  pageWidth = 220,
  pageHeight = 320,
  pageRadius = 4,
  pageColor = '#f4f4f4',
  perspective = 1200,
  spineShift = 110,
  turnAngle = 180,
  peekAngle = 10,
  duration = 0.55,
  stagger = 0.08,
  ease = 'easeInOut',
  shadow = 0.3,
  trigger = 'click',
  closeOnLeave = false,
  interactive = true,
  className,
  style,
  currentPage,
  onPageChange,
  onTurnSound,
}) => {
  const leaves = pages.length > 0 ? pages : DEFAULT_PAGES;
  const totalLeaves = leaves.length;

  const [internalTurnedCount, setInternalTurnedCount] = useState(currentPage ?? 0);
  const [hoveredIdx, setHoveredIdx] = useState(-1);
  const [isResetting, setIsResetting] = useState(false);

  // Synchronize controlled vs uncontrolled current page
  const turnedCount = currentPage !== undefined ? currentPage : internalTurnedCount;

  const curve = useMemo(() => EASE_CURVES[ease] ?? EASE_CURVES.easeInOut, [ease]);

  const updateTurnedCount = useCallback((newCount: number) => {
    if (newCount !== turnedCount) {
      onTurnSound?.();
    }
    setInternalTurnedCount(newCount);
    onPageChange?.(newCount);
  }, [turnedCount, onPageChange, onTurnSound]);

  const handleSelect = useCallback(
    (index: number) => {
      if (!interactive) return;
      setIsResetting(false);
      // If clicking a leaf that's already turned, flip back to this index.
      // If clicking an unturned leaf, flip it and make it turned (index + 1).
      const nextTurned = index < turnedCount ? index : index + 1;
      updateTurnedCount(nextTurned);
    },
    [interactive, turnedCount, updateTurnedCount],
  );

  const handleDragFlip = useCallback(
    (index: number, turnForward: boolean) => {
      if (!interactive) return;
      setIsResetting(false);
      const nextTurned = turnForward ? index + 1 : index;
      updateTurnedCount(nextTurned);
    },
    [interactive, updateTurnedCount],
  );

  const handleReach = useCallback(
    (index: number) => {
      if (!interactive) return;
      setHoveredIdx(index);
      if (trigger === 'hover') {
        setIsResetting(false);
        updateTurnedCount(index + 1);
      }
    },
    [interactive, trigger, updateTurnedCount],
  );

  const handleRelease = useCallback(() => {
    setHoveredIdx(-1);
  }, []);

  const handleCloseAll = useCallback(() => {
    setIsResetting(true);
    updateTurnedCount(0);
  }, [updateTurnedCount]);

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center select-none ${className || ''}`}
      style={{ perspective: `${perspective}px`, ...style }}
      onClick={handleCloseAll}
      onPointerLeave={() => {
        setHoveredIdx(-1);
        if (closeOnLeave) {
          handleCloseAll();
        }
      }}
    >
      <motion.div
        className="relative"
        style={{
          width: pageWidth,
          height: pageHeight,
          perspective: `${perspective}px`,
          transformStyle: 'preserve-3d',
        }}
        animate={{ x: turnedCount > 0 ? spineShift : 0 }}
        transition={{ duration: Math.max(0.8 * duration, 0.1), ease: 'easeOut' }}
      >
        {leaves.map((leaf, idx) => {
          const isTurned = idx < turnedCount;
          const isPeeking = interactive && !isTurned && hoveredIdx === idx && idx === turnedCount;
          const delay = isResetting && !isTurned ? (totalLeaves - 1 - idx) * stagger : 0;

          return (
            <PageLeaf
              key={leaf.id ?? `${leaf.front}-${idx}`}
              index={idx}
              total={totalLeaves}
              front={leaf.front}
              back={leaf.back}
              frontAlt={leaf.frontAlt}
              backAlt={leaf.backAlt}
              frontContent={leaf.frontContent}
              backContent={leaf.backContent}
              turned={isTurned}
              peek={isPeeking}
              delay={delay}
              width={pageWidth}
              height={pageHeight}
              radius={pageRadius}
              paper={pageColor}
              turnAngle={turnAngle}
              peekAngle={peekAngle}
              duration={duration}
              curve={curve}
              shadow={shadow}
              interactive={interactive}
              onSelect={handleSelect}
              onReach={handleReach}
              onRelease={handleRelease}
              onDragFlip={handleDragFlip}
            />
          );
        })}
      </motion.div>
    </div>
  );
};

export default PageFlip;
