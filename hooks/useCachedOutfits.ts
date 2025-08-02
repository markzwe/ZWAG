import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useMemo, useRef } from "react";

// Custom hook for caching outfits with advanced caching strategies
export function useCachedOutfits() {
  const outfits = useQuery(api.outfits.getOutfits);
  const cacheRef = useRef<any[]>([]);
  const lastFetchTimeRef = useRef<number>(0);
  
  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;
  
  // Memoized and cached outfits
  const cachedOutfits = useMemo(() => {
    const now = Date.now();
    
    // If we have fresh data from the query, update cache
    if (outfits && Array.isArray(outfits)) {
      const processedOutfits = outfits.map(outfit => ({
        ...outfit,
        // Create stable cache keys
        cacheKey: `${outfit._id}_${outfit._creationTime}`,
        // Add cached timestamp
        cachedAt: now,
      }));
      
      cacheRef.current = processedOutfits;
      lastFetchTimeRef.current = now;
      return processedOutfits;
    }
    
    // If query is loading but we have cached data that's still fresh, use it
    if (
      cacheRef.current.length > 0 && 
      (now - lastFetchTimeRef.current) < CACHE_DURATION
    ) {
      return cacheRef.current;
    }
    
    // Return empty array if no cache or cache is stale
    return [];
  }, [outfits]);

  // Cache statistics for debugging
  const cacheStats = useMemo(() => ({
    itemCount: cachedOutfits.length,
    lastUpdate: lastFetchTimeRef.current,
    isCacheHit: outfits === undefined && cachedOutfits.length > 0,
    cacheAge: Date.now() - lastFetchTimeRef.current,
  }), [cachedOutfits.length, outfits]);

  return {
    outfits: cachedOutfits,
    isLoading: outfits === undefined && cachedOutfits.length === 0,
    cacheStats,
  };
}

// Advanced caching hook with manual cache control
export function useAdvancedOutfitCache() {
  const outfits = useQuery(api.outfits.getOutfits);
  const cacheRef = useRef(new Map<string, any>());
  
  const cachedOutfits = useMemo(() => {
    if (!outfits) return Array.from(cacheRef.current.values());
    
    // Update cache with new data
    outfits.forEach(outfit => {
      const cacheKey = `${outfit._id}_${outfit._creationTime}`;
      cacheRef.current.set(cacheKey, {
        ...outfit,
        cacheKey,
        lastAccessed: Date.now(),
      });
    });
    
    // Clean up old cache entries (keep last 100 items)
    const cacheEntries = Array.from(cacheRef.current.entries());
    if (cacheEntries.length > 100) {
      // Sort by last accessed time and keep most recent
      cacheEntries
        .sort((a, b) => b[1].lastAccessed - a[1].lastAccessed)
        .slice(100)
        .forEach(([key]) => cacheRef.current.delete(key));
    }
    
    return Array.from(cacheRef.current.values())
      .sort((a, b) => b._creationTime - a._creationTime);
  }, [outfits]);

  const clearCache = () => {
    cacheRef.current.clear();
  };

  const getCacheSize = () => cacheRef.current.size;

  return {
    outfits: cachedOutfits,
    isLoading: outfits === undefined && cachedOutfits.length === 0,
    clearCache,
    getCacheSize,
  };
}
