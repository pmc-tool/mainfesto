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

const FlipbookPage = ({ imageUrl }: { imageUrl: string | null }) => {
  return (
    <div className="flipbook-page-content w-full h-full bg-white flex items-center justify-center">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Page"
          className="w-full h-full object-contain"
          draggable={false}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-gray-400">Loading...</div>
        </div>
      )}
    </div>
  );
};

export const FlipbookViewer = ({ pdfProxy, numPages, activePage, onPageChange }: FlipbookViewerProps) => {
  const [pageImages, setPageImages] = useState<Map<number, string>>(new Map());
  const [currentPage, setCurrentPage] = useState(0);
  const flipBookRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 1000 });

  // Calculate full-screen book dimensions
  useEffect(() => {
    const updateDimensions = () => {
      // Full screen height minus header and some padding
      const availableHeight = window.innerHeight - 120;
      // Each page takes half the width (minus sidebar and padding)
      const availableWidth = (window.innerWidth - 400) / 2; // Accounting for sidebar

      // Use A4-like aspect ratio (1:1.414)
      const heightBasedWidth = availableHeight / 1.414;
      const widthBasedHeight = availableWidth * 1.414;

      let finalWidth, finalHeight;
      if (heightBasedWidth <= availableWidth) {
        finalHeight = availableHeight;
        finalWidth = heightBasedWidth;
      } else {
        finalWidth = availableWidth;
        finalHeight = widthBasedHeight;
      }

      setDimensions({
        width: Math.floor(finalWidth),
        height: Math.floor(finalHeight)
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Load all PDF pages as images
  useEffect(() => {
    if (!pdfProxy) return;

    const loadAllPages = async () => {
      const images = new Map<number, string>();

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        try {
          const page = await pdfProxy.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2.5 });
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
      <div className="flipbook-loading-screen flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-uwp-secondary mx-auto mb-6"></div>
          <p className="text-white text-xl">Preparing your book...</p>
          <p className="text-gray-400 mt-2">Loading {numPages} pages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flipbook-fullscreen-container flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-gray-800 via-gray-900 to-black overflow-hidden">
      {/* Main Book Container */}
      <div className="flipbook-book-wrapper relative flex items-center justify-center flex-1 w-full">
        <HTMLFlipBook
          ref={flipBookRef}
          width={dimensions.width}
          height={dimensions.height}
          size="stretch"
          minWidth={300}
          maxWidth={2000}
          minHeight={400}
          maxHeight={2000}
          showCover={false}
          flippingTime={800}
          usePortrait={false}
          startPage={0}
          drawShadow={true}
          className="flipbook-book-element"
          style={{}}
          startZIndex={0}
          autoSize={false}
          maxShadowOpacity={0.8}
          mobileScrollSupport={false}
          onFlip={handleFlip}
          useMouseEvents={true}
          swipeDistance={50}
          clickEventForward={true}
          showPageCorners={true}
          disableFlipByClick={false}
        >
          {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
            <div key={pageNum} className="flipbook-single-page">
              <FlipbookPage
                imageUrl={pageImages.get(pageNum) || null}
              />
            </div>
          ))}
        </HTMLFlipBook>

        {/* Large Navigation Arrows */}
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 0}
          className="flipbook-arrow-left absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 disabled:opacity-20 disabled:cursor-not-allowed p-6 rounded-full backdrop-blur-sm transition-all hover:scale-110 border-2 border-white/20"
          aria-label="Previous page"
        >
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={goToNextPage}
          disabled={currentPage >= numPages - 1}
          className="flipbook-arrow-right absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 disabled:opacity-20 disabled:cursor-not-allowed p-6 rounded-full backdrop-blur-sm transition-all hover:scale-110 border-2 border-white/20"
          aria-label="Next page"
        >
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Bottom Bar with Page Info */}
      <div className="flipbook-bottom-bar w-full bg-black/80 backdrop-blur-md px-8 py-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-uwp-primary px-6 py-2 rounded-full">
              <span className="text-white font-bold text-lg">
                {currentPage + 1} / {numPages}
              </span>
            </div>
            <span className="text-gray-300 text-sm">
              Click page corners or use arrows to flip • Drag to turn pages
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-lg transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={goToNextPage}
              disabled={currentPage >= numPages - 1}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-lg transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
