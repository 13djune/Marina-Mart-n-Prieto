import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookOpen, Sparkles, Layers } from 'lucide-react';
import { galleryItems, Project } from '../data';
import { useLanguage } from '../LanguageContext';
import SketchbookCoverCard from './SketchbookCoverCard';
import ProjectDetail from './ProjectDetail';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Gallery() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const redLineRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });

      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }
      )
      .fromTo(
        redLineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, ease: 'power3.out' },
        '-=0.5'
      )
      .fromTo(
        descRef.current,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
        '-=0.6'
      )
      .fromTo(
        filterRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
        '-=0.4'
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const categories = useMemo(() => [
    { id: 'all', labelEs: 'Todos', labelEn: 'All' },
    { id: 'environment', labelEs: 'Entornos', labelEn: 'Environments' },
    { id: 'character', labelEs: 'Personajes', labelEn: 'Characters' },
    { id: 'props', labelEs: 'Atrezo & Props', labelEn: 'Props' },
    { id: 'keyframe', labelEs: 'Keyframe & Escenas', labelEn: 'Keyframe' },
  ], []);

  const filteredItems = useMemo(() => {
    return galleryItems.filter((item) => {
      if (activeCategory === 'all') return true;
      if (activeCategory === 'environment') {
        return item.categoryEs.toLowerCase().includes('entorno') || item.categoryEn.toLowerCase().includes('environment');
      }
      if (activeCategory === 'character') {
        return item.categoryEs.toLowerCase().includes('personaje') || item.categoryEn.toLowerCase().includes('character');
      }
      if (activeCategory === 'props') {
        return item.categoryEs.toLowerCase().includes('atrezo') || item.categoryEn.toLowerCase().includes('prop');
      }
      if (activeCategory === 'keyframe') {
        return item.categoryEs.toLowerCase().includes('ilustraci') || item.categoryEn.toLowerCase().includes('keyframe');
      }
      return true;
    });
  }, [activeCategory]);

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.96 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } 
    },
    exit: {
      opacity: 0,
      scale: 0.94,
      transition: { duration: 0.35, ease: 'easeOut' },
    },
  };

  return (
    <section 
      ref={sectionRef}
      id="portfolio" 
      className="py-20 md:py-28 px-4 sm:px-6 md:px-12 bg-vampire-bg relative z-10"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header: Galería de Proyectos */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-12 gap-6">
          <div ref={headerRef} className="will-change-transform">
            <div className="flex items-center gap-2 mb-3 text-xs font-mono uppercase tracking-[0.25em] text-vampire-red font-bold">
              <BookOpen size={14} aria-hidden="true" />
              <span>{t("ARCHIVO DE CUADERNOS & ESTUDIOS", "SKETCHBOOK ARCHIVE & STUDIES")}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black uppercase text-bone italic leading-tight">
              {t("Galería de", "Project")}<br/>
              <span className="text-vampire-red">{t("Proyectos", "Gallery")}</span>
            </h2>
            <div 
              ref={redLineRef}
              className="w-24 h-1 bg-vampire-red mt-4 origin-left will-change-transform"
            />
          </div>

          <div ref={descRef} className="max-w-md space-y-3 will-change-transform">
            <p className="text-bone-muted text-sm md:text-base font-serif italic leading-relaxed">
              {t(
                "Colección de cuadernos de bocetos encuadernados. Haz clic en cualquier portada para abrir el cuaderno interactivo en 3D y explorar su proceso de creación.",
                "Collection of bound sketchbooks. Click on any cover to open the interactive 3D book and explore its creative visual development process."
              )}
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-bone-muted/80">
              <Sparkles size={13} className="text-vampire-red" aria-hidden="true" />
              <span>
                {t("Total en archivo:", "Archive total:")} <strong className="text-bone font-bold">{galleryItems.length} {t("volúmenes", "volumes")}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs with Smooth Layout Transition Animation */}
        <div 
          ref={filterRef}
          className="mb-10 flex flex-wrap items-center gap-2 sm:gap-2.5 pb-2 border-b border-white/10 will-change-transform"
          role="tablist"
          aria-label={t("Filtro de categorías de la galería", "Gallery categories filter")}
        >
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-bone-muted mr-2 hidden sm:flex">
            <Layers size={14} className="text-vampire-red" aria-hidden="true" />
            <span>{t("Filtrar:", "Filter:")}</span>
          </div>

          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(cat.id)}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-colors duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vampire-red ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-bone-muted hover:text-bone hover:bg-white/5'
                }`}
              >
                {/* Active Pill Layout Indicator Animation */}
                {isActive && (
                  <motion.span
                    layoutId="active-gallery-pill"
                    className="absolute inset-0 rounded-full bg-vampire-red shadow-[0_0_15px_rgba(255,59,31,0.5)] z-0"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  />
                )}
                <span className="relative z-10">{t(cat.labelEs, cat.labelEn)}</span>
              </button>
            );
          })}

          <div className="ml-auto text-[11px] font-mono text-bone-muted hidden md:block">
            {t("Mostrando", "Showing")} <strong className="text-white">{filteredItems.length}</strong> / {galleryItems.length}
          </div>
        </div>

        {/* Sketchbook Covers Grid - With Animated Card Layout Transitions */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 min-h-[380px]"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                layoutId={`card-${item.id}`}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{
                  layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                  opacity: { duration: 0.35 },
                }}
              >
                <SketchbookCoverCard
                  project={item}
                  index={index}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setOriginRect(rect);
                    setSelectedProject(item);
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Full-Screen Immersive Sketchbook Studio Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetail 
            project={selectedProject}
            originRect={originRect}
            onClose={() => {
              setSelectedProject(null);
              setOriginRect(null);
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
