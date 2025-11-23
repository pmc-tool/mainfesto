import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { CONFIG } from '@/lib/utils/constants';

/**
 * Loads a PDF document from the given URL
 * @param url - Absolute or relative path to PDF file
 * @returns Promise resolving to PDF.js document proxy
 * @throws Error if file not found or invalid PDF format
 */
export const loadPdfDocument = async (url: string): Promise<PDFDocumentProxy> => {
  // Configure PDF.js worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = CONFIG.PDFJS_WORKER_PATH;

  try {
    // Load document
    const loadingTask = pdfjsLib.getDocument(url);
    const pdf = await loadingTask.promise;

    return pdf;
  } catch (error) {
    console.error('Failed to load PDF document:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to load PDF document'
    );
  }
};

/**
 * Gets the error message for PDF load errors
 * @param error - Error object
 * @returns User-friendly error message
 */
export const getErrorMessage = (error: Error): string => {
  const message = error.message.toLowerCase();

  if (message.includes('404') || message.includes('not found')) {
    return 'Manifesto file not found. Please contact support.';
  }
  if (message.includes('network') || message.includes('failed to fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  if (message.includes('invalid') || message.includes('corrupted')) {
    return 'The manifesto file is corrupted. Please contact support.';
  }
  return 'Unable to load manifesto. Please refresh the page.';
};
