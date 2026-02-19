import { useEffect, useRef } from 'react';
import { message } from 'antd';

interface UseAutoSaveOptions {
    key: string;
    data: any;
    delay?: number;
    enabled?: boolean;
}

/**
 * Hook pour sauvegarder automatiquement les brouillons dans localStorage
 * @param options - Configuration de l'auto-save
 */
export function useAutoSave({ key, data, delay = 2000, enabled = true }: UseAutoSaveOptions) {
    const timeoutRef = useRef<NodeJS.Timeout>();
    const previousDataRef = useRef<string>();

    useEffect(() => {
        if (!enabled) return;

        const currentData = JSON.stringify(data);

        // Ne sauvegarder que si les données ont changé
        if (currentData === previousDataRef.current) return;

        // Annuler le timeout précédent
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Créer un nouveau timeout
        timeoutRef.current = setTimeout(() => {
            try {
                localStorage.setItem(`draft:${key}`, currentData);
                previousDataRef.current = currentData;
                console.log(`✓ Brouillon sauvegardé: ${key}`);
            } catch (error) {
                console.error('Erreur sauvegarde brouillon:', error);
            }
        }, delay);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [data, key, delay, enabled]);
}

/**
 * Restaurer un brouillon depuis localStorage
 * @param key - Clé du brouillon
 * @returns Données du brouillon ou null
 */
export function restoreDraft<T>(key: string): T | null {
    try {
        const draft = localStorage.getItem(`draft:${key}`);
        if (draft) {
            return JSON.parse(draft) as T;
        }
        return null;
    } catch (error) {
        console.error('Erreur restauration brouillon:', error);
        return null;
    }
}

/**
 * Supprimer un brouillon
 * @param key - Clé du brouillon
 */
export function clearDraft(key: string): void {
    try {
        localStorage.removeItem(`draft:${key}`);
        console.log(`✓ Brouillon supprimé: ${key}`);
    } catch (error) {
        console.error('Erreur suppression brouillon:', error);
    }
}

/**
 * Hook pour gérer la restauration de brouillon au montage
 * @param key - Clé du brouillon
 * @param onRestore - Callback appelé avec les données restaurées
 */
export function useRestoreDraft<T>(key: string, onRestore: (data: T) => void) {
    useEffect(() => {
        const draft = restoreDraft<T>(key);
        if (draft) {
            const shouldRestore = window.confirm(
                'Un brouillon a été trouvé. Voulez-vous le restaurer ?'
            );
            if (shouldRestore) {
                onRestore(draft);
                message.success('Brouillon restauré');
            } else {
                clearDraft(key);
            }
        }
    }, [key, onRestore]);
}
