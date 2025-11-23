'use client';

import { useState, useEffect } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { PDFDocument } from '@/types';
import { loadPdfDocument, getErrorMessage } from '@/lib/pdf/pdfLoader';
import { extractAllPageTexts } from '@/lib/pdf/textExtractor';
import { CONFIG } from '@/lib/utils/constants';

interface UsePdfDocumentReturn {
  document: PDFDocument;
  pdfProxy: PDFDocumentProxy | null;
  pageTexts: Map<number, string>;
  reload: () => void;
}

/**
 * Hook for loading and managing PDF document state
 * @param url - URL of PDF file to load
 * @returns Document state, PDF proxy, page texts, and reload function
 */
export const usePdfDocument = (url: string = CONFIG.PDF_URL): UsePdfDocumentReturn => {
  const [document, setDocument] = useState<PDFDocument>({
    id: 'uwp-manifesto',
    numPages: 0,
    url,
    loadingState: 'idle',
  });

  const [pdfProxy, setPdfProxy] = useState<PDFDocumentProxy | null>(null);
  const [pageTexts, setPageTexts] = useState<Map<number, string>>(new Map());

  const loadPdf = async () => {
    setDocument((prev) => ({ ...prev, loadingState: 'loading' }));

    try {
      const pdf = await loadPdfDocument(url);
      setPdfProxy(pdf);

      setDocument({
        id: 'uwp-manifesto',
        numPages: pdf.numPages,
        url,
        loadingState: 'loaded',
      });

      // Extract text from all pages in the background (this may take a while for large PDFs)
      // Don't block rendering - extract text asynchronously
      extractAllPageTexts(pdf).then((texts) => {
        setPageTexts(texts);
      }).catch((error) => {
        console.error('Text extraction failed:', error);
        // Still allow PDF viewing even if text extraction fails
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? getErrorMessage(error) : 'Unknown error';
      setDocument((prev) => ({
        ...prev,
        loadingState: 'error',
        errorMessage,
      }));
      console.error('PDF load error:', error);
    }
  };

  const reload = () => {
    setDocument({
      id: 'uwp-manifesto',
      numPages: 0,
      url,
      loadingState: 'idle',
    });
    setPdfProxy(null);
    setPageTexts(new Map());
  };

  useEffect(() => {
    loadPdf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return {
    document,
    pdfProxy,
    pageTexts,
    reload,
  };
};
