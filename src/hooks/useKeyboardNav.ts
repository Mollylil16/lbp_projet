/**
 * Hook pour la navigation clavier globale de l'application
 * Raccourcis WCAG-friendly, désactivés si le focus est dans un input/textarea
 */
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnnounce } from './useAnnounce';

interface ShortcutDef {
  key: string;
  ctrlOrMeta?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
}

const isTyping = (): boolean => {
  const tag = document.activeElement?.tagName.toLowerCase();
  const role = document.activeElement?.getAttribute('role');
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    role === 'textbox' ||
    role === 'combobox' ||
    (document.activeElement as HTMLElement)?.isContentEditable
  );
};

export const useKeyboardNav = () => {
  const navigate = useNavigate();
  const { announce } = useAnnounce();

  const shortcuts: ShortcutDef[] = [
    {
      key: 'h',
      description: 'Aller au tableau de bord',
      action: () => { navigate('/dashboard'); announce('Tableau de bord'); },
    },
    {
      key: 'c',
      description: 'Aller aux colis',
      action: () => { navigate('/colis/groupage'); announce('Liste des colis'); },
    },
    {
      key: 'f',
      description: 'Aller aux factures',
      action: () => { navigate('/factures'); announce('Liste des factures'); },
    },
    {
      key: 'p',
      description: 'Aller aux paiements',
      action: () => { navigate('/paiements'); announce('Liste des paiements'); },
    },
    {
      key: 'g',
      description: 'Aller à la caisse',
      action: () => { navigate('/caisse'); announce('Suivi de caisse'); },
    },
    {
      key: '?',
      description: 'Afficher les raccourcis clavier',
      action: () => showShortcutsHelp(),
    },
    {
      key: 'Escape',
      description: 'Fermer la modale / revenir en arrière',
      action: () => {
        // Fermer les modales Ant Design ouvertes
        const closeBtn = document.querySelector<HTMLElement>(
          '.ant-modal-close, .ant-drawer-close'
        );
        if (closeBtn) closeBtn.click();
      },
    },
  ];

  const showShortcutsHelp = useCallback(() => {
    const lines = shortcuts
      .filter((s) => s.key !== '?' && s.key !== 'Escape')
      .map((s) => `[${s.key.toUpperCase()}] ${s.description}`)
      .join('\n');
    // Utiliser une notification Ant Design si disponible, sinon un alert sobre
    console.info('[Raccourcis LBP]\n' + lines);
    announce('Raccourcis clavier : ' + shortcuts.map((s) => `${s.key} pour ${s.description}`).join(', '));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ne pas interférer si l'utilisateur est en train de saisir
      if (isTyping()) return;
      // Ne pas interférer avec les combos navigateur standards
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const matched = shortcuts.find((s) => s.key === e.key);
      if (matched) {
        e.preventDefault();
        matched.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return { shortcuts };
};
