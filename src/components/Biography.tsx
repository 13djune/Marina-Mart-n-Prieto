import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../LanguageContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Download, FileText, ArrowDown, Briefcase, GraduationCap, Trophy } from 'lucide-react';
import ProfileCard from './ProfileCard';
import { downloadCV, downloadPortfolio } from '../utils/downloadHelpers';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Biography() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const profileCardRef = useRef<HTMLDivElement>(null);
  const bioContentRef = useRef<HTMLDivElement>(null);
  const chartWrapperRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);

  const skillsData = [
    { subject: 'Photoshop', A: 95, fullMark: 100 },
    { subject: 'ZBrush', A: 70, fullMark: 100 },
    { subject: 'Blender', A: 75, fullMark: 100 },
    { subject: 'Clip Studio', A: 90, fullMark: 100 },
    { subject: 'Unreal', A: 60, fullMark: 100 },
    { subject: 'Procreate', A: 95, fullMark: 100 },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // 1. Top Section Intro: Profile Card & Bio Content
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      tl.fromTo(
        profileCardRef.current,
        { x: -50, opacity: 0, rotateY: 10, transformPerspective: 1000 },
        { x: 0, opacity: 1, rotateY: 0, duration: 1.1, ease: 'power3.out' }
      )
      .fromTo(
        bioContentRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out' },
        '-=0.7'
      )
      .fromTo(
        chartWrapperRef.current,
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.4)' },
        '-=0.4'
      );

      // 2. Resume / Experience Columns Stagger
      if (columnsRef.current) {
        gsap.fromTo(
          columnsRef.current.children,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            stagger: 0.18,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: columnsRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="about" 
      className="py-24 px-6 md:px-12 bg-vampire-bg relative z-10 border-t border-white/5"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24 mb-24">
          
          {/* Image Side */}
          <div 
            ref={profileCardRef}
            className="w-full md:w-5/12 relative will-change-transform"
          >
            <div className="w-full flex justify-center">
              <ProfileCard
                name=""
                title=""
                handle="black_umi"
                status={t("Disponible para trabajo", "Available for work")}
                contactText={t("Contacto", "Contact")}
                avatarUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2864&auto=format&fit=crop"
                iconUrl="data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%22-16%20-16%2056%2056%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%23fff%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M14.77%2021c1.123-4.649%202.486-6.099%206.23-7.364c-3.934-1.328-5.16-2.94-6.23-7.363c-1.124%204.649-2.488%206.098-6.232%207.363c3.93%201.327%205.163%202.95%206.231%207.364m-8.308-9.818c.512-2.42%201.502-3.512%203.461-4.091C7.963%206.512%206.973%205.42%206.462%203C5.972%205.315%205.047%206.485%203%207.09c1.959.58%202.95%201.672%203.462%204.092%22%2F%3E%3C%2Fsvg%3E"
                showUserInfo={true}
                enableTilt={true}
                enableMobileTilt={false}
                behindGlowEnabled={true}
                behindGlowColor="rgba(255, 59, 31, 0.15)"
                innerGradient="linear-gradient(145deg, rgba(255, 59, 31, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)"
                onContactClick={() => {
                  const element = document.getElementById('contact');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              />
            </div>
            
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-vampire-red/20 blur-3xl rounded-full z-[-1]"></div>
          </div>

          {/* Text Side */}
          <div className="w-full md:w-7/12 flex flex-col justify-center">
            <div
              ref={bioContentRef}
              className="pt-6 will-change-transform"
            >
              <h3 className="text-xs uppercase tracking-widest text-vampire-red mb-3 font-sans font-bold">
                {t("Sobre la Artista", "About the Artist")}
              </h3>
              
              <h2 className="text-4xl md:text-5xl font-serif text-bone mb-6 italic">Marina Martín Prieto</h2>
              
              <div className="space-y-6 text-bone-muted text-sm md:text-base font-sans font-light leading-relaxed">
                <p>
                  {t(
                    <>Hola, mi nombre es <strong className="text-bone font-semibold">Marina Martín Prieto</strong> y tengo 26 años. Durante mis años formativos me he centrado principalmente en la <strong className="text-bone font-semibold">comprensión de la luz y el color</strong> como puedes ver en mi portfolio, pudiendo asegurar con certeza mi capacidad de <strong className="text-bone font-semibold">traducir las ideas en ilustraciones llenas de vida, movimiento y color</strong>.</>,
                    <>Hello, my name is <strong className="text-bone font-semibold">Marina Martín Prieto</strong> and I am 26 years old. During my formative years I have focused mainly on the <strong className="text-bone font-semibold">understanding of light and color</strong> as you can see in my portfolio, being able to assure with certainty my ability to <strong className="text-bone font-semibold">translate ideas into illustrations full of life, movement and color</strong>.</>
                  )}
                </p>
                <p>
                  {t(
                    <>A la hora de trabajar me gusta <strong className="text-bone font-semibold">mostrar el proceso de la ilustración</strong> para que el equipo pueda sugerir cambios con el objetivo de acercarse lo máximo posible a su visión, combinándolo con una <strong className="text-bone font-semibold">gran capacidad creativa para sorprender e inventar</strong>.</>,
                    <>When working I like to <strong className="text-bone font-semibold">showcase the illustration process</strong> so that the team can suggest changes with the aim of getting as close to their vision as possible, combining it with a <strong className="text-bone font-semibold">great creative capacity to surprise and innovate</strong>.</>
                  )}
                </p>
              </div>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-10">
                  <div>
                    <span className="block text-xl font-serif text-[#ff6e58] mb-1 font-bold">{t("Concept Art", "Concept Art")}</span>
                    <span className="text-xs uppercase tracking-[0.3em] font-sans text-bone-muted font-semibold">
                      {t("Entornos & Props", "Environments & Props")}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xl font-serif text-[#ff6e58] mb-1 font-bold">{t("Ilustración", "Illustration")}</span>
                    <span className="text-xs uppercase tracking-[0.3em] font-sans text-bone-muted font-semibold">
                      {t("Luz & Color", "Light & Color")}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xl font-serif text-[#ff6e58] mb-1 font-bold">{t("Desarrollo Visual", "Visual Development")}</span>
                    <span className="text-xs uppercase tracking-[0.3em] font-sans text-bone-muted font-semibold">
                      {t("Narrativa visual", "Visual storytelling")}
                    </span>
                  </div>
                </div>

                <div ref={chartWrapperRef} className="h-[250px] w-full will-change-transform">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillsData}>
                      <PolarGrid stroke="rgba(255, 255, 255, 0.15)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#f8f7f4', fontSize: 11, fontFamily: 'sans-serif', fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.95)', borderColor: '#ff3b1f', color: '#f8f7f4' }}
                        itemStyle={{ color: '#ff6e58' }}
                      />
                      <Radar name="Skills" dataKey="A" stroke="#ff3b1f" fill="#ff3b1f" fillOpacity={0.35} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="mt-12 flex flex-wrap gap-4 items-center">
                {/* 1. Descargar CV - Min 44x44px for WCAG AAA */}
                <button 
                  type="button"
                  onClick={downloadCV}
                  className="inline-flex items-center gap-2.5 border-2 border-white/30 hover:border-vampire-red bg-black/60 hover:bg-white/10 text-bone hover:text-white text-xs uppercase tracking-[0.2em] px-6 py-3.5 font-bold transition-all duration-300 rounded-sm cursor-pointer shadow-md hover:scale-105 active:scale-95 group min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  title={t("Descargar Curriculum Vitae en PDF", "Download Resume PDF")}
                >
                  <Download size={16} className="text-[#ff6e58] group-hover:translate-y-0.5 transition-transform" aria-hidden="true" />
                  <span>{t("DESCARGAR CV", "DOWNLOAD CV")}</span>
                </button>

                {/* 2. Descargar Portfolio - Min 44x44px for WCAG AAA */}
                <button 
                  type="button"
                  onClick={downloadPortfolio}
                  className="inline-flex items-center gap-2.5 border-2 border-white/30 hover:border-amber-400 bg-black/60 hover:bg-white/10 text-bone hover:text-white text-xs uppercase tracking-[0.2em] px-6 py-3.5 font-bold transition-all duration-300 rounded-sm cursor-pointer shadow-md hover:scale-105 active:scale-95 group min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  title={t("Descargar Dossier de Portfolio en PDF", "Download Portfolio Dossier PDF")}
                >
                  <FileText size={16} className="text-amber-300 group-hover:translate-y-0.5 transition-transform" aria-hidden="true" />
                  <span>{t("DESCARGAR PORTFOLIO", "DOWNLOAD PORTFOLIO")}</span>
                </button>

                {/* 3. Trabaja Conmigo - Min 44x44px for WCAG AAA */}
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById('contact');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.location.hash = '#contact';
                    }
                  }}
                  className="inline-flex items-center gap-2.5 bg-vampire-red hover:bg-vampire-red-dark text-white text-xs uppercase tracking-[0.2em] px-7 py-3.5 font-bold transition-all duration-300 rounded-sm cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(255,59,31,0.5)] hover:scale-105 active:scale-95 group min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  title={t("Ir a la sección de contacto", "Scroll to contact section")}
                >
                  <span>{t("TRABAJA CONMIGO", "WORK WITH ME")}</span>
                  <ArrowDown size={15} className="group-hover:translate-y-0.5 transition-transform" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Resume / Experience Section (Harmoniously Balanced 3x2 Grid) */}
        <div ref={columnsRef} className="pt-16 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">
          {/* Column 1: Experiencia */}
          <div className="flex flex-col will-change-transform">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-vampire-red/10 border border-vampire-red/30 flex items-center justify-center text-vampire-red shrink-0" aria-hidden="true">
                <Briefcase size={16} />
              </div>
              <h4 className="text-xl font-serif text-bone font-bold italic">{t("Experiencia", "Experience")}</h4>
            </div>
            
            <div className="space-y-8 flex-1">
              <div 
                className="relative pl-6 border-l-2 border-white/15"
              >
                <div className="absolute w-2.5 h-2.5 bg-vampire-red rotate-45 -left-[6px] top-2 shadow-[0_0_8px_rgba(255,59,31,0.6)]" aria-hidden="true"></div>
                <h5 className="text-base sm:text-lg font-bold text-bone leading-snug">{t("Artista Conceptual", "Concept Artist")}</h5>
                <div className="text-xs uppercase tracking-wider text-amber-300 font-mono font-semibold mb-2 mt-1">
                  <a href="https://www.linkedin.com/company/nocturnia-studios/" target="_blank" rel="noopener noreferrer" className="hover:text-vampire-red transition-colors inline-block underline decoration-amber-300/40">
                    Nocturnia Studios
                  </a> • {t("Ago 2023 - Actualidad", "Aug 2023 - Present")}
                </div>
                <p className="text-sm text-bone-muted font-normal leading-relaxed font-sans">
                  {t(
                    <>Trabajo autónomo en remoto. Diseño de <strong className="text-bone font-semibold">fondos, entornos y personajes</strong> utilizando <strong className="text-bone font-semibold">Adobe Photoshop</strong> y herramientas de desarrollo visual.</>,
                    <>Freelance remote work. Design of <strong className="text-bone font-semibold">backgrounds, environments and characters</strong> using <strong className="text-bone font-semibold">Adobe Photoshop</strong> and visual development tools.</>
                  )}
                </p>
              </div>
              
              <div 
                className="relative pl-6 border-l-2 border-white/15"
              >
                <div className="absolute w-2.5 h-2.5 bg-vampire-red rotate-45 -left-[6px] top-2 shadow-[0_0_8px_rgba(255,59,31,0.6)]" aria-hidden="true"></div>
                <h5 className="text-base sm:text-lg font-bold text-bone leading-snug">{t("Azafata de Eventos, AULA", "Event Hostess, AULA")}</h5>
                <div className="text-xs uppercase tracking-wider text-amber-300 font-mono font-semibold mb-2 mt-1">
                  Lightbox Academy • {t("Mar 2023", "Mar 2023")}
                </div>
                <p className="text-sm text-bone-muted font-normal leading-relaxed font-sans">
                  {t("Contrato de prácticas en Madrid. Asistencia y representación académica en el Salón Internacional del Estudiante y la Oferta Educativa.", "Internship in Madrid. Attendance and academic representation at the International Educational Opportunities Exhibition.")}
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: Educación */}
          <div className="flex flex-col will-change-transform">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-vampire-red/10 border border-vampire-red/30 flex items-center justify-center text-vampire-red shrink-0" aria-hidden="true">
                <GraduationCap size={16} />
              </div>
              <h4 className="text-xl font-serif text-bone font-bold italic">{t("Educación", "Education")}</h4>
            </div>
            
            <div className="space-y-8 flex-1">
              <div 
                className="relative pl-6 border-l-2 border-white/15"
              >
                <div className="absolute w-2.5 h-2.5 bg-vampire-red rotate-45 -left-[6px] top-2 shadow-[0_0_8px_rgba(255,59,31,0.6)]" aria-hidden="true"></div>
                <h5 className="text-base sm:text-lg font-bold text-bone leading-snug">
                  <a href="https://lboxacademy.es/" target="_blank" rel="noopener noreferrer" className="hover:text-vampire-red transition-colors underline decoration-white/30">
                    Lightbox Academy
                  </a>
                </h5>
                <div className="text-xs uppercase tracking-wider text-amber-300 font-mono font-semibold mb-2 mt-1">
                  2023 · {t("Madrid, España", "Madrid, Spain")}
                </div>
                <p className="text-sm text-bone-muted font-normal leading-relaxed font-sans">
                  {t(
                    <><strong className="text-bone font-semibold">Concept Art</strong>, diseño de personajes, entornos, atrezo, ilustración digital, <strong className="text-bone font-semibold">teoría del color y composición</strong>.</>,
                    <><strong className="text-bone font-semibold">Concept Art</strong>, character design, environments, props, digital illustration, <strong className="text-bone font-semibold">color theory and composition</strong>.</>
                  )}
                </p>
              </div>
              
              <div 
                className="relative pl-6 border-l-2 border-white/15"
              >
                <div className="absolute w-2.5 h-2.5 bg-vampire-red rotate-45 -left-[6px] top-2 shadow-[0_0_8px_rgba(255,59,31,0.6)]" aria-hidden="true"></div>
                <h5 className="text-base sm:text-lg font-bold text-bone leading-snug">{t("Grado en Bellas Artes", "Degree in Fine Arts")}</h5>
                <div className="text-xs uppercase tracking-wider text-amber-300 font-mono font-semibold mb-2 mt-1">
                  Universidad de Granada • 2017 - 2021
                </div>
                <p className="text-sm text-bone-muted font-normal leading-relaxed font-sans">
                  {t(
                    <>Especialización en <strong className="text-bone font-semibold">dibujo, pintura y fundamentos visuales</strong>. Pensamiento crítico, teoría plástica y creatividad compositiva.</>,
                    <>Specialization in <strong className="text-bone font-semibold">drawing, painting and visual fundamentals</strong>. Critical thinking, plastic theory and compositional creativity.</>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Column 3: Reconocimientos (2 premios balanceados) */}
          <div className="flex flex-col md:col-span-2 lg:col-span-1 will-change-transform">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-vampire-red/10 border border-vampire-red/30 flex items-center justify-center text-vampire-red shrink-0" aria-hidden="true">
                <Trophy size={16} />
              </div>
              <h4 className="text-xl font-serif text-bone font-bold italic">{t("Reconocimientos", "Awards")}</h4>
            </div>
            
            <div className="space-y-8 flex-1">
              {/* Nuevo Premio: Certamen Caja Rural Granada 2026 */}
              <div 
                className="relative pl-6 border-l-2 border-vampire-red/60 bg-white/[0.02] p-3 -ml-3 rounded-r-xl"
              >
                <div className="absolute w-2.5 h-2.5 bg-vampire-red rotate-45 -left-[6px] top-3 shadow-[0_0_10px_rgba(255,59,31,0.8)]" aria-hidden="true"></div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff6e58] font-bold bg-vampire-red/15 px-2 py-0.5 rounded-sm border border-vampire-red/30">
                    {t("PREMIO JOVEN", "YOUTH PRIZE")}
                  </span>
                  <span className="text-[11px] font-mono text-bone-muted">{t("Sep 2026", "Sep 2026")}</span>
                </div>
                <h5 className="text-base sm:text-lg font-bold text-bone leading-snug">
                  {t("Certamen de Pintura Rápida 2026", "2026 Quick Painting Contest")}
                </h5>
                <div className="text-xs uppercase tracking-wider text-amber-300 font-mono font-semibold mb-2 mt-0.5">
                  <a 
                    href="https://fundacioncrg.com/fundacion-caja-rural-granada-entrega-el-primer-premio-de-su-xviii-certamen-de-pintura-rapida-a-pepe-bonano/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-vampire-red transition-colors inline-block underline decoration-amber-300/40"
                    title={t("Ver enlace oficial en Fundación Caja Rural Granada", "View official link at Fundación Caja Rural Granada")}
                  >
                    Fundación Caja Rural Granada ↗
                  </a> · {t("Obra:", "Artwork:")} <span className="italic text-bone">«Plaza Berrocal»</span>
                </div>
                <p className="text-sm text-bone-muted font-normal leading-relaxed font-sans">
                  {t(
                    <>Ganadora del <strong className="text-bone font-semibold">Premio Joven</strong> con mi cuadro <strong className="text-bone font-semibold">«Plaza Berrocal»</strong>, un lugar que fue la infancia de mi abuelo y que para mí es un escenario cotidiano y diario de mi vida y mi entorno en <strong className="text-bone font-semibold">Granada</strong>.</>,
                    <>Winner of the <strong className="text-bone font-semibold">Youth Prize</strong> with my painting <strong className="text-bone font-semibold">«Plaza Berrocal»</strong>, a place that was my grandfather's childhood and for me represents an everyday, daily setting of my life and environment in <strong className="text-bone font-semibold">Granada</strong>.</>
                  )}
                </p>
              </div>

              {/* Premio 2022: Speedpainting */}
              <div 
                className="relative pl-6 border-l-2 border-white/15 p-3 -ml-3 rounded-r-xl"
              >
                <div className="absolute w-2.5 h-2.5 bg-vampire-red rotate-45 -left-[6px] top-3 shadow-[0_0_8px_rgba(255,59,31,0.6)]" aria-hidden="true"></div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded-sm border border-amber-400/20">
                    {t("1º PREMIO", "1ST PRIZE")}
                  </span>
                  <span className="text-[11px] font-mono text-bone-muted">{t("Nov 2022", "Nov 2022")}</span>
                </div>
                <h5 className="text-base sm:text-lg font-bold text-bone leading-snug">
                  <a 
                    href="https://lboxacademy.es/eventos/entrega-del-premio-de-la-sexta-edicion-speed-painting-2022/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-vampire-red transition-colors underline decoration-white/30"
                  >
                    {t("VI Edición Speed Painting", "VI Speed Painting Edition")}
                  </a>
                </h5>
                <div className="text-xs uppercase tracking-wider text-amber-300 font-mono font-semibold mb-2 mt-0.5">
                  Lightbox Academy & NVIDIA
                </div>
                <p className="text-sm text-bone-muted font-normal leading-relaxed font-sans">
                  {t(
                    "Reto de crear una ilustración sobre el Japón medieval con un toque de fantasía en tres horas. Jurado encabezado por David Benzal, Jorge Ramos y Ygor Yglesias.",
                    "Challenge to create an illustration inspired by medieval Japan with a fantasy twist in three hours. Jury led by David Benzal, Jorge Ramos and Ygor Yglesias."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
