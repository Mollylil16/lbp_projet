/**
 * Hook pour piéger le focus dans un conteneur (modale, drawer, menu)
 * Conforme WCAG 2.1 — Critère 2.1.2 No Keyboard Trap
 */
import { useEffect, useRef, useCallback } from 'react';

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ');

export const useFocusTrap = (active: boolean) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    ).filter((el) => !el.closest('[aria-hidden="true"]'));
  }, []);

  useEffect(() => {
    if (!active) return;

    // Mémoriser l'élément actif avant l'ouverture
    previouslyFocusedRef.current = document.activeElement as HTMLElement;

    // Focaliser le premier élément focusable du conteneur
    const focusFirst = () => {
      const elements = getFocusableElements();
      if (elements.length > 0) {
        elements[0].focus();
      } else {
        containerRef.current?.focus();
      }
    };
    // Légère temporisation pour laisser le DOM se rendre
    const timer = setTimeout(focusFirst, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const elements = getFocusableElements();
      if (elements.length === 0) return;

      const first = elements[0];
      const last = elements[elements.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !containerRef.current?.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !containerRef.current?.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      // Restaurer le focus à la fermeture
      if (previouslyFocusedRef.current) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [active, getFocusableElements]);

  return containerRef;
};
