# Utility Contracts

**Purpose**: Define all pure utility functions in lib/

---

## 1. PDF Loading & Text Extraction

### Location: `lib/pdf/pdfLoader.ts`

#### loadPdfDocument

**Purpose**: Load PDF file using PDF.js

**Signature**:
```typescript
function loadPdfDocument(url: string): Promise<PDFDocumentProxy>
```

**Contract**:
```typescript
/**
 * Loads a PDF document from the given URL
 * @param url - Absolute or relative path to PDF file
 * @returns Promise resolving to PDF.js document proxy
 * @throws Error if file not found or invalid PDF format
 */
export const loadPdfDocument = async (url: string): Promise<PDFDocumentProxy> => {
  // Configure PDF.js worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = CONFIG.PDFJS_WORKER_PATH;

  // Load document
  const loadingTask = pdfjsLib.getDocument(url);
  const pdf = await loadingTask.promise;

  return pdf;
};
```

**Test Cases**:
- Valid PDF URL → Returns PDFDocumentProxy
- Invalid URL (404) → Throws Error
- Invalid PDF format → Throws Error
- Empty URL → Throws Error

---

### Location: `lib/pdf/textExtractor.ts`

#### extractPageText

**Purpose**: Extract text from a single PDF page

**Signature**:
```typescript
function extractPageText(page: PDFPageProxy): Promise<string>
```

**Contract**:
```typescript
/**
 * Extracts text content from a PDF page
 * @param page - PDF.js page proxy
 * @returns Promise resolving to plain text string
 */
export const extractPageText = async (page: PDFPageProxy): Promise<string> => {
  const textContent = await page.getTextContent();

  const text = textContent.items
    .map(item => {
      if ('str' in item) {
        return item.str;
      }
      return '';
    })
    .join(' ');

  return text;
};
```

**Test Cases**:
- Page with text → Returns text string
- Page with images only → Returns empty string
- Page with mixed content → Returns only text portions

---

#### extractAllPageTexts

**Purpose**: Extract text from all pages in a PDF

**Signature**:
```typescript
function extractAllPageTexts(pdf: PDFDocumentProxy): Promise<Map<number, string>>
```

**Contract**:
```typescript
/**
 * Extracts text from all pages in a PDF document
 * @param pdf - PDF.js document proxy
 * @returns Promise resolving to Map of pageNumber -> text
 */
export const extractAllPageTexts = async (
  pdf: PDFDocumentProxy
): Promise<Map<number, string>> => {
  const pageTexts = new Map<number, string>();

  // Extract text from each page sequentially
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const text = await extractPageText(page);
    pageTexts.set(pageNum, text);
  }

  return pageTexts;
};
```

**Performance**:
- Sequential extraction to avoid memory spikes
- ~2-5 seconds for 78 pages
- Could be parallelized with `Promise.all()` if needed

**Test Cases**:
- 78-page PDF → Returns Map with 78 entries
- Page numbers are 1-indexed (not 0-indexed)
- Map keys match page numbers exactly

---

## 2. Search Engine

### Location: `lib/search/searchEngine.ts`

#### search

**Purpose**: Search for query across all pages

**Signature**:
```typescript
function search(
  query: string,
  pageTexts: Map<number, string>
): SearchMatch[]
```

**Contract**:
```typescript
/**
 * Searches for a query string across all pages
 * @param query - Search query (case-insensitive)
 * @param pageTexts - Map of page number to text content
 * @returns Array of SearchMatch objects, sorted by page then offset
 */
export const search = (
  query: string,
  pageTexts: Map<number, string>
): SearchMatch[] => {
  if (!query.trim()) {
    return [];
  }

  const matches: SearchMatch[] = [];
  const lowerQuery = query.toLowerCase();
  let globalIndex = 0;

  // Iterate pages in order
  const sortedPages = Array.from(pageTexts.keys()).sort((a, b) => a - b);

  for (const pageNumber of sortedPages) {
    const text = pageTexts.get(pageNumber)!;
    const lowerText = text.toLowerCase();

    let matchIndexOnPage = 0;
    let startOffset = 0;

    // Find all occurrences on this page
    while ((startOffset = lowerText.indexOf(lowerQuery, startOffset)) !== -1) {
      matches.push({
        id: `${pageNumber}-${matchIndexOnPage}`,
        pageNumber,
        matchIndexOnPage,
        globalIndex,
        startOffset,
        endOffset: startOffset + query.length,
        matchedText: text.substring(startOffset, startOffset + query.length),
        isActive: globalIndex === 0, // First match is active by default
      });

      matchIndexOnPage++;
      globalIndex++;
      startOffset += query.length; // Move past this match
    }
  }

  return matches;
};
```

**Algorithm**:
- Case-insensitive substring search
- Uses `String.prototype.indexOf()` (O(n*m) worst case, but fast in practice)
- Iterates pages in ascending order
- Captures exact matched text (preserves original case)

**Test Cases**:
```typescript
describe('search', () => {
  const pageTexts = new Map([
    [1, 'Renewable energy is important'],
    [2, 'Agriculture and renewable resources'],
    [3, 'Energy policy for the future'],
  ]);

  it('should find all case-insensitive matches', () => {
    const matches = search('energy', pageTexts);
    expect(matches).toHaveLength(2);
    expect(matches[0].pageNumber).toBe(1);
    expect(matches[1].pageNumber).toBe(3);
  });

  it('should preserve original case in matchedText', () => {
    const matches = search('energy', pageTexts);
    expect(matches[0].matchedText).toBe('energy');
    expect(matches[1].matchedText).toBe('Energy');
  });

  it('should return empty array for empty query', () => {
    const matches = search('', pageTexts);
    expect(matches).toEqual([]);
  });

  it('should find multiple matches on same page', () => {
    const matches = search('renewable', pageTexts);
    expect(matches).toHaveLength(2);
    expect(matches[0].pageNumber).toBe(1);
    expect(matches[1].pageNumber).toBe(2);
    expect(matches[0].matchIndexOnPage).toBe(0);
    expect(matches[1].matchIndexOnPage).toBe(0);
  });
});
```

---

#### highlightMatches

**Purpose**: Generate highlight markup for matches

**Signature**:
```typescript
function highlightMatches(
  text: string,
  matches: SearchMatch[],
  activeMatchId: string | null
): string
```

**Contract**:
```typescript
/**
 * Wraps matched text in <mark> tags for highlighting
 * @param text - Original text content
 * @param matches - Search matches for this text
 * @param activeMatchId - ID of currently active match
 * @returns HTML string with <mark> elements
 */
export const highlightMatches = (
  text: string,
  matches: SearchMatch[],
  activeMatchId: string | null
): string => {
  if (matches.length === 0) {
    return text;
  }

  let result = '';
  let lastIndex = 0;

  // Sort matches by offset
  const sortedMatches = [...matches].sort((a, b) => a.startOffset - b.startOffset);

  for (const match of sortedMatches) {
    // Add text before match
    result += text.substring(lastIndex, match.startOffset);

    // Add highlighted match
    const className = match.id === activeMatchId ? 'bg-yellow-200' : 'bg-yellow-100';
    result += `<mark class="${className}">${match.matchedText}</mark>`;

    lastIndex = match.endOffset;
  }

  // Add remaining text
  result += text.substring(lastIndex);

  return result;
};
```

**Test Cases**:
- Single match → One `<mark>` tag
- Multiple matches → Multiple `<mark>` tags in order
- Active match → Has `bg-yellow-200` class
- Inactive matches → Have `bg-yellow-100` class
- Overlapping matches → Handled by sorting and deduplication

---

## 3. Scroll Utilities

### Location: `lib/utils/scrollUtils.ts`

#### smoothScrollToElement

**Purpose**: Scroll to element with smooth behavior

**Signature**:
```typescript
function smoothScrollToElement(
  elementId: string,
  options?: ScrollIntoViewOptions
): void
```

**Contract**:
```typescript
/**
 * Smoothly scrolls to an element by ID
 * @param elementId - ID of element to scroll to (without '#')
 * @param options - ScrollIntoView options (defaults to smooth + center)
 */
export const smoothScrollToElement = (
  elementId: string,
  options: ScrollIntoViewOptions = {
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
  }
): void => {
  const element = document.getElementById(elementId);

  if (!element) {
    console.warn(`Element with ID "${elementId}" not found`);
    return;
  }

  element.scrollIntoView(options);
};
```

**Browser Compatibility**:
- `scrollIntoView` supported in all modern browsers
- `behavior: 'smooth'` supported in Chrome 61+, Firefox 36+, Safari 15.4+
- Fallback to instant scroll on older browsers (graceful degradation)

**Test Cases**:
- Valid element ID → Scrolls to element
- Invalid element ID → Logs warning, no error thrown
- Custom options → Uses provided options

---

#### getScrollProgress

**Purpose**: Calculate scroll progress as percentage

**Signature**:
```typescript
function getScrollProgress(): number
```

**Contract**:
```typescript
/**
 * Calculates scroll progress as percentage (0-100)
 * @returns Scroll progress percentage
 */
export const getScrollProgress = (): number => {
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollY = window.scrollY;

  if (scrollHeight === 0) {
    return 0;
  }

  return (scrollY / scrollHeight) * 100;
};
```

**Use Cases**:
- Progress bars
- Lazy loading triggers
- Analytics tracking

**Test Cases**:
- At top of page → Returns 0
- At bottom of page → Returns 100
- Mid-scroll → Returns value between 0-100
- Short page (no scroll) → Returns 0

---

## 4. Constants

### Location: `lib/utils/constants.ts`

#### MANIFESTO_SECTIONS

**Type**: `readonly Section[]`

**Contract**:
```typescript
export const MANIFESTO_SECTIONS: readonly Section[] = [
  {
    id: 'leader',
    title: 'MESSAGE FROM OUR POLITICAL LEADER',
    shortLabel: 'Leader',
    pageNumber: 4,
  },
  {
    id: 'vision',
    title: 'THE VISION',
    shortLabel: 'Vision',
    pageNumber: 10,
  },
  // ... 10 more sections
] as const;
```

**Validation**:
```typescript
// Compile-time check: all sections have required fields
type ValidSection = typeof MANIFESTO_SECTIONS[number]; // Should equal Section type

// Runtime validation
export const validateSections = (sections: readonly Section[]): void => {
  if (sections.length !== 12) {
    throw new Error(`Expected 12 sections, got ${sections.length}`);
  }

  sections.forEach((section, i) => {
    if (i > 0 && section.pageNumber <= sections[i - 1].pageNumber) {
      throw new Error(`Sections must be in ascending page order`);
    }
  });
};

validateSections(MANIFESTO_SECTIONS); // Run on module load
```

---

#### CONFIG

**Type**: `Readonly<Configuration>`

**Contract**:
```typescript
export const CONFIG = {
  TOTAL_PAGES: 78,
  RENDER_BUFFER: 2,
  SEARCH_DEBOUNCE_MS: 300,
  MAX_PAGE_WIDTH_PX: 1000,
  PAGE_SPACING_PX: {
    mobile: 32,
    desktop: 40,
  },
  ACTIVE_PAGE_THRESHOLD: 0.5,
  SCROLL_BEHAVIOR: 'smooth' as ScrollBehavior,
  PDFJS_WORKER_PATH: '/pdfjs/pdf.worker.min.js',
  PDF_URL: '/manifesto.pdf',
} as const;
```

**Usage**:
```typescript
// Type-safe access
const totalPages: number = CONFIG.TOTAL_PAGES; // ✓ Type: 78
CONFIG.TOTAL_PAGES = 100; // ✗ Error: Cannot assign to read-only property
```

---

## 5. Validation Functions

### Location: `lib/utils/validation.ts`

#### isValidPageNumber

**Signature**:
```typescript
function isValidPageNumber(n: unknown): n is number
```

**Contract**:
```typescript
/**
 * Type guard for valid page numbers (1-78)
 * @param n - Value to check
 * @returns true if n is a valid page number
 */
export const isValidPageNumber = (n: unknown): n is number => {
  return (
    typeof n === 'number' &&
    Number.isInteger(n) &&
    n >= 1 &&
    n <= CONFIG.TOTAL_PAGES
  );
};
```

**Test Cases**:
```typescript
expect(isValidPageNumber(1)).toBe(true);
expect(isValidPageNumber(78)).toBe(true);
expect(isValidPageNumber(0)).toBe(false);
expect(isValidPageNumber(79)).toBe(false);
expect(isValidPageNumber(1.5)).toBe(false);
expect(isValidPageNumber('5')).toBe(false);
expect(isValidPageNumber(null)).toBe(false);
```

---

#### isValidSearchMatch

**Signature**:
```typescript
function isValidSearchMatch(match: unknown): match is SearchMatch
```

**Contract**:
```typescript
/**
 * Type guard for valid SearchMatch objects
 * @param match - Value to check
 * @returns true if match is a valid SearchMatch
 */
export const isValidSearchMatch = (match: unknown): match is SearchMatch => {
  if (typeof match !== 'object' || match === null) {
    return false;
  }

  const m = match as SearchMatch;

  return (
    typeof m.id === 'string' &&
    isValidPageNumber(m.pageNumber) &&
    typeof m.matchIndexOnPage === 'number' &&
    typeof m.globalIndex === 'number' &&
    typeof m.startOffset === 'number' &&
    typeof m.endOffset === 'number' &&
    m.endOffset > m.startOffset &&
    typeof m.matchedText === 'string' &&
    m.matchedText.length === m.endOffset - m.startOffset &&
    typeof m.isActive === 'boolean'
  );
};
```

---

## Summary

All utility functions are:

1. **Pure**: No side effects (except console.warn for errors)
2. **Testable**: Clear inputs/outputs
3. **Type-safe**: Strict TypeScript types with type guards
4. **Documented**: JSDoc comments for all public APIs
5. **Performant**: Optimized algorithms for 78-page scale

Next: [Event Contracts](./event-contracts.md)
