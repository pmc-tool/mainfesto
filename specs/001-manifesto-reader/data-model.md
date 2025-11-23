# Data Model: UWP Manifesto Reader

**Feature**: 001-manifesto-reader
**Date**: 2025-11-23
**Status**: Phase 1 Complete

## Purpose

This document defines all TypeScript interfaces, types, and data structures used in the UWP Manifesto Reader application. It captures the domain model without implementation details.

---

## Core Entities

### 1. PDFDocument

Represents the loaded PDF file and its metadata.

```typescript
interface PDFDocument {
  /**
   * Unique identifier for the PDF document
   * In our case: 'uwp-manifesto-2025'
   */
  id: string;

  /**
   * Total number of pages in the document
   * Constant: 78
   */
  numPages: number;

  /**
   * File path relative to public directory
   * Value: '/manifesto.pdf'
   */
  url: string;

  /**
   * Loading state of the document
   */
  loadingState: 'idle' | 'loading' | 'loaded' | 'error';

  /**
   * Error message if loadingState is 'error'
   */
  errorMessage?: string;

  /**
   * Reference to the PDF.js PDFDocumentProxy instance
   * (Implementation detail - stored separately in hook state)
   */
  _pdfProxy?: unknown; // Opaque reference, not exposed to components
}
```

**Validation Rules**:
- `numPages` must equal 78 (const assertion)
- `url` must be a valid file path
- `loadingState` transition: idle → loading → loaded|error

---

### 2. Page

Represents a single page from the manifesto.

```typescript
interface Page {
  /**
   * Page number (1-based index)
   * Range: 1 to 78
   */
  pageNumber: number;

  /**
   * Extracted text content from this page
   * Used for searching and native browser Ctrl+F
   */
  textContent: string;

  /**
   * Render state of this page
   */
  renderState: 'pending' | 'rendering' | 'rendered' | 'error';

  /**
   * Whether this page is currently visible in the viewport
   */
  isVisible: boolean;

  /**
   * Whether this page is the active/centered page
   */
  isActive: boolean;

  /**
   * Canvas dimensions for rendering
   * Calculated based on viewport width (responsive)
   */
  dimensions: {
    width: number;
    height: number;
    scale: number;
  };
}
```

**Validation Rules**:
- `pageNumber` must be 1 ≤ n ≤ 78
- `textContent` is populated during initial load (never null after load)
- `isActive` can only be true for one page at a time (enforced by state)
- `dimensions.scale` calculated to fit max-width 900-1000px on desktop

**State Transitions**:
```
pending → rendering → rendered
        ↓
      error (on render failure)
```

---

### 3. Section

Represents a navigable section of the manifesto (table of contents entry).

```typescript
interface Section {
  /**
   * Unique identifier (kebab-case)
   * Examples: 'leader', 'vision', 'agriculture'
   */
  id: string;

  /**
   * Full section title (desktop display)
   * Example: 'MESSAGE FROM OUR POLITICAL LEADER'
   */
  title: string;

  /**
   * Shortened label (mobile display)
   * Example: 'Leader'
   */
  shortLabel: string;

  /**
   * Page number where this section begins
   * Range: 1 to 78
   */
  pageNumber: number;

  /**
   * Whether this section is currently active (user is viewing its page)
   */
  isActive: boolean;
}
```

**Validation Rules**:
- Total of 12 sections (const array)
- `pageNumber` must match spec-defined mapping (see constants.ts)
- Section order must match page number order (ascending)
- `isActive` determined by comparing `pageNumber` to `activePage`

**Constant Data** (from spec):
```typescript
const SECTIONS: readonly Section[] = [
  { id: 'leader', title: 'MESSAGE FROM OUR POLITICAL LEADER', shortLabel: 'Leader', pageNumber: 4 },
  { id: 'vision', title: 'THE VISION', shortLabel: 'Vision', pageNumber: 10 },
  { id: 'recovery', title: 'A RECOVERY PROGRAMME', shortLabel: 'Recovery', pageNumber: 12 },
  { id: 'team', title: 'OUR TEAM', shortLabel: 'Team', pageNumber: 14 },
  { id: 'agenda', title: 'THE TRANSFORMATIVE AGENDA', shortLabel: 'Agenda', pageNumber: 16 },
  { id: 'agriculture', title: 'TRANSFORMING OUR AGRICULTURE AND FISHERIES SECTOR', shortLabel: 'Agriculture', pageNumber: 23 },
  { id: 'tourism', title: 'REVITALIZING THE TOURISM SECTOR', shortLabel: 'Tourism', pageNumber: 26 },
  { id: 'digital', title: 'BUILDING A VIBRANT DIGITAL ECONOMY', shortLabel: 'Digital', pageNumber: 32 },
  { id: 'trade', title: 'INVESTMENT, TRADE AND EXTERNAL RELATIONS', shortLabel: 'Trade', pageNumber: 38 },
  { id: 'infrastructure', title: 'INFRASTRUCTURE AND PORT DEVELOPMENT', shortLabel: 'Infra', pageNumber: 45 },
  { id: 'energy', title: 'SECURING OUR ENERGY FUTURE THROUGH RENEWABLES', shortLabel: 'Energy', pageNumber: 50 },
  { id: 'governance', title: 'GOVERNANCE AND LOCAL GOVERNMENT REFORM', shortLabel: 'Governance', pageNumber: 60 },
] as const;
```

---

### 4. SearchMatch

Represents a single occurrence of a search query within the manifesto.

```typescript
interface SearchMatch {
  /**
   * Unique identifier for this match
   * Format: `${pageNumber}-${matchIndex}`
   */
  id: string;

  /**
   * Page number where this match occurs
   * Range: 1 to 78
   */
  pageNumber: number;

  /**
   * Index of this match on the page (0-based)
   * Used when multiple matches exist on same page
   */
  matchIndexOnPage: number;

  /**
   * Global index of this match across all pages (0-based)
   * Used for "Match 3 of 12" counter
   */
  globalIndex: number;

  /**
   * Character offset where match starts in page text
   */
  startOffset: number;

  /**
   * Character offset where match ends in page text
   */
  endOffset: number;

  /**
   * The matched text (for verification/debugging)
   */
  matchedText: string;

  /**
   * Whether this is the currently active/highlighted match
   */
  isActive: boolean;
}
```

**Validation Rules**:
- `endOffset > startOffset`
- `endOffset - startOffset` equals search query length
- `matchedText` case-insensitive matches original query
- Only one match can have `isActive: true` at a time

**Derived Data**:
```typescript
interface SearchResults {
  /**
   * Original search query (case-preserved)
   */
  query: string;

  /**
   * Array of all matches found
   * Sorted by: pageNumber ASC, startOffset ASC
   */
  matches: SearchMatch[];

  /**
   * Total number of matches found
   */
  totalMatches: number;

  /**
   * Index of currently active match (0-based)
   * -1 if no active match
   */
  currentMatchIndex: number;
}
```

---

### 5. ViewportState

Tracks the current viewport and scroll position.

```typescript
interface ViewportState {
  /**
   * Current scroll position (pixels from top)
   */
  scrollY: number;

  /**
   * Viewport height (window.innerHeight)
   */
  viewportHeight: number;

  /**
   * Viewport width (window.innerWidth)
   */
  viewportWidth: number;

  /**
   * Currently active page number (most visible/centered)
   * Range: 1 to 78
   */
  activePage: number;

  /**
   * Array of page numbers currently in viewport
   * Length: typically 1-5 pages
   */
  visiblePages: number[];

  /**
   * Whether user is currently scrolling
   * Used to throttle updates
   */
  isScrolling: boolean;
}
```

**Validation Rules**:
- `activePage` must be in `visiblePages` array
- `visiblePages` must be sorted ascending
- `scrollY` must be ≥ 0

---

### 6. ApplicationState

Top-level application state (managed in ManifestoReaderShell).

```typescript
interface ApplicationState {
  /**
   * PDF document state
   */
  document: PDFDocument;

  /**
   * Map of page number to extracted text
   * Populated once during initial load
   */
  pageTexts: Map<number, string>;

  /**
   * Viewport and scroll state
   */
  viewport: ViewportState;

  /**
   * Search state
   */
  search: {
    /**
     * Whether search UI is open
     */
    isOpen: boolean;

    /**
     * Current search results (null if no search performed)
     */
    results: SearchResults | null;
  };

  /**
   * UI state
   */
  ui: {
    /**
     * Whether to show page indicator badge
     */
    showPageIndicator: boolean;

    /**
     * Whether to use dark mode (future enhancement)
     */
    isDarkMode: boolean;
  };
}
```

---

## Type Aliases & Utility Types

### Page Range

```typescript
/**
 * Valid page number (1 to 78)
 */
type PageNumber = number; // Runtime validated: 1 <= n <= 78

/**
 * Helper to create compile-time page number literals
 */
type ValidPageNumber = 1 | 2 | 3 | /* ... */ 78; // Full union for strict typing
```

### Search State

```typescript
/**
 * Search UI states
 */
type SearchUIState = 'closed' | 'open-empty' | 'open-with-results' | 'open-no-results';
```

### Render State

```typescript
/**
 * Page render states
 */
type RenderState = 'pending' | 'rendering' | 'rendered' | 'error';

/**
 * Document load states
 */
type LoadState = 'idle' | 'loading' | 'loaded' | 'error';
```

---

## Component Props Interfaces

### ManifestoReaderShell

```typescript
interface ManifestoReaderShellProps {
  /**
   * Path to PDF file
   * Default: '/manifesto.pdf'
   */
  pdfUrl?: string;

  /**
   * Initial page to display
   * Default: 1
   */
  initialPage?: PageNumber;

  /**
   * Whether to show page indicator
   * Default: true
   */
  showPageIndicator?: boolean;
}
```

### Header

```typescript
interface HeaderProps {
  /**
   * Path to logo image
   * Default: '/logo.svg'
   */
  logoUrl?: string;

  /**
   * Logo alt text
   * Default: 'UWP Logo'
   */
  logoAlt?: string;

  /**
   * Callback when search icon is clicked
   */
  onSearchClick: () => void;

  /**
   * Whether search UI is currently open
   */
  isSearchOpen: boolean;
}
```

### SearchBar

```typescript
interface SearchBarProps {
  /**
   * Whether search bar is visible
   */
  isOpen: boolean;

  /**
   * Current search query
   */
  query: string;

  /**
   * Search results (null if no search performed)
   */
  results: SearchResults | null;

  /**
   * Callback when query changes
   */
  onQueryChange: (query: string) => void;

  /**
   * Callback when search is submitted
   */
  onSearch: () => void;

  /**
   * Callback when search is closed
   */
  onClose: () => void;

  /**
   * Callback to navigate to previous match
   */
  onPrevMatch: () => void;

  /**
   * Callback to navigate to next match
   */
  onNextMatch: () => void;
}
```

### SectionTabs

```typescript
interface SectionTabsProps {
  /**
   * Array of sections to display
   */
  sections: Section[];

  /**
   * Currently active page number
   */
  activePage: PageNumber;

  /**
   * Callback when section is clicked
   */
  onSectionClick: (pageNumber: PageNumber) => void;

  /**
   * Whether to show shortened labels (mobile)
   * Default: auto-detect based on viewport width
   */
  useShortLabels?: boolean;
}
```

### PageGallery

```typescript
interface PageGalleryProps {
  /**
   * Total number of pages
   */
  totalPages: number;

  /**
   * Array of page numbers currently visible (for virtualization)
   */
  visiblePages: number[];

  /**
   * Currently active page
   */
  activePage: PageNumber;

  /**
   * Map of page number to text content
   */
  pageTexts: Map<number, string>;

  /**
   * Current search matches (for highlighting)
   */
  searchMatches: SearchMatch[];

  /**
   * Callback when page visibility changes
   */
  onPageVisibilityChange: (pageNumber: number, isVisible: boolean) => void;

  /**
   * Callback when active page changes
   */
  onActivePageChange: (pageNumber: number) => void;
}
```

### PageContainer

```typescript
interface PageContainerProps {
  /**
   * Page number to render
   */
  pageNumber: PageNumber;

  /**
   * Whether this page is active (centered in viewport)
   */
  isActive: boolean;

  /**
   * PDF.js page proxy (implementation detail)
   */
  pdfPage: unknown; // Opaque type

  /**
   * Search matches on this page
   */
  searchMatches: SearchMatch[];

  /**
   * Callback when page enters/exits viewport
   */
  onVisibilityChange: (isVisible: boolean) => void;
}
```

### PdfPageRenderer

```typescript
interface PdfPageRendererProps {
  /**
   * Page number to render
   */
  pageNumber: PageNumber;

  /**
   * PDF.js page proxy
   */
  pdfPage: unknown; // Opaque type

  /**
   * Canvas dimensions
   */
  dimensions: {
    width: number;
    height: number;
    scale: number;
  };

  /**
   * Search matches to highlight on this page
   */
  searchMatches: SearchMatch[];

  /**
   * Render state callback
   */
  onRenderStateChange: (state: RenderState) => void;
}
```

### PageIndicator

```typescript
interface PageIndicatorProps {
  /**
   * Current page number
   */
  currentPage: PageNumber;

  /**
   * Total number of pages
   */
  totalPages: number;

  /**
   * Position of indicator
   * Default: 'right'
   */
  position?: 'left' | 'right';
}
```

---

## Hook Return Types

### usePdfDocument

```typescript
interface UsePdfDocumentReturn {
  /**
   * PDF document state
   */
  document: PDFDocument;

  /**
   * Map of page number to extracted text
   */
  pageTexts: Map<number, string>;

  /**
   * Load PDF from URL
   */
  loadPdf: (url: string) => Promise<void>;

  /**
   * Get PDF.js page proxy for rendering
   */
  getPage: (pageNumber: PageNumber) => Promise<unknown>;

  /**
   * Retry loading if error occurred
   */
  retry: () => void;
}
```

### usePageVisibility

```typescript
interface UsePageVisibilityReturn {
  /**
   * Currently active page number
   */
  activePage: PageNumber;

  /**
   * Array of visible page numbers
   */
  visiblePages: number[];

  /**
   * Register a page element for visibility tracking
   */
  registerPage: (pageNumber: number, element: HTMLElement) => void;

  /**
   * Unregister a page element
   */
  unregisterPage: (pageNumber: number) => void;
}
```

### useSearch

```typescript
interface UseSearchReturn {
  /**
   * Current search query
   */
  query: string;

  /**
   * Search results
   */
  results: SearchResults | null;

  /**
   * Whether search is in progress
   */
  isSearching: boolean;

  /**
   * Set search query
   */
  setQuery: (query: string) => void;

  /**
   * Perform search
   */
  search: () => void;

  /**
   * Clear search
   */
  clearSearch: () => void;

  /**
   * Navigate to next match
   */
  nextMatch: () => void;

  /**
   * Navigate to previous match
   */
  prevMatch: () => void;

  /**
   * Navigate to specific match by index
   */
  goToMatch: (index: number) => void;
}
```

### useKeyboardShortcuts

```typescript
interface UseKeyboardShortcutsReturn {
  /**
   * Registered keyboard shortcuts
   */
  shortcuts: {
    key: string;
    handler: () => void;
    description: string;
  }[];
}
```

---

## Enums

### KeyboardShortcut

```typescript
enum KeyboardShortcut {
  OPEN_SEARCH = '/',
  CLOSE_SEARCH = 'Escape',
  NEXT_MATCH = 'Enter', // When search is focused
  PREV_MATCH = 'Shift+Enter', // When search is focused
}
```

---

## Constants

### Configuration

```typescript
const CONFIG = {
  /**
   * Total number of pages in manifesto
   */
  TOTAL_PAGES: 78,

  /**
   * Number of pages to render around active page
   */
  RENDER_BUFFER: 2, // Render activePage ± 2 = 5 pages total

  /**
   * Search debounce delay (ms)
   */
  SEARCH_DEBOUNCE_MS: 300,

  /**
   * Maximum page width (desktop)
   */
  MAX_PAGE_WIDTH_PX: 1000,

  /**
   * Page spacing (vertical gap between pages)
   */
  PAGE_SPACING_PX: {
    mobile: 32,
    desktop: 40,
  },

  /**
   * IntersectionObserver threshold for "active" page
   */
  ACTIVE_PAGE_THRESHOLD: 0.5, // 50% visible

  /**
   * Scroll behavior
   */
  SCROLL_BEHAVIOR: 'smooth' as ScrollBehavior,

  /**
   * PDF.js worker path
   */
  PDFJS_WORKER_PATH: '/pdfjs/pdf.worker.min.js',
} as const;
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   ManifestoReaderShell                      │
│  (Top-level state: document, pageTexts, viewport, search)  │
└─────────────────────────────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
    ┌────────┐      ┌──────────────┐    ┌────────────┐
    │ Header │      │ SectionTabs  │    │ SearchBar  │
    └────────┘      └──────────────┘    └────────────┘
                            │                  │
                            │      ┌───────────┘
                            ▼      ▼
                     ┌────────────────┐
                     │  PageGallery   │
                     │ (Virtualization)│
                     └────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │PageContainer │  │PageContainer │  │PageContainer │
  │   (Page 1)   │  │   (Page 2)   │  │   (Page 3)   │
  └──────────────┘  └──────────────┘  └──────────────┘
         │                  │                  │
         ▼                  ▼                  ▼
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │PdfPageRender │  │PdfPageRender │  │PdfPageRender │
  │ (Canvas +    │  │ (Canvas +    │  │ (Canvas +    │
  │  TextLayer)  │  │  TextLayer)  │  │  TextLayer)  │
  └──────────────┘  └──────────────┘  └──────────────┘
```

---

## State Transitions

### Document Load

```
idle
  │
  ├─ loadPdf() called
  ▼
loading
  │
  ├─ Success
  ▼
loaded (pageTexts extracted)
  │
  OR
  │
  ├─ Error
  ▼
error (with errorMessage)
  │
  ├─ retry() called
  ▼
loading
```

### Search Flow

```
No search (results = null)
  │
  ├─ User types query + presses Enter
  ▼
Searching (isSearching = true)
  │
  ├─ Matches found
  ▼
Results displayed (currentMatchIndex = 0, first match active)
  │
  ├─ User clicks "Next"
  ▼
currentMatchIndex++, scroll to next match
  │
  ├─ User clicks "Prev"
  ▼
currentMatchIndex--, scroll to prev match
  │
  ├─ User presses Escape or clears query
  ▼
Search closed (results = null)
```

### Page Visibility

```
Page rendered (renderState = 'rendered')
  │
  ├─ IntersectionObserver detects entry
  ▼
Page visible (isVisible = true)
  │
  ├─ Page intersection ratio > 50%
  ▼
Page active (isActive = true, activePage updated)
  │
  ├─ User scrolls, different page becomes centered
  ▼
Page inactive (isActive = false)
  │
  ├─ Page scrolled out of viewport
  ▼
Page not visible (isVisible = false)
```

---

## Validation & Invariants

### Invariants (Always True)

1. `activePage` is always between 1 and 78 (inclusive)
2. Only one page has `isActive: true` at any time
3. Only one search match has `isActive: true` at any time
4. `visiblePages` array is sorted in ascending order
5. `pageTexts` map has exactly 78 entries when document is loaded
6. `searchMatches` are sorted by: `pageNumber ASC, startOffset ASC`
7. Total sections count is always 12

### Validation Functions

```typescript
/**
 * Validates that a page number is in valid range
 */
const isValidPageNumber = (n: number): n is PageNumber => {
  return Number.isInteger(n) && n >= 1 && n <= CONFIG.TOTAL_PAGES;
};

/**
 * Validates search match integrity
 */
const isValidSearchMatch = (match: SearchMatch): boolean => {
  return (
    isValidPageNumber(match.pageNumber) &&
    match.startOffset >= 0 &&
    match.endOffset > match.startOffset &&
    match.matchedText.length === match.endOffset - match.startOffset
  );
};

/**
 * Validates section-to-page mapping
 */
const areValidSections = (sections: Section[]): boolean => {
  return (
    sections.length === 12 &&
    sections.every(s => isValidPageNumber(s.pageNumber)) &&
    sections.every((s, i, arr) => i === 0 || s.pageNumber > arr[i - 1].pageNumber)
  );
};
```

---

## Summary

This data model defines 6 core entities, 8 component prop interfaces, 4 custom hook return types, and all necessary type aliases for the UWP Manifesto Reader. All types are designed to be:

- **Immutable where possible** (using `readonly` and `const` assertions)
- **Type-safe** (strict TypeScript interfaces with runtime validation)
- **Self-documenting** (comprehensive JSDoc comments)
- **Testable** (validation functions for all invariants)

**Next**: Phase 1 will continue with contract definitions and quickstart guide.
