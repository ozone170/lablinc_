import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for infinite scroll
 * @param {function} callback - Function to call when reaching bottom
 * @param {boolean} hasMore - Whether there are more items to load
 * @param {boolean} loading - Whether currently loading
 * @returns {object} - Ref to attach to scrollable element
 */
export const useInfiniteScroll = (callback, hasMore = true, loading = false) => {
  const observer = useRef();
  const lastElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          callback();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, callback]
  );

  return { lastElementRef };
};

/**
 * Alternative: Hook for scroll event based infinite scroll
 */
export const useScrollInfinite = (callback, hasMore = true, loading = false) => {
  const containerRef = useRef();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (loading || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      // Trigger when 100px from bottom
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        callback();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [callback, hasMore, loading]);

  return { containerRef };
};
