# Implementation Plan: UWP Manifesto Reader

**Branch**: `001-manifesto-reader` | **Date**: 2025-11-23 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-manifesto-reader/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

A distraction-free, fully searchable web-based PDF reader for the 78-page UWP political manifesto. Built as a Next.js application with client-side PDF rendering using PDF.js, featuring section-based navigation, full-text search with highlighting, lazy loading for performance, and responsive design. The application is completely self-hosted with zero external dependencies, delivering a reading experience superior to downloading a PDF while maintaining exact page fidelity.

## Technical Context

**Language/Version**: TypeScript 5.x / JavaScript ES2020+
**Primary Dependencies**: Next.js 14+ (App Router), React 18+, pdfjs-dist 3.x+, Tailwind CSS 3.x
**Storage**: Static file storage (PDF hosted in /public directory)
**Testing**: Jest + React Testing Library (unit/integration), Playwright (E2E), Lighthouse (performance)
**Target Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
**Project Type**: Web application (frontend-only, static site generation capable)
**Performance Goals**: 60fps scrolling, <2s search response, <5s initial load on 5Mbps, render 3-5 pages visible in viewport
**Constraints**: Zero external requests (fully self-hosted), <200ms p95 for page navigation, native browser search compatibility
**Scale/Scope**: Single 78-page PDF, 12 navigation sections, estimated 50-100KB text extraction, supports 1000+ concurrent readers

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ **PASSED** - No constitution file exists; project is using default best practices.

Since no constitution.md file with specific project principles has been defined, this feature will follow industry-standard practices for Next.js development:

- **Component-based architecture**: React components with clear separation of concerns
- **Type safety**: TypeScript for all source code
- **Testing approach**: Unit tests for utilities/hooks, integration tests for components, E2E for critical user flows
- **Performance-first**: Lazy loading, virtualization, code splitting
- **Accessibility**: Semantic HTML, keyboard navigation, ARIA attributes where needed

**Re-evaluation required after Phase 1 design** to ensure architectural decisions align with best practices.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Next.js App Router Structure (Web Application)

app/
├── manifesto/
│   ├── page.tsx                    # Main manifesto reader page
│   └── layout.tsx                  # Optional: manifesto-specific layout
├── layout.tsx                      # Root layout (optional: for shared nav/footer)
└── globals.css                     # Global styles + Tailwind directives

components/
├── manifesto/
│   ├── ManifestoReaderShell.tsx   # Main container component
│   ├── Header.tsx                  # Sticky header with logo & search icon
│   ├── SearchBar.tsx               # Expandable search input with controls
│   ├── SectionTabs.tsx             # Horizontal scrollable section tabs
│   ├── PageGallery.tsx             # Virtualized page container with scroll management
│   ├── PageContainer.tsx           # Individual page wrapper with IntersectionObserver
│   ├── PdfPageRenderer.tsx         # PDF.js renderer (canvas + textLayer)
│   └── PageIndicator.tsx           # "Page X / 78" badge
└── ui/                             # Shared UI primitives (if needed)

lib/
├── pdf/
│   ├── pdfLoader.ts                # PDF.js document loading utilities
│   ├── textExtractor.ts            # Extract text from all pages
│   └── types.ts                    # PDF-related type definitions
├── search/
│   ├── searchEngine.ts             # Search logic (find matches across pages)
│   └── types.ts                    # Search-related types
└── utils/
    ├── scrollUtils.ts              # Smooth scroll helpers
    └── constants.ts                # Section-to-page mapping, config

hooks/
├── usePdfDocument.ts               # Load & manage PDF document state
├── usePageVisibility.ts            # IntersectionObserver for active page tracking
├── useSearch.ts                    # Search state & navigation logic
└── useKeyboardShortcuts.ts         # "/" and "Esc" key handlers

public/
├── manifesto.pdf                   # 78-page UWP manifesto PDF
├── logo.svg                        # UWP logo for header
└── pdfjs/                          # Self-hosted PDF.js worker files
    ├── pdf.worker.min.js
    └── pdf.worker.min.js.map

types/
├── manifesto.ts                    # Manifesto-specific types (Page, Section, SearchMatch)
└── index.ts                        # Barrel export

__tests__/
├── unit/
│   ├── lib/
│   │   ├── textExtractor.test.ts
│   │   └── searchEngine.test.ts
│   └── hooks/
│       ├── usePdfDocument.test.ts
│       └── useSearch.test.ts
├── integration/
│   └── components/
│       ├── ManifestoReaderShell.test.tsx
│       └── SearchBar.test.tsx
└── e2e/
    └── manifesto.spec.ts           # Playwright E2E tests

# Configuration Files (root)
package.json                         # Dependencies & scripts
tsconfig.json                        # TypeScript configuration
next.config.js                       # Next.js configuration
tailwind.config.js                   # Tailwind CSS configuration
postcss.config.js                    # PostCSS configuration
jest.config.js                       # Jest configuration
playwright.config.ts                 # Playwright E2E configuration
.eslintrc.json                       # ESLint rules
```

**Structure Decision**: Next.js App Router structure (Option 2: Web Application) selected. This is a frontend-only application with no backend services. The structure follows Next.js 14+ conventions with App Router, featuring:

- **app/**: Route-based page structure with `/manifesto` route
- **components/**: Feature-specific React components organized by domain
- **lib/**: Pure business logic and utilities (PDF handling, search)
- **hooks/**: Reusable React hooks for state management
- **public/**: Static assets including the PDF and self-hosted PDF.js worker
- **types/**: TypeScript type definitions
- **__tests__/**: Co-located tests organized by test type (unit/integration/E2E)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**N/A** - No constitution violations. Architecture follows standard Next.js best practices with appropriate separation of concerns for a client-side PDF reader application.
