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
  const [dimensions, setDimensions] = useState({ width: 2000, height: 2400 });

  const CHUNK_SIZE = 4;
  const INITIAL_LOAD = 4; // Load first 4 pages immediately

  // Calculate maximum book dimensions - fill screen completely
  useEffect(() => {
    const updateDimensions = () => {
      const headerHeight = 60;
      const maxHeight = window.innerHeight - headerHeight;
      const maxWidthPerPage = window.innerWidth / 2;

      setDimensions({
        width: Math.floor(maxWidthPerPage),
        height: Math.floor(maxHeight)
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
      const viewport = page.getViewport({ scale: 4 }); // Higher quality for larger display
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
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <HTMLFlipBook
        ref={flipBookRef}
        width={dimensions.width}
        height={dimensions.height}
        size="stretch"
        minWidth={300}
        maxWidth={3000}
        minHeight={400}
        maxHeight={3000}
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
    </div>
  );
};
