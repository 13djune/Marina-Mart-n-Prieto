import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Gallery from './components/Gallery';
import Biography from './components/Biography';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import Process from './components/Process';
import Contact from './components/Contact';
import Divider from './components/Divider';
import SEO from './components/SEO';
import Preloader from './components/Preloader';
import BackToTop from './components/BackToTop';
import SmoothScroll from './components/SmoothScroll';
import ScrollProgress from './components/ScrollProgress';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { HelmetProvider } from 'react-helmet-async';

function MainContent() {
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  // Detect keyboard navigation for WCAG AAA
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigating');
      }
    };
    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigating');
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return (
    <SmoothScroll>
      <SEO />
      <ScrollProgress />

      {/* Skip to Content Link for WCAG AAA */}
      <a 
        href="#portfolio" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999999] focus:bg-vampire-red focus:text-white focus:px-4 focus:py-2.5 focus:rounded-md focus:shadow-2xl focus:font-bold focus:outline-none focus:ring-2 focus:ring-white text-xs uppercase tracking-wider"
      >
        {t("Saltar al contenido principal", "Skip to main content")}
      </a>

      <AnimatePresence>
        {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>
      
      <div className={`bg-vampire-bg min-h-screen relative overflow-hidden text-bone selection:bg-vampire-red selection:text-white transition-opacity duration-1000 ${isLoading ? 'opacity-0 h-screen overflow-hidden' : 'opacity-100'}`}>
        <CustomCursor />
        <BackToTop />
        {/* Pure Atmospheric Vampire Gradient Background */}
        <div 
          className="fixed inset-0 pointer-events-none z-0" 
          style={{
            background: 'radial-gradient(circle at 50% 18%, rgba(255, 59, 31, 0.08) 0%, rgba(28, 32, 29, 0.95) 60%, #1c201d 100%)'
          }}
          aria-hidden="true"
        />
        <div 
          className="fixed inset-0 opacity-15 pointer-events-none z-0 transform-gpu will-change-transform" 
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 20%, #ff3b1f 0%, transparent 45%), radial-gradient(circle at 80% 80%, #ff3b1f 0%, transparent 45%)'
          }}
          aria-hidden="true"
        />
        <div className="relative z-10">
          <Navbar />
          <main id="main-content">
            <Hero />
            <Divider />
            <Gallery />
            <Divider />
            <Biography />
            <Divider />
            <Process />
            <Divider />
            <Contact />
          </main>
          <Footer />
        </div>
      </div>
    </SmoothScroll>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <MainContent />
      </LanguageProvider>
    </HelmetProvider>
  );
}
