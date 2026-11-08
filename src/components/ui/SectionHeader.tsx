'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import React from 'react';

const ease = [0.22, 1, 0.36, 1] as const;

interface SectionHeaderProps {
  icon?: LucideIcon;
  label?: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionHeader({ icon: Icon, label, children, className = '' }: SectionHeaderProps) {
  const containerVariants = {
    hidden: {},
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease },
    },
  };

  const childrenArray = React.Children.toArray(children);
  const headingChild = childrenArray[0];
  const remainingChildren = childrenArray.slice(1);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className={`flex flex-col mb-8 md:mb-12 ${className}`}
    >
      {/* ── Straight Inline Icon + Heading Row ── */}
      <div className="flex flex-col">
        {Icon ? (
          <div className="flex items-center gap-3.5 sm:gap-4 mb-2">
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] sm:rounded-2xl bg-[var(--card)] border border-border-subtle text-accent shadow-xs shrink-0"
            >
              <Icon size={21} strokeWidth={2} className="text-accent" />
            </motion.div>

            {headingChild && (
              <motion.div variants={itemVariants} className="flex-1">
                {headingChild}
              </motion.div>
            )}
          </div>
        ) : (
          headingChild && (
            <motion.div variants={itemVariants} className="mb-2">
              {headingChild}
            </motion.div>
          )
        )}

        {/* ── Subtitles / Paragraphs ── */}
        {remainingChildren.map((child, index) => (
          <motion.div key={index + 1} variants={itemVariants}>
            {child}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
