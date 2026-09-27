'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

export interface ModalTargetOptions {
  hideGlobalBar?: boolean;
}

interface ModalEntry {
  element: HTMLElement;
  options?: ModalTargetOptions;
}

interface ScrollProgressContextType {
  activeModalElement: HTMLElement | null;
  hideGlobalProgress: boolean;
  registerModalScrollTarget: (element: HTMLElement | null, options?: ModalTargetOptions) => void;
  unregisterModalScrollTarget: (element: HTMLElement | null) => void;
}

const ScrollProgressContext = createContext<ScrollProgressContextType>({
  activeModalElement: null,
  hideGlobalProgress: false,
  registerModalScrollTarget: () => {},
  unregisterModalScrollTarget: () => {},
});

export function ScrollProgressProvider({ children }: { children: React.ReactNode }) {
  const [modalStack, setModalStack] = useState<ModalEntry[]>([]);

  const registerModalScrollTarget = useCallback((element: HTMLElement | null, options?: ModalTargetOptions) => {
    if (!element) return;
    setModalStack((prev) => {
      const filtered = prev.filter((item) => item.element !== element);
      return [...filtered, { element, options }];
    });
  }, []);

  const unregisterModalScrollTarget = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    setModalStack((prev) => prev.filter((item) => item.element !== element));
  }, []);

  // Event bus listeners for non-hook or custom components
  useEffect(() => {
    const handleMount = (e: Event) => {
      const customEvent = e as CustomEvent<{ target: HTMLElement; options?: ModalTargetOptions }>;
      if (customEvent.detail?.target) {
        registerModalScrollTarget(customEvent.detail.target, customEvent.detail.options);
      }
    };

    const handleUnmount = (e: Event) => {
      const customEvent = e as CustomEvent<{ target: HTMLElement }>;
      if (customEvent.detail?.target) {
        unregisterModalScrollTarget(customEvent.detail.target);
      }
    };

    window.addEventListener('scroll-target-mount', handleMount);
    window.addEventListener('scroll-target-unmount', handleUnmount);

    return () => {
      window.removeEventListener('scroll-target-mount', handleMount);
      window.removeEventListener('scroll-target-unmount', handleUnmount);
    };
  }, [registerModalScrollTarget, unregisterModalScrollTarget]);

  const activeEntry = modalStack.length > 0 ? modalStack[modalStack.length - 1] : null;
  const activeModalElement = activeEntry?.element || null;
  const hideGlobalProgress = Boolean(activeEntry?.options?.hideGlobalBar);

  const value = useMemo(
    () => ({
      activeModalElement,
      hideGlobalProgress,
      registerModalScrollTarget,
      unregisterModalScrollTarget,
    }),
    [activeModalElement, hideGlobalProgress, registerModalScrollTarget, unregisterModalScrollTarget]
  );

  return (
    <ScrollProgressContext.Provider value={value}>
      {children}
    </ScrollProgressContext.Provider>
  );
}

export function useScrollProgress() {
  return useContext(ScrollProgressContext);
}

/**
 * Convenient React hook for modals/popups to register their scroll container
 * while open, and cleanly unregister upon closing or unmounting.
 */
export function useModalScrollProgress(
  isOpen: boolean,
  scrollContainerRef: React.RefObject<HTMLElement | null>,
  options?: ModalTargetOptions
) {
  const { registerModalScrollTarget, unregisterModalScrollTarget } = useScrollProgress();

  useEffect(() => {
    if (!isOpen) return;

    // Small delay to ensure the DOM node is rendered and measured
    const timer = setTimeout(() => {
      const el = scrollContainerRef.current;
      if (el) {
        registerModalScrollTarget(el, options);
      }
    }, 16);

    return () => {
      clearTimeout(timer);
      const el = scrollContainerRef.current;
      if (el) {
        unregisterModalScrollTarget(el);
      }
    };
  }, [isOpen, scrollContainerRef, registerModalScrollTarget, unregisterModalScrollTarget, options?.hideGlobalBar]);
}
