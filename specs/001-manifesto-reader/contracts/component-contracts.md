# Component Contracts

**Purpose**: Define all React component interfaces, props, and callback signatures

---

## 1. ManifestoReaderShell (Top-Level Container)

**Responsibility**: Orchestrate all child components, manage global state

**Props**:
```typescript
interface ManifestoReaderShellProps {
  pdfUrl?: string;           // Default: '/manifesto.pdf'
  initialPage?: number;      // Default: 1
  showPageIndicator?: boolean; // Default: true
}
```

**State Managed**:
- PDF document loading state
- Page text extraction
- Active page number
- Search state
- Viewport state

**Callbacks Provided to Children**:
- `onSearchClick: () => void` → Opens search bar
- `onSearchClose: () => void` → Closes search bar
- `onSectionClick: (pageNumber: number) => void` → Scrolls to section
- `onPageVisibilityChange: (pageNumber: number, isVisible: boolean) => void` → Updates viewport state
- `onActivePageChange: (pageNumber: number) => void` → Updates active page

**Rendering Contract**:
```tsx
<ManifestoReaderShell>
  <Header onSearchClick={...} />
  <SectionTabs onSectionClick={...} activePage={...} />
  <SearchBar isOpen={...} results={...} onClose={...} />
  <PageGallery visiblePages={...} searchMatches={...} />
  <PageIndicator currentPage={...} totalPages={78} />
</ManifestoReaderShell>
```

**Error Handling**:
- Catches PDF load errors, displays error UI with retry button
- Gracefully handles missing PDF file
- Logs render errors without crashing app

---

## 2. Header (Sticky Top Bar)

**Responsibility**: Display logo and search icon

**Props**:
```typescript
interface HeaderProps {
  logoUrl?: string;          // Default: '/logo.svg'
  logoAlt?: string;          // Default: 'UWP Logo'
  onSearchClick: () => void; // Required
  isSearchOpen: boolean;     // Required
}
```

**Rendering Contract**:
```tsx
<header className="sticky top-0 z-50 bg-white shadow-sm">
  <div className="flex items-center justify-between px-4 py-3">
    <div className="flex-1" /> {/* Empty left spacer */}
    <img src={logoUrl} alt={logoAlt} className="h-12" />
    <div className="flex-1 flex justify-end">
      <button
        onClick={onSearchClick}
        aria-label="Open search"
        className="p-2 hover:bg-gray-100 rounded"
      >
        <SearchIcon />
      </button>
    </div>
  </div>
</header>
```

**Accessibility**:
- Logo has alt text
- Search button has aria-label
- Keyboard accessible (Tab + Enter)

---

## 3. SearchBar (Expandable Search UI)

**Responsibility**: Search input, match navigation, results display

**Props**:
```typescript
interface SearchBarProps {
  isOpen: boolean;           // Required
  query: string;             // Required
  results: SearchResults | null; // Required
  onQueryChange: (query: string) => void; // Required
  onSearch: () => void;      // Required
  onClose: () => void;       // Required
  onPrevMatch: () => void;   // Required
  onNextMatch: () => void;   // Required
}
```

**Rendering Contract (when isOpen=true)**:
```tsx
<div className="sticky top-16 z-40 bg-white border-b shadow-sm">
  <div className="flex items-center gap-2 px-4 py-2">
    <input
      type="text"
      value={query}
      onChange={(e) => onQueryChange(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && onSearch()}
      placeholder="Search manifesto..."
      className="flex-1 px-3 py-2 border rounded"
      autoFocus
    />

    {results && (
      <>
        <span className="text-sm text-gray-600">
          {results.currentMatchIndex + 1} / {results.totalMatches}
        </span>
        <button onClick={onPrevMatch} aria-label="Previous match">
          <ChevronUpIcon />
        </button>
        <button onClick={onNextMatch} aria-label="Next match">
          <ChevronDownIcon />
        </button>
      </>
    )}

    <button onClick={onClose} aria-label="Close search">
      <XIcon />
    </button>
  </div>

  {results && results.totalMatches === 0 && (
    <div className="px-4 py-2 text-sm text-gray-500">
      No results found for "{query}"
    </div>
  )}
</div>
```

**Accessibility**:
- Input has placeholder and label
- Buttons have aria-labels
- Match counter announced via aria-live
- Keyboard shortcuts: Enter (search), Esc (close)

**Edge Cases**:
- Empty query → disable search button
- No results → show "No results found" message
- Long query (>100 chars) → truncate in display
- Results = null → hide navigation buttons

---

## 4. SectionTabs (Horizontal Scrollable Tabs)

**Responsibility**: Display section navigation tabs

**Props**:
```typescript
interface SectionTabsProps {
  sections: Section[];       // Required (12 sections)
  activePage: number;        // Required
  onSectionClick: (pageNumber: number) => void; // Required
  useShortLabels?: boolean;  // Default: auto-detect <640px
}
```

**Rendering Contract**:
```tsx
<nav
  aria-label="Manifesto sections"
  className="sticky top-16 z-30 bg-white border-b overflow-x-auto"
>
  <div className="flex space-x-2 px-4 py-2">
    {sections.map(section => {
      const isActive = activePage >= section.pageNumber &&
        (/* next section pageNumber or 78 */ > activePage);

      return (
        <button
          key={section.id}
          onClick={() => onSectionClick(section.pageNumber)}
          aria-current={isActive ? 'true' : undefined}
          className={cn(
            "px-3 py-2 text-sm whitespace-nowrap rounded",
            isActive
              ? "bg-gray-900 text-white font-bold"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {useShortLabels ? section.shortLabel : section.title}
        </button>
      );
    })}
  </div>
</nav>
```

**Active Tab Logic**:
```typescript
// A section is active if:
// activePage >= section.pageNumber AND
// activePage < nextSection.pageNumber (or 78 if last section)

const getActiveSection = (activePage: number, sections: Section[]): Section | null => {
  for (let i = 0; i < sections.length; i++) {
    const current = sections[i];
    const next = sections[i + 1];

    if (activePage >= current.pageNumber &&
        (next ? activePage < next.pageNumber : true)) {
      return current;
    }
  }
  return null;
};
```

**Accessibility**:
- Wrapped in `<nav>` with aria-label
- Active tab has aria-current="true"
- Keyboard navigable (Tab, Enter)

---

## 5. PageGallery (Virtualized Page Container)

**Responsibility**: Render visible pages with virtualization

**Props**:
```typescript
interface PageGalleryProps {
  totalPages: number;        // Required (78)
  visiblePages: number[];    // Required (e.g., [5, 6, 7, 8, 9])
  activePage: number;        // Required
  pageTexts: Map<number, string>; // Required
  searchMatches: SearchMatch[]; // Required
  onPageVisibilityChange: (pageNumber: number, isVisible: boolean) => void;
  onActivePageChange: (pageNumber: number) => void;
}
```

**Rendering Contract**:
```tsx
<main className="min-h-screen bg-gray-100 py-8">
  <div className="space-y-8 md:space-y-10">
    {visiblePages.map(pageNumber => (
      <PageContainer
        key={pageNumber}
        pageNumber={pageNumber}
        isActive={pageNumber === activePage}
        searchMatches={searchMatches.filter(m => m.pageNumber === pageNumber)}
        onVisibilityChange={(isVisible) =>
          onPageVisibilityChange(pageNumber, isVisible)
        }
      />
    ))}
  </div>
</main>
```

**Virtualization Logic**:
```typescript
// In parent component (ManifestoReaderShell)
const visiblePages = useMemo(() => {
  const centerPage = activePage;
  const buffer = 2; // Render ±2 pages

  return Array.from(
    { length: buffer * 2 + 1 },
    (_, i) => centerPage - buffer + i
  ).filter(p => p >= 1 && p <= 78);
}, [activePage]);
```

---

## 6. PageContainer (Individual Page Wrapper)

**Responsibility**: Wrap PDF page, manage IntersectionObserver

**Props**:
```typescript
interface PageContainerProps {
  pageNumber: number;        // Required
  isActive: boolean;         // Required
  searchMatches: SearchMatch[]; // Required
  onVisibilityChange: (isVisible: boolean) => void; // Required
}
```

**Rendering Contract**:
```tsx
<div
  id={`page-${pageNumber}`}
  ref={containerRef}
  className={cn(
    "mx-auto max-w-[900px] bg-white shadow-lg rounded-lg overflow-hidden",
    isActive && "ring-2 ring-blue-500"
  )}
  data-page-number={pageNumber}
>
  <PdfPageRenderer
    pageNumber={pageNumber}
    searchMatches={searchMatches}
  />
</div>
```

**IntersectionObserver Setup**:
```typescript
useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      onVisibilityChange(entry.isIntersecting);
    },
    { threshold: 0.5 } // 50% visible
  );

  if (containerRef.current) {
    observer.observe(containerRef.current);
  }

  return () => observer.disconnect();
}, [onVisibilityChange]);
```

---

## 7. PdfPageRenderer (Canvas + Text Layer)

**Responsibility**: Render PDF page using PDF.js

**Props**:
```typescript
interface PdfPageRendererProps {
  pageNumber: number;        // Required
  searchMatches: SearchMatch[]; // Required
}
```

**Rendering Contract**:
```tsx
<div className="relative">
  {/* Canvas Layer (Visual) */}
  <canvas
    ref={canvasRef}
    className="w-full h-auto"
    aria-hidden="true"
  />

  {/* Text Layer (Selectable) */}
  <div
    ref={textLayerRef}
    className="absolute inset-0 overflow-hidden"
    style={{
      lineHeight: 1,
      fontSize: '1px', // Scaled by PDF.js
    }}
  >
    {/* PDF.js renders text spans here */}
    {/* Highlights injected for search matches */}
  </div>
</div>
```

**PDF.js Rendering Flow**:
```typescript
useEffect(() => {
  const renderPage = async () => {
    const page = await pdfDocument.getPage(pageNumber);

    // Render canvas
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;

    // Render text layer
    const textContent = await page.getTextContent();
    pdfjsLib.renderTextLayer({
      textContentSource: textContent,
      container: textLayerRef.current,
      viewport,
    });
  };

  renderPage();
}, [pageNumber, pdfDocument]);
```

**Search Highlight Injection**:
```typescript
useEffect(() => {
  if (searchMatches.length === 0) return;

  // Find text spans in text layer that match search positions
  const textLayer = textLayerRef.current;
  const textSpans = textLayer.querySelectorAll('span');

  searchMatches.forEach(match => {
    // Wrap matched text in <mark> element
    const span = findSpanAtOffset(textSpans, match.startOffset);
    if (span) {
      span.innerHTML = span.innerHTML.replace(
        new RegExp(match.matchedText, 'gi'),
        `<mark class="${match.isActive ? 'bg-yellow-200' : 'bg-yellow-100'}">$&</mark>`
      );
    }
  });
}, [searchMatches]);
```

---

## 8. PageIndicator (Page Counter Badge)

**Responsibility**: Display "Page X / 78" badge

**Props**:
```typescript
interface PageIndicatorProps {
  currentPage: number;       // Required
  totalPages: number;        // Required (78)
  position?: 'left' | 'right'; // Default: 'right'
}
```

**Rendering Contract**:
```tsx
<div
  className={cn(
    "fixed bottom-4 z-50 px-3 py-1 bg-gray-900 text-white text-sm rounded-full shadow-lg",
    position === 'left' ? 'left-4' : 'right-4'
  )}
  aria-live="polite"
  aria-atomic="true"
>
  Page {currentPage} / {totalPages}
</div>
```

**Accessibility**:
- Uses aria-live="polite" to announce page changes to screen readers
- Updates only when currentPage changes (not on every scroll event)

---

## Component Hierarchy

```
ManifestoReaderShell (State Container)
│
├─ Header
│  └─ Logo + Search Icon
│
├─ SearchBar (Conditional: isOpen)
│  ├─ Search Input
│  ├─ Match Counter
│  └─ Prev/Next Buttons
│
├─ SectionTabs
│  └─ Section Buttons (×12)
│
├─ PageGallery
│  └─ PageContainer (×5 visible)
│     └─ PdfPageRenderer
│        ├─ Canvas (Visual Layer)
│        └─ Text Layer (Selectable + Highlights)
│
└─ PageIndicator
```

---

## Testing Contracts

### Example: Testing Header Component

```typescript
describe('Header', () => {
  it('should render logo with correct alt text', () => {
    render(<Header logoUrl="/logo.svg" logoAlt="UWP Logo" onSearchClick={jest.fn()} />);
    expect(screen.getByAltText('UWP Logo')).toBeInTheDocument();
  });

  it('should call onSearchClick when search icon is clicked', () => {
    const onSearchClick = jest.fn();
    render(<Header onSearchClick={onSearchClick} />);
    fireEvent.click(screen.getByLabelText('Open search'));
    expect(onSearchClick).toHaveBeenCalledTimes(1);
  });

  it('should be keyboard accessible', () => {
    const onSearchClick = jest.fn();
    render(<Header onSearchClick={onSearchClick} />);
    const button = screen.getByLabelText('Open search');
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(onSearchClick).toHaveBeenCalled();
  });
});
```

### Example: Testing SearchBar Component

```typescript
describe('SearchBar', () => {
  it('should call onQueryChange when user types', () => {
    const onQueryChange = jest.fn();
    render(
      <SearchBar
        isOpen={true}
        query=""
        results={null}
        onQueryChange={onQueryChange}
        onSearch={jest.fn()}
        onClose={jest.fn()}
        onPrevMatch={jest.fn()}
        onNextMatch={jest.fn()}
      />
    );

    const input = screen.getByPlaceholderText('Search manifesto...');
    fireEvent.change(input, { target: { value: 'renewable' } });
    expect(onQueryChange).toHaveBeenCalledWith('renewable');
  });

  it('should call onSearch when Enter is pressed', () => {
    const onSearch = jest.fn();
    render(
      <SearchBar
        isOpen={true}
        query="energy"
        results={null}
        onQueryChange={jest.fn()}
        onSearch={onSearch}
        onClose={jest.fn()}
        onPrevMatch={jest.fn()}
        onNextMatch={jest.fn()}
      />
    );

    const input = screen.getByPlaceholderText('Search manifesto...');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it('should display match counter when results are present', () => {
    const results = {
      query: 'energy',
      matches: [{...}, {...}, {...}],
      totalMatches: 3,
      currentMatchIndex: 1,
    };

    render(<SearchBar isOpen={true} query="energy" results={results} {...handlers} />);
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });
});
```

---

## Summary

All component contracts are:
- **Strictly typed** with TypeScript interfaces
- **Testable** with clear input/output contracts
- **Accessible** with ARIA labels and keyboard support
- **Responsive** with mobile-first Tailwind classes
- **Error-resilient** with graceful fallbacks

Next: [Hook Contracts](./hook-contracts.md)
