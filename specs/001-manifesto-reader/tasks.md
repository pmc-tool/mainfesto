# Tasks: UWP Manifesto Reader

**Input**: Design documents from `/specs/001-manifesto-reader/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No test tasks included (not explicitly requested in specification)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

All paths are relative to repository root. This is a Next.js App Router web application with frontend-only structure.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic Next.js structure

- [ ] T001 Create Next.js 14 project with TypeScript, Tailwind CSS, and App Router using `npx create-next-app`
- [ ] T002 [P] Install dependencies: pdfjs-dist@3.11.174 and @types/pdfjs-dist
- [ ] T003 [P] Create project directory structure: app/, components/manifesto/, lib/, hooks/, types/, public/pdfjs/
- [ ] T004 [P] Configure tsconfig.json with path aliases (@/components/*, @/lib/*, @/hooks/*, @/types/*)
- [ ] T005 [P] Configure tailwind.config.js with content paths and system-ui font stack
- [ ] T006 [P] Create scripts/copy-pdfjs-worker.js to copy PDF.js worker files from node_modules to public/pdfjs/
- [ ] T007 Add postinstall script to package.json to run copy-pdfjs-worker.js
- [ ] T008 Run postinstall script to copy pdf.worker.min.js and pdf.worker.min.js.map to public/pdfjs/
- [ ] T009 [P] Update app/globals.css with Tailwind directives, smooth scrolling, and PDF.js text layer styles
- [ ] T010 [P] Configure .eslintrc.json with Next.js recommended rules
- [ ] T011 [P] Add manifesto.pdf file to public/ directory (placeholder: create empty file or use test PDF)
- [ ] T012 [P] Add UWP logo.svg to public/ directory

**Checkpoint**: Project structure and configuration complete - ready for foundational implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T013 [P] Create types/manifesto.ts with all TypeScript interfaces (PDFDocument, Page, Section, SearchMatch, SearchResults)
- [ ] T014 [P] Create types/index.ts barrel export
- [ ] T015 [P] Create lib/utils/constants.ts with CONFIG object and MANIFESTO_SECTIONS array (12 sections with page mappings)
- [ ] T016 [P] Create lib/utils/validation.ts with isValidPageNumber() and isValidSearchMatch() type guards
- [ ] T017 [P] Create lib/pdf/pdfLoader.ts with loadPdfDocument() function using PDF.js
- [ ] T018 [P] Create lib/pdf/textExtractor.ts with extractPageText() and extractAllPageTexts() functions
- [ ] T019 [P] Create lib/pdf/types.ts for PDF-related internal types
- [ ] T020 [P] Create lib/search/searchEngine.ts with search() function for case-insensitive substring matching
- [ ] T021 [P] Create lib/search/types.ts for search-related types
- [ ] T022 [P] Create lib/utils/scrollUtils.ts with smoothScrollToElement() and getScrollProgress() functions

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Complete Manifesto (Priority: P1) 🎯 MVP

**Goal**: Display full 78-page manifesto with exact page rendering, selectable text, and responsive layout

**Independent Test**: Navigate to /manifesto, verify all 78 pages render correctly with selectable text, test on desktop (900-1000px max width) and mobile (full width with padding)

### Implementation for User Story 1

- [ ] T023 [P] [US1] Create hooks/usePdfDocument.ts with loadPdf(), getPage(), retry() methods
- [ ] T024 [P] [US1] Create hooks/usePageVisibility.ts with IntersectionObserver logic for tracking visible/active pages
- [ ] T025 [P] [US1] Create components/manifesto/PdfPageRenderer.tsx to render PDF page with canvas and text layer
- [ ] T026 [P] [US1] Create components/manifesto/PageContainer.tsx wrapper component with page ID and IntersectionObserver integration
- [ ] T027 [US1] Create components/manifesto/PageGallery.tsx with virtualization logic (render activePage ± 2 pages)
- [ ] T028 [P] [US1] Create components/manifesto/Header.tsx with centered UWP logo and search icon (non-functional placeholder)
- [ ] T029 [US1] Create components/manifesto/ManifestoReaderShell.tsx main container integrating all US1 components
- [ ] T030 [US1] Create app/manifesto/page.tsx route rendering ManifestoReaderShell
- [ ] T031 [US1] Add error handling in ManifestoReaderShell for PDF load failures with retry button
- [ ] T032 [US1] Add loading spinner in app/manifesto/page.tsx while PDF loads
- [ ] T033 [US1] Configure PDF.js worker path in usePdfDocument hook (GlobalWorkerOptions.workerSrc)
- [ ] T034 [US1] Implement responsive styling: desktop (max-w-[900px] mx-auto), mobile (w-full px-4)
- [ ] T035 [US1] Add vertical spacing between pages: 32px mobile, 40px desktop
- [ ] T036 [US1] Style page cards: white background, subtle shadow, border radius

**Checkpoint**: User Story 1 complete - manifesto fully viewable with selectable text, responsive on desktop and mobile

---

## Phase 4: User Story 2 - Navigate by Section (Priority: P2)

**Goal**: Enable quick navigation to 12 key sections via sticky tab strip with auto-highlighting

**Independent Test**: Click each of 12 section tabs, verify smooth scroll to correct page (pages 4, 10, 12, 14, 16, 23, 26, 32, 38, 45, 50, 60), confirm active tab updates when scrolling

### Implementation for User Story 2

- [ ] T037 [P] [US2] Create components/manifesto/SectionTabs.tsx with horizontal scrollable tab strip
- [ ] T038 [US2] Implement section tab click handler in SectionTabs to call smoothScrollToElement()
- [ ] T039 [US2] Integrate SectionTabs into ManifestoReaderShell below Header component
- [ ] T040 [US2] Connect usePageVisibility active page state to SectionTabs for auto-highlighting
- [ ] T041 [US2] Implement active tab calculation logic: find section where activePage >= section.pageNumber && activePage < nextSection.pageNumber
- [ ] T042 [US2] Style SectionTabs: sticky position (top-16), neutral background, overflow-x-auto
- [ ] T043 [US2] Style active tab: bold font, underline or subtle background (bg-gray-900 text-white)
- [ ] T044 [US2] Style inactive tabs: neutral color (bg-gray-100 text-gray-700), hover state
- [ ] T045 [US2] Implement responsive labels: full title on desktop (md:inline), short label on mobile (md:hidden)
- [ ] T046 [US2] Add aria-label="Manifesto sections" to nav wrapper
- [ ] T047 [US2] Add aria-current="true" to active tab for accessibility

**Checkpoint**: User Story 2 complete - section navigation fully functional with 12 tabs, auto-highlighting, and responsive labels

---

## Phase 5: User Story 3 - Search Within Document (Priority: P3)

**Goal**: Full-text search across all 78 pages with match highlighting, navigation, and keyboard shortcuts

**Independent Test**: Open search (/), type "renewable energy", verify matches found, navigate between results with Prev/Next, confirm soft yellow highlighting, test Escape to close

### Implementation for User Story 3

- [ ] T048 [P] [US3] Create hooks/useSearch.ts with search(), clearSearch(), nextMatch(), prevMatch(), goToMatch() methods
- [ ] T049 [P] [US3] Create hooks/useKeyboardShortcuts.ts for "/" (open search) and "Escape" (close search) handlers
- [ ] T050 [P] [US3] Create components/manifesto/SearchBar.tsx with input, match counter, Prev/Next buttons
- [ ] T051 [US3] Integrate useSearch hook in ManifestoReaderShell with pageTexts from usePdfDocument
- [ ] T052 [US3] Integrate useKeyboardShortcuts hook in ManifestoReaderShell with searchInputRef and open/close callbacks
- [ ] T053 [US3] Add search state to ManifestoReaderShell: isOpen, query, results, currentMatchIndex
- [ ] T054 [US3] Implement search icon click handler in Header to toggle SearchBar visibility
- [ ] T055 [US3] Integrate SearchBar into ManifestoReaderShell below Header (conditional render when isOpen=true)
- [ ] T056 [US3] Implement 300ms debounce in useSearch for query changes
- [ ] T057 [US3] Pass searchMatches to PdfPageRenderer for highlighting in text layer
- [ ] T058 [US3] Implement highlight injection in PdfPageRenderer: wrap matched text in <mark> elements
- [ ] T059 [US3] Style active match highlights: bg-yellow-200 (soft yellow)
- [ ] T060 [US3] Style inactive match highlights: bg-yellow-100 (faint yellow) - optional
- [ ] T061 [US3] Implement scrollToMatch() helper in useSearch: call smoothScrollToElement() and update currentMatchIndex
- [ ] T062 [US3] Implement match counter display in SearchBar: "X / Y" format
- [ ] T063 [US3] Implement wraparound logic: nextMatch() from last → first, prevMatch() from first → last
- [ ] T064 [US3] Add "No results found for '{query}'" message in SearchBar when matches.length === 0
- [ ] T065 [US3] Implement Escape key handler to clear search, close SearchBar, remove highlights
- [ ] T066 [US3] Implement "/" key handler to focus search input (check document.activeElement !== INPUT)
- [ ] T067 [US3] Style SearchBar: sticky (top-16 below header), slim horizontal layout, neutral colors
- [ ] T068 [US3] Add aria-live="polite" to match counter for screen reader announcements
- [ ] T069 [US3] Add aria-label to search input: "Search manifesto"
- [ ] T070 [US3] Add aria-label to Prev button: "Previous match"
- [ ] T071 [US3] Add aria-label to Next button: "Next match"

**Checkpoint**: User Story 3 complete - full-text search with highlighting, keyboard shortcuts, and match navigation working

---

## Phase 6: User Story 4 - Track Reading Progress (Priority: P4)

**Goal**: Unobtrusive page indicator badge showing "Page X / 78"

**Independent Test**: Scroll through manifesto, verify badge updates from "Page 1 / 78" to "Page 78 / 78", confirm positioning doesn't interfere with reading

### Implementation for User Story 4

- [ ] T072 [US4] Create components/manifesto/PageIndicator.tsx with currentPage and totalPages props
- [ ] T073 [US4] Integrate PageIndicator into ManifestoReaderShell, passing activePage from usePageVisibility
- [ ] T074 [US4] Style PageIndicator: fixed positioning (bottom-4 right-4), small text, dark background with white text
- [ ] T075 [US4] Add aria-live="polite" and aria-atomic="true" for accessibility
- [ ] T076 [US4] Make position configurable via prop: left or right edge (default: right)
- [ ] T077 [US4] Add subtle shadow and border radius for visibility: shadow-lg rounded-full

**Checkpoint**: User Story 4 complete - page progress indicator functional and unobtrusive

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, edge case handling, and final cleanup

- [ ] T078 [P] Add edge case handling: PDF load failure → show error message with retry button (enhance T031)
- [ ] T079 [P] Add edge case handling: slow network → show loading progress indicator during PDF load
- [ ] T080 [P] Add edge case handling: JavaScript disabled → add <noscript> message in app/manifesto/page.tsx
- [ ] T081 [P] Add edge case handling: extremely narrow viewport (<320px) → ensure minimum padding and readability
- [ ] T082 [P] Add edge case handling: extremely wide viewport (>2560px) → cap max-width at 1000px for pages
- [ ] T083 [P] Add edge case handling: section tab click during scroll animation → debounce or queue scroll requests
- [ ] T084 [P] Add edge case handling: search with special characters → escape regex special characters in query
- [ ] T085 [P] Add edge case handling: very long search query (>100 chars) → truncate in UI, allow full search
- [ ] T086 [P] Add edge case handling: rapid search query changes → cancel previous search, debounce properly
- [ ] T087 [P] Optimize virtualization: ensure only 3-5 pages render simultaneously (activePage ± 2)
- [ ] T088 [P] Add optional scroll-snap CSS to page-gallery for natural page centering (scroll-snap-type: y proximity)
- [ ] T089 [P] Verify 60fps scrolling performance with Chrome DevTools Performance panel
- [ ] T090 [P] Verify search response time <2s for all 78 pages with large queries
- [ ] T091 [P] Verify initial page load <5s on simulated 5Mbps connection (Chrome Network throttling)
- [ ] T092 [P] Run Lighthouse audit, ensure scores: Performance >90, Accessibility >90, Best Practices >90
- [ ] T093 [P] Verify native browser search (Cmd+F / Ctrl+F) works on rendered text layer
- [ ] T094 [P] Test text selection and copy/paste functionality on all pages
- [ ] T095 [P] Test on multiple browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- [ ] T096 [P] Test responsive behavior on mobile devices: iOS Safari, Android Chrome
- [ ] T097 [P] Verify zero external network requests using Chrome Network panel
- [ ] T098 [P] Add error boundary in app/manifesto/page.tsx for graceful error handling
- [ ] T099 [P] Add console.error logging for PDF render failures (individual pages)
- [ ] T100 [P] Review and cleanup: remove console.log statements, unused imports, commented code
- [ ] T101 [P] Run TypeScript compiler check: `npx tsc --noEmit` (zero errors)
- [ ] T102 [P] Run ESLint: `npm run lint` (zero errors)
- [ ] T103 [P] Verify all accessibility requirements: keyboard navigation, ARIA labels, semantic HTML
- [ ] T104 [P] Create README.md with project setup instructions (reference quickstart.md)
- [ ] T105 Build production bundle: `npm run build` (verify zero errors, check bundle size)

**Checkpoint**: All polish tasks complete - production-ready application

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion - No dependencies on other stories
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion - Integrates with US1 components (Header, ManifestoReaderShell) but independently testable
- **User Story 3 (Phase 5)**: Depends on Foundational phase completion - Integrates with US1 components (Header, ManifestoReaderShell, PdfPageRenderer) but independently testable
- **User Story 4 (Phase 6)**: Depends on Foundational phase completion - Integrates with US1 (ManifestoReaderShell, usePageVisibility) but independently testable
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - ✅ No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - ⚠️ Uses US1's Header, ManifestoReaderShell (adds SectionTabs)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - ⚠️ Uses US1's Header, ManifestoReaderShell, PdfPageRenderer (adds search functionality)
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - ⚠️ Uses US1's ManifestoReaderShell (adds PageIndicator)

**Note**: US2, US3, US4 all enhance the base viewer (US1), so US1 MUST be complete first for a functional MVP. However, after US1 is complete, US2, US3, and US4 can theoretically be developed in parallel by different developers.

### Within Each User Story

- **User Story 1**: Hooks → Components → Integration → Styling
- **User Story 2**: Component → Integration → Styling → Accessibility
- **User Story 3**: Hooks → Component → Integration → Highlighting → Keyboard → Styling → Accessibility
- **User Story 4**: Component → Integration → Styling → Accessibility

### Parallel Opportunities

**Setup Phase (11 tasks can run in parallel)**:
- T002, T003, T004, T005, T006, T009, T010, T011, T012 (all [P] marked)

**Foundational Phase (10 tasks can run in parallel)**:
- T013-T022 (all [P] marked - different files, no dependencies)

**User Story 1 (6 tasks can run in parallel initially)**:
- T023, T024, T025, T026, T028 (different files)
- Then T027, T029, T030 (sequential integration)
- Then T031-T036 (enhancements and styling)

**User Story 2 (2 tasks can run in parallel initially)**:
- T037 can be developed independently
- Then T038-T047 (sequential integration and styling)

**User Story 3 (3 tasks can run in parallel initially)**:
- T048, T049, T050 (different files)
- Then T051-T071 (sequential integration)

**User Story 4 (1 task)**:
- T072 can be developed independently
- Then T073-T077 (sequential integration)

**Polish Phase (28 tasks can run in parallel)**:
- T078-T105 (most are [P] marked - testing, optimization, cleanup tasks)

---

## Parallel Example: User Story 1

```bash
# Launch all parallelizable tasks for User Story 1 together:

# Hooks (can be developed simultaneously):
Task T023: "Create hooks/usePdfDocument.ts"
Task T024: "Create hooks/usePageVisibility.ts"

# Components (can be developed simultaneously):
Task T025: "Create components/manifesto/PdfPageRenderer.tsx"
Task T026: "Create components/manifesto/PageContainer.tsx"
Task T028: "Create components/manifesto/Header.tsx"

# After above complete, sequential integration:
Task T027: "Create components/manifesto/PageGallery.tsx" (uses T025, T026)
Task T029: "Create components/manifesto/ManifestoReaderShell.tsx" (uses T023-T028)
Task T030: "Create app/manifesto/page.tsx" (uses T029)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. ✅ Complete Phase 1: Setup (T001-T012)
2. ✅ Complete Phase 2: Foundational (T013-T022) - CRITICAL
3. ✅ Complete Phase 3: User Story 1 (T023-T036)
4. **STOP and VALIDATE**:
   - Navigate to /manifesto
   - Verify all 78 pages render
   - Test text selection/copy
   - Test desktop and mobile layouts
   - Deploy/demo if ready

**Estimated effort**: ~20-30 hours for MVP (US1 only)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (~8-10 hours)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!) (~12-15 hours)
3. Add User Story 2 → Test independently → Deploy/Demo (~6-8 hours)
4. Add User Story 3 → Test independently → Deploy/Demo (~12-15 hours)
5. Add User Story 4 → Test independently → Deploy/Demo (~2-3 hours)
6. Polish → Final production release (~8-10 hours)

**Total estimated effort**: 48-61 hours for full feature

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (~8-10 hours)
2. Team completes User Story 1 together (required for others) (~12-15 hours)
3. Once US1 is done:
   - Developer A: User Story 2 (~6-8 hours)
   - Developer B: User Story 3 (~12-15 hours)
   - Developer C: User Story 4 (~2-3 hours)
4. Team reconvenes for Polish phase (~8-10 hours)

**Total calendar time**: ~30-35 hours with 3 developers (vs. 48-61 hours solo)

---

## Task Summary

- **Total Tasks**: 105
- **Setup**: 12 tasks (11 parallelizable)
- **Foundational**: 10 tasks (all parallelizable after setup)
- **User Story 1 (P1)**: 14 tasks (6 initial parallel opportunities)
- **User Story 2 (P2)**: 11 tasks (2 initial parallel opportunities)
- **User Story 3 (P3)**: 24 tasks (3 initial parallel opportunities)
- **User Story 4 (P4)**: 6 tasks (1 initial parallel opportunity)
- **Polish**: 28 tasks (all parallelizable)

**Parallelizable Tasks**: 56 tasks marked [P] (53% of total)

**MVP Scope**: Phases 1-3 (Setup + Foundational + US1) = 36 tasks

**Full Feature Scope**: All 105 tasks

---

## Notes

- [P] tasks = different files, no dependencies within their phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable after US1 foundation
- No test tasks included (not explicitly requested in specification)
- Commit after each task or logical group for safety
- Stop at any checkpoint to validate story independently before proceeding
- Follow quickstart.md for detailed setup instructions (referenced in Setup phase)
- All file paths are exact locations per plan.md structure
- Edge cases from spec.md are addressed in Polish phase (T078-T086)
- Performance targets (60fps, <2s search, <5s load) validated in T089-T091
