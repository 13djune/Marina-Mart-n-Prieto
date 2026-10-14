import React, { useState, useEffect, useRef } from 'react';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';

interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  widthParam?: number;
  qualityParam?: number;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  rootMargin?: string;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  widthParam = 1000,
  qualityParam = 80,
  className = '',
  containerClassName = '',
  priority = false,
  rootMargin = '250px 0px 250px 0px',
  ...props
}) => {
  const [isInView, setIsInView] = useState<boolean>(priority);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // High-performance Intersection Observer: disconnects immediately once triggered to free resources
  useEffect(() => {
    if (priority || isInView) return;

    // Feature detection for environments without IntersectionObserver
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(element);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold: 0.01,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [priority, isInView, rootMargin]);

  const optimizedSrc = getOptimizedImageUrl(src, widthParam, qualityParam);

  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden bg-neutral-950 ${containerClassName}`}
      role="region"
      aria-label={alt}
    >
      {/* Accessible Skeleton Shimmer with smooth exit transition */}
      {(!isLoaded || !isInView) && !hasError && (
        <div 
          className="absolute inset-0 bg-neutral-900/80 pointer-events-none z-0 transition-opacity duration-700 ease-out"
          aria-hidden="true"
        >
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/8 to-transparent animate-shimmer" />
        </div>
      )}

      {/* Actual Lazy-Loaded Image with de-blur and subtle scale-in transition */}
      {isInView && (
        <img
          src={optimizedSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`transform-gpu transition-all duration-700 ease-out ${
            isLoaded 
              ? 'opacity-100 scale-100 blur-0' 
              : 'opacity-0 scale-[1.04] blur-sm'
          } ${className}`}
          {...props}
        />
      )}

      {/* Accessible Error Fallback */}
      {hasError && (
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 text-bone-muted text-xs p-4 text-center font-mono"
          role="img"
          aria-label={alt}
        >
          <span className="text-vampire-red mb-1 font-bold">✕</span>
          <span className="line-clamp-2">{alt}</span>
        </div>
      )}
    </div>
  );
};

export default ProgressiveImage;
