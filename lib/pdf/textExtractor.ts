import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

/**
 * Extracts text content from a PDF page
 * @param page - PDF.js page proxy
 * @returns Promise resolving to plain text string
 */
export const extractPageText = async (page: PDFPageProxy): Promise<string> => {
  try {
    const textContent = await page.getTextContent();

    const text = textContent.items
      .map((item) => {
        if ('str' in item) {
          return item.str;
        }
        return '';
      })
      .join(' ');

    return text;
  } catch (error) {
    console.error(`Failed to extract text from page:`, error);
    return '';
  }
};

/**
 * Extracts text from all pages in a PDF document
 * @param pdf - PDF.js document proxy
 * @returns Promise resolving to Map of pageNumber -> text
 */
export const extractAllPageTexts = async (
  pdf: PDFDocumentProxy
): Promise<Map<number, string>> => {
  const pageTexts = new Map<number, string>();

  // Extract text from each page sequentially to avoid memory spikes
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    try {
      const page = await pdf.getPage(pageNum);
      const text = await extractPageText(page);
      pageTexts.set(pageNum, text);
    } catch (error) {
      console.error(`Failed to extract text from page ${pageNum}:`, error);
      pageTexts.set(pageNum, '');
    }
  }

  return pageTexts;
};

/**
 * Extracts text from a specific range of pages
 * @param pdf - PDF.js document proxy
 * @param startPage - Starting page number (1-indexed)
 * @param endPage - Ending page number (1-indexed, inclusive)
 * @returns Promise resolving to Map of pageNumber -> text
 */
export const extractPageRange = async (
  pdf: PDFDocumentProxy,
  startPage: number,
  endPage: number
): Promise<Map<number, string>> => {
  const pageTexts = new Map<number, string>();

  for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
    if (pageNum < 1 || pageNum > pdf.numPages) continue;

    try {
      const page = await pdf.getPage(pageNum);
      const text = await extractPageText(page);
      pageTexts.set(pageNum, text);
    } catch (error) {
      console.error(`Failed to extract text from page ${pageNum}:`, error);
      pageTexts.set(pageNum, '');
    }
  }

  return pageTexts;
};
