'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SearchState } from '@/types';
import { search } from '@/lib/search/searchEngine';
import { CONFIG } from '@/lib/utils/constants';
import { isValidSearchQuery } from '@/lib/utils/validation';

interface UseSearchReturn extends SearchState {
  openSearch: () => void;
  closeSearch: () => void;
  setQuery: (query: string) => void;
  performSearch: () => void;
  nextMatch: () => void;
  previousMatch: () => void;
}

/**
 * Hook for managing search state and operations
 * @param pageTexts - Map of page number to text content
 * @returns Search state and control functions
 */
export const useSearch = (pageTexts: Map<number, string>): UseSearchReturn => {
  const [searchState, setSearchState] = useState<SearchState>({
    isOpen: false,
    query: '',
    results: null,
    isSearching: false,
  });

  const openSearch = useCallback(() => {
    setSearchState((prev) => ({ ...prev, isOpen: true }));
  }, []);

  const closeSearch = useCallback(() => {
    setSearchState({
      isOpen: false,
      query: '',
      results: null,
      isSearching: false,
    });
  }, []);

  const setQuery = useCallback((query: string) => {
    setSearchState((prev) => ({ ...prev, query }));
  }, []);

  const performSearch = useCallback(() => {
    if (!isValidSearchQuery(searchState.query)) {
      setSearchState((prev) => ({ ...prev, results: null }));
      return;
    }

    setSearchState((prev) => ({ ...prev, isSearching: true }));

    const matches = search(searchState.query, pageTexts);

    setSearchState((prev) => ({
      ...prev,
      results: {
        query: prev.query,
        matches,
        totalMatches: matches.length,
        currentMatchIndex: matches.length > 0 ? 0 : -1,
      },
      isSearching: false,
    }));
  }, [searchState.query, pageTexts]);

  const nextMatch = useCallback(() => {
    if (!searchState.results || searchState.results.matches.length === 0) return;

    const nextIndex =
      (searchState.results.currentMatchIndex + 1) % searchState.results.totalMatches;

    setSearchState((prev) => ({
      ...prev,
      results: prev.results
        ? {
            ...prev.results,
            currentMatchIndex: nextIndex,
          }
        : null,
    }));
  }, [searchState.results]);

  const previousMatch = useCallback(() => {
    if (!searchState.results || searchState.results.matches.length === 0) return;

    const prevIndex =
      (searchState.results.currentMatchIndex - 1 + searchState.results.totalMatches) %
      searchState.results.totalMatches;

    setSearchState((prev) => ({
      ...prev,
      results: prev.results
        ? {
            ...prev.results,
            currentMatchIndex: prevIndex,
          }
        : null,
    }));
  }, [searchState.results]);

  // Debounced search on query change
  useEffect(() => {
    if (!searchState.isOpen) return;

    const timer = setTimeout(() => {
      if (searchState.query.trim()) {
        performSearch();
      } else {
        setSearchState((prev) => ({ ...prev, results: null }));
      }
    }, CONFIG.SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchState.query, searchState.isOpen, performSearch]);

  return {
    ...searchState,
    openSearch,
    closeSearch,
    setQuery,
    performSearch,
    nextMatch,
    previousMatch,
  };
};
