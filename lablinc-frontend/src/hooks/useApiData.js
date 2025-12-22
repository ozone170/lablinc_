import { useState, useEffect, useCallback, useRef } from 'react';
import { config } from '../config/environment.js';

/**
 * Custom hook for API data fetching with comprehensive loading and error states
 * 
 * @param {Function} fetchFunction - Function that returns a Promise for the API call
 * @param {Object} options - Configuration options
 * @returns {Object} - State and control functions
 */
export const useApiData = (fetchFunction, options = {}) => {
  const {
    immediate = true,
    dependencies = [],
    onSuccess = null,
    onError = null,
    retryAttempts = config.retryAttempts || 3,
    retryDelay = config.retryDelay || 1000,
    cacheKey = null,
    cacheDuration = 5 * 60 * 1000, // 5 minutes default
    enableOfflineCache = true
  } = options;

  // State management
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFetch, setLastFetch] = useState(null);

  // Refs for cleanup and control
  const abortControllerRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cache management
  const getCacheKey = useCallback(() => {
    if (!cacheKey) return null;
    return typeof cacheKey === 'function' ? cacheKey() : cacheKey;
  }, [cacheKey]);

  const getCachedData = useCallback(() => {
    if (!enableOfflineCache) return null;
    
    const key = getCacheKey();
    if (!key) return null;

    try {
      const cached = localStorage.getItem(`api_cache_${key}`);
      if (!cached) return null;

      const { data: cachedData, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > cacheDuration;
      
      if (isExpired) {
        localStorage.removeItem(`api_cache_${key}`);
        return null;
      }

      return cachedData;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }, [getCacheKey, enableOfflineCache, cacheDuration]);

  const setCachedData = useCallback((data) => {
    if (!enableOfflineCache) return;
    
    const key = getCacheKey();
    if (!key) return;

    try {
      const cacheEntry = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(`api_cache_${key}`, JSON.stringify(cacheEntry));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }, [getCacheKey, enableOfflineCache]);

  // Fetch function with retry logic
  const fetchData = useCallback(async (isRetry = false) => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    if (!isRetry) {
      setLoading(true);
      setError(null);
      setRetryCount(0);
    }

    try {
      // Check for cached data if offline
      if (!navigator.onLine && enableOfflineCache) {
        const cachedData = getCachedData();
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          setLastFetch(Date.now());
          return cachedData;
        }
      }

      // Execute the fetch function
      const result = await fetchFunction({
        signal: abortControllerRef.current.signal
      });

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setData(result);
        setError(null);
        setRetryCount(0);
        setLastFetch(Date.now());

        // Cache the successful result
        setCachedData(result);

        // Call success callback
        if (onSuccess) {
          onSuccess(result);
        }
      }

      return result;
    } catch (err) {
      // Don't handle aborted requests
      if (err.name === 'AbortError') {
        return;
      }

      // Only update state if component is still mounted
      if (!isMountedRef.current) {
        return;
      }

      // Determine if we should retry
      const shouldRetry = retryCount < retryAttempts && 
                         !err.response?.status?.toString().startsWith('4'); // Don't retry 4xx errors

      if (shouldRetry) {
        const nextRetryCount = retryCount + 1;
        setRetryCount(nextRetryCount);

        if (config.enableLogging) {
          console.warn(`API request failed, retrying (${nextRetryCount}/${retryAttempts}):`, err.message);
        }

        // Schedule retry with exponential backoff
        const delay = retryDelay * Math.pow(2, retryCount);
        retryTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            fetchData(true);
          }
        }, delay);
      } else {
        // No more retries, set error state
        setError(err);
        setLoading(false);

        // Try to load cached data as fallback
        if (enableOfflineCache) {
          const cachedData = getCachedData();
          if (cachedData) {
            setData(cachedData);
            // Keep error state to show stale data warning
          }
        }

        // Call error callback
        if (onError) {
          onError(err);
        }

        if (config.enableLogging) {
          console.error('API request failed after all retries:', err);
        }
      }
    } finally {
      if (isMountedRef.current && !retryTimeoutRef.current) {
        setLoading(false);
      }
    }
  }, [
    fetchFunction, 
    retryCount, 
    retryAttempts, 
    retryDelay, 
    onSuccess, 
    onError,
    getCachedData,
    setCachedData,
    enableOfflineCache
  ]);

  // Manual refetch function
  const refetch = useCallback(() => {
    setRetryCount(0);
    return fetchData(false);
  }, [fetchData]);

  // Clear data function
  const clearData = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setRetryCount(0);
    setLastFetch(null);

    // Clear cache
    const key = getCacheKey();
    if (key) {
      localStorage.removeItem(`api_cache_${key}`);
    }
  }, [getCacheKey]);

  // Cancel ongoing request
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    setLoading(false);
  }, []);

  // Effect for initial fetch and dependency changes
  useEffect(() => {
    if (immediate) {
      fetchData();
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Derived state
  const isRetrying = retryCount > 0 && loading;
  const hasData = data !== null;
  const isStale = error && hasData; // Has cached data but current request failed
  const isEmpty = !loading && !error && !hasData;

  return {
    // Data state
    data,
    loading,
    error,
    
    // Status flags
    isRetrying,
    hasData,
    isStale,
    isEmpty,
    retryCount,
    lastFetch,
    
    // Control functions
    refetch,
    clearData,
    cancel,
    
    // Utility functions
    getCachedData,
    setCachedData
  };
};

/**
 * Hook for paginated API data
 */
export const usePaginatedApiData = (fetchFunction, options = {}) => {
  const {
    pageSize = 20,
    initialPage = 1,
    ...apiOptions
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const paginatedFetchFunction = useCallback(async (requestOptions) => {
    const result = await fetchFunction({
      ...requestOptions,
      page: currentPage,
      limit: pageSize
    });

    // Update pagination info
    if (result && typeof result === 'object') {
      if (result.totalPages !== undefined) setTotalPages(result.totalPages);
      if (result.totalItems !== undefined) setTotalItems(result.totalItems);
      if (result.total !== undefined) setTotalItems(result.total);
      
      // Return the actual data
      return result.data || result.items || result;
    }

    return result;
  }, [fetchFunction, currentPage, pageSize]);

  const apiState = useApiData(paginatedFetchFunction, {
    ...apiOptions,
    dependencies: [currentPage, pageSize, ...(apiOptions.dependencies || [])]
  });

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  return {
    ...apiState,
    
    // Pagination state
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    
    // Pagination controls
    goToPage,
    nextPage,
    prevPage,
    
    // Pagination flags
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages
  };
};

export default useApiData;