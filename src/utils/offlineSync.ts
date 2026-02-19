/**
 * Synchronisation offline — queue persistante IndexedDB + retry exponentiel
 */
import { persistentCache, type PendingAction } from './cachePersistent';
import { apiService } from '@services/api.service';

export type { PendingAction };

// ─── Dispatch automatique par type d'action ──────────────────────────────────

const dispatch = async (action: PendingAction): Promise<unknown> => {
  const { type, endpoint, data } = action;
  switch (type) {
    case 'CREATE': return apiService.post(endpoint, data);
    case 'UPDATE': return apiService.put(endpoint, data);
    case 'PATCH':  return apiService.patch(endpoint, data);
    case 'DELETE': return apiService.delete(endpoint);
    default:       throw new Error(`Unknown action type: ${type}`);
  }
};

// ─── API publique ────────────────────────────────────────────────────────────

/**
 * Ajouter une action à la file d'attente offline
 */
export const enqueueAction = async (
  action: Omit<PendingAction, 'id' | 'timestamp' | 'retries'>
): Promise<string> => {
  const id = await persistentCache.addPendingAction(action);
  console.log(`[OfflineSync] Action ${action.type} enqueued: ${id}`);
  return id;
};

/**
 * Récupérer toutes les actions en attente
 */
export const getPendingActions = (): Promise<PendingAction[]> =>
  persistentCache.getPendingActions();

/**
 * Nombre d'actions en attente
 */
export const countPendingActions = (): Promise<number> =>
  persistentCache.countPendingActions();

/**
 * Synchroniser toutes les actions en attente avec backoff exponentiel
 * Retourne le nombre d'actions réussies
 */
export const syncPendingActions = async (): Promise<{ success: number; failed: number }> => {
  const actions = await persistentCache.getPendingActions();
  if (actions.length === 0) return { success: 0, failed: 0 };

  console.log(`[OfflineSync] Synchronizing ${actions.length} pending actions…`);
  let success = 0;
  let failed = 0;

  for (const action of actions) {
    if (action.retries >= action.maxRetries) {
      console.warn(`[OfflineSync] Action ${action.id} exceeded max retries, discarding`);
      await persistentCache.removePendingAction(action.id);
      failed++;
      continue;
    }

    try {
      await dispatch(action);
      await persistentCache.removePendingAction(action.id);
      console.log(`[OfflineSync] ✅ Action ${action.id} synced`);
      success++;
    } catch (error) {
      const updated: PendingAction = { ...action, retries: action.retries + 1 };
      await persistentCache.updatePendingAction(updated);
      console.error(`[OfflineSync] ❌ Action ${action.id} failed (attempt ${updated.retries}/${action.maxRetries}):`, error);
    }
  }

  console.log(`[OfflineSync] Done: ${success} success, ${failed} failed`);
  return { success, failed };
};

// ─── Compatibilité / données offline lecture seule ────────────────────────────

export const saveOfflineData = (key: string, data: unknown): void => {
  persistentCache.set(`offline_${key}`, data, 24 * 60 * 60 * 1000).catch((err) =>
    console.error(`[OfflineSync] Save error for ${key}:`, err)
  );
};

export const getOfflineData = async <T>(key: string): Promise<T | null> =>
  persistentCache.get<T>(`offline_${key}`);

export const isOffline = (): boolean => !navigator.onLine;
