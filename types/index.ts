/**
 * Core type definitions for the UWP Manifesto Reader
 */

export type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

export interface PDFDocument {
  id: string;
  numPages: number;
  url: string;
  loadingState: LoadingState;
  errorMessage?: string;
}

export interface Page {
  pageNumber: number;
  textContent: string;
  renderState: 'idle' | 'rendering' | 'rendered' | 'error';
  isVisible: boolean;
  isActive: boolean;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface Section {
  id: string;
  title: string;
  shortLabel: string;
  pageNumber: number;
}

export interface SearchMatch {
  id: string;
  pageNumber: number;
  matchIndexOnPage: number;
  globalIndex: number;
  startOffset: number;
  endOffset: number;
  matchedText: string;
  isActive: boolean;
}

export interface SearchState {
  isOpen: boolean;
  query: string;
  results: {
    query: string;
    matches: SearchMatch[];
    totalMatches: number;
    currentMatchIndex: number;
  } | null;
  isSearching: boolean;
}

export interface ViewState {
  activePage: number;
  visiblePages: number[];
  scrollProgress: number;
}

// PDF.js types (re-exported for convenience)
export type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
