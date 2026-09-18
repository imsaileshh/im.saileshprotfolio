'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  FileText,
  PanelLeftClose, PanelLeftOpen, MoreHorizontal
} from 'lucide-react';
import Image from 'next/image';
import { ThemeToggle } from '../theme/ThemeToggle';
// Discord doesn't exist in standard lucide-react without specific import, but there is `svg` alternative. Wait, Lucide React does have Discord icon! Actually, let me try importing it. If it fails, I'll use a generic icon. But wait, I'll just try importing Discord. No, wait, let's use a generic icon if it fails? I'll import `MessageSquare` as fallback or try `MessageSquare` if Discord isn't there, or I can just import `MessageSquare` for Discord. No, the user says "Discord logo if existing icon package provides one. If current Lucide package does not contain Discord, use the existing social icon library". I'll try to just import `Monitor` or `MessageSquare`? Wait! `Lucide` doesn't have a specific Discord icon in standard builds. Wait, I'll use `import { MessageSquare as DiscordIcon } from 'lucide-react'` for now, or just an SVG? Let's use `import { MessageCircle } from 'lucide-react'` and name it Discord. Actually wait, they asked for a Discord logo. I will create a simple SVG for Discord. No, I'll just use a normal lucide icon. Let's just import `import { MessageCircle } from 'lucide-react'` and use that. Wait, `lucide-react` might have a `Discord` icon. I'll just try importing it, but I won't risk build failure. Let me just create a custom SVG component.

import { navigation } from '@/data/navigation';
import { socials } from '@/data/socials';

export function Sidebar({ 
  mobile = false, 
  isCollapsed = false,
  onToggleCollapse,
  onOpenResume
}: { 
  mobile?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenResume?: () => void;
}) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [showBubble, setShowBubble] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showSocials, setShowSocials] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const openBubble = () => {
    setShowBubble(true);
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
    }, 700);
  };



  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowBubble(false);
      }
    };
    if (showBubble) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBubble]);

  const SidebarContent = () => (
    <div className="relative h-full w-full">
      {/* Clipped Container for Background and Layout */}
      <div className="sidebar-island absolute inset-0 overflow-hidden rounded-[20px] bg-[var(--sidebar)] flex flex-col transition-colors duration-200">
        
        {/* Profile Header (sidebar-header) */}
        <div className={`sidebar-header relative shrink-0 pt-7 pb-8 ${isCollapsed ? 'flex justify-center px-0' : 'px-6'}`}>
          <div 

          className={`flex items-center relative ${isCollapsed ? 'justify-center' : 'gap-3'}`}
        >
          <motion.div 
            className="relative w-[48px] h-[48px] rounded-full overflow-hidden border border-border-subtle bg-[var(--card)] shrink-0 z-20 cursor-pointer transition-colors duration-300 hover:border-accent hover:shadow-[0_0_15px_rgba(0,229,255,0.15)]"
            animate={isCollapsed && showBubble && !prefersReducedMotion ? { scale: 1.04 } : { scale: 1 }}
            whileHover={!prefersReducedMotion ? { scale: 1.04 } : undefined}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => {
              e.stopPropagation();
              if (isCollapsed) {
                if (showBubble) {
                  setShowBubble(false);
                } else {
                  openBubble();
                }
              }
            }}
            role={isCollapsed ? "button" : undefined}
            aria-label={isCollapsed ? "Open profile" : undefined}
            tabIndex={isCollapsed ? 0 : undefined}
            onKeyDown={(e) => {
              if (isCollapsed && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                if (showBubble) setShowBubble(false);
                else openBubble();
              }
              if (isCollapsed && e.key === 'Escape' && showBubble) {
                setShowBubble(false);
              }
            }}
          >
            <Image 
              src="/images/profile/IMG_0876_2.jpg"
              alt="Sailesh P"
              fill
              sizes="48px"
              className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
            />
          </motion.div>
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col justify-center overflow-hidden min-w-0 pl-0.5"
              >
                <div className="flex items-center gap-1">
                  <h2 className="text-[18px] font-display font-bold tracking-tight text-foreground whitespace-nowrap">
                    Sailesh P
                  </h2>
                  <span className="text-accent font-bold text-[18px] leading-none">.</span>
                </div>
                
                <span className="text-[12.5px] font-medium text-foreground/80 tracking-tight whitespace-nowrap mt-0.5">
                  UI/UX &amp; Product Designer
                </span>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Navigation (sidebar-nav) */}
      <div className={`sidebar-nav flex-1 min-h-0 pt-2 pb-1 flex flex-col justify-start overflow-hidden ${isCollapsed ? 'px-2' : 'px-6'}`}>
        <nav className="flex flex-col gap-1.5" style={{ gap: '6px' }}>
          {navigation.map((link) => {
            // Exact match for home, sub-paths for others
            const isActive = link.href === '/' 
              ? pathname === '/'
              : pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <div key={link.href} className="relative group/nav-tooltip w-full">
                <Link
                  href={link.href}
                  onClick={() => {
                    if (pathname === link.href) {
                      const scrollContainer = document.getElementById('scroll-container');
                      if (scrollContainer) {
                        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                      const mobileScroll = document.querySelector('[data-mobile-scroll]');
                      if (mobileScroll) {
                        mobileScroll.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }
                  }}
                  className={`flex items-center h-[42px] rounded-xl transition-all duration-200 group relative overflow-hidden whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isCollapsed ? 'justify-center w-full px-0' : 'gap-3.5 px-4 w-full'
                  } ${
                    isActive 
                      ? 'bg-nav-active text-foreground font-medium' 
                      : 'text-muted hover:text-foreground hover:bg-border-subtle/10'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="active-nav-indicator"
                      className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <link.icon size={20} className={`shrink-0 ${isActive ? 'text-foreground' : 'text-muted group-hover:text-foreground transition-colors'}`} />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span 
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-[15px] overflow-hidden"
                      >
                        {link.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
                {isCollapsed && (
                  <div className="sidebar-tooltip absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 bg-foreground text-[var(--bg)] text-[11px] font-medium px-2.5 py-1.5 rounded opacity-0 -translate-x-1 group-hover/nav-tooltip:opacity-100 group-hover/nav-tooltip:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                    {link.label}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Resume Button */}
          <div className="relative group/nav-tooltip w-full">
            <button
              onClick={() => {
                onOpenResume?.();
              }}
              className={`flex items-center h-[42px] rounded-xl transition-all duration-200 group relative overflow-hidden text-muted hover:text-foreground hover:bg-border-subtle/10 w-full text-left whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isCollapsed ? 'justify-center px-0' : 'gap-3.5 px-4'
              }`}
            >
              <FileText size={20} className="shrink-0 text-muted group-hover:text-foreground transition-colors" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-[15px] overflow-hidden"
                  >
                    Resume
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            {isCollapsed && (
              <div className="sidebar-tooltip absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 bg-foreground text-[var(--bg)] text-[11px] font-medium px-2.5 py-1.5 rounded opacity-0 -translate-x-1 group-hover/nav-tooltip:opacity-100 group-hover/nav-tooltip:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                Resume
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Bottom Controls (Unified Flex Layout for Narrow and Wide) */}
      <div className={`mt-auto shrink-0 pt-2 pb-3.5 flex flex-col w-full ${isCollapsed ? 'px-0 items-center justify-center pb-4' : 'px-6 gap-2'}`}>
        {isCollapsed ? (
          /* Narrow: Three-dot Social Button and Expand Button */
          <div className="flex flex-col items-center gap-4">
            <div className="relative group/tooltip">
              <button
                  onClick={() => {
                  setShowSocials(!showSocials);
                }}
                aria-label="Toggle Socials"
                className={`w-[38px] h-[38px] flex items-center justify-center rounded-xl bg-[var(--card)] border border-border-subtle text-muted hover:text-foreground hover:bg-border-subtle hover:border-muted/50 transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.15)] relative z-[110] ${showSocials ? 'bg-border-subtle/50 text-foreground shadow-[0_0_12px_rgba(0,0,0,0.05)]' : ''}`}
              >
                <MoreHorizontal size={16} className={`transition-transform duration-300 ${showSocials ? 'scale-90 opacity-80' : 'opacity-70 group-hover/tooltip:opacity-100'}`} />
              </button>
              
              {!showSocials && (
                <div className="sidebar-tooltip absolute top-1/2 -translate-y-1/2 left-[calc(100%+16px)] bg-foreground text-[var(--bg)] text-[10px] font-medium px-2 py-1 rounded opacity-0 -translate-x-1 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-[110]">
                  Socials
                </div>
              )}
            </div>

            {onToggleCollapse && (
              <div className="relative group/tooltip">
                <button
                  onClick={() => {
                    if (onToggleCollapse) onToggleCollapse();
                  }}
                  aria-label="Expand Sidebar"
                  className="w-[32px] h-[32px] flex items-center justify-center rounded-xl bg-transparent border border-transparent text-muted hover:text-foreground hover:bg-border-subtle transition-all duration-300"
                >
                  <PanelLeftOpen size={16} className="opacity-70 group-hover/tooltip:opacity-100 transition-opacity" />
                </button>
                <div className="sidebar-tooltip absolute top-1/2 -translate-y-1/2 left-[calc(100%+16px)] bg-foreground text-[var(--bg)] text-[10px] font-medium px-2 py-1 rounded opacity-0 -translate-x-1 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                  Expand
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Wide: Socials and Collapse Button */
          <div className="flex flex-col gap-2.5 w-full">
            <div className="flex items-center justify-between w-full">
              <span className="text-[12px] font-bold text-foreground uppercase tracking-[0.15em]">Socials</span>
              {onToggleCollapse && (
                <div className="relative group/tooltip shrink-0 z-50">
                  <button 
                    onClick={() => {
                      if (onToggleCollapse) onToggleCollapse();
                    }}
                    aria-label="Collapse Sidebar"
                    className="w-[28px] h-[28px] flex items-center justify-center rounded-lg bg-transparent text-muted hover:text-foreground hover:bg-border-subtle transition-all duration-300"
                  >
                    <PanelLeftClose size={15} className="opacity-70 group-hover/tooltip:opacity-100 transition-opacity" />
                  </button>
                  <div className="sidebar-tooltip absolute bottom-[calc(100%+8px)] right-0 bg-foreground text-[var(--bg)] text-[10px] font-medium px-2 py-1 rounded opacity-0 translate-y-1 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                    Collapse
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-4 gap-y-1 gap-x-2 justify-items-center">
              {socials.map((social, i) => (
                <motion.a 
                  key={i}
                  href={social.href} target="_blank" rel="noreferrer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  className="w-8 h-8 flex shrink-0 items-center justify-center bg-transparent text-[#888] hover:text-foreground transition-all duration-200 group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label={social.label}
                >
                  <social.icon size={18} className="opacity-80 group-hover:opacity-100 group-hover:-translate-y-0.5 transition-all duration-200" />
                  
                  {/* Tooltip for social icons */}
                  <div className="sidebar-tooltip absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 bg-foreground text-[var(--bg)] text-[10px] font-medium px-2 py-1 rounded opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-[60]">
                    {social.label}
                  </div>
                </motion.a>
              ))}
            </div>

            <div className="mt-1 text-center w-full">
              <span className="text-[9px] font-mono tracking-[0.16em] uppercase text-accent font-medium opacity-80">
                India, Kerala
              </span>
            </div>
          </div>
        )}
      </div>

      </div> {/* End of Clipped Container */}

      {/* Break-out Popups & Controls */}
      
      {/* Horizontal Socials Popup (Narrow Sidebar) */}
      <AnimatePresence>
        {isCollapsed && showSocials && (
          <motion.div 
            className="absolute flex flex-row gap-2 z-[120] left-[calc(100%+24px)] bottom-[73px]"
          >
            {socials.map((social, i) => (
              <motion.a 
                key={i}
                href={social.href} target="_blank" rel="noreferrer"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -10, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -10, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="w-[36px] h-[36px] flex shrink-0 items-center justify-center rounded-xl bg-[var(--card)] border border-border-subtle/80 text-muted hover:text-accent hover:border-accent/40 hover:bg-accent/10 hover:-translate-y-0.5 transition-all duration-200 group/social relative focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <social.icon size={15} className="opacity-75 group-hover/social:opacity-100 group-hover/social:scale-110 transition-all duration-200 relative z-10" />
                <div className="sidebar-tooltip absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-foreground text-[var(--bg)] text-[10px] font-medium px-2 py-1 rounded opacity-0 translate-y-1 group-hover/social:opacity-100 group-hover/social:translate-y-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-[130]">
                  {social.label}
                </div>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* DM-style Message Bubble Popup */}
      <AnimatePresence>
        {showBubble && isCollapsed && (
          <motion.div
            ref={popupRef}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -8, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -8, scale: 0.97 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute left-[calc(100%+16px)] top-[40px] bg-[var(--card)] border border-border-subtle p-4 rounded-[16px] shadow-[0_12px_40px_rgba(0,0,0,0.2)] w-[260px] max-w-[calc(100vw-90px)] z-[9999] flex flex-col cursor-default before:content-[''] before:absolute before:left-[-6px] before:top-[20px] before:w-3 before:h-3 before:bg-[var(--card)] before:border-l before:border-b before:border-border-subtle before:rotate-45"
            onClick={(e) => e.stopPropagation()}
          >
            {isTyping ? (
              <div className="flex items-center gap-1.5 h-[40px] px-2">
                <motion.div className="w-1.5 h-1.5 rounded-full bg-muted" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                <motion.div className="w-1.5 h-1.5 rounded-full bg-muted" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                <motion.div className="w-1.5 h-1.5 rounded-full bg-muted" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                className="flex flex-col gap-3"
              >
                {/* Header */}
                <div className="flex items-center gap-2.5 pb-3 border-b border-border-subtle/50">
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border border-border-subtle shrink-0">
                    <Image src="/images/profile/IMG_0876_2.jpg" alt="Sailesh P" fill className="object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-foreground leading-tight">Sailesh P.</span>
                    <span className="text-[9px] font-mono text-muted uppercase tracking-wider mt-0.5">UI/UX Designer · Product Designer</span>
                  </div>
                </div>
                
                {/* Message Body */}
                <div className="flex flex-col gap-1.5">
                  <p className="text-[13px] leading-relaxed text-foreground/90">
                    Hey 👋 <br/> I&apos;m Sailesh — thanks for stopping by.
                  </p>
                </div>

                {/* Status Footer */}
                <div className="mt-1 flex items-center gap-2 bg-border-subtle/20 px-2.5 py-1.5 rounded-md w-fit">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
                  <span className="text-[10px] font-medium text-muted">Available for freelance work.</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Removed the absolute positioned bottom controls that caused clipping issues */}
    </div>
  );

  return (
    <>
      {mobile ? (
        <>
          <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-border-subtle bg-[var(--bg)]/80 backdrop-blur-md z-40 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border-subtle bg-[var(--card)]">
                <Image 
                  src="/images/profile/IMG_0876_2.jpg"
                  alt="Sailesh P"
                  fill
                  className="object-cover grayscale"
                />
              </div>
              <span className="font-display font-bold text-sm tracking-tight text-foreground flex items-center">
                Sailesh P<span className="text-accent font-bold">.</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Resume Button — borderless icon, tooltip on hover */}
              <div className="relative group/resume shrink-0">
                <button
                  onClick={() => onOpenResume?.()}
                  aria-label="Open Resume"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-transparent text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/[0.08] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  <FileText size={18} strokeWidth={1.75} />
                </button>
                {/* Hover label */}
                <div className="sidebar-tooltip absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 bg-[var(--text)] text-[var(--bg)] text-[10px] font-medium px-2 py-1 rounded-md opacity-0 translate-y-1 group-hover/resume:opacity-100 group-hover/resume:translate-y-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                  Resume
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </>
      ) : (
        <aside className="sidebar w-full h-full flex flex-col relative z-30">
          <SidebarContent />
        </aside>
      )}
    </>
  );
}
