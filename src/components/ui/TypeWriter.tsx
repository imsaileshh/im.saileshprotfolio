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
  delayBeforeType = 300,
  enableSound = false,
  loop = true,
}: TypeWriterProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Stable ref for the words array so the effect doesn't re-run when the
  // parent re-renders and passes a new array literal reference each time.
  // This is the primary fix for "Maximum update depth exceeded".
  const wordsRef = useRef(words);
  useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  // Stable ref for numeric options — avoids adding them to the effect dep array.
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

  useEffect(() => {
    if (isFinished) return;

    const words = wordsRef.current;
    const currentWord = words[currentWordIndex];
    let timer: ReturnType<typeof setTimeout>;

    if (isDeleting) {
      if (currentText === '') {
        // Finished deleting — move to next word
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      } else {
        timer = setTimeout(() => {
          setCurrentText((t) => currentWord.substring(0, t.length - 1));
          playTypingSound();
        }, deletingSpeedRef.current);
      }
    } else {
      if (currentText === currentWord) {
        // Finished typing — pause then start deleting
        if (!loop && currentWordIndex === words.length - 1) {
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
    // Only re-run when the typing state changes — NOT when the words array
    // reference changes (that's handled via wordsRef to avoid infinite loops).
  }, [currentText, isDeleting, currentWordIndex, isFinished, loop, playTypingSound]);

  return (
    <span className="inline-flex items-center">
      <span className="text-foreground font-medium">{currentText}</span>
      {!isFinished && (
        <span
          className="w-[2.5px] h-[1.1em] bg-accent ml-[4px]"
          style={{ animation: 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
        />
      )}
    </span>
  );
}
