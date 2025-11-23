# Hook Contracts

**Purpose**: Define all custom React hooks, their inputs, outputs, and side effects

---

## 1. usePdfDocument

**Responsibility**: Load PDF, extract text, manage document state

**Location**: `hooks/usePdfDocument.ts`

**Signature**:
```typescript
function usePdfDocument(pdfUrl: string): UsePdfDocumentReturn

interface UsePdfDocumentReturn {
  document: PDFDocument;
  pageTexts: Map<number, string>;
  loadPdf: () => Promise<void>;
  getPage: (pageNumber: number) => Promise<PDFPageProxy>;
  retry: () => void;
}
```

**Implementation Contract**:
```typescript
const usePdfDocument = (pdfUrl: string) => {
  const [document, setDocument] = useState<PDFDocument>({
    id: 'uwp-manifesto',
    numPages: 0,
    url: pdfUrl,
    loadingState: 'idle',
  });

  const [pageTexts, setPageTexts] = useState<Map<number, string>>(new Map());
  const pdfProxyRef = useRef<PDFDocumentProxy | null>(null);

  const loadPdf = useCallback(async () => {
    setDocument(prev => ({ ...prev, loadingState: 'loading' }));

    try {
      // Load PDF using PDF.js
      const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
      pdfProxyRef.current = pdf;

      setDocument({
        id: 'uwp-manifesto',
        numPages: pdf.numPages,
        url: pdfUrl,
        loadingState: 'loaded',
      });

      // Extract text from all pages
      const texts = await extractAllPageTexts(pdf);
      setPageTexts(texts);

    } catch (error) {
      setDocument(prev => ({
        ...prev,
        loadingState: 'error',
        errorMessage: error.message,
      }));
    }
  }, [pdfUrl]);

  const getPage = useCallback(async (pageNumber: number) => {
    if (!pdfProxyRef.current) {
      throw new Error('PDF not loaded');
    }
    return pdfProxyRef.current.getPage(pageNumber);
  }, []);

  const retry = useCallback(() => {
    loadPdf();
  }, [loadPdf]);

  // Auto-load on mount
  useEffect(() => {
    loadPdf();
  }, [loadPdf]);

  return { document, pageTexts, loadPdf, getPage, retry };
};
```

**Side Effects**:
- Loads PDF file from URL on mount
- Extracts text from all 78 pages (async operation, ~2-5 seconds)
- Stores PDF.js proxy in ref (not in state to avoid re-renders)

**Error Handling**:
- Network errors → `loadingState: 'error'`, `errorMessage` set
- Invalid PDF format → caught and displayed via error state
- Missing file → 404 error captured

**Testing Contract**:
```typescript
describe('usePdfDocument', () => {
  it('should load PDF and extract text', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      usePdfDocument('/manifesto.pdf')
    );

    expect(result.current.document.loadingState).toBe('loading');

    await waitForNextUpdate();

    expect(result.current.document.loadingState).toBe('loaded');
    expect(result.current.document.numPages).toBe(78);
    expect(result.current.pageTexts.size).toBe(78);
  });

  it('should handle load errors gracefully', async () => {
    // Mock PDF.js to throw error
    jest.spyOn(pdfjsLib, 'getDocument').mockRejectedValue(new Error('404'));

    const { result, waitForNextUpdate } = renderHook(() =>
      usePdfDocument('/missing.pdf')
    );

    await waitForNextUpdate();

    expect(result.current.document.loadingState).toBe('error');
    expect(result.current.document.errorMessage).toBe('404');
  });
});
```

---

## 2. usePageVisibility

**Responsibility**: Track which pages are visible using IntersectionObserver

**Location**: `hooks/usePageVisibility.ts`

**Signature**:
```typescript
function usePageVisibility(): UsePageVisibilityReturn

interface UsePageVisibilityReturn {
  activePage: number;
  visiblePages: number[];
  registerPage: (pageNumber: number, element: HTMLElement) => void;
  unregisterPage: (pageNumber: number) => void;
}
```

**Implementation Contract**:
```typescript
const usePageVisibility = () => {
  const [activePage, setActivePage] = useState<number>(1);
  const [visiblePages, setVisiblePages] = useState<number[]>([1]);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const pageElementsRef = useRef<Map<number, HTMLElement>>(new Map());
  const intersectionRatiosRef = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const pageNumber = Number(entry.target.getAttribute('data-page-number'));

          // Update intersection ratio
          intersectionRatiosRef.current.set(pageNumber, entry.intersectionRatio);

          // Update visible pages
          const visible = Array.from(intersectionRatiosRef.current.entries())
            .filter(([_, ratio]) => ratio > 0)
            .map(([page, _]) => page)
            .sort((a, b) => a - b);

          setVisiblePages(visible);

          // Update active page (most visible)
          const mostVisible = Array.from(intersectionRatiosRef.current.entries())
            .reduce((max, [page, ratio]) =>
              ratio > max.ratio ? { page, ratio } : max,
              { page: 1, ratio: 0 }
            );

          if (mostVisible.ratio >= 0.5) {
            setActivePage(mostVisible.page);
          }
        });
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
        rootMargin: '0px',
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
      intersectionRatiosRef.current.delete(pageNumber);
    }
  }, []);

  return { activePage, visiblePages, registerPage, unregisterPage };
};
```

**Side Effects**:
- Creates IntersectionObserver on mount
- Updates `activePage` when a page becomes 50%+ visible
- Updates `visiblePages` array when pages enter/exit viewport

**Performance**:
- Uses ref to store observer (no re-renders on observe/unobserve)
- Throttles updates using IntersectionObserver's built-in throttling
- Multiple threshold values for smooth transitions

**Testing Contract**:
```typescript
describe('usePageVisibility', () => {
  it('should track visible pages', () => {
    const { result } = renderHook(() => usePageVisibility());

    const mockElement = document.createElement('div');
    mockElement.setAttribute('data-page-number', '5');

    act(() => {
      result.current.registerPage(5, mockElement);
    });

    // Simulate IntersectionObserver callback
    mockIntersectionObserver([
      { target: mockElement, intersectionRatio: 0.8, isIntersecting: true },
    ]);

    expect(result.current.visiblePages).toContain(5);
    expect(result.current.activePage).toBe(5);
  });
});
```

---

## 3. useSearch

**Responsibility**: Manage search state, perform searches, navigate matches

**Location**: `hooks/useSearch.ts`

**Signature**:
```typescript
function useSearch(pageTexts: Map<number, string>): UseSearchReturn

interface UseSearchReturn {
  query: string;
  results: SearchResults | null;
  isSearching: boolean;
  setQuery: (query: string) => void;
  search: () => void;
  clearSearch: () => void;
  nextMatch: () => void;
  prevMatch: () => void;
  goToMatch: (index: number) => void;
}
```

**Implementation Contract**:
```typescript
const useSearch = (pageTexts: Map<number, string>) => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const search = useCallback(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    setIsSearching(true);

    try {
      // Perform search using searchEngine utility
      const matches = searchEngine.search(query, pageTexts);

      setResults({
        query,
        matches,
        totalMatches: matches.length,
        currentMatchIndex: matches.length > 0 ? 0 : -1,
      });

      // Auto-scroll to first match
      if (matches.length > 0) {
        scrollToMatch(matches[0]);
      }

    } finally {
      setIsSearching(false);
    }
  }, [query, pageTexts]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults(null);
  }, []);

  const nextMatch = useCallback(() => {
    if (!results || results.matches.length === 0) return;

    const nextIndex = (results.currentMatchIndex + 1) % results.matches.length;
    setResults(prev => ({ ...prev!, currentMatchIndex: nextIndex }));
    scrollToMatch(results.matches[nextIndex]);
  }, [results]);

  const prevMatch = useCallback(() => {
    if (!results || results.matches.length === 0) return;

    const prevIndex =
      (results.currentMatchIndex - 1 + results.matches.length) % results.matches.length;
    setResults(prev => ({ ...prev!, currentMatchIndex: prevIndex }));
    scrollToMatch(results.matches[prevIndex]);
  }, [results]);

  const goToMatch = useCallback((index: number) => {
    if (!results || index < 0 || index >= results.matches.length) return;

    setResults(prev => ({ ...prev!, currentMatchIndex: index }));
    scrollToMatch(results.matches[index]);
  }, [results]);

  // Debounce search on query change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        search();
      } else {
        setResults(null);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query, search]);

  return {
    query,
    results,
    isSearching,
    setQuery,
    search,
    clearSearch,
    nextMatch,
    prevMatch,
    goToMatch,
  };
};

// Helper function
const scrollToMatch = (match: SearchMatch) => {
  const pageElement = document.getElementById(`page-${match.pageNumber}`);
  pageElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};
```

**Side Effects**:
- Debounces search input (300ms)
- Auto-scrolls to matched pages
- Updates match highlights (via callback)

**Performance**:
- Debouncing prevents excessive searches while typing
- Search is synchronous (fast enough for 100KB text)
- Only re-searches when query or pageTexts change

**Testing Contract**:
```typescript
describe('useSearch', () => {
  const mockPageTexts = new Map([
    [1, 'renewable energy policy'],
    [2, 'agriculture and fisheries'],
    [3, 'renewable energy future'],
  ]);

  it('should find all matches for a query', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useSearch(mockPageTexts)
    );

    act(() => {
      result.current.setQuery('renewable energy');
    });

    await waitForNextUpdate(); // Wait for debounce

    expect(result.current.results?.totalMatches).toBe(2);
    expect(result.current.results?.matches[0].pageNumber).toBe(1);
  });

  it('should navigate between matches', () => {
    const { result } = renderHook(() => useSearch(mockPageTexts));

    act(() => {
      result.current.setQuery('energy');
      result.current.search();
    });

    expect(result.current.results?.currentMatchIndex).toBe(0);

    act(() => {
      result.current.nextMatch();
    });

    expect(result.current.results?.currentMatchIndex).toBe(1);
  });

  it('should wrap around when navigating past last match', () => {
    const { result } = renderHook(() => useSearch(mockPageTexts));

    // Setup: 2 matches
    act(() => {
      result.current.setQuery('energy');
      result.current.search();
    });

    // Go to last match
    act(() => {
      result.current.goToMatch(1);
    });

    // Next should wrap to first
    act(() => {
      result.current.nextMatch();
    });

    expect(result.current.results?.currentMatchIndex).toBe(0);
  });
});
```

---

## 4. useKeyboardShortcuts

**Responsibility**: Register global keyboard shortcuts

**Location**: `hooks/useKeyboardShortcuts.ts`

**Signature**:
```typescript
function useKeyboardShortcuts(
  searchInputRef: RefObject<HTMLInputElement>,
  onOpenSearch: () => void,
  onCloseSearch: () => void
): void
```

**Implementation Contract**:
```typescript
const useKeyboardShortcuts = (
  searchInputRef: RefObject<HTMLInputElement>,
  onOpenSearch: () => void,
  onCloseSearch: () => void
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // "/" key - open search and focus input
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        onOpenSearch();
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }

      // "Escape" key - close search and blur input
      if (e.key === 'Escape') {
        onCloseSearch();
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchInputRef, onOpenSearch, onCloseSearch]);
};
```

**Side Effects**:
- Registers global keydown listener
- Focuses/blurs search input element
- Prevents default browser behavior for "/"

**Accessibility**:
- Does not interfere with screen reader shortcuts
- Only intercepts "/" when not already typing in input
- Respects browser's native Escape behavior (closes modals, etc.)

**Testing Contract**:
```typescript
describe('useKeyboardShortcuts', () => {
  it('should focus search input when "/" is pressed', () => {
    const inputRef = { current: document.createElement('input') };
    const onOpenSearch = jest.fn();
    const onCloseSearch = jest.fn();

    renderHook(() =>
      useKeyboardShortcuts(inputRef, onOpenSearch, onCloseSearch)
    );

    fireEvent.keyDown(window, { key: '/' });

    expect(onOpenSearch).toHaveBeenCalled();
    expect(inputRef.current).toHaveFocus();
  });

  it('should not intercept "/" when already typing in input', () => {
    const inputRef = { current: document.createElement('input') };
    document.body.appendChild(inputRef.current);
    inputRef.current.focus();

    const onOpenSearch = jest.fn();

    renderHook(() =>
      useKeyboardShortcuts(inputRef, onOpenSearch, jest.fn())
    );

    fireEvent.keyDown(window, { key: '/' });

    expect(onOpenSearch).not.toHaveBeenCalled();
  });
});
```

---

## Hook Dependency Graph

```
ManifestoReaderShell
│
├─ usePdfDocument(pdfUrl)
│  └─ Returns: { document, pageTexts, loadPdf, getPage }
│
├─ usePageVisibility()
│  └─ Returns: { activePage, visiblePages, registerPage }
│
├─ useSearch(pageTexts)
│  └─ Returns: { query, results, search, nextMatch, prevMatch }
│
└─ useKeyboardShortcuts(searchInputRef, onOpenSearch, onCloseSearch)
   └─ Returns: void (side-effect only)
```

---

## Summary

All custom hooks follow these principles:

1. **Single Responsibility**: Each hook manages one specific concern
2. **Dependency Injection**: Accept dependencies as parameters (testability)
3. **Ref Storage**: Use refs for values that shouldn't trigger re-renders
4. **Cleanup**: Always return cleanup functions from useEffect
5. **Memoization**: Use useCallback for stable function references
6. **Type Safety**: Strictly typed inputs and outputs

Next: [Utility Contracts](./utility-contracts.md)
