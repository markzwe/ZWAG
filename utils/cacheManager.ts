// Cache management utilities for outfits
import { Logger, ErrorHandler } from './errorHandler';
import { UI_CONSTANTS } from '@/constants/app';

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class OutfitCacheManager {
  private static instance: OutfitCacheManager;
  private cache = new Map<string, CacheEntry>();
  private subscribers = new Set<() => void>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  static getInstance(): OutfitCacheManager {
    if (!OutfitCacheManager.instance) {
      OutfitCacheManager.instance = new OutfitCacheManager();
    }
    return OutfitCacheManager.instance;
  }

  private constructor() {
    // Start periodic cleanup
    this.startCleanupInterval();
    Logger.debug('OutfitCacheManager initialized');
  }

  // Subscribe to cache changes
  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // Notify all subscribers of cache changes
  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  // Set cache with expiry
  set<T>(key: string, value: T, ttl: number = UI_CONSTANTS.CACHE_TTL): void {
    try {
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl,
      };
      this.cache.set(key, entry);
      Logger.debug(`Cache set: ${key}`, { ttl });
      this.notifySubscribers();
    } catch (error) {
      Logger.error('Failed to set cache entry', error, { key });
      throw ErrorHandler.handleCacheError(error);
    }
  }

  // Get from cache if not expired
  get<T>(key: string): T | null {
    try {
      const entry = this.cache.get(key);
      
      if (!entry) {
        Logger.debug(`Cache miss: ${key}`);
        return null;
      }
      
      const now = Date.now();
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key);
        Logger.debug(`Cache expired: ${key}`);
        return null;
      }
      
      Logger.debug(`Cache hit: ${key}`);
      return entry.data as T;
    } catch (error) {
      Logger.error('Failed to get cache entry', error, { key });
      return null;
    }
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    try {
      return this.get(key) !== null;
    } catch (error) {
      Logger.error('Failed to check cache entry', error, { key });
      return false;
    }
  }

  // Clear specific key
  delete(key: string): boolean {
    try {
      const deleted = this.cache.delete(key);
      if (deleted) {
        Logger.debug(`Cache deleted: ${key}`);
        this.notifySubscribers();
      }
      return deleted;
    } catch (error) {
      Logger.error('Failed to delete cache entry', error, { key });
      return false;
    }
  }

  // Clear all cache
  clear(): void {
    try {
      const size = this.cache.size;
      this.cache.clear();
      Logger.debug(`Cache cleared: ${size} entries removed`);
      this.notifySubscribers();
    } catch (error) {
      Logger.error('Failed to clear cache', error);
    }
  }

  // Clean expired entries
  cleanup(): void {
    try {
      const now = Date.now();
      const expiredKeys: string[] = [];
      
      this.cache.forEach((entry, key) => {
        if (now > entry.timestamp + entry.ttl) {
          expiredKeys.push(key);
        }
      });
      
      expiredKeys.forEach(key => {
        this.cache.delete(key);
      });
      
      if (expiredKeys.length > 0) {
        Logger.debug(`Cache cleanup: ${expiredKeys.length} expired entries removed`);
        this.notifySubscribers();
      }
    } catch (error) {
      Logger.error('Failed to cleanup cache', error);
    }
  }

  // Get cache statistics
  getStats() {
    try {
      const now = Date.now();
      const entries = Array.from(this.cache.entries());
      const expired = entries.filter(([, entry]) => now > entry.timestamp + entry.ttl);
      
      return {
        size: this.cache.size,
        expiredCount: expired.length,
        entries: Array.from(this.cache.keys()),
        memoryUsage: JSON.stringify(entries.map(([, entry]) => entry.data)).length,
        oldestEntry: entries.reduce((oldest, [key, entry]) => 
          !oldest || entry.timestamp < oldest.timestamp 
            ? { key, timestamp: entry.timestamp }
            : oldest
        , null as { key: string; timestamp: number } | null),
      };
    } catch (error) {
      Logger.error('Failed to get cache stats', error);
      return {
        size: 0,
        expiredCount: 0,
        entries: [],
        memoryUsage: 0,
        oldestEntry: null,
      };
    }
  }

  // Invalidate outfit-related cache (for after delete/update operations)
  invalidateOutfits(): void {
    try {
      const outfitKeys = Array.from(this.cache.keys()).filter(key => 
        key.startsWith('outfit_') || key === 'outfits_list'
      );
      
      outfitKeys.forEach(key => this.delete(key));
      Logger.debug(`Invalidated ${outfitKeys.length} outfit cache entries`);
    } catch (error) {
      Logger.error('Failed to invalidate outfit cache', error);
    }
  }

  // Start periodic cleanup
  private startCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    // Cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000) as ReturnType<typeof setInterval>;
  }

  // Stop cleanup interval (for testing or cleanup)
  stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Hook to use the cache manager
export function useCacheManager() {
  const cacheManager = OutfitCacheManager.getInstance();
  
  return {
    cacheManager,
    set: <T>(key: string, value: T, ttl?: number) => cacheManager.set(key, value, ttl),
    get: <T>(key: string) => cacheManager.get<T>(key),
    has: (key: string) => cacheManager.has(key),
    delete: (key: string) => cacheManager.delete(key),
    invalidateOutfits: () => cacheManager.invalidateOutfits(),
    clearCache: () => cacheManager.clear(),
    getStats: () => cacheManager.getStats(),
  };
}
