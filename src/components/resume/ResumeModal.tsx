'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ExternalLink } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useAnalytics } from '@/hooks/useAnalytics';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResumeModal({ isOpen, onClose }: ResumeModalProps) {
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    if (isOpen) trackEvent('resume_view');
  }, [isOpen, trackEvent]);

  useEffect(() => {
    setMounted(true);
    // Initialize audio object once
    audioRef.current = new Audio('/sounds/paper-open.mp3');
    audioRef.current.volume = 0.2;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (isOpen && audioRef.current) {
      // Play sound when opened
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Autoplay might be blocked, gracefully ignore
      });
    }
  }, [isOpen]);

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Resume Modal"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-[5px]"
            onClick={onClose}
          />

          {/* Paper Document */}
          <motion.div
            initial={{ 
              opacity: 0, 
              scale: 0.86, 
              rotateX: -12, 
              clipPath: 'inset(45% 4% 45% 4%)' 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              rotateX: 0, 
              clipPath: 'inset(0% 0% 0% 0%)' 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.96, 
              rotateX: -4, 
              clipPath: 'inset(45% 4% 45% 4%)' 
            }}
            transition={{ 
              duration: 0.65, 
              ease: [0.19, 1, 0.22, 1] // Custom spring-like easing
            }}
            style={{ 
              transformOrigin: 'center center',
              perspective: '1000px'
            }}
            className="relative w-full max-w-[820px] h-[88vh] max-h-[1000px] bg-[#F5F0E8] text-[#181818] rounded-md shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header / Actions */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#E5E0D8] shrink-0 bg-[#F5F0E8] z-10">
              <div className="flex flex-col">
                <span className="font-display font-bold text-sm tracking-wide">SAILESH P</span>
                <span className="text-[10px] sm:text-xs font-medium text-[#666] uppercase tracking-widest hidden sm:block">Resume / Curriculum Vitae</span>
                <span className="text-[10px] font-medium text-[#666] uppercase tracking-widest block sm:hidden">Resume</span>
              </div>
              
              <div className="flex items-center gap-3 sm:gap-4">
                <a 
                  href="/resume/SAILESH-P.pdf" 
                  download="Sailesh-P-Resume.pdf"
                  onClick={(e) => {
                    e.preventDefault();
                    trackEvent('resume_download', { href: '/resume/SAILESH-P.pdf' });
                    const link = document.createElement("a");
                    link.href = "/resume/SAILESH-P.pdf";
                    link.download = "Sailesh-P-Resume.pdf";
                    link.style.display = "none";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium hover:text-[#000] text-[#444] transition-colors"
                >
                  <Download size={15} /> 
                  <span className="hidden sm:inline">Download Resume</span>
                  <span className="inline sm:hidden">Download</span>
                </a>
                <div className="w-px h-4 bg-[#D5D0C8] mx-0.5 sm:mx-1"></div>
                <button 
                  onClick={onClose}
                  aria-label="Close resume"
                  className="p-1 rounded-full hover:bg-[#E5E0D8] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Resume Content Preview */}
            <div className="flex-1 w-full bg-[#F5F0E8] relative overflow-y-auto resume-paper p-8 sm:p-12 md:p-16 text-[#181818]">
              <div className="max-w-[700px] mx-auto flex flex-col gap-8">
                
                {/* CV Header */}
                <header className="flex flex-col items-center sm:items-start border-b border-[#D5D0C8] pb-8">
                  <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight mb-2 uppercase">SAILESH P</h1>
                  <h2 className="text-lg font-medium text-[#444] mb-6">UI & UX Designer</h2>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-sm text-[#444]">
                    <a href="mailto:im.saileshh@gmail.com" className="hover:text-black transition-colors">im.saileshh@gmail.com</a>
                    <span className="w-1 h-1 rounded-full bg-[#D5D0C8]"></span>
                    <span>+91 7592825012</span>
                    <span className="w-1 h-1 rounded-full bg-[#D5D0C8]"></span>
                    <span>Thrissur, Kerala</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-sm text-[#444] mt-2">
                    <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-black transition-colors underline underline-offset-4 decoration-[#D5D0C8]">LinkedIn</a>
                    <span className="w-1 h-1 rounded-full bg-[#D5D0C8]"></span>
                    <a href="https://www.behance.net/im_saileshh" target="_blank" rel="noreferrer" className="hover:text-black transition-colors underline underline-offset-4 decoration-[#D5D0C8]">Behance</a>
                    <span className="w-1 h-1 rounded-full bg-[#D5D0C8]"></span>
                    <a href="https://dribbble.com" target="_blank" rel="noreferrer" className="hover:text-black transition-colors underline underline-offset-4 decoration-[#D5D0C8]">Dribbble</a>
                  </div>
                </header>

                {/* Career Objective */}
                <section>
                  <h3 className="text-xl font-display font-bold border-b border-[#D5D0C8] pb-2 mb-4">Career Objective</h3>
                  <p className="text-[#333] leading-relaxed text-sm sm:text-base">
                    I am a UI/UX designer with a background in computer science. I enjoy turning ideas into clean, user-friendly designs that solve real problems. I also have frontend skills, which help me work better with developers and understand how designs come to life. I am looking for a team where I can grow, keep learning, and help build products that people enjoy using.
                  </p>
                </section>

                {/* Skills */}
                <section>
                  <h3 className="text-xl font-display font-bold border-b border-[#D5D0C8] pb-2 mb-4">Skills</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                    <div>
                      <h4 className="font-bold text-[#181818] mb-2">Design Skills</h4>
                      <p className="text-[#444] text-sm leading-relaxed">User Interface (UI) Design, User Experience (UX) Design, Wireframing & Prototyping, Design Systems & Style Guides, Responsive Design.</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#181818] mb-2">UX Research & Process</h4>
                      <p className="text-[#444] text-sm leading-relaxed">User Flow Mapping, Persona Creation, Basic Usability Testing, Feedback Iteration, Empathy Mapping.</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#181818] mb-2">Design Tools</h4>
                      <p className="text-[#444] text-sm leading-relaxed">Figma, Adobe XD, Photoshop (Intermediate), Illustrator (Intermediate)</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#181818] mb-2">Frontend Skills</h4>
                      <p className="text-[#444] text-sm leading-relaxed">HTML, CSS, Tailwind, JavaScript</p>
                    </div>
                    <div className="sm:col-span-2">
                      <h4 className="font-bold text-[#181818] mb-2">Soft Skills</h4>
                      <p className="text-[#444] text-sm leading-relaxed">Team Collaboration, Problem Solving, Clear Communication, Time Management</p>
                    </div>
                  </div>
                </section>

                {/* Projects */}
                <section>
                  <h3 className="text-xl font-display font-bold border-b border-[#D5D0C8] pb-2 mb-4">Projects</h3>
                  <div className="mb-4">
                    <div className="flex justify-between items-baseline mb-2">
                      <h4 className="font-bold text-[#181818] text-lg">Flight Booking App UI&UX and case study</h4>
                    </div>
                    <p className="text-sm font-medium text-[#444] mb-3">Tools: Figma, Adobe XD, User Research methods</p>
                    <ul className="list-disc pl-5 text-sm text-[#333] space-y-2">
                      <li>Designed the complete UI/UX flow and created a detailed case study for a flight booking app.</li>
                      <li>Followed the full design process from user research to wireframes and high-fidelity mockups.</li>
                      <li>Created journey maps and personas to guide user-centered design.</li>
                    </ul>
                  </div>
                </section>

                {/* Education */}
                <section>
                  <h3 className="text-xl font-display font-bold border-b border-[#D5D0C8] pb-2 mb-4">Education</h3>
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-[#181818]">Bachelor of Science in Computer Science</h4>
                        <p className="text-sm text-[#444] mt-1">Calicut University</p>
                      </div>
                      <span className="text-sm font-medium text-[#444]">2022–25</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-[#181818]">Higher Secondary School</h4>
                        <p className="text-sm text-[#444] mt-1">GHSS Panjal, Kerala</p>
                      </div>
                      <span className="text-sm font-medium text-[#444]">2020–22</span>
                    </div>
                  </div>
                </section>

                {/* Additional Information */}
                <section>
                  <h3 className="text-xl font-display font-bold border-b border-[#D5D0C8] pb-2 mb-4">Additional Information</h3>
                  <div className="flex flex-col gap-3 text-sm text-[#333]">
                    <p><span className="font-bold text-[#181818]">Languages:</span> Malayalam (Native), English</p>
                    <p><span className="font-bold text-[#181818]">Interests:</span> UX Research, Photography, Videography, Design</p>
                  </div>
                </section>

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
