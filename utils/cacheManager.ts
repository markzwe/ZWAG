// Cache management utilities for outfits
export class OutfitCacheManager {
  private static instance: OutfitCacheManager;
  private cache = new Map<string, any>();
  private cacheTimestamps = new Map<string, number>();
  private subscribers = new Set<() => void>();

  static getInstance(): OutfitCacheManager {
    if (!OutfitCacheManager.instance) {
      OutfitCacheManager.instance = new OutfitCacheManager();
    }
    return OutfitCacheManager.instance;
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
  set(key: string, value: any, ttl: number = 5 * 60 * 1000) {
    this.cache.set(key, value);
    this.cacheTimestamps.set(key, Date.now() + ttl);
    this.notifySubscribers();
  }

  // Get from cache if not expired
  get(key: string): any | null {
    const value = this.cache.get(key);
    const expiry = this.cacheTimestamps.get(key);
    
    if (!value || !expiry) return null;
    
    if (Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
      return null;
    }
    
    return value;
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Clear specific key
  delete(key: string) {
    this.cache.delete(key);
    this.cacheTimestamps.delete(key);
    this.notifySubscribers();
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.cacheTimestamps.clear();
    this.notifySubscribers();
  }

  // Clean expired entries
  cleanup() {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    this.cacheTimestamps.forEach((expiry, key) => {
      if (now > expiry) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => {
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
    });
    
    if (expiredKeys.length > 0) {
      this.notifySubscribers();
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
      memoryUsage: JSON.stringify(Array.from(this.cache.values())).length,
    };
  }

  // Invalidate outfit-related cache (for after delete/update operations)
  invalidateOutfits() {
    const outfitKeys = Array.from(this.cache.keys()).filter(key => 
      key.startsWith('outfit_') || key === 'outfits_list'
    );
    
    outfitKeys.forEach(key => this.delete(key));
  }
}

// Hook to use the cache manager
export function useCacheManager() {
  const cacheManager = OutfitCacheManager.getInstance();
  
  return {
    cacheManager,
    invalidateOutfits: () => cacheManager.invalidateOutfits(),
    clearCache: () => cacheManager.clear(),
    getStats: () => cacheManager.getStats(),
  };
}
