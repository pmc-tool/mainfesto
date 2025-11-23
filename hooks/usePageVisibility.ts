'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { CONFIG } from '@/lib/utils/constants';

interface UsePageVisibilityReturn {
  visiblePages: number[];
  activePage: number;
  registerPage: (pageNumber: number, element: HTMLElement) => void;
  unregisterPage: (pageNumber: number) => void;
}

/**
 * Hook for tracking page visibility using IntersectionObserver
 * @returns Visible pages, active page, and registration functions
 */
export const usePageVisibility = (): UsePageVisibilityReturn => {
  const [visiblePages, setVisiblePages] = useState<number[]>([]);
  const [activePage, setActivePage] = useState<number>(1);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const pageElementsRef = useRef<Map<number, HTMLElement>>(new Map());

  useEffect(() => {
    // Create IntersectionObserver for tracking visibility
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const pageNumber = parseInt(
            entry.target.getAttribute('data-page-number') || '0',
            10
          );

          if (!pageNumber) return;

          if (entry.isIntersecting) {
            setVisiblePages((prev) => {
              if (prev.includes(pageNumber)) return prev;
              return [...prev, pageNumber].sort((a, b) => a - b);
            });

            // Update active page if this page is >50% visible
            if (entry.intersectionRatio >= CONFIG.ACTIVE_PAGE_THRESHOLD) {
              setActivePage(pageNumber);
            }
          } else {
            setVisiblePages((prev) => prev.filter((p) => p !== pageNumber));
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: [0, CONFIG.ACTIVE_PAGE_THRESHOLD, 1],
      }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const registerPage = useCallback((pageNumber: number, element: HTMLElement) => {
    pageElementsRef.current.set(pageNumber, element);
    observerRef.current?.observe(element);
  }, []);

  const unregisterPage = useCallback((pageNumber: number) => {
    const element = pageElementsRef.current.get(pageNumber);
    if (element) {
      observerRef.current?.unobserve(element);
      pageElementsRef.current.delete(pageNumber);
    }
  }, []);

  return {
    visiblePages,
    activePage,
    registerPage,
    unregisterPage,
  };
};
