import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import SideRays from './SideRays';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Hero() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleLine1Ref = useRef<HTMLSpanElement>(null);
  const titleLine2Ref = useRef<HTMLSpanElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // 1. Initial Choreographed Entrance Timeline
      const introTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      introTl
        .fromTo(
          [titleLine1Ref.current, titleLine2Ref.current],
          { y: 60, opacity: 0, rotateX: 25, transformPerspective: 1000 },
          { y: 0, opacity: 1, rotateX: 0, duration: 1.2, stagger: 0.18, delay: 0.2 }
        )
        .fromTo(
          descRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9 },
          '-=0.6'
        )
        .fromTo(
          ctaRef.current,
          { y: 25, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.4)' },
          '-=0.5'
        )
        .fromTo(
          scrollIndicatorRef.current,
          { opacity: 0, y: -15 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.3'
        );

      // Continuous subtle bounce on scroll indicator
      if (scrollIndicatorRef.current) {
        gsap.to(scrollIndicatorRef.current.querySelector('.chevron-bounce'), {
          y: 7,
          repeat: -1,
          yoyo: true,
          duration: 0.9,
          ease: 'power1.inOut',
        });
      }

      // 2. ScrollTrigger Parallax on Scroll Down
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          yPercent: 40,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        });
      }

      if (scrollIndicatorRef.current) {
        gsap.to(scrollIndicatorRef.current, {
          opacity: 0,
          y: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '30% top',
            scrub: true,
          },
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
    >
      {/* Pure Atmospheric Vampire Gradient Background */}
      <div 
        className="absolute inset-0 z-0 bg-gradient-to-b from-vampire-bg via-[#161a17] to-vampire-bg"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 35%, rgba(255, 59, 31, 0.08) 0%, rgba(28, 32, 29, 0.95) 70%, #1c201d 100%)'
        }}
      />

      {/* Light Rays */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <SideRays
          speed={1.5}
          rayColor1="#ff3b1f"
          rayColor2="#801005"
          intensity={1.2}
          spread={2}
          origin="top-right"
          tilt={-10}
          saturation={1}
          blend={0.5}
          falloff={1.2}
          opacity={0.4}
        />
      </div>

      {/* Content */}
      <div 
        ref={contentRef}
        className="relative z-10 text-left px-4 max-w-7xl mx-auto w-full mt-20 will-change-transform"
      >
        <h1 className="text-7xl md:text-9xl font-black uppercase leading-[0.85] mb-6 transform-origin-left">
          <span ref={titleLine1Ref} className="inline-block will-change-transform">
            {t("Luz &", "Exotic")}
          </span>
          <br />
          <span ref={titleLine2Ref} className="text-vampire-red inline-block will-change-transform">
            {t("Color", "Decay")}
          </span>
        </h1>
        
        <p
          ref={descRef}
          className="font-sans text-sm md:text-base leading-relaxed text-bone-muted max-w-sm mb-12 font-medium will-change-transform"
        >
          {t(
            "Concept artist especializada en traducir ideas en ilustraciones llenas de vida, movimiento y color.",
            "Concept artist specializing in translating ideas into illustrations full of life, movement and color."
          )}
        </p>

        <a
          ref={ctaRef}
          href="#portfolio"
          className="inline-flex items-center gap-2 border-2 border-vampire-red text-bone px-8 py-4 uppercase tracking-[0.3em] font-sans text-xs font-bold hover:bg-vampire-red hover:text-white transition-all duration-300 rounded-sm min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white will-change-transform"
        >
          {t("Ver Galería", "View Gallery")}
        </a>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-bone will-change-transform"
        aria-hidden="true"
      >
        <span className="text-xs uppercase tracking-widest font-semibold">{t("Desplazar", "Scroll")}</span>
        <div className="chevron-bounce">
          <ChevronDown size={22} className="text-vampire-red" />
        </div>
      </div>
    </section>
  );
}
