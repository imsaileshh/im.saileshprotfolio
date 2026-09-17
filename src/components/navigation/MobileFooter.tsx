'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { navigation } from '@/data/navigation';
import { socials } from '@/data/socials';

const currentYear = new Date().getFullYear();

export function MobileFooter() {
  return (
    <footer className="mt-8 sm:mt-12 md:mt-16 px-5 sm:px-6 md:px-10 lg:px-16 pt-10 sm:pt-12 pb-[calc(90px+env(safe-area-inset-bottom,0px))] md:pb-16 lg:pb-20 flex flex-col items-center text-center w-full relative">

      {/* ── Top Subtle Divider Line Above Footer ── */}
      <div className="w-full h-px bg-border-subtle/50 mb-10 sm:mb-12" />

      {/* ── 01. Brand Wordmark ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-7"
      >
        <span className="font-display text-[20px] sm:text-[22px] font-bold tracking-[0.22em] text-foreground uppercase">
          SAILESH P<span className="text-accent">.</span>
        </span>
      </motion.div>

      {/* ── 02. Navigation Menu Links ── */}
      <motion.nav
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-2.5 mb-8 max-w-xl"
      >
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-block text-[11px] sm:text-[11.5px] font-mono tracking-[0.16em] uppercase text-muted hover:text-accent hover:-translate-y-0.5 transition-all duration-200"
          >
            {item.label}
          </Link>
        ))}
      </motion.nav>

      {/* ── 03. Social Media Icon Boxes (Refined Compact Size) ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-center gap-2.5 sm:gap-3 mb-9 flex-wrap"
      >
        {socials.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noreferrer"
            aria-label={social.label}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-[var(--card)] border border-border-subtle/80 text-muted hover:text-accent hover:border-accent/40 hover:bg-accent/10 active:scale-95 transition-all duration-200 shadow-sm"
          >
            <social.icon size={15} className="transition-transform duration-200 hover:scale-110" />
          </a>
        ))}
      </motion.div>

      {/* ── 04. Copyright & Legal Metadata ── */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.18 }}
        className="flex flex-col items-center gap-2.5 text-center"
      >
        <p className="text-[11px] sm:text-[11.5px] text-muted/80 font-mono tracking-wide">
          &copy; {currentYear} Sailesh P. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-[10.5px] font-mono text-muted/50 tracking-wider">
          <span className="hover:text-muted transition-colors cursor-pointer">Privacy Policy</span>
          <span>&middot;</span>
          <span className="hover:text-muted transition-colors cursor-pointer">Terms of Service</span>
        </div>
      </motion.div>

    </footer>
  );
}
