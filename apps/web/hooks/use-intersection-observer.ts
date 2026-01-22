"use client";

import { useCallback, useRef } from "react";

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

/**
 * Hook that creates an intersection observer to detect when an element enters the viewport.
 * Useful for implementing infinite scroll functionality.
 *
 * @param callback - Function to call when the element becomes visible
 * @param options - IntersectionObserver options plus enabled flag
 * @returns A ref callback to attach to the sentinel element
 */
export function useIntersectionObserver(
  callback: () => void,
  options: UseIntersectionObserverOptions = {}
): (node: HTMLElement | null) => void {
  const { threshold = 0.1, rootMargin = "100px", enabled = true } = options;

  const observerRef = useRef<IntersectionObserver | null>(null);

  const setRef = useCallback(
    (node: HTMLElement | null) => {
      // Disconnect previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      // Don't observe if disabled or no node
      if (!(enabled && node)) {
        return;
      }

      // Create new observer
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry?.isIntersecting) {
            callback();
          }
        },
        {
          threshold,
          rootMargin,
        }
      );

      observerRef.current.observe(node);
    },
    [callback, threshold, rootMargin, enabled]
  );

  return setRef;
}
