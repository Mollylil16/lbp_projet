import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';

/**
 * Hook pour optimistic updates sur les colis
 */
export const useOptimisticColisUpdate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: any }) => {
            // Appel API réel
            const response = await fetch(`/api/colis/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return response.json();
        },

        // ✅ Optimistic update - mise à jour immédiate de l'UI
        onMutate: async ({ id, data }) => {
            // Annuler les requêtes en cours
            await queryClient.cancelQueries({ queryKey: ['colis', id] });

            // Sauvegarder l'état précédent
            const previousColis = queryClient.getQueryData(['colis', id]);

            // Mettre à jour optimistiquement
            queryClient.setQueryData(['colis', id], (old: any) => ({
                ...old,
                ...data,
            }));

            // Retourner contexte pour rollback
            return { previousColis };
        },

        // ✅ Rollback en cas d'erreur
        onError: (err, variables, context: any) => {
            if (context?.previousColis) {
                queryClient.setQueryData(['colis', variables.id], context.previousColis);
            }
            message.error('Erreur lors de la mise à jour');
        },

        // ✅ Toujours refetch après mutation
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({ queryKey: ['colis', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['colis'] });
        },

        onSuccess: () => {
            message.success('Colis mis à jour avec succès');
        },
    });
};

/**
 * Hook pour optimistic delete
 */
export const useOptimisticColisDelete = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const response = await fetch(`/api/colis/${id}`, {
                method: 'DELETE',
            });
            return response.json();
        },

        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['colis'] });

            const previousColis = queryClient.getQueryData(['colis']);

            // Retirer optimistiquement de la liste
            queryClient.setQueryData(['colis'], (old: any) => {
                if (Array.isArray(old)) {
                    return old.filter((c: any) => c.id !== id);
                }
                return old;
            });

            return { previousColis };
        },

        onError: (err, id, context: any) => {
            if (context?.previousColis) {
                queryClient.setQueryData(['colis'], context.previousColis);
            }
            message.error('Erreur lors de la suppression');
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['colis'] });
        },

        onSuccess: () => {
            message.success('Colis supprimé avec succès');
        },
    });
};

/**
 * Hook pour optimistic facture generation
 */
export const useOptimisticFactureGeneration = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (colisId: number) => {
            const response = await fetch(`/api/factures/generate/${colisId}`, {
                method: 'POST',
            });
            return response.json();
        },

        onMutate: async (colisId) => {
            // Optimistic: ajouter une facture "en cours de génération"
            const tempFacture = {
                id: 'temp',
                num_facture: 'Génération...',
                etat: 0,
                loading: true,
            };

            queryClient.setQueryData(['factures'], (old: any) => {
                if (Array.isArray(old)) {
                    return [tempFacture, ...old];
                }
                return [tempFacture];
            });
        },

        onSuccess: (newFacture) => {
            // Remplacer la facture temporaire par la vraie
            queryClient.setQueryData(['factures'], (old: any) => {
                if (Array.isArray(old)) {
                    return old.map((f: any) => (f.id === 'temp' ? newFacture : f));
                }
                return [newFacture];
            });
            message.success('Facture générée avec succès');
        },

        onError: () => {
            // Retirer la facture temporaire
            queryClient.setQueryData(['factures'], (old: any) => {
                if (Array.isArray(old)) {
                    return old.filter((f: any) => f.id !== 'temp');
                }
                return old;
            });
            message.error('Erreur lors de la génération de la facture');
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['factures'] });
        },
    });
};
