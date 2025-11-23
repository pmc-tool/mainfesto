# UWP Manifesto Reader

A modern, accessible PDF reader built with Next.js 14, React 18, and TypeScript for viewing the UWP's 78-page manifesto with full-text search and section navigation.

## Features

### 📄 Complete PDF Viewing
- Full 78-page manifesto rendering with PDF.js
- High-quality canvas rendering at 1.5x scale
- Smooth scrolling with native CSS scroll behavior
- Responsive design (mobile-first, works on all devices)

### 🔍 Full-Text Search
- Search across all 78 pages with 300ms debounce
- Real-time match highlighting (yellow background)
- Match counter showing "X / Y" results
- Next/Previous navigation with wraparound
- Keyboard shortcuts:
  - `/` - Open search
  - `Escape` - Close search
  - `Enter` - Next match
  - `Shift+Enter` - Previous match

### 🗂️ Section Navigation
- 12 clickable section tabs for quick navigation
- Auto-highlighting of active section based on scroll position
- Responsive labels (full title on desktop, short label on mobile)
- Sections include:
  - Leader (Page 4)
  - Vision (Page 10)
  - Recovery (Page 12)
  - Team (Page 14)
  - Agenda (Page 16)
  - Agriculture (Page 23)
  - Tourism (Page 26)
  - Digital (Page 32)
  - Trade (Page 38)
  - Infrastructure (Page 45)
  - Energy (Page 50)
  - Governance (Page 60)

### 📍 Reading Progress
- Fixed page indicator badge (bottom-right corner)
- Shows current page / total pages
- Updates automatically as you scroll
- Accessible with ARIA live regions

### ♿ Accessibility
- ARIA labels on all interactive elements
- Screen reader announcements for search results and page changes
- Keyboard navigation support
- Semantic HTML structure
- High contrast text and interactive elements

## Tech Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **PDF Rendering**: pdfjs-dist 3.11.174
- **State Management**: React Hooks (useState, useEffect, useReducer)
- **Performance**: IntersectionObserver for page visibility tracking

## Getting Started

### Prerequisites
- Node.js 18.17.0 or higher
- npm 9.6.7 or higher

### Installation

1. Clone the repository
```bash
cd "uwp plain"
```

2. Install dependencies
```bash
npm install
```

3. Copy PDF.js worker files (automatically runs after install)
```bash
npm run postinstall
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000/manifesto](http://localhost:3000/manifesto) in your browser

### Building for Production

```bash
npm run build
npm start
```

The production build is optimized and generates static pages for better performance.

## Project Structure

```
.
├── app/
│   ├── layout.tsx           # Root layout with metadata
│   ├── globals.css          # Global styles and Tailwind directives
│   └── manifesto/
│       └── page.tsx         # Main manifesto page
├── components/
│   └── manifesto/
│       ├── ManifestoReader.tsx      # Main orchestrator component
│       ├── Header.tsx               # Top header with logo and search
│       ├── LoadingState.tsx         # Loading spinner
│       ├── ErrorState.tsx           # Error display with retry
│       ├── pages/
│       │   ├── PdfViewer.tsx        # PDF page container
│       │   └── PdfPage.tsx          # Individual page renderer
│       ├── search/
│       │   └── SearchBar.tsx        # Search input and controls
│       └── navigation/
│           ├── SectionTabs.tsx      # Section navigation tabs
│           └── PageIndicator.tsx    # Page progress badge
├── hooks/
│   ├── usePdfDocument.ts    # PDF loading and text extraction
│   ├── usePageVisibility.ts # IntersectionObserver for page tracking
│   ├── useSearch.ts         # Search state and operations
│   └── useKeyboardShortcuts.ts # Global keyboard handlers
├── lib/
│   ├── pdf/
│   │   ├── pdfLoader.ts     # PDF.js document loading
│   │   └── textExtractor.ts # Text content extraction
│   ├── search/
│   │   └── searchEngine.ts  # Full-text search and highlighting
│   └── utils/
│       ├── constants.ts     # Configuration and section mappings
│       ├── validation.ts    # Type guards and validators
│       └── scrollUtils.ts   # Smooth scrolling helpers
├── types/
│   └── index.ts             # TypeScript type definitions
├── public/
│   ├── manifesto.pdf        # PDF file (replace with actual)
│   ├── logo.svg             # UWP logo (replace with actual)
│   └── pdfjs/
│       └── pdf.worker.min.js # PDF.js web worker
└── scripts/
    └── copy-pdfjs-worker.js # Postinstall script for PDF.js
```

## Configuration

### Constants (`lib/utils/constants.ts`)

```typescript
export const CONFIG = {
  TOTAL_PAGES: 78,
  RENDER_BUFFER: 2,
  SEARCH_DEBOUNCE_MS: 300,
  MAX_PAGE_WIDTH_PX: 1000,
  ACTIVE_PAGE_THRESHOLD: 0.5,
  SCROLL_BEHAVIOR: 'smooth',
  PDFJS_WORKER_PATH: '/pdfjs/pdf.worker.min.js',
  PDF_URL: '/manifesto.pdf',
}
```

## Performance

- **First Load JS**: 195 kB (includes PDF.js library)
- **Search Response**: < 2 seconds for full document
- **Scroll Performance**: 60fps smooth scrolling
- **Initial Load**: < 5 seconds on 5Mbps connection

## Browser Support

- Chrome 61+ (full support)
- Firefox 36+ (full support)
- Safari 15.4+ (full support with smooth scrolling)
- Edge 79+ (full support)

## Customization

### Replace PDF File
1. Place your PDF file at `public/manifesto.pdf`
2. Update `CONFIG.TOTAL_PAGES` in `lib/utils/constants.ts`
3. Update section mappings in `MANIFESTO_SECTIONS`

### Replace Logo
1. Place your logo at `public/logo.svg`
2. Update dimensions in `components/manifesto/Header.tsx` if needed

### Customize Colors
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      'uwp-primary': '#1e40af',  // Main brand color
      'uwp-accent': '#3b82f6',   // Accent color
    },
  },
}
```

## License

This project is built for the United Workers Party (UWP).

## Acknowledgments

- PDF.js by Mozilla for PDF rendering
- Next.js team for the excellent framework
- Tailwind CSS for utility-first styling
# mainfesto
