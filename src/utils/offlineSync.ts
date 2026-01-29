/**
 * Utilitaires pour la synchronisation offline
 */

interface PendingAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  resource: string;
  data: any;
  timestamp: number;
  retries: number;
}

const STORAGE_KEY = 'lbp_pending_actions';
const MAX_RETRIES = 3;

/**
 * Sauvegarder une action en attente
 */
export const savePendingAction = (action: Omit<PendingAction, 'id' | 'timestamp' | 'retries'>): string => {
  const pendingActions = getPendingActions();
  const newAction: PendingAction = {
    ...action,
    id: `${Date.now()}-${Math.random()}`,
    timestamp: Date.now(),
    retries: 0,
  };

  pendingActions.push(newAction);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingActions));
  return newAction.id;
};

/**
 * Récupérer toutes les actions en attente
 */
export const getPendingActions = (): PendingAction[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

/**
 * Supprimer une action en attente
 */
export const removePendingAction = (id: string): void => {
  const pendingActions = getPendingActions();
  const filtered = pendingActions.filter((action) => action.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

/**
 * Incrémenter le nombre de tentatives pour une action
 */
export const incrementRetry = (id: string): void => {
  const pendingActions = getPendingActions();
  const action = pendingActions.find((a) => a.id === id);
  if (action) {
    action.retries += 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingActions));
  }
};

/**
 * Synchroniser les actions en attente avec le serveur
 */
export const syncPendingActions = async (apiCall: (action: PendingAction) => Promise<any>): Promise<void> => {
  const pendingActions = getPendingActions();
  const toRemove: string[] = [];

  for (const action of pendingActions) {
    if (action.retries >= MAX_RETRIES) {
      console.warn(`[OfflineSync] Action ${action.id} a dépassé le nombre maximum de tentatives`);
      toRemove.push(action.id);
      continue;
    }

    try {
      await apiCall(action);
      toRemove.push(action.id);
      console.log(`[OfflineSync] Action ${action.id} synchronisée avec succès`);
    } catch (error) {
      incrementRetry(action.id);
      console.error(`[OfflineSync] Erreur lors de la synchronisation de l'action ${action.id}:`, error);
    }
  }

  // Supprimer les actions synchronisées ou ayant échoué
  toRemove.forEach((id) => removePendingAction(id));
};

/**
 * Vérifier si l'application est en mode offline
 */
export const isOffline = (): boolean => {
  return !navigator.onLine;
};

/**
 * Sauvegarder des données localement pour consultation offline
 */
export const saveOfflineData = (key: string, data: any): void => {
  try {
    localStorage.setItem(`lbp_offline_${key}`, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.error(`[OfflineSync] Erreur lors de la sauvegarde de ${key}:`, error);
  }
};

/**
 * Récupérer des données sauvegardées localement
 */
export const getOfflineData = <T>(key: string): T | null => {
  try {
    const stored = localStorage.getItem(`lbp_offline_${key}`);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed.data as T;
  } catch {
    return null;
  }
};
