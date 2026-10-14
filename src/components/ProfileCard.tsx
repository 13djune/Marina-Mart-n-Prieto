import React, { useState, useRef, useCallback } from 'react';

export interface ProfileCardProps {
  avatarUrl?: string;
  miniAvatarUrl?: string;
  name?: string;
  title?: string;
  handle?: string;
  status?: string;
  contactText?: string;
  showUserInfo?: boolean;
  enableTilt?: boolean;
  enableMobileTilt?: boolean;
  behindGlowEnabled?: boolean;
  behindGlowColor?: string;
  innerGradient?: string;
  className?: string;
  onContactClick?: () => void;
}

const ProfileCardComponent: React.FC<ProfileCardProps> = ({
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2864&auto=format&fit=crop',
  miniAvatarUrl,
  name = 'Marina Martín Prieto',
  title = 'Concept Artist',
  handle = 'black_umi',
  status = 'Online',
  contactText = 'Contacto',
  showUserInfo = true,
  enableTilt = true,
  behindGlowEnabled = true,
  behindGlowColor = 'rgba(255, 59, 31, 0.22)',
  innerGradient = 'linear-gradient(145deg, rgba(255, 59, 31, 0.12) 0%, rgba(20, 24, 21, 0.95) 100%)',
  className = '',
  onContactClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);
  const [glarePos, setGlarePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Smooth Native 3D Tilt calculation (Mobile & Desktop compatible)
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!enableTilt || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    // Relative offset from -1 to 1 across card width & height
    const normalizedX = (clientX - rect.left) / rect.width;
    const normalizedY = (clientY - rect.top) / rect.height;

    const clampX = Math.max(0, Math.min(1, normalizedX));
    const clampY = Math.max(0, Math.min(1, normalizedY));

    // Tilt angle max +/- 12 degrees
    const rY = (clampX - 0.5) * 22;
    const rX = -(clampY - 0.5) * 22;

    setRotateX(rX);
    setRotateY(rY);
    setGlarePos({ x: clampX * 100, y: clampY * 100 });
  }, [enableTilt]);

  const handlePointerEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
    // Smooth reset to neutral planar alignment
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50 });
  }, []);

  return (
    <div 
      className={`relative w-full max-w-[310px] sm:max-w-[360px] md:max-w-[385px] mx-auto select-none touch-manipulation ${className}`.trim()}
      style={{ perspective: '1200px' }}
    >
      {/* 1. Behind Atmospheric Studio Desk Glow (Hardcoded fixed styles, no CSS variables) */}
      {behindGlowEnabled && (
        <div
          className="absolute -inset-4 sm:-inset-6 pointer-events-none rounded-[36px] transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, ${behindGlowColor} 0%, rgba(255, 59, 31, 0.05) 45%, transparent 70%)`,
            filter: 'blur(38px)',
            opacity: isHovered ? 0.95 : 0.65,
          }}
          aria-hidden="true"
        />
      )}

      {/* 2. Main 3D Card Shell */}
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className="relative w-full aspect-[0.72] rounded-[28px] overflow-hidden border border-white/15 bg-[#0e1110] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.9),0_0_20px_rgba(255,59,31,0.15)] cursor-pointer"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1}, 1)`,
          transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Background Inner Base Gradient */}
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={{ background: innerGradient }}
        />

        {/* Artist Portrait Image with depth vignette */}
        <div className="relative w-full h-full z-[1] overflow-hidden">
          <img
            src={avatarUrl}
            alt={name || 'Marina Martín Prieto'}
            loading="lazy"
            className="w-full h-full object-cover object-center filter contrast-[1.04] brightness-95 transform transition-transform duration-700 ease-out"
            style={{
              transform: isHovered ? 'scale(1.04)' : 'scale(1)',
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.opacity = '0.7';
            }}
          />

          {/* Bottom Dark Gradient Shadow for text readability */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(10, 12, 11, 0.95) 0%, rgba(10, 12, 11, 0.4) 38%, transparent 70%)',
            }}
          />
        </div>

        {/* 3. Dynamic Holographic Rainbow Sheen Sweep (Hardcoded fixed CSS values) */}
        <div
          className="absolute inset-0 pointer-events-none z-[2] mix-blend-color-dodge transition-opacity duration-500"
          style={{
            background: `linear-gradient(${115 + rotateY * 1.5}deg, transparent 20%, rgba(255, 110, 88, 0.12) 36%, rgba(255, 59, 31, 0.18) 46%, rgba(96, 165, 250, 0.14) 56%, rgba(168, 85, 247, 0.12) 66%, transparent 82%)`,
            opacity: isHovered ? 0.85 : 0.35,
          }}
          aria-hidden="true"
        />

        {/* 4. Smooth Radial Glare Highlight */}
        <div
          className="absolute inset-0 pointer-events-none z-[3] mix-blend-overlay transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.08) 35%, transparent 65%)`,
            opacity: isHovered ? 0.8 : 0.25,
          }}
          aria-hidden="true"
        />

        {/* 5. Metallic Foil Border Edge Highlight */}
        <div
          className="absolute inset-0 rounded-[28px] pointer-events-none z-[4] border border-white/20"
          style={{
            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), inset 0 -1px 1px rgba(0, 0, 0, 0.6)',
          }}
          aria-hidden="true"
        />

        {/* 6. Floating Frosted Glass User Info Pill (Strictly Mobile-First, Accessible) */}
        {showUserInfo && (
          <div
            className="absolute left-3 right-3 bottom-3 sm:left-4 sm:right-4 sm:bottom-4 z-[10] flex items-center justify-between rounded-[20px] px-3 sm:px-4 py-2.5 sm:py-3 border border-white/20 backdrop-blur-xl bg-[#121614]/85 shadow-[0_8px_30px_rgba(0,0,0,0.7)]"
            style={{
              transform: 'translateZ(25px)',
            }}
          >
            {/* User Details */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-white/30 shrink-0">
                <img
                  src={miniAvatarUrl || avatarUrl}
                  alt={name || 'User'}
                  className="w-full h-full object-cover rounded-full"
                />
                {/* Glowing Online Status Indicator */}
                <div 
                  className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22c55e] border-2 border-[#121614] shadow-[0_0_8px_#22c55e]"
                  title={status}
                  aria-hidden="true"
                />
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-white text-xs sm:text-sm font-sans font-bold truncate leading-tight">
                  @{handle}
                </span>
                <span className="text-[#4ade80] text-[10px] sm:text-[11px] font-sans font-medium flex items-center gap-1 leading-tight mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse inline-block" />
                  <span className="truncate">{status}</span>
                </span>
              </div>
            </div>

            {/* Contact Action Button - Min 44x44px Touch Target for WCAG AAA */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onContactClick?.();
              }}
              className="min-h-[44px] min-w-[44px] px-3 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-mono uppercase tracking-wider font-bold text-white bg-vampire-red/25 hover:bg-vampire-red border border-vampire-red/60 hover:border-vampire-red transition-all duration-300 cursor-pointer shadow-md hover:shadow-[0_0_15px_rgba(255,59,31,0.6)] hover:scale-105 active:scale-95 shrink-0 ml-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label={`${contactText}: Marina Martín Prieto`}
            >
              {contactText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const ProfileCard = React.memo(ProfileCardComponent);
export default ProfileCard;
