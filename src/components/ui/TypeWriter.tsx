'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface TypeWriterProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBeforeDelete?: number;
  delayBeforeType?: number;
  enableSound?: boolean;
  loop?: boolean;
}

export function TypeWriter({
  words,
  typingSpeed = 80,
  deletingSpeed = 50,
  delayBeforeDelete = 2000,
  enableSound = false,
  loop = true,
}: TypeWriterProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  const wordsRef = useRef(words);
  useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  const typingSpeedRef = useRef(typingSpeed);
  const deletingSpeedRef = useRef(deletingSpeed);
  const delayBeforeDeleteRef = useRef(delayBeforeDelete);
  useEffect(() => {
    typingSpeedRef.current = typingSpeed;
    deletingSpeedRef.current = deletingSpeed;
    delayBeforeDeleteRef.current = delayBeforeDelete;
  }, [typingSpeed, deletingSpeed, delayBeforeDelete]);

  const playTypingSound = useCallback(() => {
    if (!enableSound) return;
    try {
      const AudioContextClass =
        window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      if (audioCtx.state === 'suspended') return;

      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800 + Math.random() * 400, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch {
      // Ignore audio errors
    }
  }, [enableSound]);

  const containerRef = useRef<HTMLSpanElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { rootMargin: '150px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setCurrentText(wordsRef.current[0] || '');
      setIsFinished(true);
      return;
    }

    if (!isInView || isFinished) return;

    const wordsList = wordsRef.current;
    const currentWord = wordsList[currentWordIndex] || '';
    let timer: ReturnType<typeof setTimeout>;

    if (isDeleting) {
      if (currentText === '') {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % wordsList.length);
      } else {
        timer = setTimeout(() => {
          setCurrentText((t) => currentWord.substring(0, t.length - 1));
          playTypingSound();
        }, deletingSpeedRef.current);
      }
    } else {
      if (currentText === currentWord) {
        if (!loop && currentWordIndex === wordsList.length - 1) {
          setIsFinished(true);
          return;
        }
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, delayBeforeDeleteRef.current);
      } else {
        timer = setTimeout(() => {
          setCurrentText((t) => currentWord.substring(0, t.length + 1));
          playTypingSound();
        }, typingSpeedRef.current);
      }
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, isFinished, loop, playTypingSound, isInView, prefersReducedMotion]);

  return (
    <span ref={containerRef} className="inline whitespace-normal break-words">
      <span className="text-foreground font-medium">{currentText}</span>
      <span
        className="inline-block w-[2px] sm:w-[2.5px] h-[1em] bg-accent ml-1 align-[-0.1em] shrink-0 animate-pulse pointer-events-none"
        aria-hidden="true"
      />
    </span>
  );
}
