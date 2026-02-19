import { QueryClient } from '@tanstack/react-query';
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';
import toast from 'react-hot-toast';
import { persistentCache } from '@utils/cachePersistent';

// ─── QueryClient central ─────────────────────────────────────────────────────

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,        // 5 min — données fraîches
            gcTime: 30 * 60 * 1000,           // 30 min — survie en mémoire
            networkMode: 'offlineFirst',       // Lire le cache même hors ligne
            retry: (failureCount, error: any) => {
                if (error?.response?.status >= 400 && error?.response?.status < 500) {
                    return false;
                }
                return failureCount < 2;
            },
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            refetchOnMount: false,
            structuralSharing: true,
        },
        mutations: {
            networkMode: 'offlineFirst',      // Permettre les mutations offline
            retry: false,
            onError: (error: any) => {
                console.error('Mutation error:', error);
                const status = error?.response?.status;
                const message = error?.response?.data?.message || error?.message;

                if (status === 401) {
                    toast.error('Session expirée, veuillez vous reconnecter.');
                } else if (status === 403) {
                    toast.error('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
                } else if (status === 404) {
                    toast.error('Ressource introuvable.');
                } else if (status === 422 || status === 400) {
                    toast.error(message || 'Données invalides. Vérifiez le formulaire.');
                } else if (status >= 500) {
                    toast.error('Erreur serveur. Veuillez réessayer plus tard.');
                } else if (!navigator.onLine) {
                    toast('Action mise en attente — vous êtes hors ligne.', { icon: '📶' });
                } else {
                    toast.error(message || 'Une erreur est survenue.');
                }
            },
        },
    },
});

// ─── Persister IndexedDB (TanStack Query persist-client) ─────────────────────

const IDB_CACHE_KEY = 'tanstack_query_cache';
const IDB_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 h

export const idbPersister: Persister = {
    persistClient: async (client: PersistedClient) => {
        await persistentCache.set(IDB_CACHE_KEY, client, IDB_CACHE_TTL);
    },
    restoreClient: async (): Promise<PersistedClient | undefined> => {
        const cached = await persistentCache.get<PersistedClient>(IDB_CACHE_KEY);
        return cached ?? undefined;
    },
    removeClient: async () => {
        await persistentCache.delete(IDB_CACHE_KEY);
    },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const prefetchQuery = async (queryKey: unknown[], queryFn: () => Promise<unknown>) => {
    await queryClient.prefetchQuery({ queryKey, queryFn });
};

export const invalidateQueries = (queryKey: unknown[]) => {
    queryClient.invalidateQueries({ queryKey });
};

export const setQueryData = (queryKey: unknown[], updater: unknown) => {
    queryClient.setQueryData(queryKey, updater);
};
