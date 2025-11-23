import type { SearchMatch } from '@/types';
import { CONFIG } from './constants';

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

/**
 * Validates a search query string
 * @param query - Query to validate
 * @returns true if query is valid
 */
export const isValidSearchQuery = (query: string): boolean => {
  return typeof query === 'string' && query.trim().length > 0;
};

/**
 * Sanitizes HTML to prevent XSS attacks
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (html: string): string => {
  // Basic sanitization: escape HTML entities
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};
