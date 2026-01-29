/**
 * Service de cache persistant avec IndexedDB
 * Permet de stocker des données importantes pour l'offline
 */

class PersistentCacheService {
  private dbName = 'lbp_cache'
  private dbVersion = 1
  private db: IDBDatabase | null = null

  /**
   * Initialiser IndexedDB
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB is not supported'))
        return
      }

      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Store pour les données de cache
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' })
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        // Store pour les préférences utilisateur
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'key' })
        }

        // Store pour les brouillons
        if (!db.objectStoreNames.contains('drafts')) {
          db.createObjectStore('drafts', { keyPath: 'key' })
        }
      }
    })
  }

  /**
   * Sauvegarder des données dans le cache
   */
  async set(key: string, data: any, ttl?: number): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')

      const cacheItem = {
        key,
        data,
        timestamp: Date.now(),
        ttl: ttl ? Date.now() + ttl : null,
      }

      const request = store.put(cacheItem)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Récupérer des données du cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction(['cache'], 'readonly')
      const store = transaction.objectStore('cache')
      const request = store.get(key)

      request.onsuccess = () => {
        const cacheItem = request.result

        if (!cacheItem) {
          resolve(null)
          return
        }

        // Vérifier si le cache a expiré
        if (cacheItem.ttl && Date.now() > cacheItem.ttl) {
          this.delete(key) // Supprimer le cache expiré
          resolve(null)
          return
        }

        resolve(cacheItem.data as T)
      }

      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Supprimer des données du cache
   */
  async delete(key: string): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Vider tout le cache
   */
  async clear(): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Nettoyer le cache expiré
   */
  async cleanExpired(): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      const index = store.index('timestamp')
      const request = index.openCursor()

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result

        if (cursor) {
          const cacheItem = cursor.value

          // Supprimer si expiré
          if (cacheItem.ttl && Date.now() > cacheItem.ttl) {
            cursor.delete()
          }

          cursor.continue()
        } else {
          resolve()
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Sauvegarder des préférences utilisateur
   */
  async savePreference(key: string, value: any): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction(['preferences'], 'readwrite')
      const store = transaction.objectStore('preferences')

      const request = store.put({ key, value, timestamp: Date.now() })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Récupérer une préférence utilisateur
   */
  async getPreference<T>(key: string): Promise<T | null> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction(['preferences'], 'readonly')
      const store = transaction.objectStore('preferences')
      const request = store.get(key)

      request.onsuccess = () => {
        const item = request.result
        resolve(item ? item.value : null)
      }

      request.onerror = () => reject(request.error)
    })
  }
}

export const persistentCache = new PersistentCacheService()

// Initialiser le cache au démarrage
if (typeof window !== 'undefined') {
  persistentCache.init().catch((error) => {
    console.warn('Failed to initialize persistent cache:', error)
  })

  // Nettoyer le cache expiré toutes les heures
  setInterval(() => {
    persistentCache.cleanExpired().catch((error) => {
      console.warn('Failed to clean expired cache:', error)
    })
  }, 60 * 60 * 1000) // 1 heure
}
