# Event Contracts

**Purpose**: Define all event handlers, state transitions, and user interaction flows

---

## 1. User Interaction Events

### Search Events

#### Event: Open Search

**Trigger**: User clicks search icon OR presses "/" key

**Handler Signature**:
```typescript
const handleOpenSearch = (): void => {
  setSearchState(prev => ({ ...prev, isOpen: true }));
  // Auto-focus input in next render cycle
  setTimeout(() => searchInputRef.current?.focus(), 100);
};
```

**State Transition**:
```
{ isOpen: false } → { isOpen: true }
```

**Side Effects**:
- Focus moves to search input
- Search bar slides down (CSS transition)

---

#### Event: Close Search

**Trigger**: User clicks X button, presses Escape, OR clicks outside search bar

**Handler Signature**:
```typescript
const handleCloseSearch = (): void => {
  setSearchState({
    isOpen: false,
    query: '',
    results: null,
  });
  searchInputRef.current?.blur();
};
```

**State Transition**:
```
{ isOpen: true, query: "...", results: {...} }
  →
{ isOpen: false, query: '', results: null }
```

**Side Effects**:
- Focus returns to document body
- Search highlights removed
- Match counter hidden

---

#### Event: Query Change

**Trigger**: User types in search input

**Handler Signature**:
```typescript
const handleQueryChange = (newQuery: string): void => {
  setSearchState(prev => ({ ...prev, query: newQuery }));
  // Debounced search will trigger automatically via useEffect
};
```

**State Transition**:
```
{ query: 'old' } → { query: 'new' }
```

**Debounce Logic**:
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    if (query.trim()) {
      performSearch();
    } else {
      setResults(null);
    }
  }, CONFIG.SEARCH_DEBOUNCE_MS);

  return () => clearTimeout(timer);
}, [query]);
```

---

#### Event: Perform Search

**Trigger**: User presses Enter OR debounce timer completes

**Handler Signature**:
```typescript
const handleSearch = (): void => {
  if (!query.trim()) {
    setResults(null);
    return;
  }

  setIsSearching(true);

  const matches = searchEngine.search(query, pageTexts);

  setSearchState(prev => ({
    ...prev,
    results: {
      query,
      matches,
      totalMatches: matches.length,
      currentMatchIndex: matches.length > 0 ? 0 : -1,
    },
  }));

  // Auto-scroll to first match
  if (matches.length > 0) {
    scrollToMatch(matches[0]);
  }

  setIsSearching(false);
};
```

**State Transition**:
```
{ results: null } → { results: { matches: [...], currentMatchIndex: 0, ... } }
```

**Side Effects**:
- Scrolls to first match
- Highlights all matches
- Updates match counter

---

#### Event: Next Match

**Trigger**: User clicks "Next" button OR presses Enter (when search focused)

**Handler Signature**:
```typescript
const handleNextMatch = (): void => {
  if (!results || results.matches.length === 0) return;

  const nextIndex = (results.currentMatchIndex + 1) % results.totalMatches;

  setSearchState(prev => ({
    ...prev,
    results: {
      ...prev.results!,
      currentMatchIndex: nextIndex,
    },
  }));

  scrollToMatch(results.matches[nextIndex]);
};
```

**State Transition**:
```
{ currentMatchIndex: 2 } → { currentMatchIndex: 3 }
{ currentMatchIndex: 11 (last) } → { currentMatchIndex: 0 (wrap) }
```

**Side Effects**:
- Scrolls to next match
- Updates highlight (previous match fades, new match highlighted)
- Match counter updates

---

#### Event: Previous Match

**Trigger**: User clicks "Prev" button OR presses Shift+Enter

**Handler Signature**:
```typescript
const handlePrevMatch = (): void => {
  if (!results || results.matches.length === 0) return;

  const prevIndex = (results.currentMatchIndex - 1 + results.totalMatches) % results.totalMatches;

  setSearchState(prev => ({
    ...prev,
    results: {
      ...prev.results!,
      currentMatchIndex: prevIndex,
    },
  }));

  scrollToMatch(results.matches[prevIndex]);
};
```

**State Transition**:
```
{ currentMatchIndex: 3 } → { currentMatchIndex: 2 }
{ currentMatchIndex: 0 (first) } → { currentMatchIndex: 11 (wrap) }
```

---

### Section Navigation Events

#### Event: Section Click

**Trigger**: User clicks a section tab

**Handler Signature**:
```typescript
const handleSectionClick = (pageNumber: number): void => {
  // Validate page number
  if (!isValidPageNumber(pageNumber)) {
    console.error(`Invalid page number: ${pageNumber}`);
    return;
  }

  // Smooth scroll to page
  smoothScrollToElement(`page-${pageNumber}`, {
    behavior: 'smooth',
    block: 'start',
  });

  // Active page will update automatically via IntersectionObserver
};
```

**State Transition**:
```
{ activePage: 10 } → { scrolling... } → { activePage: 23 }
```

**Side Effects**:
- Smooth scroll animation
- Active tab highlight moves to clicked section
- URL hash could update (future enhancement: #page-23)

---

### Scroll Events

#### Event: Page Enters Viewport

**Trigger**: IntersectionObserver detects page element becoming visible

**Handler Signature**:
```typescript
const handlePageVisibilityChange = (
  pageNumber: number,
  isVisible: boolean
): void => {
  if (isVisible) {
    setVisiblePages(prev => {
      if (prev.includes(pageNumber)) return prev;
      return [...prev, pageNumber].sort((a, b) => a - b);
    });
  } else {
    setVisiblePages(prev => prev.filter(p => p !== pageNumber));
  }
};
```

**State Transition**:
```
{ visiblePages: [5, 6, 7] } → { visiblePages: [5, 6, 7, 8] }
```

**Side Effects**:
- May trigger page rendering (if virtualization enabled)
- May trigger text extraction (if lazy loading text)

---

#### Event: Active Page Change

**Trigger**: IntersectionObserver detects a page becoming 50%+ visible

**Handler Signature**:
```typescript
const handleActivePageChange = (pageNumber: number): void => {
  if (activePage === pageNumber) return;

  setActivePage(pageNumber);

  // Update section tab highlight
  updateActiveSectionTab(pageNumber);
};
```

**State Transition**:
```
{ activePage: 5 } → { activePage: 6 }
```

**Side Effects**:
- Page indicator updates: "Page 6 / 78"
- Section tab highlight updates
- Analytics event (if tracking enabled)

---

### PDF Loading Events

#### Event: PDF Load Start

**Trigger**: Component mounts OR retry button clicked

**Handler Signature**:
```typescript
const handleLoadPdf = async (): Promise<void> => {
  setDocument(prev => ({ ...prev, loadingState: 'loading' }));

  try {
    const pdf = await loadPdfDocument(pdfUrl);
    setPdfProxy(pdf);

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
};
```

**State Transitions**:
```
{ loadingState: 'idle' }
  → { loadingState: 'loading' }
  → { loadingState: 'loaded' } OR { loadingState: 'error' }
```

**Side Effects**:
- Loading spinner displayed
- Progress indicator updated (optional)
- Text extraction begins (async, ~2-5 seconds)

---

#### Event: PDF Load Complete

**Trigger**: PDF and text extraction both complete

**Handler Signature**:
```typescript
const handleLoadComplete = (): void => {
  // Auto-scroll to initial page (if specified)
  if (initialPage && initialPage !== 1) {
    setTimeout(() => {
      smoothScrollToElement(`page-${initialPage}`);
    }, 500); // Wait for render
  }

  // Analytics: Track load time
  const loadTime = performance.now() - loadStartTime;
  console.log(`PDF loaded in ${loadTime}ms`);
};
```

**Side Effects**:
- Render first page
- Enable search functionality
- Enable section navigation

---

#### Event: PDF Load Error

**Trigger**: Network error, file not found, or invalid PDF format

**Handler Signature**:
```typescript
const handleLoadError = (error: Error): void => {
  setDocument(prev => ({
    ...prev,
    loadingState: 'error',
    errorMessage: getErrorMessage(error),
  }));

  // Log to error tracking service
  console.error('PDF load failed:', error);
};

const getErrorMessage = (error: Error): string => {
  if (error.message.includes('404')) {
    return 'Manifesto file not found. Please contact support.';
  }
  if (error.message.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  return 'Unable to load manifesto. Please refresh the page.';
};
```

**State Transition**:
```
{ loadingState: 'loading' } → { loadingState: 'error', errorMessage: '...' }
```

**Side Effects**:
- Error UI displayed with retry button
- User-friendly error message shown
- Technical error logged to console

---

## 2. Keyboard Event Map

| Key | Context | Handler | Action |
|-----|---------|---------|--------|
| `/` | Global (not in input) | `handleOpenSearch` | Open search, focus input |
| `Escape` | Search open | `handleCloseSearch` | Close search, clear query |
| `Enter` | Search input focused | `handleSearch` | Perform search |
| `Shift+Enter` | Search input focused | `handlePrevMatch` | Go to previous match |
| `Tab` | Section tabs | Browser default | Navigate between tabs |
| `Enter` | Section tab focused | Browser default | Activate tab (scroll to section) |
| `Ctrl+F` / `Cmd+F` | Global | Browser default | Native browser search (works on text layer) |

---

## 3. State Machine: Search Flow

```
┌─────────────┐
│   CLOSED    │ (isOpen: false, results: null)
└──────┬──────┘
       │
       │ "/" key or click search icon
       ▼
┌─────────────┐
│  OPEN EMPTY │ (isOpen: true, query: '', results: null)
└──────┬──────┘
       │
       │ User types query
       ▼
┌─────────────┐
│  TYPING     │ (isOpen: true, query: '...', results: null)
└──────┬──────┘
       │
       │ 300ms debounce completes OR Enter pressed
       ▼
┌─────────────┐
│ SEARCHING   │ (isSearching: true)
└──────┬──────┘
       │
       ├─ Matches found
       │  ▼
       │  ┌──────────────────┐
       │  │ RESULTS (>0)     │ (results: { matches: [...], currentMatchIndex: 0 })
       │  └────────┬─────────┘
       │           │
       │           │ Next/Prev buttons
       │           ▼
       │  ┌──────────────────┐
       │  │ NAVIGATING       │ (currentMatchIndex changes)
       │  └────────┬─────────┘
       │           │
       │           │ New query typed
       │           ▼
       └──────────────┐
                      │
       OR             │
       ├─ No matches  │
       │  ▼           │
       │  ┌──────────────────┐
       │  │ RESULTS (0)      │ (results: { matches: [], totalMatches: 0 })
       │  └────────┬─────────┘
       │           │
       └───────────┘
                   │
                   │ Escape or X clicked
                   ▼
              ┌─────────────┐
              │   CLOSED    │
              └─────────────┘
```

---

## 4. State Machine: Page Visibility

```
┌──────────────┐
│ NOT RENDERED │ (virtualization: page not in render range)
└──────┬───────┘
       │
       │ User scrolls, page enters render range
       ▼
┌──────────────┐
│  RENDERING   │ (PDF.js rendering canvas + text layer)
└──────┬───────┘
       │
       │ Render complete
       ▼
┌──────────────┐
│  RENDERED    │ (isVisible: false, page in DOM but not in viewport)
└──────┬───────┘
       │
       │ IntersectionObserver: entry.isIntersecting = true
       ▼
┌──────────────┐
│   VISIBLE    │ (isVisible: true, isActive: false)
└──────┬───────┘
       │
       │ IntersectionObserver: intersectionRatio > 0.5
       ▼
┌──────────────┐
│   ACTIVE     │ (isVisible: true, isActive: true)
└──────┬───────┘
       │
       │ User scrolls, different page becomes centered
       ▼
┌──────────────┐
│   VISIBLE    │ (isVisible: true, isActive: false)
└──────┬───────┘
       │
       │ IntersectionObserver: entry.isIntersecting = false
       ▼
┌──────────────┐
│  RENDERED    │ (isVisible: false, page in DOM but not visible)
└──────┬───────┘
       │
       │ User scrolls far away, page exits render range
       ▼
┌──────────────┐
│ NOT RENDERED │ (virtualization: page removed from DOM)
└──────────────┘
```

---

## 5. Event Flow Diagrams

### Search Match Navigation

```
User clicks "Next Match" button
  │
  ▼
handleNextMatch() called
  │
  ├─ Calculate nextIndex (with wraparound)
  │
  ├─ Update state: currentMatchIndex = nextIndex
  │
  ├─ scrollToMatch(matches[nextIndex])
  │  │
  │  ├─ Get page element by ID
  │  │
  │  └─ Call element.scrollIntoView({ behavior: 'smooth' })
  │
  ├─ Update highlight classes
  │  │
  │  ├─ Previous active match: bg-yellow-200 → bg-yellow-100
  │  │
  │  └─ New active match: bg-yellow-100 → bg-yellow-200
  │
  └─ Update match counter UI: "3 / 12" → "4 / 12"
```

### Section Tab Click

```
User clicks "AGRICULTURE" tab (page 23)
  │
  ▼
handleSectionClick(23) called
  │
  ├─ Validate page number (1-78)
  │
  ├─ Call smoothScrollToElement('page-23')
  │  │
  │  ├─ Find element with ID "page-23"
  │  │
  │  └─ Call element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  │
  ├─ [Async scroll animation ~500ms]
  │
  ├─ IntersectionObserver detects page 23 entering viewport
  │  │
  │  └─ handlePageVisibilityChange(23, true)
  │     │
  │     ├─ visiblePages += 23
  │     │
  │     └─ When intersectionRatio > 0.5:
  │        └─ handleActivePageChange(23)
  │           │
  │           ├─ activePage = 23
  │           │
  │           ├─ Update section tab highlight
  │           │  │
  │           │  ├─ Previous tab: remove active styles
  │           │  │
  │           │  └─ "AGRICULTURE" tab: add active styles
  │           │
  │           └─ Update page indicator: "Page 23 / 78"
  │
  └─ [Scroll complete]
```

---

## 6. Error Handling Events

### PDF Load Failure

```typescript
try {
  await loadPdf();
} catch (error) {
  // Network error
  if (error.message.includes('NetworkError')) {
    showErrorMessage('Unable to connect. Check your internet connection.');
    enableRetryButton();
  }

  // File not found
  if (error.message.includes('404')) {
    showErrorMessage('Manifesto file not found. Please contact support.');
    disableRetryButton(); // No point retrying a 404
  }

  // Invalid PDF
  if (error.message.includes('Invalid PDF')) {
    showErrorMessage('The manifesto file is corrupted. Please contact support.');
    disableRetryButton();
  }

  // Unknown error
  showErrorMessage('An unexpected error occurred. Please try again.');
  enableRetryButton();
}
```

### Page Render Failure

```typescript
try {
  await renderPage(pageNumber);
} catch (error) {
  // Log error but don't crash entire app
  console.error(`Failed to render page ${pageNumber}:`, error);

  // Show placeholder or skip page
  setPageRenderState(pageNumber, 'error');

  // Continue rendering other pages
}
```

---

## Summary

All event handlers follow these principles:

1. **Type Safety**: Strict TypeScript parameter and return types
2. **Validation**: Validate inputs before state updates
3. **Atomicity**: State updates are atomic (no partial states)
4. **Error Resilience**: Graceful error handling, no app crashes
5. **Side Effect Isolation**: Side effects (scroll, focus) clearly separated from state logic
6. **Idempotency**: Handlers can be called multiple times safely

**End of Contracts Documentation**
