# Quick Start Guide: UWP Manifesto Reader

**Feature**: 001-manifesto-reader
**Date**: 2025-11-23
**Target Audience**: Developers implementing this feature

---

## Overview

This guide walks you through setting up the UWP Manifesto Reader from scratch. Follow these steps in order to get the application running locally in under 30 minutes.

---

## Prerequisites

Ensure you have the following installed:

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code recommended (with TypeScript extension)

Verify installations:
```bash
node --version  # Should output v18.x.x or higher
npm --version   # Should output v9.x.x or higher
```

---

## Step 1: Initialize Next.js Project

### 1.1 Create Next.js App

```bash
npx create-next-app@latest uwp-manifesto-reader --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd uwp-manifesto-reader
```

**Options selected**:
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ App Router (not Pages Router)
- ❌ No src/ directory (use root-level structure)
- ✅ Import alias: `@/*`

### 1.2 Verify Installation

```bash
npm run dev
```

Open http://localhost:3000 - you should see the Next.js welcome page.

Press `Ctrl+C` to stop the dev server.

---

## Step 2: Install Dependencies

### 2.1 Install PDF.js

```bash
npm install pdfjs-dist@3.11.174
npm install --save-dev @types/pdfjs-dist
```

### 2.2 Install Development Tools

```bash
# Testing libraries
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev @playwright/test

# TypeScript utilities
npm install --save-dev @types/node

# Linting (if not already installed)
npm install --save-dev eslint eslint-config-next
```

### 2.3 Verify package.json

Your `package.json` should now include:

```json
{
  "dependencies": {
    "next": "14.x.x",
    "react": "^18.x.x",
    "react-dom": "^18.x.x",
    "pdfjs-dist": "^3.11.174"
  },
  "devDependencies": {
    "@types/node": "^20.x.x",
    "@types/react": "^18.x.x",
    "@types/pdfjs-dist": "^3.x.x",
    "typescript": "^5.x.x",
    "tailwindcss": "^3.x.x",
    "postcss": "^8.x.x",
    "autoprefixer": "^10.x.x",
    "jest": "^29.x.x",
    "@testing-library/react": "^14.x.x",
    "@playwright/test": "^1.x.x"
  }
}
```

---

## Step 3: Setup PDF.js Worker Files

### 3.1 Create Script to Copy Worker Files

Create `scripts/copy-pdfjs-worker.js`:

```javascript
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../node_modules/pdfjs-dist/build');
const destDir = path.join(__dirname, '../public/pdfjs');

// Create public/pdfjs directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy worker files
const files = ['pdf.worker.min.js', 'pdf.worker.min.js.map'];

files.forEach(file => {
  const src = path.join(srcDir, file);
  const dest = path.join(destDir, file);

  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✓ Copied ${file} to /public/pdfjs`);
  } else {
    console.error(`✗ Source file not found: ${src}`);
  }
});

console.log('PDF.js worker files copied successfully!');
```

### 3.2 Add Post-Install Script

Update `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "node scripts/copy-pdfjs-worker.js"
  }
}
```

### 3.3 Run the Script

```bash
node scripts/copy-pdfjs-worker.js
```

Verify that `public/pdfjs/pdf.worker.min.js` exists.

---

## Step 4: Add Manifesto PDF

### 4.1 Place PDF File

Copy your 78-page UWP manifesto PDF to:

```
public/manifesto.pdf
```

**Important**: The file MUST be named exactly `manifesto.pdf` and placed in the `public/` directory.

### 4.2 Verify File Size

```bash
ls -lh public/manifesto.pdf
```

Expected file size: 5-20 MB (typical for a 78-page political manifesto).

---

## Step 5: Create Directory Structure

### 5.1 Create All Directories

```bash
mkdir -p app/manifesto
mkdir -p components/manifesto
mkdir -p lib/{pdf,search,utils}
mkdir -p hooks
mkdir -p types
mkdir -p __tests__/{unit/{lib,hooks},integration/components,e2e}
mkdir -p public/pdfjs
```

### 5.2 Verify Structure

```bash
tree -L 2 -d
```

Expected output:
```
.
├── app
│   └── manifesto
├── components
│   └── manifesto
├── hooks
├── lib
│   ├── pdf
│   ├── search
│   └── utils
├── public
│   └── pdfjs
├── scripts
├── types
└── __tests__
    ├── e2e
    ├── integration
    └── unit
```

---

## Step 6: Configure TypeScript

### 6.1 Update tsconfig.json

Edit `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "incremental": true,
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/types/*": ["./types/*"]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Step 7: Configure Tailwind CSS

### 7.1 Update tailwind.config.js

Edit `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Optional: Add custom colors for UWP branding
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

### 7.2 Update globals.css

Edit `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Optional: Scroll snap for pages */
.page-gallery {
  scroll-snap-type: y proximity;
}

.page-container {
  scroll-snap-align: center;
}

/* PDF.js text layer styling */
.textLayer {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  opacity: 0.2;
  line-height: 1;
}

.textLayer span {
  color: transparent;
  position: absolute;
  white-space: pre;
  cursor: text;
  transform-origin: 0% 0%;
}

/* Search highlight styles */
.textLayer mark {
  color: transparent;
}

.textLayer mark.bg-yellow-200 {
  background-color: rgb(254 240 138); /* Active match */
}

.textLayer mark.bg-yellow-100 {
  background-color: rgb(254 249 195); /* Inactive match */
}
```

---

## Step 8: Create Type Definitions

### 8.1 Create types/manifesto.ts

```typescript
// types/manifesto.ts

export interface PDFDocument {
  id: string;
  numPages: number;
  url: string;
  loadingState: 'idle' | 'loading' | 'loaded' | 'error';
  errorMessage?: string;
}

export interface Page {
  pageNumber: number;
  textContent: string;
  renderState: 'pending' | 'rendering' | 'rendered' | 'error';
  isVisible: boolean;
  isActive: boolean;
  dimensions: {
    width: number;
    height: number;
    scale: number;
  };
}

export interface Section {
  id: string;
  title: string;
  shortLabel: string;
  pageNumber: number;
}

export interface SearchMatch {
  id: string;
  pageNumber: number;
  matchIndexOnPage: number;
  globalIndex: number;
  startOffset: number;
  endOffset: number;
  matchedText: string;
  isActive: boolean;
}

export interface SearchResults {
  query: string;
  matches: SearchMatch[];
  totalMatches: number;
  currentMatchIndex: number;
}
```

### 8.2 Create types/index.ts (barrel export)

```typescript
// types/index.ts
export * from './manifesto';
```

---

## Step 9: Create Constants

Create `lib/utils/constants.ts`:

```typescript
import { Section } from '@/types';

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
```

---

## Step 10: Create Minimal Manifesto Page

### 10.1 Create app/manifesto/page.tsx

```typescript
// app/manifesto/page.tsx
export default function ManifestoPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">UWP Manifesto Reader</h1>
        <p className="text-gray-600">Implementation in progress...</p>
      </div>
    </div>
  );
}
```

### 10.2 Test the Route

```bash
npm run dev
```

Visit http://localhost:3000/manifesto

You should see the placeholder page.

---

## Step 11: Configure Jest (Optional - for Testing)

### 11.1 Create jest.config.js

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
};

module.exports = createJestConfig(customJestConfig);
```

### 11.2 Create jest.setup.js

```javascript
import '@testing-library/jest-dom';
```

### 11.3 Add Test Script

Update `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

---

## Step 12: Configure Playwright (Optional - for E2E)

### 12.1 Initialize Playwright

```bash
npx playwright install
```

### 12.2 Create playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 12.3 Add E2E Test Script

Update `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## Step 13: Verify Setup

### 13.1 Checklist

- [ ] Next.js dev server runs without errors (`npm run dev`)
- [ ] PDF.js worker files exist in `public/pdfjs/`
- [ ] Manifesto PDF exists at `public/manifesto.pdf`
- [ ] Route `/manifesto` displays placeholder page
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] Directory structure matches plan
- [ ] All dependencies installed successfully

### 13.2 Test TypeScript Compilation

```bash
npx tsc --noEmit
```

Should complete with no errors.

---

## Next Steps

Now that your environment is set up, you can begin implementation:

1. **Implement PDF loading utilities** (`lib/pdf/`)
2. **Create custom hooks** (`hooks/`)
3. **Build React components** (`components/manifesto/`)
4. **Write tests** (`__tests__/`)
5. **Follow tasks.md** (generated by `/speckit.tasks`)

---

## Troubleshooting

### PDF.js Worker Not Found

**Error**: `Setting up fake worker failed`

**Solution**:
```bash
# Re-run the copy script
node scripts/copy-pdfjs-worker.js

# Verify file exists
ls -la public/pdfjs/
```

### TypeScript Import Errors

**Error**: `Cannot find module '@/...'`

**Solution**:
- Verify `tsconfig.json` has correct `paths` configuration
- Restart TypeScript server in VS Code (`Cmd+Shift+P` → "TypeScript: Restart TS Server")

### Tailwind Styles Not Applied

**Error**: Styles not appearing

**Solution**:
- Verify `tailwind.config.js` includes correct `content` paths
- Check `app/globals.css` imports Tailwind directives
- Restart dev server

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill

# Or use different port
npm run dev -- -p 3001
```

---

## Development Workflow

### Daily Development

```bash
# Start dev server
npm run dev

# In another terminal, run tests in watch mode
npm run test:watch

# Before committing
npm run lint
npx tsc --noEmit
npm test
```

### Before Creating PR

```bash
# Run full test suite
npm test
npm run test:e2e

# Build for production (check for build errors)
npm run build

# Run production build locally
npm start
```

---

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **PDF.js Docs**: https://mozilla.github.io/pdf.js/
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **React Testing Library**: https://testing-library.com/docs/react-testing-library/intro
- **Playwright Docs**: https://playwright.dev/

---

## Summary

You've now set up the complete development environment for the UWP Manifesto Reader. The next phase (tasks.md) will guide you through implementing each component systematically.

**Estimated setup time**: 20-30 minutes

**Ready to code?** Proceed to `/speckit.tasks` to generate the implementation task breakdown.
