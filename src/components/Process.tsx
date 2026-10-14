import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../LanguageContext';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const processSteps = [
  {
    number: "01",
    titleEs: "INVESTIGACIÓN",
    titleEn: "RESEARCH",
    descEs: "Comprender los objetivos del cliente y del proyecto. Desarrollar paneles de inspiración basados en la visión del cliente.",
    descEn: "Understand the client's goals and objectives of the project. Along with developing mood boards based off of the client's vision."
  },
  {
    number: "02",
    titleEs: "CONCEPTO",
    titleEn: "CONCEPT",
    descEs: "Utilizar la investigación para desarrollar 2-3 conceptos iniciales. Luego revisar con el cliente para finalizar una dirección.",
    descEn: "Use the research and develop 2-3 rough concepts. Then review with the client to finalize a direction."
  },
  {
    number: "03",
    titleEs: "DISEÑO",
    titleEn: "DESIGN",
    descEs: "Fase de diseño y producción, donde todos los recursos se desarrollan o prototipan para ser revisados por el cliente.",
    descEn: "The designing and production phase, where all the assets are developed or prototyped to be reviewed by the client."
  },
  {
    number: "04",
    titleEs: "REVISIÓN",
    titleEn: "REVIEW",
    descEs: "Feedback continuo con el cliente sobre cambios de diseño antes de la finalización de los recursos.",
    descEn: "Back and forth feedback with the client regarding design or copy changes before the finalization of the assets."
  },
  {
    number: "05",
    titleEs: "FINALIZACIÓN",
    titleEn: "FINALIZE",
    descEs: "Una vez aprobado, todos los recursos se finalizan, se empaquetan y se envían. El soporte continuo siempre es una opción.",
    descEn: "Once the project is approved, all the assets will be finalized, files packaged up and sent off to the client."
  }
];

export default function Process() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const timelineLineRef = useRef<HTMLDivElement>(null);
  const stepsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      // 1. Header entrance
      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }
      )
      // 2. Timeline horizontal line fill
      .fromTo(
        timelineLineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.2, ease: 'power2.inOut' },
        '-=0.5'
      );

      // 3. Staggered Step diamonds and text cards
      if (stepsContainerRef.current) {
        const stepElements = Array.from(stepsContainerRef.current.children) as HTMLElement[];
        stepElements.forEach((stepEl, idx) => {
          const diamond = stepEl.querySelector('.step-diamond');
          const textElements = stepEl.querySelectorAll('.step-text');

          tl.fromTo(
            diamond,
            { scale: 0, rotation: 0, opacity: 0 },
            { scale: 1, rotation: 45, opacity: 1, duration: 0.65, ease: 'back.out(2)' },
            `-=${idx === 0 ? 0.9 : 0.45}`
          )
          .fromTo(
            textElements,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08 },
            '-=0.4'
          );
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-24 px-6 md:px-12 bg-vampire-bg relative z-10 text-bone overflow-hidden"
    >
      <div className="max-w-7xl mx-auto text-center">
        <div
          ref={headerRef}
          className="mb-20 will-change-transform"
        >
          <h2 className="text-5xl md:text-6xl font-serif font-black uppercase mb-6 tracking-widest text-bone">
            {t("PROCESO", "PROCESS")}
          </h2>
          <p className="text-lg md:text-xl font-serif max-w-3xl mx-auto text-bone-muted font-light">
            {t(
              "Cada proyecto va a ser diferente, pero esta es la estructura habitual que me gusta seguir como mejores prácticas.",
              "Every project is going to be different, but this is the usual structure that I like to follow as best practices."
            )}
          </p>
          <div className="w-2 h-2 bg-vampire-red rotate-45 mx-auto mt-12"></div>
        </div>

        <div className="relative">
          {/* Background timeline line */}
          <div className="hidden md:block absolute top-[28px] left-[10%] w-[80%] h-[1px] bg-white/10"></div>
          
          {/* Animated fill line driven by GSAP */}
          <div 
            ref={timelineLineRef}
            className="hidden md:block absolute top-[28px] left-[10%] w-[80%] h-[1px] bg-vampire-red shadow-[0_0_12px_rgba(255,59,31,0.6)] z-0 origin-left will-change-transform"
          />

          <div 
            ref={stepsContainerRef}
            className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-6 relative z-10"
          >
            {processSteps.map((step) => (
              <div
                key={step.number}
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="step-diamond w-14 h-14 bg-vampire-bg border border-white/20 rotate-45 flex items-center justify-center mb-10 transition-colors duration-500 group-hover:border-vampire-red relative overflow-hidden shadow-xl group-hover:shadow-[0_0_20px_rgba(255,59,31,0.3)] will-change-transform">
                  <div className="absolute inset-0 bg-vampire-red/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  <span className="-rotate-45 text-bone-muted font-serif text-lg group-hover:text-vampire-red transition-colors duration-500 relative z-10">{step.number}</span>
                </div>
                
                <h3 className="step-text text-2xl font-serif mb-4 text-bone tracking-wider uppercase italic group-hover:text-vampire-red transition-colors duration-500 will-change-transform">
                  {t(step.titleEs, step.titleEn)}
                </h3>
                
                <p className="step-text text-sm leading-relaxed text-bone-muted font-light max-w-[250px] will-change-transform">
                  {t(step.descEs, step.descEn)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
