import React from 'react';

export type PaperTextureType = 
  | 'laid'        // Papel verjurado: finas líneas horizontales y trama de agua
  | 'watercolor'  // Grano fino de acuarela: microporos suaves de algodón prensado en frío
  | 'vellum'      // Papel vitela: liso, sedoso con tenues nubes de fibra
  | 'woven'       // Papel tejido de lino: sutil textura de trama textil
  | 'botanical'   // Papel artesanal: fibras naturales diminutas y tacto cálido
  | 'rag'         // Papel de trapo de archivo: bordes cálidos de algodón puro
  | 'parchment';  // Pergamino fino de archivo: suave veladura clásica

interface SketchbookTextureOverlayProps {
  type?: PaperTextureType;
  /** Opacidad muy tenue y elegante (por defecto 0.04 a 0.06 para máxima sutileza) */
  opacity?: number;
  className?: string;
  seed?: number;
}

/**
 * Superposiciones de texturas de papel fino artesanal para el sketchbook.
 * Enfocado en grano de papel delicado, estético ("mono"), con muy baja opacidad y sin manchas agresivas.
 * 100% SVG nativo, Mobile-First, valores CSS fijos y rendimiento optimizado.
 */
export const SketchbookTextureOverlay: React.FC<SketchbookTextureOverlayProps> = ({
  type = 'rag',
  opacity,
  className = '',
  seed = 1,
}) => {
  // Opacidades muy bajas, tenues y elegantes para lograr un acabado limpio y estético
  const defaultOpacity = 
    type === 'watercolor' ? 0.055 :
    type === 'laid' ? 0.05 :
    type === 'vellum' ? 0.045 :
    type === 'woven' ? 0.05 :
    type === 'botanical' ? 0.055 :
    type === 'parchment' ? 0.05 : 0.05;

  const currentOpacity = opacity !== undefined ? opacity : defaultOpacity;

  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden z-[4] ${className}`}
      style={{
        opacity: currentOpacity,
        mixBlendMode: 'multiply',
      }}
      aria-hidden="true"
    >
      {/* ------------------------------------------------------------------ */}
      {/* 1. PAPEL VERJURADO (LAID PAPER): Rayado tenue de molde tradicional */}
      {/* ------------------------------------------------------------------ */}
      {type === 'laid' && (
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`laid-lines-${seed}`} width="100" height="14" patternUnits="userSpaceOnUse">
              <line x1="0" y1="7" x2="100" y2="7" stroke="#8c7355" strokeWidth="0.35" strokeOpacity="0.35" />
              <line x1="0" y1="14" x2="100" y2="14" stroke="#b09b82" strokeWidth="0.2" strokeOpacity="0.2" strokeDasharray="4 6" />
            </pattern>
            <filter id={`laid-grain-${seed}`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" result="noise" seed={seed * 23} />
              <feColorMatrix type="matrix" values="0 0 0 0 0.94 0 0 0 0 0.90 0 0 0 0 0.83 0 0 0 0.3 0" />
            </filter>
          </defs>
          <rect width="100%" height="100%" filter={`url(#laid-grain-${seed})`} opacity="0.5" />
          <rect width="100%" height="100%" fill={`url(#laid-lines-${seed})`} />
        </svg>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 2. PAPEL DE ACUARELA (WATERCOLOR): Textura de algodón prensado      */}
      {/* ------------------------------------------------------------------ */}
      {type === 'watercolor' && (
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id={`wc-grain-${seed}`}>
              <feTurbulence type="turbulence" baseFrequency="0.055" numOctaves="3" result="noise" seed={seed * 31} />
              <feDiffuseLighting in="noise" lightingColor="#fcf8f0" surfaceScale="1.1" result="light">
                <feDistantLight azimuth="55" elevation="65" />
              </feDiffuseLighting>
              <feBlend mode="multiply" in="SourceGraphic" in2="light" />
            </filter>
            <radialGradient id={`wc-glow-${seed}`} cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#fffdfa" stopOpacity="0" />
              <stop offset="85%" stopColor="#ebdcc5" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#d9c39e" stopOpacity="0.35" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill={`url(#wc-glow-${seed})`} />
          <rect width="100%" height="100%" filter={`url(#wc-grain-${seed})`} opacity="0.35" />
        </svg>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 3. VITELA SEDOSA (VELLUM): Pátina suave y nubes de fibra vegetal   */}
      {/* ------------------------------------------------------------------ */}
      {type === 'vellum' && (
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id={`vellum-fiber-${seed}`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="3" result="noise" seed={seed * 41} />
              <feColorMatrix type="matrix" values="0 0 0 0 0.96 0 0 0 0 0.92 0 0 0 0 0.85 0 0 0 0.25 0" />
            </filter>
            <linearGradient id={`vellum-sheen-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f7f1e4" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#fdfaf3" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#eddcc4" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill={`url(#vellum-sheen-${seed})`} />
          <rect width="100%" height="100%" filter={`url(#vellum-fiber-${seed})`} opacity="0.4" />
        </svg>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 4. TEJIDO DE LINO (WOVEN): Trama de fibras cruzadas finísimas      */}
      {/* ------------------------------------------------------------------ */}
      {type === 'woven' && (
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`woven-mesh-${seed}`} width="18" height="18" patternUnits="userSpaceOnUse">
              <path d="M0,9 L18,9 M9,0 L9,18" stroke="#998369" strokeWidth="0.3" strokeOpacity="0.2" />
              <circle cx="9" cy="9" r="0.5" fill="#7d664c" fillOpacity="0.2" />
            </pattern>
            <filter id={`woven-noise-${seed}`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed={seed * 19} />
              <feColorMatrix type="matrix" values="0 0 0 0 0.92 0 0 0 0 0.88 0 0 0 0 0.80 0 0 0 0.22 0" />
            </filter>
          </defs>
          <rect width="100%" height="100%" filter={`url(#woven-noise-${seed})`} opacity="0.3" />
          <rect width="100%" height="100%" fill={`url(#woven-mesh-${seed})`} />
        </svg>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 5. BOTÁNICO ARTESANAL (BOTANICAL): Papel hecho a mano con motitas  */}
      {/* ------------------------------------------------------------------ */}
      {type === 'botanical' && (
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" preserveAspectRatio="none">
          <defs>
            <filter id={`botanical-grain-${seed}`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.038" numOctaves="3" seed={seed * 53} />
              <feColorMatrix type="matrix" values="0 0 0 0 0.94 0 0 0 0 0.89 0 0 0 0 0.80 0 0 0 0.25 0" />
            </filter>
          </defs>
          <rect width="100%" height="100%" filter={`url(#botanical-grain-${seed})`} opacity="0.4" />
          {/* Diminutas y monas motitas de fibra vegetal botánica natural */}
          <g fill="#8a6f52" opacity="0.22">
            <ellipse cx="65" cy="85" rx="1.5" ry="0.5" transform="rotate(25 65 85)" />
            <ellipse cx="290" cy="140" rx="1.2" ry="0.4" transform="rotate(-40 290 140)" />
            <ellipse cx="140" cy="310" rx="1.6" ry="0.5" transform="rotate(15 140 310)" />
            <ellipse cx="320" cy="270" rx="1.1" ry="0.35" transform="rotate(-15 320 270)" />
            <circle cx="210" cy="50" r="0.6" />
            <circle cx="85" cy="230" r="0.65" />
            <circle cx="340" cy="90" r="0.5" />
          </g>
        </svg>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 6. PAPEL DE TRAPO ARCHIVÍSTICO (RAG): Suave, con sutil halo cálido */}
      {/* ------------------------------------------------------------------ */}
      {type === 'rag' && (
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id={`rag-fiber-${seed}`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" result="noise" seed={seed * 13} />
              <feColorMatrix type="matrix" values="0 0 0 0 0.94 0 0 0 0 0.89 0 0 0 0 0.81 0 0 0 0.28 0" />
            </filter>
            <radialGradient id={`rag-vignette-${seed}`} cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#fdfbf7" stopOpacity="0" />
              <stop offset="85%" stopColor="#ebd8b9" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#cfb68d" stopOpacity="0.3" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill={`url(#rag-vignette-${seed})`} />
          <rect width="100%" height="100%" filter={`url(#rag-fiber-${seed})`} opacity="0.4" />
        </svg>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 7. PERGAMINO FINO (PARCHMENT): Pátina de tomo y biblioteca antigua */}
      {/* ------------------------------------------------------------------ */}
      {type === 'parchment' && (
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id={`parch-grain-${seed}`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.042" numOctaves="3" result="noise" seed={seed * 67} />
              <feColorMatrix type="matrix" values="0 0 0 0 0.95 0 0 0 0 0.91 0 0 0 0 0.83 0 0 0 0.26 0" />
            </filter>
            <radialGradient id={`parch-grad-${seed}`} cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="#fffdfa" stopOpacity="0" />
              <stop offset="70%" stopColor="#faecd8" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#dfca9f" stopOpacity="0.32" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill={`url(#parch-grad-${seed})`} />
          <rect width="100%" height="100%" filter={`url(#parch-grain-${seed})`} opacity="0.35" />
        </svg>
      )}
    </div>
  );
};

export default SketchbookTextureOverlay;
