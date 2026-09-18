'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Mail, MapPin, Clock } from 'lucide-react';

export function HireMeModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    if (!name || !email || !subject || !message) {
      return;
    }

    const whatsappMessage = `Hi Sailesh 👋\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`;
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/917592825012?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    
    e.currentTarget.reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" style={{ perspective: '1200px' }}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, rotateX: -25, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, rotateX: 15, y: 30, scale: 0.95 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'bottom center' }}
            className="relative w-full max-w-4xl bg-[var(--bg)] border border-border-subtle rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92dvh]"
          >
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-border-subtle/50 hover:bg-border-subtle text-foreground transition-colors"
            >
              <X size={18} />
            </button>

            {/* Left Info Panel */}
            <div className="w-full md:w-2/5 bg-[var(--sidebar)] px-5 py-5 md:p-12 flex flex-col shrink-0 border-b md:border-b-0 md:border-r border-border-subtle">
              <h2 className="text-xl md:text-3xl font-display font-medium text-foreground mb-1.5 md:mb-4">Contact me</h2>
              <p className="text-muted text-sm md:text-base mb-4 md:mb-10 leading-relaxed">I&apos;m currently available for freelance work and full-time roles. Let&apos;s build something great together.</p>
              
              <div className="flex flex-col gap-3 md:gap-6 md:mt-auto">
                <div className="flex items-center gap-3 md:items-start md:gap-4">
                  <div className="p-2 md:p-3 rounded-xl bg-[var(--card)] border border-border-subtle text-muted shrink-0">
                    <Mail size={15} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] md:text-[11px] font-medium tracking-widest text-muted uppercase mb-0.5">Email</span>
                    <a href="mailto:im.saileshh@gmail.com" className="text-xs md:text-sm text-foreground hover:text-accent transition-colors font-medium truncate">im.saileshh@gmail.com</a>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 md:items-start md:gap-4">
                  <div className="p-2 md:p-3 rounded-xl bg-[var(--card)] border border-border-subtle text-muted shrink-0">
                    <MapPin size={15} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] md:text-[11px] font-medium tracking-widest text-muted uppercase mb-0.5">Location</span>
                    <span className="text-xs md:text-sm text-foreground font-medium capitalize">Thrissur, Kerala</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 md:items-start md:gap-4">
                  <div className="p-2 md:p-3 rounded-xl bg-[var(--card)] border border-border-subtle text-muted shrink-0">
                    <Clock size={15} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] md:text-[11px] font-medium tracking-widest text-muted uppercase mb-0.5">Response Time</span>
                    <span className="text-xs md:text-sm text-foreground font-medium">Within 24-48 hours</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form Panel */}
            <div className="w-full md:w-3/5 px-4 py-4 md:p-12 overflow-y-auto">
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:gap-5">
                <div className="flex flex-col gap-1">
                  <label htmlFor="name" className="text-[10px] md:text-[11px] font-medium tracking-widest text-muted uppercase">Name</label>
                  <input
                    type="text" id="name" name="name" required
                    className="w-full bg-[var(--card)] border border-border-subtle rounded-lg md:rounded-xl px-3 py-2 md:px-4 md:py-3 text-[16px] md:text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
                    placeholder="Your name"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="email" className="text-[10px] md:text-[11px] font-medium tracking-widest text-muted uppercase">Email</label>
                  <input
                    type="email" id="email" name="email" required
                    className="w-full bg-[var(--card)] border border-border-subtle rounded-lg md:rounded-xl px-3 py-2 md:px-4 md:py-3 text-[16px] md:text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="subject" className="text-[10px] md:text-[11px] font-medium tracking-widest text-muted uppercase">Subject</label>
                  <input
                    type="text" id="subject" name="subject" required
                    className="w-full bg-[var(--card)] border border-border-subtle rounded-lg md:rounded-xl px-3 py-2 md:px-4 md:py-3 text-[16px] md:text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
                    placeholder="Project inquiry"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="message" className="text-[10px] md:text-[11px] font-medium tracking-widest text-muted uppercase">Message</label>
                  <textarea
                    id="message" name="message" required rows={2}
                    className="w-full bg-[var(--card)] border border-border-subtle rounded-lg md:rounded-xl px-3 py-2 md:px-4 md:py-3 text-[16px] md:text-sm text-foreground focus:outline-none focus:border-accent transition-colors resize-none"
                    placeholder="Tell me about your project..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="group mt-0.5 inline-flex items-center justify-center gap-2 bg-foreground text-[var(--bg)] px-5 py-2.5 md:px-8 md:py-4 rounded-xl text-sm font-semibold hover:scale-[1.015] transition-transform duration-[300ms] w-full md:w-auto md:self-start"
                >
                  Send Message
                  <Send size={14} className="group-hover:translate-x-[3px] group-hover:-translate-y-[3px] transition-transform duration-[240ms]" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
