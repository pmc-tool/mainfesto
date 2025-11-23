import type { SearchMatch } from '@/types';

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
    result += escapeHtml(text.substring(lastIndex, match.startOffset));

    // Add highlighted match
    const className = match.id === activeMatchId ? 'bg-yellow-200' : 'bg-yellow-100';
    result += `<mark class="${className}" data-match-id="${match.id}">${escapeHtml(match.matchedText)}</mark>`;

    lastIndex = match.endOffset;
  }

  // Add remaining text
  result += escapeHtml(text.substring(lastIndex));

  return result;
};

/**
 * Escapes HTML entities to prevent XSS
 * @param text - Text to escape
 * @returns Escaped text
 */
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Gets matches for a specific page
 * @param allMatches - All search matches
 * @param pageNumber - Page number to filter by
 * @returns Matches for the specified page
 */
export const getMatchesForPage = (
  allMatches: SearchMatch[],
  pageNumber: number
): SearchMatch[] => {
  return allMatches.filter((match) => match.pageNumber === pageNumber);
};

/**
 * Finds the next match after the current one
 * @param matches - All search matches
 * @param currentIndex - Current match index
 * @returns Next match index (wraps around to 0)
 */
export const getNextMatchIndex = (
  matches: SearchMatch[],
  currentIndex: number
): number => {
  if (matches.length === 0) return -1;
  return (currentIndex + 1) % matches.length;
};

/**
 * Finds the previous match before the current one
 * @param matches - All search matches
 * @param currentIndex - Current match index
 * @returns Previous match index (wraps around to last)
 */
export const getPreviousMatchIndex = (
  matches: SearchMatch[],
  currentIndex: number
): number => {
  if (matches.length === 0) return -1;
  return (currentIndex - 1 + matches.length) % matches.length;
};
