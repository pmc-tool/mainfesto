'use client';

import { useState, useEffect } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';

interface FlipbookViewerProps {
  pdfProxy: PDFDocumentProxy | null;
  numPages: number;
  activePage: number;
  onPageChange: (page: number) => void;
}

export const FlipbookViewer = ({ pdfProxy, numPages, activePage, onPageChange }: FlipbookViewerProps) => {
  const [currentPage, setCurrentPage] = useState(activePage);
  const [isFlipping, setIsFlipping] = useState(false);
  const [pageImages, setPageImages] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    setCurrentPage(activePage);
  }, [activePage]);

  useEffect(() => {
    if (!pdfProxy) return;

    const loadPageImages = async () => {
      const images = new Map<number, string>();

      // Load current page and nearby pages for smooth transitions
      const pagesToLoad = [currentPage];
      if (currentPage > 1) pagesToLoad.push(currentPage - 1);
      if (currentPage < numPages) pagesToLoad.push(currentPage + 1);

      for (const pageNum of pagesToLoad) {
        if (!pageImages.has(pageNum)) {
          try {
            const page = await pdfProxy.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            if (!context) continue;

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
              canvasContext: context,
              viewport: viewport,
            }).promise;

            images.set(pageNum, canvas.toDataURL());
          } catch (error) {
            console.error(`Error loading page ${pageNum}:`, error);
          }
        }
      }

      setPageImages(prev => new Map([...prev, ...images]));
    };

    loadPageImages();
  }, [pdfProxy, currentPage, numPages, pageImages]);

  const handlePrevious = () => {
    if (currentPage > 1 && !isFlipping) {
      setIsFlipping(true);
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      onPageChange(newPage);
      setTimeout(() => setIsFlipping(false), 600);
    }
  };

  const handleNext = () => {
    if (currentPage < numPages && !isFlipping) {
      setIsFlipping(true);
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      onPageChange(newPage);
      setTimeout(() => setIsFlipping(false), 600);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  });

  return (
    <div className="flipbook-container flex-1 flex flex-col items-center justify-center bg-gray-100 p-4 overflow-hidden">
      <div className="flipbook-wrapper relative max-w-4xl w-full" style={{ perspective: '2000px' }}>
        <div className={`flipbook-page-wrapper relative w-full ${isFlipping ? 'flipping' : ''}`}>
          {pageImages.get(currentPage) && (
            <img
              src={pageImages.get(currentPage)}
              alt={`Page ${currentPage}`}
              className="flipbook-page w-full h-auto shadow-2xl rounded-lg"
              style={{
                transformStyle: 'preserve-3d',
                transition: isFlipping ? 'transform 0.6s ease-in-out' : 'none',
              }}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1 || isFlipping}
          className="flipbook-nav-btn flipbook-nav-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded-full shadow-lg transition-all"
          aria-label="Previous page"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={handleNext}
          disabled={currentPage === numPages || isFlipping}
          className="flipbook-nav-btn flipbook-nav-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded-full shadow-lg transition-all"
          aria-label="Next page"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Page Counter */}
      <div className="flipbook-counter mt-6 bg-white px-6 py-3 rounded-full shadow-md">
        <span className="text-gray-700 font-medium">
          Page {currentPage} of {numPages}
        </span>
      </div>
    </div>
  );
};
