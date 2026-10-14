import { useState, useRef, useEffect, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Upload, Send, CheckCircle2, XCircle, X } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Contact() {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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

      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }
      );

      if (formRef.current) {
        const fields = formRef.current.querySelectorAll('.contact-field');
        tl.fromTo(
          fields,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.75, stagger: 0.12, ease: 'power2.out' },
          '-=0.5'
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Add files to FormData
    files.forEach(file => {
      formData.append('attachments', file);
    });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formData, // fetch will set the correct multipart/form-data boundary automatically
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setStatusMessage(data.message || t("Mensaje enviado con éxito", "Message sent successfully"));
        form.reset();
        setFiles([]);
      } else {
        setSubmitStatus('error');
        setStatusMessage(data.error || t("Error al enviar el mensaje", "Error sending message"));
      }
    } catch (error) {
      setSubmitStatus('error');
      setStatusMessage(t("Error de red al enviar el mensaje", "Network error while sending message"));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (submitStatus !== 'idle') {
      const timer = setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <section 
      ref={sectionRef}
      id="contact" 
      className="py-24 relative z-10 px-6 overflow-hidden"
    >
      <div className="max-w-4xl mx-auto">
        <div
          ref={headerRef}
          className="text-center mb-16 will-change-transform"
        >
          <h2 className="text-4xl md:text-5xl font-serif text-bone italic mb-4">
            {t("Pedir una", "Request a")}<br />
            <span className="text-vampire-red font-black not-italic uppercase tracking-widest">{t("Comisión", "Commission")}</span>
          </h2>
          <div className="w-24 h-1 bg-vampire-red mx-auto mt-6"></div>
          <p className="text-bone-muted mt-8 max-w-2xl mx-auto text-lg font-serif">
            {t("¿Interesado en trabajar juntos? Cuéntame sobre tu proyecto y adjunta referencias o documentos relevantes.", "Interested in working together? Tell me about your project and attach relevant references or documents.")}
          </p>
        </div>

        <form 
          ref={formRef}
          onSubmit={handleSubmit} 
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="contact-field will-change-transform">
              <label htmlFor="name" className="block text-sm uppercase tracking-wider text-bone font-bold mb-2">{t("Nombre", "Name")}</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full bg-black/40 border border-white/30 rounded-md px-4 py-3 text-bone placeholder:text-stone-400 focus:outline-none focus:border-vampire-red focus-visible:ring-2 focus-visible:ring-vampire-red transition-colors"
                placeholder={t("Tu nombre completo", "Your full name")}
              />
            </div>
            <div className="contact-field will-change-transform">
              <label htmlFor="email" className="block text-sm uppercase tracking-wider text-bone font-bold mb-2">{t("Email", "Email")}</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full bg-black/40 border border-white/30 rounded-md px-4 py-3 text-bone placeholder:text-stone-400 focus:outline-none focus:border-vampire-red focus-visible:ring-2 focus-visible:ring-vampire-red transition-colors"
                placeholder={t("tu@email.com", "you@email.com")}
              />
            </div>
          </div>

          <div className="contact-field will-change-transform">
            <label htmlFor="message" className="block text-sm uppercase tracking-wider text-bone font-bold mb-2">{t("Mensaje", "Message")}</label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              className="w-full bg-black/40 border border-white/30 rounded-md px-4 py-3 text-bone placeholder:text-stone-400 focus:outline-none focus:border-vampire-red focus-visible:ring-2 focus-visible:ring-vampire-red transition-colors resize-none"
              placeholder={t("Cuéntame los detalles de la comisión...", "Tell me the details of the commission...")}
            ></textarea>
          </div>

          {/* File Upload */}
          <div className="contact-field will-change-transform">
            <label className="block text-sm uppercase tracking-wider text-bone font-bold mb-2">{t("Archivos Adjuntos", "Attachments")}</label>
            
            <div 
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className="border-2 border-dashed border-white/30 p-8 text-center hover:border-vampire-red/80 transition-colors cursor-pointer group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vampire-red"
              onClick={() => fileInputRef.current?.click()}
              aria-label={t("Haz clic para adjuntar referencias (PDF, JPG, PNG)", "Click to attach references (PDF, JPG, PNG)")}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                multiple
                onChange={handleFileChange}
              />
              
              <div className="w-12 h-12 mx-auto mb-4 relative flex items-center justify-center">
                <div className="absolute inset-0 border border-white/30 group-hover:border-vampire-red rotate-45 transition-colors"></div>
                <Upload className="text-bone-muted group-hover:text-vampire-red transition-colors" size={22} aria-hidden="true" />
              </div>
              
              <p className="text-bone-muted font-sans text-sm font-medium">
                {t("Haz clic para adjuntar referencias (PDF, JPG, PNG)", "Click to attach references (PDF, JPG, PNG)")}
              </p>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-black/50 px-4 py-2.5 border border-white/20 rounded-md">
                    <span className="text-sm text-bone truncate mr-4">{file.name}</span>
                    <button 
                      type="button" 
                      onClick={() => removeFile(index)}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center text-bone-muted hover:text-vampire-red transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vampire-red rounded-sm"
                      aria-label={`${t("Eliminar archivo", "Remove file")}: ${file.name}`}
                    >
                      <X size={18} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <AnimatePresence>
            {submitStatus !== 'idle' && (
              <motion.div
                role="alert"
                aria-live="assertive"
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`fixed bottom-6 right-6 z-50 flex items-center p-4 border shadow-2xl backdrop-blur-md rounded-lg ${submitStatus === 'success' ? 'bg-green-950/90 border-green-400 text-white' : 'bg-red-950/90 border-red-400 text-white'}`}
              >
                {submitStatus === 'success' ? <CheckCircle2 className="mr-3 flex-shrink-0 text-green-400" size={24} /> : <XCircle className="mr-3 flex-shrink-0 text-red-400" size={24} />}
                <div>
                  <h4 className="font-bold text-white mb-0.5">{submitStatus === 'success' ? t("¡Éxito!", "Success!") : t("Error", "Error")}</h4>
                  <span className="text-sm text-bone">{statusMessage}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSubmitStatus('idle')}
                  className="min-h-[44px] min-w-[44px] ml-4 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                  aria-label={t("Cerrar notificación", "Dismiss alert")}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="contact-field text-center pt-6 will-change-transform">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative inline-flex items-center justify-center px-10 py-4 font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[200px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-sm"
            >
              <div className="absolute inset-0 w-full h-full border-2 border-vampire-red transition-all duration-300 group-hover:bg-vampire-red"></div>
              <div className="absolute inset-0 w-full h-full border-2 border-vampire-red rotate-2 scale-105 opacity-50 group-hover:rotate-0 group-hover:scale-100 transition-all duration-300 pointer-events-none"></div>
              <span className="relative z-10 flex items-center tracking-widest uppercase text-sm font-bold">
                {isSubmitting ? t("Enviando...", "Sending...") : t("Enviar Solicitud", "Send Request")}
                {!isSubmitting && <Send size={16} className="ml-3 group-hover:translate-x-1 transition-transform" aria-hidden="true" />}
              </span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
