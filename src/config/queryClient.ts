import { QueryClient } from '@tanstack/react-query';

/**
 * Configuration optimale de TanStack Query pour LBP
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // ✅ Cache intelligent
            staleTime: 5 * 60 * 1000, // 5 minutes - données considérées fraîches
            gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection (anciennement cacheTime)

            // ✅ Retry strategy
            retry: (failureCount, error: any) => {
                // Ne pas retry sur les erreurs 4xx (erreurs client)
                if (error?.response?.status >= 400 && error?.response?.status < 500) {
                    return false;
                }
                // Retry max 2 fois pour les erreurs serveur
                return failureCount < 2;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // ✅ Refetch strategies
            refetchOnWindowFocus: true, // Rafraîchir au focus de la fenêtre
            refetchOnReconnect: true, // Rafraîchir à la reconnexion
            refetchOnMount: false, // Ne pas refetch si données en cache

            // ✅ Performance
            structuralSharing: true, // Optimisation mémoire
        },
        mutations: {
            // ✅ Retry pour mutations
            retry: false, // Ne jamais retry les mutations automatiquement

            // ✅ Callbacks globaux
            onError: (error: any) => {
                console.error('Mutation error:', error);
                // TODO: Afficher notification d'erreur globale
            },
        },
    },
});

/**
 * Préfetch helper pour charger les données à l'avance
 */
export const prefetchQuery = async (queryKey: any[], queryFn: () => Promise<any>) => {
    await queryClient.prefetchQuery({
        queryKey,
        queryFn,
    });
};

/**
 * Invalidate helper pour forcer le rafraîchissement
 */
export const invalidateQueries = (queryKey: any[]) => {
    queryClient.invalidateQueries({ queryKey });
};

/**
 * Set query data helper pour optimistic updates
 */
export const setQueryData = (queryKey: any[], updater: any) => {
    queryClient.setQueryData(queryKey, updater);
};
