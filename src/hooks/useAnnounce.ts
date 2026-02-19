/**
 * Hook pour annoncer dynamiquement des messages aux lecteurs d'écran
 * via une live region ARIA (aria-live)
 */
import { useCallback, useEffect, useRef } from 'react';

type Politeness = 'polite' | 'assertive';

const LIVE_REGION_ID_POLITE = 'lbp-a11y-live-polite';
const LIVE_REGION_ID_ASSERTIVE = 'lbp-a11y-live-assertive';

const ensureLiveRegion = (id: string, politeness: Politeness): HTMLElement => {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    el.setAttribute('aria-live', politeness);
    el.setAttribute('aria-atomic', 'true');
    el.setAttribute('aria-relevant', 'additions text');
    // Visuellement caché mais lisible par les lecteurs d'écran
    Object.assign(el.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0,0,0,0)',
      whiteSpace: 'nowrap',
      border: '0',
    });
    document.body.appendChild(el);
  }
  return el;
};

export const useAnnounce = () => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // S'assurer que les regions existent dès le montage
    ensureLiveRegion(LIVE_REGION_ID_POLITE, 'polite');
    ensureLiveRegion(LIVE_REGION_ID_ASSERTIVE, 'assertive');
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  /**
   * Annonce polie — pour les informations de routine (chargement terminé, etc.)
   */
  const announce = useCallback((message: string) => {
    const el = ensureLiveRegion(LIVE_REGION_ID_POLITE, 'polite');
    // Vider puis remplir pour déclencher l'annonce même si le texte est identique
    el.textContent = '';
    timerRef.current = setTimeout(() => {
      el.textContent = message;
    }, 50);
  }, []);

  /**
   * Annonce urgente — pour les erreurs et alertes
   */
  const announceUrgent = useCallback((message: string) => {
    const el = ensureLiveRegion(LIVE_REGION_ID_ASSERTIVE, 'assertive');
    el.textContent = '';
    timerRef.current = setTimeout(() => {
      el.textContent = message;
    }, 50);
  }, []);

  return { announce, announceUrgent };
};
