# Research & Technical Decisions: UWP Manifesto Reader

**Feature**: 001-manifesto-reader
**Date**: 2025-11-23
**Status**: Phase 0 Complete

## Purpose

This document captures all technology research, architectural decisions, and best practices for implementing the UWP Manifesto Reader. It resolves all technical unknowns identified during planning and provides rationale for key implementation choices.

---

## 1. PDF Rendering Technology

### Decision: PDF.js (pdfjs-dist)

**Chosen**: `pdfjs-dist` v3.11+ (self-hosted)

**Rationale**:
- Industry-standard PDF rendering library used by Firefox, widely trusted
- Supports both canvas rendering (visual) AND text layer extraction (searchable/selectable)
- Zero external dependencies when self-hosted (meets FR-004 requirement)
- Excellent TypeScript support with @types/pdfjs-dist
- Proven performance with large documents (78 pages is well within capabilities)
- Active maintenance and security updates from Mozilla

**Alternatives Considered**:

| Alternative | Rejected Because |
|-------------|------------------|
| react-pdf | Wrapper around PDF.js, adds unnecessary abstraction layer; we need direct control for text layer manipulation |
| pdf-lib | Focused on PDF creation/modification, not rendering; lacks browser-based rendering capabilities |
| Native browser `<embed>` / `<iframe>` | No control over search UI, navigation, or styling; cannot implement custom search highlighting |
| Server-side PDF to image conversion | Violates "fully self-hosted" constraint; increases latency; loses text selectability |

**Implementation Notes**:
- Host PDF.js worker files in `/public/pdfjs/` directory
- Configure worker path: `GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.js'`
- Render each page to canvas for visual display
- Overlay text layer DOM for selectability and native browser search
- Use `getTextContent()` API to extract searchable text per page

---

## 2. Virtualization Strategy

### Decision: Custom Virtualization with IntersectionObserver

**Chosen**: Custom implementation using IntersectionObserver API + React state

**Rationale**:
- Native browser API (IntersectionObserver) has excellent performance
- Simple to implement for vertical scrolling use case (no complex grid)
- Full control over render window size (optimize for 3-5 visible pages)
- No external dependencies (aligns with self-hosted constraint)
- IntersectionObserver is supported in all target browsers (Chrome 51+, Firefox 55+, Safari 12.1+)

**Alternatives Considered**:

| Alternative | Rejected Because |
|-------------|------------------|
| react-window / react-virtualized | Adds 30KB+ dependency; overkill for simple vertical list; we need page-specific IDs for section navigation |
| CSS `content-visibility: auto` | Insufficient browser support for target audience; doesn't solve DOM node count issue |
| Full 78-page render (no virtualization) | Violates FR-037; causes jank on mobile; 78 canvas elements = ~100MB+ memory |

**Implementation Strategy**:
```typescript
// Pseudo-code for virtualization logic
const visiblePages = useMemo(() => {
  const viewportCenter = scrollY + windowHeight / 2;
  const centerPage = Math.floor(viewportCenter / pageHeight);

  // Render ±2 pages from center (5 total visible)
  return Array.from(
    { length: 5 },
    (_, i) => centerPage - 2 + i
  ).filter(p => p >= 1 && p <= 78);
}, [scrollY, windowHeight, pageHeight]);

// Use IntersectionObserver to track which page is most visible
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      const mostVisible = entries.reduce((max, entry) =>
        entry.intersectionRatio > max.intersectionRatio ? entry : max
      );
      setActivePage(Number(mostVisible.target.id.replace('page-', '')));
    },
    { threshold: [0.5] } // Trigger when 50% visible
  );

  pageRefs.forEach(ref => observer.observe(ref));
  return () => observer.disconnect();
}, []);
```

---

## 3. Search Implementation

### Decision: Client-Side Full-Text Search with Map-Based Indexing

**Chosen**: In-memory text index using Map<pageNumber, string> + case-insensitive regex matching

**Rationale**:
- 78 pages × ~500 words/page = ~39,000 words = ~50-100KB text (easily fits in memory)
- No server required (fully client-side)
- Simple implementation: extract text on load, search with `String.prototype.indexOf()`
- Fast enough for <2s requirement (linear scan of 100KB text is <50ms on modern devices)
- Case-insensitive by converting query and text to lowercase

**Alternatives Considered**:

| Alternative | Rejected Because |
|-------------|------------------|
| Fuse.js / Lunr.js | Adds 15-50KB dependency for fuzzy search we don't need (FR-033 requires exact substring match only) |
| Browser native `window.find()` | No programmatic control; can't implement custom highlighting or match counting |
| Server-side search API | Violates "fully self-hosted" constraint; adds latency |
| WebAssembly search engine | Over-engineered for 100KB text corpus |

**Implementation Strategy**:
```typescript
// Extract text from all pages on load
const extractAllText = async (pdf: PDFDocumentProxy): Promise<Map<number, string>> => {
  const textMap = new Map<number, string>();

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map(item => ('str' in item ? item.str : ''))
      .join(' ');
    textMap.set(pageNum, pageText);
  }

  return textMap;
};

// Search across all pages
const search = (query: string, textMap: Map<number, string>): SearchMatch[] => {
  const matches: SearchMatch[] = [];
  const lowerQuery = query.toLowerCase();

  textMap.forEach((text, pageNum) => {
    const lowerText = text.toLowerCase();
    let index = 0;

    while ((index = lowerText.indexOf(lowerQuery, index)) !== -1) {
      matches.push({
        pageNumber: pageNum,
        matchIndex: matches.length,
        startOffset: index,
        endOffset: index + query.length,
      });
      index += query.length;
    }
  });

  return matches;
};
```

---

## 4. Highlighting Strategy

### Decision: Dynamic Highlight Overlay with CSS Pseudo-Elements

**Chosen**: Inject `<mark>` elements into text layer, styled with Tailwind utilities

**Rationale**:
- PDF.js text layer is rendered as absolutely positioned `<span>` elements
- Can wrap matched text in `<mark>` tags without re-rendering canvas
- CSS allows smooth yellow highlight: `bg-yellow-200` (soft) for active match, `bg-yellow-100` (faint) for others
- Clean separation: rendering logic stays in PdfPageRenderer, highlighting in SearchBar

**Alternatives Considered**:

| Alternative | Rejected Because |
|-------------|------------------|
| Canvas-based highlighting | Requires re-rendering canvas; text layer wouldn't be highlighted for native search |
| SVG overlay | More complex coordinate mapping; unnecessary for text-based highlights |
| CSS `:target` pseudo-class | Can't highlight multiple matches; limited styling control |

**Implementation Notes**:
- Only highlight matches on currently visible pages (performance optimization)
- Remove highlights when search is cleared or Escape is pressed
- Use `scrollIntoView({ behavior: 'smooth', block: 'center' })` to navigate to matches

---

## 5. Smooth Scrolling & Section Navigation

### Decision: Native CSS Scroll Behavior + JavaScript Fallback

**Chosen**: `scroll-behavior: smooth` CSS property + `Element.scrollIntoView()` API

**Rationale**:
- Native CSS property supported in all target browsers
- Zero JavaScript required for basic smooth scrolling
- `scrollIntoView({ behavior: 'smooth', block: 'start' })` for section tab clicks
- Optional scroll-snap-type for "sticky" page centering (FR-038 optional enhancement)

**Alternatives Considered**:

| Alternative | Rejected Because |
|-------------|------------------|
| GSAP / Framer Motion | Adds 30-50KB dependency; overkill for simple scroll animation |
| Custom scroll interpolation | Reinventing the wheel; native API is sufficient |

**Implementation Strategy**:
```css
/* Global scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Optional: Scroll snapping for natural page centering */
.page-gallery {
  scroll-snap-type: y proximity;
}

.page-container {
  scroll-snap-align: center;
}
```

```typescript
// Section tab click handler
const scrollToPage = (pageNumber: number) => {
  const element = document.getElementById(`page-${pageNumber}`);
  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
```

---

## 6. State Management

### Decision: React useState + useReducer (No External Library)

**Chosen**: Built-in React hooks for all state management

**Rationale**:
- Application state is simple: `activePage`, `searchQuery`, `matches[]`, `currentMatchIndex`
- No complex async state transitions
- Component tree is shallow (3-4 levels max)
- Prop drilling is minimal
- Adding Redux/Zustand would be over-engineering

**State Architecture**:
```typescript
// Top-level state in ManifestoReaderShell
const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
const [pageTexts, setPageTexts] = useState<Map<number, string>>(new Map());
const [activePage, setActivePage] = useState<number>(1);

// Search state (could use useReducer for complex transitions)
const [searchState, dispatchSearch] = useReducer(searchReducer, {
  query: '',
  matches: [],
  currentMatchIndex: -1,
  isSearchOpen: false,
});

// Custom hooks to encapsulate logic
const { loadPdf, extractText } = usePdfDocument();
const { performSearch, nextMatch, prevMatch } = useSearch(pageTexts);
const { activePageNumber } = usePageVisibility(pageRefs);
```

**Alternatives Considered**:

| Alternative | Rejected Because |
|-------------|------------------|
| Redux Toolkit | Overkill for 4-5 state values; adds complexity and bundle size |
| Zustand | Simpler than Redux but still unnecessary; no cross-component state sharing needed |
| Jotai / Recoil | Atomic state management is overkill; state doesn't need global accessibility |

---

## 7. Responsive Design Strategy

### Decision: Tailwind CSS with Mobile-First Breakpoints

**Chosen**: Tailwind CSS utility-first approach with responsive modifiers (`sm:`, `md:`, `lg:`)

**Rationale**:
- Constraint requires Tailwind CSS (specified in spec)
- Mobile-first approach ensures base styles work on smallest screens (320px)
- Breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`
- Utility classes avoid CSS-in-JS overhead

**Responsive Patterns**:

| Element | Mobile (<640px) | Desktop (≥640px) |
|---------|----------------|------------------|
| Page width | `w-full px-4` | `max-w-[900px] mx-auto` |
| Section tabs | `overflow-x-auto text-xs` | `text-sm` |
| Tab labels | Short labels (e.g., "Leader") | Full labels (e.g., "MESSAGE FROM OUR POLITICAL LEADER") |
| Search bar | Full width below header | Inline with header (right side) |
| Page spacing | `space-y-8` (32px) | `space-y-10` (40px) |

**Implementation Example**:
```tsx
<div className="w-full px-4 md:max-w-[900px] md:mx-auto md:px-0">
  <PageContainer pageNumber={1} />
</div>

<div className="overflow-x-auto md:overflow-x-visible">
  <div className="flex space-x-2 text-xs md:text-sm">
    {sections.map(section => (
      <button className="px-3 py-1 whitespace-nowrap">
        <span className="md:hidden">{section.shortLabel}</span>
        <span className="hidden md:inline">{section.fullLabel}</span>
      </button>
    ))}
  </div>
</div>
```

---

## 8. Performance Optimization Techniques

### Decision: Multi-Layered Optimization Strategy

**Chosen Techniques**:

1. **Lazy Loading**: Only render 3-5 pages near viewport (FR-037)
2. **Code Splitting**: Dynamic import for PDF.js worker (`next/dynamic`)
3. **Image Optimization**: Use Next.js `<Image>` for logo (automatic WebP conversion)
4. **Text Extraction Memoization**: Cache extracted text, never re-extract
5. **Debounced Search**: Debounce search input by 300ms to avoid excessive re-renders
6. **Canvas Recycling**: Reuse canvas elements when pages scroll out of view
7. **CSS Containment**: `contain: layout paint` on page containers

**Performance Budget**:
- Initial page load: <5s on 5Mbps connection
- Time to interactive: <3s
- Largest Contentful Paint (LCP): <2.5s
- Cumulative Layout Shift (CLS): <0.1
- Search response time: <2s for all 78 pages

**Measurement Strategy**:
- Use Lighthouse CI in GitHub Actions
- Monitor Core Web Vitals in E2E tests
- Performance regression gates in CI pipeline

---

## 9. Keyboard Shortcuts Implementation

### Decision: Global Event Listeners with useEffect

**Chosen**: `keydown` event listeners in custom `useKeyboardShortcuts` hook

**Rationale**:
- Simple key mappings: `/` → focus search, `Escape` → close search
- No conflict with browser defaults (these keys are safe to intercept)
- Can prevent default behavior only when appropriate context

**Implementation**:
```typescript
const useKeyboardShortcuts = (
  searchInputRef: RefObject<HTMLInputElement>,
  closeSearch: () => void
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // "/" key - focus search (unless already typing)
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Escape key - close search
      if (e.key === 'Escape') {
        closeSearch();
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchInputRef, closeSearch]);
};
```

---

## 10. Testing Strategy

### Decision: Three-Tier Testing Approach

**Chosen Strategy**:

1. **Unit Tests (Jest + React Testing Library)**
   - Test pure functions: `searchEngine.ts`, `textExtractor.ts`, `scrollUtils.ts`
   - Test custom hooks in isolation: `usePdfDocument`, `useSearch`
   - Target: 80%+ coverage for lib/ and hooks/

2. **Integration Tests (React Testing Library)**
   - Test component interactions: SearchBar + PageGallery
   - Mock PDF.js with fixture data
   - Test state changes: search query → matches → navigation
   - Target: All user stories have corresponding integration tests

3. **E2E Tests (Playwright)**
   - Full user flows: Load page → Search → Navigate → Verify
   - Cross-browser testing (Chrome, Firefox, Safari)
   - Performance audits with Lighthouse
   - Target: Critical paths (P1-P3 user stories)

**Example E2E Test**:
```typescript
test('should search manifesto and navigate results', async ({ page }) => {
  await page.goto('/manifesto');

  // Wait for PDF to load
  await page.waitForSelector('#page-1');

  // Click search icon
  await page.click('[data-testid="search-icon"]');

  // Type query
  await page.fill('[data-testid="search-input"]', 'renewable energy');
  await page.press('[data-testid="search-input"]', 'Enter');

  // Verify match counter appears
  await expect(page.locator('[data-testid="match-counter"]')).toContainText('/');

  // Navigate to next match
  await page.click('[data-testid="next-match"]');

  // Verify page scrolled
  const activePage = await page.locator('[data-testid="active-page"]').textContent();
  expect(Number(activePage)).toBeGreaterThan(1);
});
```

---

## 11. Accessibility Considerations

### Decision: WCAG 2.1 AA Baseline Compliance

**Chosen Standards**:
- Semantic HTML5 elements (`<nav>`, `<main>`, `<button>`)
- ARIA labels for icon buttons (search icon, prev/next buttons)
- Keyboard navigation support (Tab, Enter, Escape, /)
- Focus management (trap focus in search when open)
- Sufficient color contrast (4.5:1 for text, 3:1 for UI components)

**Implementation Checklist**:
- [ ] All interactive elements keyboard accessible
- [ ] Search icon: `<button aria-label="Open search">`
- [ ] Section tabs: `<nav aria-label="Manifesto sections">`
- [ ] Active tab: `aria-current="true"`
- [ ] Search input: `<input aria-label="Search manifesto" />`
- [ ] Match counter: `<span aria-live="polite">Match 3 of 12</span>`
- [ ] Skip to content link for keyboard users

---

## 12. Error Handling Strategy

### Decision: Graceful Degradation with User-Friendly Messages

**Error Scenarios & Handling**:

| Error Scenario | Handling Strategy |
|----------------|-------------------|
| PDF fails to load | Display error message: "Unable to load manifesto. Please refresh the page." + retry button |
| Network timeout | Show loading spinner with timeout message after 10s |
| Page render failure | Skip page, log error, continue rendering other pages |
| Search with no matches | Display: "No results found for '{query}'" |
| JavaScript disabled | Show noscript message: "This feature requires JavaScript to view the interactive manifesto." |
| Unsupported browser | Detect with feature detection, show upgrade message if IntersectionObserver missing |

**Implementation**:
```typescript
const ErrorBoundary = ({ error, reset }: { error: Error; reset: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-8">
    <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
    <p className="text-gray-600 mb-6">{error.message}</p>
    <button onClick={reset} className="px-4 py-2 bg-blue-600 text-white rounded">
      Try Again
    </button>
  </div>
);
```

---

## 13. Self-Hosting PDF.js Assets

### Decision: Copy Worker Files to /public During Build

**Chosen Approach**: Post-install script to copy PDF.js worker files from node_modules to public/

**Rationale**:
- Ensures zero CDN requests (FR-004 requirement)
- Worker files are static, don't need dynamic bundling
- Next.js serves /public files with correct MIME types

**Implementation**:
```json
// package.json
{
  "scripts": {
    "postinstall": "node scripts/copy-pdfjs-worker.js"
  }
}
```

```javascript
// scripts/copy-pdfjs-worker.js
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../node_modules/pdfjs-dist/build');
const destDir = path.join(__dirname, '../public/pdfjs');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(
  path.join(srcDir, 'pdf.worker.min.js'),
  path.join(destDir, 'pdf.worker.min.js')
);

fs.copyFileSync(
  path.join(srcDir, 'pdf.worker.min.js.map'),
  path.join(destDir, 'pdf.worker.min.js.map')
);

console.log('✓ PDF.js worker files copied to /public/pdfjs');
```

---

## 14. Section-to-Page Mapping

### Decision: Static Constant with TypeScript Type Safety

**Chosen**: Hardcoded array in `lib/utils/constants.ts` with strict typing

**Rationale**:
- 12 sections are fixed, specified in requirements (won't change dynamically)
- Type safety prevents typos in page numbers
- Easy to test and maintain

**Implementation**:
```typescript
// lib/utils/constants.ts
export interface Section {
  id: string;
  title: string;
  shortLabel: string;
  pageNumber: number;
}

export const MANIFESTO_SECTIONS: readonly Section[] = [
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

export const TOTAL_PAGES = 78;
```

---

## Summary of Key Technical Decisions

| Area | Decision | Primary Rationale |
|------|----------|-------------------|
| PDF Rendering | PDF.js (pdfjs-dist) | Industry standard, text layer support, self-hostable |
| Virtualization | Custom IntersectionObserver | Native API, no dependencies, sufficient for vertical scroll |
| Search | Client-side Map + indexOf | <100KB text fits in memory, <50ms search time |
| Highlighting | `<mark>` elements in text layer | Clean separation, works with native search |
| Scroll | Native CSS smooth scroll | Zero JS, browser-optimized |
| State | React hooks (useState/useReducer) | Simple state, no need for global store |
| Responsive | Tailwind mobile-first | Required by spec, utility-first approach |
| Testing | Jest + RTL + Playwright | Standard React testing stack |
| Performance | Lazy load + code split + memoize | Meets 60fps + <5s load targets |

---

## Next Steps (Phase 1)

With all technology decisions finalized, Phase 1 will focus on:

1. **data-model.md**: Define TypeScript interfaces for all entities
2. **contracts/**: Document component APIs and data flow
3. **quickstart.md**: Step-by-step developer setup guide

**Phase 0 Status**: ✅ **COMPLETE** - All technical unknowns resolved.
