/**
 * Performance Optimization Utilities
 * 
 * @description Provides utilities for optimizing React component performance
 * including debouncing, throttling, and memoization helpers
 * 
 * @module renderer/utils/performance
 */

/**
 * Debounces a function call
 * 
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 * 
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   performSearch(query);
 * }, 300);
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttles a function call
 * 
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 * 
 * @example
 * ```typescript
 * const throttledScroll = throttle(() => {
 *   handleScroll();
 * }, 100);
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Creates a memoized version of a function
 * 
 * @param {Function} func - Function to memoize
 * @returns {Function} Memoized function
 * 
 * @example
 * ```typescript
 * const memoizedCalculation = memoize((n: number) => {
 *   return expensiveCalculation(n);
 * });
 * ```
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, ReturnType<T>>();

  return function memoized(...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Delays execution of a function
 * 
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 * 
 * @example
 * ```typescript
 * await delay(1000); // Wait 1 second
 * console.log('Executed after delay');
 * ```
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Batches multiple function calls into a single execution
 * 
 * @param {Function} func - Function to batch
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Batched function
 * 
 * @example
 * ```typescript
 * const batchedUpdate = batch((items: string[]) => {
 *   updateUI(items);
 * }, 100);
 * ```
 */
export function batch<T>(
  func: (items: T[]) => void,
  wait: number
): (item: T) => void {
  let items: T[] = [];
  let timeout: NodeJS.Timeout | null = null;

  return function batchedFunction(item: T) {
    items.push(item);

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(items);
      items = [];
      timeout = null;
    }, wait);
  };
}

/**
 * Request animation frame wrapper for smooth animations
 * 
 * @param {Function} callback - Callback to execute
 * @returns {number} Animation frame ID
 * 
 * @example
 * ```typescript
 * const frameId = requestAnimationFrame(() => {
 *   updateAnimation();
 * });
 * ```
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;

  return function throttled(...args: Parameters<T>) {
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        func(...args);
        rafId = null;
      });
    }
  };
}

/**
 * Lazy loads a component with error boundary
 * 
 * @param {Function} importFunc - Dynamic import function
 * @returns {Promise<any>} Lazy loaded component
 * 
 * @example
 * ```typescript
 * const LazyComponent = lazyLoad(() => import('./HeavyComponent'));
 * ```
 */
export function lazyLoad<T>(
  importFunc: () => Promise<{ default: T }>
): () => Promise<{ default: T }> {
  return () =>
    importFunc().catch(error => {
      console.error('Failed to load component:', error);
      throw error;
    });
}

/**
 * Checks if two objects are shallowly equal
 * Useful for React.memo comparison functions
 * 
 * @param {Object} obj1 - First object
 * @param {Object} obj2 - Second object
 * @returns {boolean} True if objects are shallowly equal
 * 
 * @example
 * ```typescript
 * const MyComponent = React.memo(Component, (prev, next) => {
 *   return shallowEqual(prev, next);
 * });
 * ```
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) {
    return true;
  }

  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Creates a stable callback reference that doesn't change between renders
 * 
 * @param {Function} callback - Callback function
 * @returns {Function} Stable callback reference
 * 
 * @example
 * ```typescript
 * const stableCallback = useStableCallback((value: string) => {
 *   console.log(value);
 * });
 * ```
 */
export function createStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  let latestCallback = callback;

  const stableCallback = ((...args: Parameters<T>) => {
    return latestCallback(...args);
  }) as T;

  // Update the latest callback reference
  latestCallback = callback;

  return stableCallback;
}

/**
 * Measures component render time
 * 
 * @param {string} componentName - Name of the component
 * @returns {Function} Cleanup function
 * 
 * @example
 * ```typescript
 * useEffect(() => {
 *   const cleanup = measureRenderTime('MyComponent');
 *   return cleanup;
 * }, []);
 * ```
 */
export function measureRenderTime(componentName: string): () => void {
  const startTime = performance.now();

  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    if (renderTime > 16) {
      // Warn if render takes longer than one frame (16ms)
      console.warn(
        `[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`
      );
    }
  };
}

/**
 * Optimizes large list rendering by calculating visible items
 * 
 * @param {number} totalItems - Total number of items
 * @param {number} itemHeight - Height of each item
 * @param {number} containerHeight - Height of the container
 * @param {number} scrollTop - Current scroll position
 * @returns {Object} Visible range information
 * 
 * @example
 * ```typescript
 * const { startIndex, endIndex, offsetY } = getVisibleRange(
 *   1000, 50, 600, scrollTop
 * );
 * ```
 */
export function getVisibleRange(
  totalItems: number,
  itemHeight: number,
  containerHeight: number,
  scrollTop: number
): {
  startIndex: number;
  endIndex: number;
  offsetY: number;
  visibleItems: number;
} {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const visibleItems = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(startIndex + visibleItems + 1, totalItems);
  const offsetY = startIndex * itemHeight;

  return {
    startIndex,
    endIndex,
    offsetY,
    visibleItems,
  };
}

/**
 * Checks if code is running in production
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Checks if code is running in development
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

// Made with Bob