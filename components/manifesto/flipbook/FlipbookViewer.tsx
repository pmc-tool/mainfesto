'use client';

import { useState, useEffect, useRef } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import HTMLFlipBook from 'react-pageflip';

interface FlipbookViewerProps {
  pdfProxy: PDFDocumentProxy | null;
  numPages: number;
  activePage: number;
  onPageChange: (page: number) => void;
}

const FlipbookPage = ({ pageNumber, imageUrl }: { pageNumber: number; imageUrl: string | null }) => {
  return (
    <div className="flipbook-page-content bg-white shadow-2xl flex items-center justify-center overflow-hidden">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`Page ${pageNumber}`}
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-gray-400">Loading page {pageNumber}...</div>
        </div>
      )}
    </div>
  );
};

export const FlipbookViewer = ({ pdfProxy, numPages, activePage, onPageChange }: FlipbookViewerProps) => {
  const [pageImages, setPageImages] = useState<Map<number, string>>(new Map());
  const [currentPage, setCurrentPage] = useState(0);
  const flipBookRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 800 });

  // Calculate dimensions based on window size
  useEffect(() => {
    const updateDimensions = () => {
      const maxWidth = Math.min(window.innerWidth * 0.4, 600);
      const maxHeight = Math.min(window.innerHeight * 0.8, 800);
      setDimensions({ width: maxWidth, height: maxHeight });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Load all PDF pages as images
  useEffect(() => {
    if (!pdfProxy) return;

    const loadAllPages = async () => {
      const images = new Map<string, string>();

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
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

          images.set(pageNum.toString(), canvas.toDataURL());
        } catch (error) {
          console.error(`Error loading page ${pageNum}:`, error);
        }
      }

      setPageImages(images);
    };

    loadAllPages();
  }, [pdfProxy, numPages]);

  const handleFlip = (e: any) => {
    setCurrentPage(e.data);
    onPageChange(e.data + 1);
  };

  const goToPreviousPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

  const goToNextPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipNext();
    }
  };

  if (pageImages.size === 0) {
    return (
      <div className="flipbook-loading flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-uwp-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flipbook pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flipbook-container-wrapper flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 p-4 overflow-hidden">
      <div className="flipbook-main relative">
        <HTMLFlipBook
          ref={flipBookRef}
          width={dimensions.width}
          height={dimensions.height}
          size="stretch"
          minWidth={315}
          maxWidth={1000}
          minHeight={400}
          maxHeight={1533}
          showCover={true}
          flippingTime={1000}
          usePortrait={true}
          startPage={0}
          drawShadow={true}
          className="flipbook-element"
          style={{ margin: '0 auto' }}
          startZIndex={0}
          autoSize={true}
          maxShadowOpacity={0.5}
          mobileScrollSupport={true}
          onFlip={handleFlip}
          useMouseEvents={true}
          swipeDistance={30}
          clickEventForward={true}
        >
          {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
            <div key={pageNum} className="flipbook-page-wrapper">
              <FlipbookPage
                pageNumber={pageNum}
                imageUrl={pageImages.get(pageNum.toString()) || null}
              />
            </div>
          ))}
        </HTMLFlipBook>

        {/* Navigation Controls */}
        <div className="flipbook-controls absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none" style={{ width: '120%', left: '-10%' }}>
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 0}
            className="flipbook-nav-btn pointer-events-auto bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed p-4 rounded-full shadow-xl transition-all hover:scale-110"
            aria-label="Previous page"
          >
            <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={goToNextPage}
            disabled={currentPage >= numPages - 1}
            className="flipbook-nav-btn pointer-events-auto bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed p-4 rounded-full shadow-xl transition-all hover:scale-110"
            aria-label="Next page"
          >
            <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Page Counter and Instructions */}
      <div className="flipbook-footer mt-6 text-center space-y-2">
        <div className="flipbook-counter bg-white px-8 py-3 rounded-full shadow-lg inline-block">
          <span className="text-gray-700 font-semibold text-lg">
            Page {currentPage + 1} of {numPages}
          </span>
        </div>
        <p className="text-gray-600 text-sm">
          Click corners or use arrow keys to flip pages
        </p>
      </div>
    </div>
  );
};
