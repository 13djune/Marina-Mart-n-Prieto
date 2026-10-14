import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../LanguageContext';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export default function SEO({ title, description, image, url }: SEOProps) {
  const { lang, t } = useLanguage();

  const siteName = "Marina Martín Prieto - Concept Artist";
  const defaultTitle = t(
    "Marina Martín Prieto | Portafolio de Concept Art & Ilustración",
    "Marina Martín Prieto | Concept Art & Illustration Portfolio"
  );
  
  const defaultDescription = t(
    "Portafolio oficial de Marina Martín Prieto, Artista Conceptual e Ilustradora. Explora proyectos de diseño de personajes, entornos, atrezzo y desarrollo visual para entretenimiento.",
    "Official portfolio of Marina Martín Prieto, Concept Artist and Illustrator. Explore projects involving character design, environments, props, and visual development for entertainment."
  );

  const defaultImage = "https://images.unsplash.com/photo-1577083165230-67a659ccbf63?q=80&w=2940&auto=format&fit=crop"; // Placeholder hero image
  
  const seoTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoImage = image || defaultImage;
  const seoUrl = url || window.location.href;

  return (
    <Helmet>
      <html lang={lang} />
      {/* Standard Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={seoUrl} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
    </Helmet>
  );
}
