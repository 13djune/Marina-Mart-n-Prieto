export interface PaletteColor {
  nameEs: string;
  nameEn: string;
  hex: string;
}

export interface Hotspot {
  x: number;
  y: number;
  titleEs: string;
  titleEn: string;
  descriptionEs: string;
  descriptionEn: string;
}

export interface ProcessImage {
  url: string;
  labelEs: string;
  labelEn: string;
  hotspots?: Hotspot[];
}

export interface Project {
  id: number;
  titleEs: string;
  titleEn: string;
  categoryEs: string;
  categoryEn: string;
  projectTypeEs: string;
  projectTypeEn: string;
  roleEs: string;
  roleEn: string;
  tools: string;
  year: string;
  imageUrl: string;
  descriptionEs: string;
  descriptionEn: string;
  tags: string[];
  processImages: ProcessImage[];
  sketchbookVol: string;
  coverColor: string;
  spineColor: string;
  accentColor: string;
  palette: PaletteColor[];
  techniqueEs: string;
  techniqueEn: string;
  notesEs: string;
  notesEn: string;
}

export const galleryItems: Project[] = [
  {
    id: 1,
    titleEs: "Santuario de Sangre",
    titleEn: "Blood Sanctuary",
    categoryEs: "Diseño de Entorno",
    categoryEn: "Environment",
    projectTypeEs: "Arte Conceptual y Entorno",
    projectTypeEn: "Concept Art & Environment",
    roleEs: "Artista 3D y 2D",
    roleEn: "3D & 2D Artist",
    tools: "Blender, Photoshop",
    year: "2024",
    imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2727&auto=format&fit=crop",
    descriptionEs: "Profundo en los territorios inexplorados, donde la flora tiene sed de algo más que luz solar.",
    descriptionEn: "Deep within the uncharted territories, where the flora thirsts for more than just sunlight.",
    tags: ["Environment", "Concept", "Flora", "Dark Fantasy"],
    sketchbookVol: "LIBRO I · EXP. 01",
    coverColor: "#221717",
    spineColor: "#150d0d",
    accentColor: "#ff3b1f",
    palette: [
      { nameEs: "Sangre Seca", nameEn: "Dried Blood", hex: "#5b1414" },
      { nameEs: "Carmesí Vivo", nameEn: "Vivid Crimson", hex: "#ff3b1f" },
      { nameEs: "Niebla Esmeralda", nameEn: "Emerald Mist", hex: "#1a3325" },
      { nameEs: "Hueso Pálido", nameEn: "Pale Bone", hex: "#e7e2d6" }
    ],
    techniqueEs: "Modelado preliminar en Blender para volumen lumínico, seguido de pintura digital directa en Photoshop con pinceles de textura orgánica.",
    techniqueEn: "Preliminary Blender blockout for volumetric light, followed by direct digital painting in Photoshop using organic texture brushes.",
    notesEs: "La clave radicó en no tratar las raíces como madera inerte, sino como tejido vivo y voraz. El contraste de la bruma roja genera una tensión sofocante.",
    notesEn: "The key was not to treat the roots as inert wood, but as voracious living tissue. The red mist contrast generates a suffocating tension.",
    processImages: [
      { 
        url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2670&auto=format&fit=crop", 
        labelEs: "Boceto y Composición", 
        labelEn: "Sketch & Composition",
        hotspots: [
          { x: 30, y: 40, titleEs: "Vegetación Corrupta", titleEn: "Corrupted Flora", descriptionEs: "Diseño inicial para las hojas mutadas por la niebla roja.", descriptionEn: "Initial design for leaves mutated by the red mist." }
        ]
      },
      { 
        url: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2727&auto=format&fit=crop", 
        labelEs: "Render Final & Acabado", 
        labelEn: "Final Render & Polish",
        hotspots: [
          { x: 60, y: 70, titleEs: "Niebla Densificada", titleEn: "Densified Mist", descriptionEs: "Uso de volumen para crear un ambiente claustrofóbico.", descriptionEn: "Volumetric fog usage to create a claustrophobic atmosphere." },
          { x: 45, y: 55, titleEs: "Punto de Fuga", titleEn: "Vanishing Point", descriptionEs: "Guía el ojo del espectador hacia lo desconocido.", descriptionEn: "Guides the viewer's eye towards the unknown." }
        ]
      }
    ]
  },
  {
    id: 2,
    titleEs: "El Tribunal Carmesí",
    titleEn: "The Crimson Court",
    categoryEs: "Diseño de Personajes",
    categoryEn: "Character",
    projectTypeEs: "Diseño de Personajes",
    projectTypeEn: "Character Design",
    roleEs: "Ilustradora Principal",
    roleEn: "Lead Illustrator",
    tools: "Photoshop, ZBrush",
    year: "2023",
    imageUrl: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=2940&auto=format&fit=crop",
    descriptionEs: "Aristocracia de la noche, celebrando su eterna mascarada en el invernadero en ruinas.",
    descriptionEn: "Aristocracy of the night, holding their eternal masquerade in the ruined conservatory.",
    tags: ["Character Design", "Costume", "Vampire", "Baroque"],
    sketchbookVol: "LIBRO II · EXP. 04",
    coverColor: "#1a1622",
    spineColor: "#100d16",
    accentColor: "#e11d48",
    palette: [
      { nameEs: "Oro Envejecido", nameEn: "Aged Gold", hex: "#c59b27" },
      { nameEs: "Terciopelo Carmín", nameEn: "Crimson Velvet", hex: "#991b1b" },
      { nameEs: "Obsidiana", nameEn: "Obsidian", hex: "#121215" },
      { nameEs: "Encaje Veneciano", nameEn: "Venetian Lace", hex: "#f5f0eb" }
    ],
    techniqueEs: "Estudios anatómicos en papel gris teñido, esculpido digital en ZBrush para joyería y ropajes góticos, y veladuras de color al óleo digital.",
    techniqueEn: "Anatomical studies on tinted grey paper, ZBrush digital sculpt for gothic jewelry and drapery, finished with digital oil glazing.",
    notesEs: "La elegancia aristocrática debe esconder una violencia latente. Cada pliegue de la seda parece haber sido bañado en vino o algo más espeso.",
    notesEn: "Aristocratic elegance must conceal latent violence. Every fold of silk seems dipped in wine or something denser.",
    processImages: [
      { 
        url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2946&auto=format&fit=crop", 
        labelEs: "Estudio de Silueta", 
        labelEn: "Silhouette Study",
        hotspots: [
          { x: 50, y: 30, titleEs: "Anatomía Alargada", titleEn: "Elongated Anatomy", descriptionEs: "Estudio previo de proporciones alargadas para dar aspecto vampírico.", descriptionEn: "Preliminary study of elongated proportions for a vampiric look." }
        ]
      },
      { 
        url: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=2940&auto=format&fit=crop", 
        labelEs: "Lámina Definitiva", 
        labelEn: "Final Plate",
        hotspots: [
          { x: 40, y: 80, titleEs: "Detalle Textil", titleEn: "Textile Detail", descriptionEs: "Renderizado de terciopelo y encaje para reflejar su estatus social.", descriptionEn: "Rendering of velvet and lace to reflect their social status." }
        ]
      }
    ]
  },
  {
    id: 3,
    titleEs: "Sanctum Cubierto",
    titleEn: "Overgrown Sanctorum",
    categoryEs: "Diseño de Entorno",
    categoryEn: "Environment",
    projectTypeEs: "Ilustración de Entorno",
    projectTypeEn: "Environment Illustration",
    roleEs: "Artista de Entornos",
    roleEn: "Environment Artist",
    tools: "Unreal Engine, Maya",
    year: "2023",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2940&auto=format&fit=crop",
    descriptionEs: "La naturaleza reclama los templos olvidados, convirtiendo arcos de piedra en esculturas de raíces retorcidas.",
    descriptionEn: "Nature reclaims the forgotten temples, turning stone arches into twisted root sculptures.",
    tags: ["Environment", "Ruins", "Nature", "Atmospheric"],
    sketchbookVol: "LIBRO III · EXP. 08",
    coverColor: "#17221b",
    spineColor: "#0d1611",
    accentColor: "#10b981",
    palette: [
      { nameEs: "Musgo Fóssil", nameEn: "Fossil Moss", hex: "#2b4c36" },
      { nameEs: "Piedra de Catedral", nameEn: "Cathedral Stone", hex: "#4b5563" },
      { nameEs: "Filtración Solar", nameEn: "Solar Leak", hex: "#fde047" },
      { nameEs: "Tierra Virgen", nameEn: "Virgin Earth", hex: "#29211a" }
    ],
    techniqueEs: "Composición basada en la arquitectura cisterciense francesa, con pasadas de luz godrays simuladas en motor 3D y sobrepintura al temple.",
    techniqueEn: "Composition grounded in French Cistercian architecture, with simulated godray lighting passes in 3D and tempera overpainting.",
    notesEs: "El silencio debe poder olerse. La piedra fría contrastada con el musgo mullido evoca siglos de quietud ininterrumpida.",
    notesEn: "The silence should be palpable. Cold stone against soft moss evokes centuries of uninterrupted stillness.",
    processImages: [
      { 
        url: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2940&auto=format&fit=crop", 
        labelEs: "Estudio Lumínico Final", 
        labelEn: "Final Light Study",
        hotspots: [
          { x: 35, y: 60, titleEs: "Ruinas Antiguas", titleEn: "Ancient Ruins", descriptionEs: "Detalle del musgo creciendo en la arquitectura de piedra.", descriptionEn: "Detail of moss growing on the stone architecture." },
          { x: 70, y: 45, titleEs: "Luz Filtrada", titleEn: "Filtered Light", descriptionEs: "Efecto de rayos de sol penetrando el denso dosel.", descriptionEn: "Effect of sunbeams penetrating the dense canopy." }
        ]
      }
    ]
  },
  {
    id: 4,
    titleEs: "Flora Nocturna",
    titleEn: "Nocturnal Flora",
    categoryEs: "Diseño de Atrezo",
    categoryEn: "Prop Design",
    projectTypeEs: "Diseño de Atrezo Botánico",
    projectTypeEn: "Botanical Prop Design",
    roleEs: "Diseñadora de Atrezo",
    roleEn: "Prop Designer",
    tools: "Procreate, Photoshop",
    year: "2024",
    imageUrl: "https://images.unsplash.com/photo-1550100136-e092101726f4?q=80&w=2800&auto=format&fit=crop",
    descriptionEs: "Plantas jarra carnívoras que emiten un tenue y fascinante resplandor para atraer a sus presas.",
    descriptionEn: "Carnivorous pitcher plants that emit a faint, mesmerizing glow to attract their prey.",
    tags: ["Props", "Botany", "Bioluminescence", "Creature"],
    sketchbookVol: "LIBRO IV · EXP. 12",
    coverColor: "#172026",
    spineColor: "#0f151a",
    accentColor: "#06b6d4",
    palette: [
      { nameEs: "Luz de Espora", nameEn: "Spore Light", hex: "#06b6d4" },
      { nameEs: "Cutícula Venenosa", nameEn: "Venomous Cuticle", hex: "#7c3aed" },
      { nameEs: "Cáliz Nocturno", nameEn: "Night Calyx", hex: "#0f172a" },
      { nameEs: "Pergamino Botánico", nameEn: "Botanical Parchment", hex: "#e2e8f0" }
    ],
    techniqueEs: "Estilo tratado como cuaderno de expedición botánica del siglo XIX, con caligrafía técnica y secciones transversales coloreadas.",
    techniqueEn: "Treated as a 19th-century botanical field expedition notebook, with technical calligraphy and colored cross-sections.",
    notesEs: "Diseñé los bordes de la flor como membranas translúcidas para dar la sensación de que palpitan al compás de la respiración del bosque.",
    notesEn: "I designed the flower edges as translucent membranes to feel like they pulsate with the breathing rhythm of the forest.",
    processImages: [
      { 
        url: "https://images.unsplash.com/photo-1550100136-e092101726f4?q=80&w=2800&auto=format&fit=crop", 
        labelEs: "Placa Botánica Final", 
        labelEn: "Final Botanical Plate",
        hotspots: [
          { x: 50, y: 50, titleEs: "Bioluminiscencia", titleEn: "Bioluminescence", descriptionEs: "Simulación de dispersión de luz subsuperficial.", descriptionEn: "Simulation of subsurface light scattering." }
        ]
      }
    ]
  },
  {
    id: 5,
    titleEs: "Río Estigia",
    titleEn: "River of Styx",
    categoryEs: "Ilustración Principal",
    categoryEn: "Keyframe Art",
    projectTypeEs: "Arte Conceptual y Keyframe",
    projectTypeEn: "Concept Art & Keyframe",
    roleEs: "Directora de Arte",
    roleEn: "Art Director",
    tools: "Photoshop",
    year: "2022",
    imageUrl: "https://images.unsplash.com/photo-1476231682828-37e571bc172f?q=80&w=2874&auto=format&fit=crop",
    descriptionEs: "El punto de cruce entre el exuberante mundo de los vivos y el árido más allá.",
    descriptionEn: "The crossing point between the lush living world and the barren afterlife.",
    tags: ["Keyframe", "Mythology", "Cinema", "Lighting"],
    sketchbookVol: "LIBRO V · EXP. 15",
    coverColor: "#221d17",
    spineColor: "#15110d",
    accentColor: "#f59e0b",
    palette: [
      { nameEs: "Aguas Negras", nameEn: "Dark Waters", hex: "#1e293b" },
      { nameEs: "Niebla de Almas", nameEn: "Soul Mist", hex: "#64748b" },
      { nameEs: "Llama del barquero", nameEn: "Ferryman's Flame", hex: "#f59e0b" },
      { nameEs: "Pizarra Fría", nameEn: "Cold Slate", hex: "#334155" }
    ],
    techniqueEs: "Composición cinematográfica panorámica 2.39:1, enfatizando la gradación de temperatura de color desde el cálido al sepulcral.",
    techniqueEn: "Cinematic 2.39:1 widescreen keyframe, emphasizing color temperature gradation from warm gold to sepulchral cold.",
    notesEs: "El río actúa como el umbral definitivo. El horizonte nunca toca el fondo; se disuelve en una niebla que no ofrece retorno.",
    notesEn: "The river acts as the definitive threshold. The horizon never meets the floor; it dissolves into mist that offers no return.",
    processImages: [
      { 
        url: "https://images.unsplash.com/photo-1476231682828-37e571bc172f?q=80&w=2874&auto=format&fit=crop", 
        labelEs: "Keyframe Definitivo", 
        labelEn: "Final Keyframe",
        hotspots: [
          { x: 65, y: 35, titleEs: "Contraste Térmico", titleEn: "Thermal Contrast", descriptionEs: "Uso de tonos fríos vs cálidos para marcar el límite entre la vida y la muerte.", descriptionEn: "Use of cool vs warm tones to mark the boundary between life and death." }
        ]
      }
    ]
  },
  {
    id: 6,
    titleEs: "Abrazo de Terciopelo",
    titleEn: "Velvet Embrace",
    categoryEs: "Diseño de Personajes",
    categoryEn: "Character",
    projectTypeEs: "Diseño y Vestuario",
    projectTypeEn: "Character & Costume Design",
    roleEs: "Artista 2D",
    roleEn: "2D Artist",
    tools: "Clip Studio Paint",
    year: "2023",
    imageUrl: "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?q=80&w=2940&auto=format&fit=crop",
    descriptionEs: "Una criatura de elegancia y terror, envuelta en sedas color sangre seca.",
    descriptionEn: "A creature of elegance and terror, draped in silks the color of dried blood.",
    tags: ["Character Design", "Portrait", "Sensual Goth", "Textile"],
    sketchbookVol: "LIBRO VI · EXP. 19",
    coverColor: "#24181e",
    spineColor: "#160d12",
    accentColor: "#f43f5e",
    palette: [
      { nameEs: "Seda Carmesí", nameEn: "Crimson Silk", hex: "#be123c" },
      { nameEs: "Sombra Gótica", nameEn: "Gothic Shade", hex: "#18181b" },
      { nameEs: "Marfil Funerario", nameEn: "Funerary Ivory", hex: "#fdf4ff" },
      { nameEs: "Rosa Marchita", nameEn: "Withered Rose", hex: "#9f1239" }
    ],
    techniqueEs: "Renderizado de tejidos táctiles con especial énfasis en el acabado especular del terciopelo y la translucidez de la piel pálida.",
    techniqueEn: "Tactile fabric rendering with special emphasis on velvet specular sheen and the translucency of pale skin.",
    notesEs: "El rostro está casi en calma, pero la tensión de los ropajes sugiere una amenaza inminente. El cuaderno contiene más de 20 pruebas de telas.",
    notesEn: "The face is nearly serene, yet the drape tension hints at imminent threat. The sketchbook holds over 20 fabric texture swatches.",
    processImages: [
      { 
        url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2946&auto=format&fit=crop", 
        labelEs: "Estudio de Mirada y Rictus", 
        labelEn: "Gaze & Expression Study",
        hotspots: []
      },
      { 
        url: "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?q=80&w=2940&auto=format&fit=crop", 
        labelEs: "Retrato Terminado", 
        labelEn: "Finished Portrait",
        hotspots: [
          { x: 30, y: 25, titleEs: "Textura Suave", titleEn: "Soft Texture", descriptionEs: "Contraste entre los bordes suaves y duros en el retrato.", descriptionEn: "Contrast between soft and hard edges in the portrait." }
        ]
      }
    ]
  }
];
