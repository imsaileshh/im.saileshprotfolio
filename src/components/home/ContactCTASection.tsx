'use client';

import { ArrowUpRight, Mail } from 'lucide-react';

export function ContactCTASection() {
  return (
    <section
      id="contact-cta"
      className="py-6 sm:py-8 md:py-10 px-5 sm:px-6 md:px-10 lg:px-16 relative"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-14 w-full">
        {/* Left: Headline & Information */}
        <div className="flex flex-col items-start max-w-2xl">
          {/* Main Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-display font-semibold tracking-tight text-foreground leading-[1.1] mb-4">
            Let&apos;s work together<span className="text-accent">.</span>
          </h2>

          {/* Supporting Copy */}
          <p className="text-[15px] sm:text-base md:text-lg text-muted leading-relaxed font-normal mb-5 max-w-xl">
            Have a project, collaboration or idea in mind? Send me a message.
          </p>

          {/* Direct Email Link */}
          <a
            href="mailto:im.saileshh@gmail.com"
            className="group inline-flex items-center gap-2 text-[14px] font-mono text-muted hover:text-accent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm py-0.5"
          >
            <Mail size={15} className="opacity-80" />
            <span>im.saileshh@gmail.com</span>
          </a>

        </div>

        {/* Right: Creative Action Button */}
        <div className="flex items-start lg:items-center shrink-0 pt-2 lg:pt-0">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-hire-me'))}
            className="group relative inline-flex items-center gap-4 pl-6 sm:pl-7 pr-2.5 py-2 rounded-full bg-[var(--card)] border border-border-subtle/90 hover:border-accent/50 text-foreground transition-all duration-300 shadow-sm hover:shadow-[0_8px_28px_rgba(45,212,191,0.16)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="text-[15px] font-medium tracking-tight group-hover:text-accent transition-colors duration-200">
              Get in touch
            </span>
            <span className="w-10 h-10 rounded-full bg-accent text-[#111214] flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:rotate-45 shrink-0 shadow-sm">
              <ArrowUpRight size={18} strokeWidth={2.5} />
            </span>
          </button>
        </div>

      </div>
    </section>
  );
}
