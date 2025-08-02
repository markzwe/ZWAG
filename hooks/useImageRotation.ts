import { useEffect, useMemo, useRef, useState } from 'react';

interface UseImageRotationProps {
  categories: Array<{
    name: string;
    images: string[];
  }>;
  intervalMs?: number;
}

/**
 * Custom hook for rotating through category images efficiently
 * Only starts timer if categories have multiple images
 * Automatically cleans up on unmount
 */
export function useImageRotation({ categories, intervalMs = 10000 }: UseImageRotationProps) {
  const [currentImageIndices, setCurrentImageIndices] = useState<Record<string, number>>({});
  const isMountedRef = useRef(true);

  // Initialize indices when categories change
  useEffect(() => {
    if (categories.length > 0) {
      const initialIndices: Record<string, number> = {};
      categories.forEach((category) => {
        initialIndices[category.name] = 0;
      });
      setCurrentImageIndices(initialIndices);
    }
  }, [categories]);

  // Set up rotation timer
  useEffect(() => {
    // Only start timer if we have categories with multiple images
    const hasRotatingImages = categories.some(cat => cat.images.length > 1);
    if (!hasRotatingImages) return;

    const interval = setInterval(() => {
      // Safety check for component mount status
      if (!isMountedRef.current) return;
      
      setCurrentImageIndices((prevIndices) => {
        const newIndices = { ...prevIndices };

        categories.forEach((category) => {
          if (category.images.length > 1) {
            const currentIndex = prevIndices[category.name] || 0;
            newIndices[category.name] = (currentIndex + 1) % category.images.length;
          }
        });

        return newIndices;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [categories, intervalMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Memoized function to get current image URL
  const getCurrentImageUrl = useMemo(() => {
    return (categoryName: string, images: string[], fallbackUrl?: string) => {
      if (images.length === 0) {
        return fallbackUrl || "https://i.ebayimg.com/images/g/gYkAAOSwaA5Wi0WK/s-l1200.jpg";
      }

      const currentIndex = currentImageIndices[categoryName] || 0;
      return images[currentIndex] || images[0];
    };
  }, [currentImageIndices]);

  return {
    currentImageIndices,
    getCurrentImageUrl,
  };
}
