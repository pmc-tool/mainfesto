# Feature Specification: UWP Manifesto Reader

**Feature Branch**: `001-manifesto-reader`
**Created**: 2025-11-23
**Status**: Draft
**Input**: User description: "Design and implement a UWP Manifesto Reader page in Next.js + Tailwind CSS with full PDF searchability, exact page rendering, section-based navigation, and a distraction-free reading room layout."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Complete Manifesto (Priority: P1)

A visitor lands on the manifesto page to read the UWP's full 78-page policy document. They need to see all pages in exact original format, scroll through the document naturally, and read at their own pace without distractions.

**Why this priority**: This is the core functionality - without the ability to view the manifesto, no other features matter. This delivers immediate value by making the full document accessible online.

**Independent Test**: Can be fully tested by navigating to /manifesto route, verifying all 78 pages render correctly, and confirming text is selectable for copy/paste. Delivers value by replacing PDF downloads with an in-browser reading experience.

**Acceptance Scenarios**:

1. **Given** a visitor navigates to /manifesto, **When** the page loads, **Then** they see the UWP logo in the header and the first page of the manifesto displayed
2. **Given** the manifesto is loaded, **When** the user scrolls down, **Then** subsequent pages load and display in order (pages 1-78)
3. **Given** any manifesto page is visible, **When** the user attempts to select text, **Then** the text is selectable and can be copied
4. **Given** the manifesto is displayed, **When** viewed on mobile device, **Then** pages are responsive and readable with appropriate sizing
5. **Given** the manifesto is displayed, **When** viewed on desktop, **Then** pages are centered with maximum 900-1000px width with appropriate spacing

---

### User Story 2 - Navigate by Section (Priority: P2)

A reader wants to jump directly to specific sections of the manifesto (e.g., "Agriculture", "Tourism", "Digital Economy") rather than scrolling through all 78 pages. They need quick access to the 12 key policy sections.

**Why this priority**: Enhances usability significantly by allowing targeted reading. Most visitors will want to read specific sections rather than the entire document sequentially.

**Independent Test**: Can be tested by clicking section tabs and verifying the page scrolls to the correct manifesto page. Delivers value by reducing time to find relevant policy content from minutes to seconds.

**Acceptance Scenarios**:

1. **Given** the manifesto page is loaded, **When** the user views the section tab strip, **Then** they see 12 section tabs with clear labels
2. **Given** the section tabs are visible, **When** the user clicks "MESSAGE FROM OUR POLITICAL LEADER", **Then** the page smoothly scrolls to page 4
3. **Given** the section tabs are visible, **When** the user clicks "GOVERNANCE AND LOCAL GOVERNMENT REFORM", **Then** the page smoothly scrolls to page 60
4. **Given** the user is scrolling through the manifesto, **When** page 23 becomes visible in the viewport, **Then** the "AGRICULTURE AND FISHERIES" tab automatically highlights as active
5. **Given** the user is on mobile, **When** viewing section tabs, **Then** tabs are horizontally scrollable with shortened labels
6. **Given** any section tab is clicked, **When** the target page scrolls into view, **Then** the tab remains highlighted to show current location

---

### User Story 3 - Search Within Document (Priority: P3)

A researcher or voter wants to find specific topics, keywords, or policy details within the 78-page manifesto. They need to search across all pages and jump directly to relevant mentions.

**Why this priority**: Critical for research and fact-checking, but not required for basic reading. Differentiates this from a simple PDF viewer and enables power users to extract maximum value.

**Independent Test**: Can be tested by entering search queries, verifying matches are found across all pages, and confirming navigation between results works. Delivers value by making the manifesto fully searchable without downloading.

**Acceptance Scenarios**:

1. **Given** the manifesto page is loaded, **When** the user clicks the search icon in the header, **Then** a search input bar expands below the header
2. **Given** the search bar is open, **When** the user types "renewable energy" and presses Enter, **Then** all matching instances are found and the page scrolls to the first match
3. **Given** search results are displayed, **When** matches are found, **Then** a counter shows "1 / X" where X is total matches
4. **Given** the first search match is highlighted, **When** the user clicks "Next", **Then** the page scrolls to the second match and counter updates to "2 / X"
5. **Given** the last search match is active, **When** the user clicks "Next", **Then** the page wraps to the first match
6. **Given** a search match is highlighted, **When** the match is on page 45, **Then** the page automatically scrolls to page 45 and highlights the match in soft yellow
7. **Given** the search bar is open, **When** the user presses Escape key, **Then** the search bar closes and highlights are removed
8. **Given** the manifesto is displayed, **When** the user presses "/" key, **Then** the search input automatically focuses for typing
9. **Given** the manifesto is displayed, **When** the user uses browser's native search (Cmd+F or Ctrl+F), **Then** the browser search works normally on the rendered text

---

### User Story 4 - Track Reading Progress (Priority: P4)

A reader wants to know which page they're currently viewing and how much of the manifesto remains. They need a simple, unobtrusive page indicator.

**Why this priority**: Nice-to-have enhancement that aids orientation but not essential for core reading experience. Can be added after core features are working.

**Independent Test**: Can be tested by scrolling through pages and verifying the page indicator updates correctly. Delivers value by helping readers track progress through long document.

**Acceptance Scenarios**:

1. **Given** the manifesto is loaded, **When** viewing any page, **Then** a small badge displays "Page X / 78" where X is the current page number
2. **Given** the user is on page 1, **When** they scroll to page 15, **Then** the badge updates to "Page 15 / 78"
3. **Given** the page indicator is visible, **When** the user is reading, **Then** the indicator is positioned unobtrusively (left or right edge) and does not interfere with content

---

### Edge Cases

- What happens when the PDF file fails to load or is missing from the server?
- How does the system handle extremely slow network connections where pages take time to render?
- What happens when a user clicks a section tab before previous scroll animation completes?
- How does the search handle special characters, punctuation, or case sensitivity?
- What happens when a search query returns zero matches?
- How does the system handle very long search queries (100+ characters)?
- What happens when JavaScript is disabled in the user's browser?
- How does the page perform when rendering all 78 pages simultaneously on low-powered devices?
- What happens when a user tries to access a section tab page number that doesn't exist (e.g., manual URL manipulation)?
- How does the system handle multiple simultaneous search operations (user rapidly changing queries)?
- What happens when the viewport is extremely narrow (< 320px) or extremely wide (> 2560px)?

## Requirements *(mandatory)*

### Functional Requirements

#### Core Display Requirements

- **FR-001**: System MUST display all 78 pages of the manifesto in exact original format with no content modifications
- **FR-002**: System MUST render each page with both a visual canvas layer and a selectable text layer
- **FR-003**: System MUST make all text selectable and copyable by users
- **FR-004**: System MUST load PDF assets from local server storage only (no external CDN or remote requests)
- **FR-005**: System MUST serve the manifesto at route /manifesto or /uwp/manifesto
- **FR-006**: System MUST implement lazy loading to render only pages near the viewport initially
- **FR-007**: System MUST load additional pages on demand as user scrolls

#### Layout Requirements

- **FR-008**: System MUST display a sticky header containing only the UWP logo (centered) and search icon (right)
- **FR-009**: System MUST display a sticky section tab strip directly below the header
- **FR-010**: System MUST render pages as centered white cards with 900-1000px maximum width
- **FR-011**: System MUST apply 32-40px vertical spacing between pages
- **FR-012**: System MUST use neutral background color (light grey or dark neutral)
- **FR-013**: System MUST apply subtle shadow and border radius to page cards
- **FR-014**: System MUST assign each page a unique ID in format "page-X" where X is the page number

#### Section Navigation Requirements

- **FR-015**: System MUST provide 12 section tabs corresponding to the section-to-page mapping provided
- **FR-016**: System MUST implement smooth scrolling when a section tab is clicked
- **FR-017**: System MUST automatically highlight the active section tab based on which page is currently in viewport
- **FR-018**: System MUST detect when pages enter or exit the viewport to update navigation state
- **FR-019**: System MUST make section tabs horizontally scrollable on small screens
- **FR-020**: System MUST display shortened section labels on mobile (Leader, Vision, Recovery, Team, Agenda, Agriculture, Tourism, Digital, Trade, Infra, Energy, Governance)

#### Search Requirements

- **FR-021**: System MUST extract and cache full text from all 78 pages on initial load
- **FR-022**: System MUST provide a search icon in the header that expands to a search input bar when clicked
- **FR-023**: System MUST search across all pages when user enters a query and presses Enter
- **FR-024**: System MUST scroll to and highlight the first search match when results are found
- **FR-025**: System MUST display a match counter showing "current / total" matches
- **FR-026**: System MUST provide Previous and Next buttons to navigate between search matches
- **FR-027**: System MUST wrap from last match to first match when navigating forward, and vice versa
- **FR-028**: System MUST highlight the active search match in soft yellow color
- **FR-029**: System MUST scroll to the page containing each match when navigating between results
- **FR-030**: System MUST focus search input when user presses "/" key
- **FR-031**: System MUST close search input and remove highlights when user presses Escape key
- **FR-032**: System MUST support native browser search (Cmd+F / Ctrl+F) on rendered text
- **FR-033**: System MUST perform case-insensitive search by default

#### Responsive Design Requirements

- **FR-034**: System MUST provide responsive layout that works on desktop and mobile devices
- **FR-035**: System MUST display full-width pages with side padding on mobile devices
- **FR-036**: System MUST maintain readability across viewport sizes from 320px to 2560px width

#### Performance Requirements

- **FR-037**: System MUST use virtualization to avoid rendering all 78 pages simultaneously
- **FR-038**: System MUST implement scroll-snap behavior to naturally center pages during scrolling (optional enhancement)

### Key Entities

- **Manifesto Document**: The complete 78-page PDF file containing UWP policy positions, stored locally on server
- **Page**: Individual page from the manifesto (1-78), rendered with canvas visual layer and DOM text layer
- **Section**: Named policy area within the manifesto with a defined starting page (12 total sections)
- **Search Match**: Instance of a search query found within the manifesto text, defined by page number, match index, and text position
- **Active Page**: The page currently centered or most visible in the user's viewport
- **Search Query**: User-entered text string used to find matches across all manifesto pages

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view all 78 manifesto pages without downloading a PDF file
- **SC-002**: Users can navigate to any of the 12 major sections in under 3 seconds from page load
- **SC-003**: Search results appear and first match is highlighted within 2 seconds of query submission
- **SC-004**: Page scrolling is smooth with no janky animations (60 fps performance)
- **SC-005**: Text selection and copy functionality works on 100% of pages
- **SC-006**: Page load time is under 5 seconds on standard broadband connection (5 Mbps)
- **SC-007**: Mobile users can read and navigate the manifesto with same functionality as desktop (responsive design)
- **SC-008**: Zero external network requests are made during normal operation (fully self-hosted)
- **SC-009**: Active section tab accurately reflects current page position 95% of scrolling time
- **SC-010**: Users successfully find specific policy topics using search on first attempt (measured by search query reformulation rate)

### Section-to-Page Mapping

The following 12 sections must be navigable via the section tab strip:

| Section Title | Target Page |
|---------------|-------------|
| MESSAGE FROM OUR POLITICAL LEADER | Page 4 |
| THE VISION | Page 10 |
| A RECOVERY PROGRAMME | Page 12 |
| OUR TEAM | Page 14 |
| THE TRANSFORMATIVE AGENDA | Page 16 |
| TRANSFORMING OUR AGRICULTURE AND FISHERIES SECTOR | Page 23 |
| REVITALIZING THE TOURISM SECTOR | Page 26 |
| BUILDING A VIBRANT DIGITAL ECONOMY | Page 32 |
| INVESTMENT, TRADE AND EXTERNAL RELATIONS | Page 38 |
| INFRASTRUCTURE AND PORT DEVELOPMENT | Page 45 |
| SECURING OUR ENERGY FUTURE THROUGH RENEWABLES | Page 50 |
| GOVERNANCE AND LOCAL GOVERNMENT REFORM | Page 60 |

## Assumptions

1. **PDF Availability**: The UWP manifesto is available as a PDF file that can be hosted on the server
2. **PDF Format**: The manifesto PDF is standard-compliant and can be processed by PDF.js library
3. **Browser Support**: Target users access the site with modern browsers that support ES6+ JavaScript, IntersectionObserver API, and PDF.js
4. **Network Speed**: Users have at least basic broadband connection (1 Mbps+) for reasonable initial load time
5. **Device Capabilities**: Target devices have sufficient memory and processing power to handle PDF rendering (not targeting very old mobile devices)
6. **Search Case Sensitivity**: Search is case-insensitive by default (user looking for "Energy" will match "energy", "ENERGY", etc.)
7. **Search Exact Match**: Search uses exact substring matching (no fuzzy matching or stemming required)
8. **Single Language**: Manifesto is in English only (no internationalization required)
9. **Static Content**: Manifesto content does not change during user session (no live updates needed)
10. **Accessibility**: Basic accessibility support is implied (keyboard navigation, semantic HTML) but WCAG compliance level is not specified
11. **Analytics**: No requirement for tracking user behavior, page views, or search queries specified
12. **Print Capability**: Users can use browser's native print function if they need hard copies (no custom print styling required unless specified later)
13. **Bookmark/Share**: No requirement for deep linking to specific pages or sharing specific sections via URL parameters

## Constraints

1. **Technology Stack**: Must be built with Next.js (App Router), TypeScript, and Tailwind CSS only
2. **PDF Library**: Must use pdfjs-dist library for PDF rendering (self-hosted, no CDN)
3. **No External Dependencies**: Zero external CDN, API calls, or third-party service requests allowed
4. **Content Integrity**: Complete 78-page manifesto must be displayed exactly as original - no summaries, excerpts, or editorial modifications
5. **Route**: Feature must be accessible at /manifesto or /uwp/manifesto path
6. **Styling Philosophy**: Must follow minimal, distraction-free, policy-document aesthetic (no bright campaign colors or marketing elements)
7. **Header Content**: Header must contain ONLY UWP logo (centered) and search icon (right) - no additional menu items, social icons, or navigation
8. **Typography**: Must use system-ui font stack (no custom web fonts)

## Out of Scope

The following are explicitly NOT included in this feature:

1. **PDF Download**: Providing a "Download PDF" button or link
2. **Annotations**: Ability to highlight, annotate, or bookmark sections
3. **Sharing**: Social media sharing buttons or share-to-email functionality
4. **Print Optimization**: Custom print stylesheets or print-specific layouts
5. **Comments**: User comments or discussion features on manifesto content
6. **Comparison**: Side-by-side comparison with other party manifestos
7. **Personalization**: User accounts, saved reading positions, or personalized recommendations
8. **Advanced Search**: Fuzzy search, search filters, or search within specific sections only
9. **Audio/Video**: Read-aloud functionality or embedded multimedia content
10. **Translations**: Multi-language support or translation features
11. **Analytics Dashboard**: Admin panel to view reading statistics or popular sections
12. **Content Management**: Ability to update or replace the manifesto through admin interface
13. **Deep Linking**: URL parameters to link directly to specific pages or search results (e.g., /manifesto?page=23)
14. **Export**: Export to other formats (Word, EPUB, etc.)
15. **Offline Support**: Progressive Web App features or offline reading capability
