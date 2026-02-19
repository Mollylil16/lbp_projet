/**
 * Hook centralisé pour la gestion offline :
 * - Détection réseau en temps réel
 * - Compteur d'actions en attente
 * - Synchronisation manuelle ou automatique
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { syncPendingActions, countPendingActions } from '@utils/offlineSync';
import { queryClient } from '@config/queryClient';

export interface OfflineState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncAt: Date | null;
  syncNow: () => Promise<void>;
  refreshPendingCount: () => Promise<void>;
}

export const useOffline = (): OfflineState => {
  const [isOnline, setIsOnline] = useState(() =>
    typeof window !== 'undefined' ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const syncingRef = useRef(false);

  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await countPendingActions();
      setPendingCount(count);
    } catch {
      // IndexedDB non disponible, ignorer
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) return;
    syncingRef.current = true;
    setIsSyncing(true);

    try {
      const result = await syncPendingActions();
      if (result.success > 0) {
        // Invalider les caches TanStack Query pour rafraîchir les données
        queryClient.invalidateQueries();
      }
      await refreshPendingCount();
      setLastSyncAt(new Date());
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  }, [refreshPendingCount]);

  useEffect(() => {
    refreshPendingCount();

    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync dès qu'on repasse en ligne
      setTimeout(() => syncNow(), 1500);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Rafraîchir le compteur toutes les 30 secondes
    const interval = setInterval(refreshPendingCount, 30_000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [syncNow, refreshPendingCount]);

  return { isOnline, isSyncing, pendingCount, lastSyncAt, syncNow, refreshPendingCount };
};
