import type { Section } from '@/types';

/**
 * Application configuration constants
 */
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

/**
 * UWP Manifesto section mapping (page numbers are 1-indexed)
 */
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
  {
    id: 'recovery',
    title: 'A RECOVERY PROGRAMME',
    shortLabel: 'Recovery',
    pageNumber: 12,
  },
  {
    id: 'team',
    title: 'OUR TEAM',
    shortLabel: 'Team',
    pageNumber: 14,
  },
  {
    id: 'agenda',
    title: 'THE TRANSFORMATIVE AGENDA',
    shortLabel: 'Agenda',
    pageNumber: 16,
  },
  {
    id: 'agriculture',
    title: 'TRANSFORMING OUR AGRICULTURE AND FISHERIES SECTOR',
    shortLabel: 'Agriculture',
    pageNumber: 23,
  },
  {
    id: 'tourism',
    title: 'REVITALIZING THE TOURISM SECTOR',
    shortLabel: 'Tourism',
    pageNumber: 26,
  },
  {
    id: 'digital',
    title: 'BUILDING A VIBRANT DIGITAL ECONOMY',
    shortLabel: 'Digital',
    pageNumber: 32,
  },
  {
    id: 'trade',
    title: 'INVESTMENT, TRADE AND EXTERNAL RELATIONS',
    shortLabel: 'Trade',
    pageNumber: 38,
  },
  {
    id: 'infrastructure',
    title: 'INFRASTRUCTURE AND PORT DEVELOPMENT',
    shortLabel: 'Infra',
    pageNumber: 45,
  },
  {
    id: 'energy',
    title: 'SECURING OUR ENERGY FUTURE THROUGH RENEWABLES',
    shortLabel: 'Energy',
    pageNumber: 50,
  },
  {
    id: 'governance',
    title: 'GOVERNANCE AND LOCAL GOVERNMENT REFORM',
    shortLabel: 'Governance',
    pageNumber: 60,
  },
] as const;

/**
 * Validation: Ensure sections are in ascending page order
 */
const validateSections = (sections: readonly Section[]): void => {
  if (sections.length !== 12) {
    throw new Error(`Expected 12 sections, got ${sections.length}`);
  }

  sections.forEach((section, i) => {
    if (i > 0 && section.pageNumber <= sections[i - 1].pageNumber) {
      throw new Error(`Sections must be in ascending page order`);
    }
  });
};

// Run validation on module load
validateSections(MANIFESTO_SECTIONS);
