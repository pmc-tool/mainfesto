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
  const [loadedChunks, setLoadedChunks] = useState<Set<number>>(new Set());
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const flipBookRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 1000 });

  const CHUNK_SIZE = 4;
  const INITIAL_LOAD = 4; // Load first 4 pages immediately

  // Calculate full-screen book dimensions - 80% of canvas
  useEffect(() => {
    const updateDimensions = () => {
      // Use 80% of available height (minus header and bottom bar)
      const totalAvailableHeight = window.innerHeight - 180; // header + bottom bar
      const targetHeight = totalAvailableHeight * 0.85; // 85% for better coverage

      // Calculate available width
      const availableWidth = window.innerWidth - 100; // Small margins

      // Use A4-like aspect ratio (1:1.414)
      const heightBasedWidth = targetHeight / 1.414;

      let finalWidth, finalHeight;

      // Prioritize height to use more vertical space
      if (heightBasedWidth * 2 <= availableWidth * 0.85) {
        // Height-based sizing fits within width
        finalHeight = targetHeight;
        finalWidth = heightBasedWidth;
      } else {
        // Width-constrained - scale down proportionally
        finalWidth = (availableWidth * 0.85) / 2;
        finalHeight = finalWidth * 1.414;
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

  // Function to load a specific page
  const loadPage = async (pageNum: number): Promise<string | null> => {
    if (!pdfProxy) return null;

    try {
      const page = await pdfProxy.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) return null;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      return canvas.toDataURL();
    } catch (error) {
      console.error(`Error loading page ${pageNum}:`, error);
      return null;
    }
  };

  // Function to load a chunk of pages
  const loadChunk = async (startPage: number, endPage: number) => {
    const chunkKey = Math.floor(startPage / CHUNK_SIZE);

    // Skip if chunk already loaded
    if (loadedChunks.has(chunkKey)) return;

    const actualEndPage = Math.min(endPage, numPages);
    const newImages = new Map<number, string>();

    for (let pageNum = startPage; pageNum <= actualEndPage; pageNum++) {
      // Skip if page already loaded
      if (pageImages.has(pageNum)) continue;

      const imageUrl = await loadPage(pageNum);
      if (imageUrl) {
        newImages.set(pageNum, imageUrl);
      }
    }

    setPageImages(prev => new Map([...prev, ...newImages]));
    setLoadedChunks(prev => new Set([...prev, chunkKey]));
  };

  // Load initial pages (first 4)
  useEffect(() => {
    if (!pdfProxy) return;

    const loadInitialPages = async () => {
      await loadChunk(1, INITIAL_LOAD);
      setIsInitialLoading(false);

      // Start loading next chunk in background
      setTimeout(() => {
        loadChunk(INITIAL_LOAD + 1, INITIAL_LOAD + CHUNK_SIZE);
      }, 500);
    };

    loadInitialPages();
  }, [pdfProxy]);

  // Load chunks based on current page
  useEffect(() => {
    if (isInitialLoading || !pdfProxy) return;

    const currentChunk = Math.floor((currentPage + 1) / CHUNK_SIZE);
    const nextChunk = currentChunk + 1;
    const prevChunk = currentChunk - 1;

    // Load current chunk if not loaded
    const currentStart = currentChunk * CHUNK_SIZE + 1;
    const currentEnd = currentStart + CHUNK_SIZE - 1;
    loadChunk(currentStart, currentEnd);

    // Preload next chunk
    const nextStart = nextChunk * CHUNK_SIZE + 1;
    const nextEnd = nextStart + CHUNK_SIZE - 1;
    if (nextStart <= numPages) {
      setTimeout(() => loadChunk(nextStart, nextEnd), 100);
    }

    // Preload previous chunk
    if (prevChunk >= 0) {
      const prevStart = prevChunk * CHUNK_SIZE + 1;
      const prevEnd = prevStart + CHUNK_SIZE - 1;
      setTimeout(() => loadChunk(prevStart, prevEnd), 200);
    }
  }, [currentPage, pdfProxy, isInitialLoading]);

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

  if (isInitialLoading) {
    return (
      <div className="flipbook-loading-screen flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-uwp-secondary mx-auto mb-6"></div>
          <p className="text-white text-xl">Preparing your book...</p>
          <p className="text-gray-400 mt-2">Loading first pages</p>
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
          showCover={true}
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
