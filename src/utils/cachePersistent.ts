/**
 * Service de cache persistant avec IndexedDB
 * Permet de stocker des données importantes pour l'offline
 */

export interface PendingAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'PATCH';
  resource: string;
  endpoint: string;
  data?: unknown;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

class PersistentCacheService {
  private dbName = 'lbp_cache';
  private dbVersion = 2; // Bumped for pending_actions store
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialiser IndexedDB
   */
  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB is not supported'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        this.initPromise = null;
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('drafts')) {
          db.createObjectStore('drafts', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('pending_actions')) {
          const pendingStore = db.createObjectStore('pending_actions', { keyPath: 'id' });
          pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
          pendingStore.createIndex('resource', 'resource', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  private async getDb(): Promise<IDBDatabase> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error('Database not initialized');
    return this.db;
  }

  // ─── Cache store ────────────────────────────────────────────────────────────

  async set(key: string, data: unknown, ttl?: number): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put({
        key,
        data,
        timestamp: Date.now(),
        ttl: ttl ? Date.now() + ttl : null,
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onsuccess = () => {
        const cacheItem = request.result;
        if (!cacheItem) { resolve(null); return; }
        if (cacheItem.ttl && Date.now() > cacheItem.ttl) {
          this.delete(key);
          resolve(null);
          return;
        }
        resolve(cacheItem.data as T);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async delete(key: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async cleanExpired(): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const index = store.index('timestamp');
      const request = index.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const cacheItem = cursor.value;
          if (cacheItem.ttl && Date.now() > cacheItem.ttl) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ─── Preferences store ───────────────────────────────────────────────────────

  async savePreference(key: string, value: unknown): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['preferences'], 'readwrite');
      const store = transaction.objectStore('preferences');
      const request = store.put({ key, value, timestamp: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPreference<T>(key: string): Promise<T | null> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['preferences'], 'readonly');
      const store = transaction.objectStore('preferences');
      const request = store.get(key);
      request.onsuccess = () => {
        const item = request.result;
        resolve(item ? item.value : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ─── Pending actions store ──────────────────────────────────────────────────

  async addPendingAction(action: Omit<PendingAction, 'id' | 'timestamp' | 'retries'>): Promise<string> {
    const db = await this.getDb();
    const newAction: PendingAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      retries: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pending_actions'], 'readwrite');
      const store = transaction.objectStore('pending_actions');
      const request = store.put(newAction);
      request.onsuccess = () => resolve(newAction.id);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingActions(): Promise<PendingAction[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pending_actions'], 'readonly');
      const store = transaction.objectStore('pending_actions');
      const index = store.index('timestamp');
      const request = index.getAll();
      request.onsuccess = () => resolve(request.result as PendingAction[]);
      request.onerror = () => reject(request.error);
    });
  }

  async removePendingAction(id: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pending_actions'], 'readwrite');
      const store = transaction.objectStore('pending_actions');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updatePendingAction(action: PendingAction): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pending_actions'], 'readwrite');
      const store = transaction.objectStore('pending_actions');
      const request = store.put(action);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async countPendingActions(): Promise<number> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pending_actions'], 'readonly');
      const store = transaction.objectStore('pending_actions');
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const persistentCache = new PersistentCacheService();

if (typeof window !== 'undefined') {
  persistentCache.init().catch((error) => {
    console.warn('Failed to initialize persistent cache:', error);
  });

  setInterval(() => {
    persistentCache.cleanExpired().catch((error) => {
      console.warn('Failed to clean expired cache:', error);
    });
  }, 60 * 60 * 1000);
}
