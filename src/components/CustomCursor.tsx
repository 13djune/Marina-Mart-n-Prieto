import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Instant positions for primary cursor to avoid any lag
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth positions for outer decorative shape
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Only show custom cursor on devices with a mouse
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const updateMousePosition = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('cursor-pointer') ||
        target.closest('.cursor-pointer')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible, cursorX, cursorY]);

  if (!isVisible) return null;

  return (
    <>
      {/* Inner Dot */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-vampire-red pointer-events-none z-[1000000] hidden sm:block origin-center"
        style={{
          x: cursorX,
          y: cursorY,
          marginLeft: '-6px',
          marginTop: '-6px',
          rotate: 45
        }}
        animate={{
          scale: isClicking ? 0.5 : isHovering ? 2.5 : 1,
        }}
        transition={{ type: 'tween', duration: 0.15 }}
      />
      
      {/* Outer Diamond */}
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border border-white/40 pointer-events-none z-[1000000] hidden sm:block origin-center shadow-[0_0_15px_rgba(255,255,255,0.1)]"
        style={{
          x: smoothX,
          y: smoothY,
          marginLeft: '-20px',
          marginTop: '-20px',
        }}
        animate={{
          scale: isClicking ? 0.8 : isHovering ? 1.2 : 1,
          opacity: isHovering ? 0 : 1,
          rotate: isHovering ? 135 : 45,
        }}
        transition={{ type: 'tween', duration: 0.2 }}
      />
    </>
  );
}
