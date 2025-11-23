'use client';

import { useState, useEffect } from 'react';
import { usePdfDocument } from '@/hooks/usePdfDocument';
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { PdfViewer } from './pages/PdfViewer';
import { FlipbookViewer } from './flipbook/FlipbookViewer';
import { Context } from './Context';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

export const ManifestoReader = () => {
  const { document: pdfDocument, pdfProxy, pageTexts, reload } = usePdfDocument();
  const pageVisibility = usePageVisibility();
  // Start with sidebar open (will adjust on client side)
  const [isContextOpen, setIsContextOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'single' | 'double' | 'all'>('single');
  const [displayMode, setDisplayMode] = useState<'pdf' | 'flipbook'>('pdf');
  const [isScrolled, setIsScrolled] = useState(false);

  // Adjust sidebar state based on screen size on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsContextOpen(false);
    }
  }, []);

  const scrollToPage = (pageNumber: number, switchToSingle = false) => {
    if (switchToSingle && viewMode !== 'single') {
      // Switch to single view first, then scroll after the view updates
      setViewMode('single');
      // Delay scroll to allow view mode to update
      setTimeout(() => {
        const pageElement = document.querySelector(`[data-page-number="${pageNumber}"]`);
        if (pageElement) {
          pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const pageElement = document.querySelector(`[data-page-number="${pageNumber}"]`);
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Detect scroll on mobile
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target) {
        const scrolled = target.scrollTop > 50;
        setIsScrolled(scrolled);
      }
    };

    // Wait for the component to mount
    const timer = setTimeout(() => {
      const pdfViewer = document.querySelector('.pdf-viewer-container');
      if (pdfViewer) {
        pdfViewer.addEventListener('scroll', handleScroll);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      const pdfViewer = document.querySelector('.pdf-viewer-container');
      if (pdfViewer) {
        pdfViewer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [pdfProxy]);

  if (pdfDocument.loadingState === 'loading') {
    return <LoadingState />;
  }

  if (pdfDocument.loadingState === 'error') {
    return <ErrorState message={pdfDocument.errorMessage} onRetry={reload} />;
  }

  const currentPageText = pageTexts.get(pageVisibility.activePage) || '';

  return (
    <div className="flex h-screen bg-gray-50">
      <Context
        isOpen={isContextOpen}
        onClose={() => setIsContextOpen(false)}
        onToggle={() => setIsContextOpen(!isContextOpen)}
        activePage={pageVisibility.activePage}
        pageText={currentPageText}
        onPageClick={scrollToPage}
        pageTexts={pageTexts}
      />

      <div className="flex-1 flex flex-col relative">
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
          <div className="px-4 py-3 flex items-center justify-between">
            {/* Mobile: Hamburger */}
            <button
              onClick={() => setIsContextOpen(!isContextOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Mobile: Center - Logo or View mode buttons */}
            <div className="lg:hidden flex-1 flex items-center justify-center">
              {!isScrolled ? (
                <img
                  src="/uwp-final.png"
                  alt="United Workers Party Logo"
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('single')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      viewMode === 'single'
                        ? 'bg-uwp-secondary text-gray-900'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    aria-label="Single page view"
                  >
                    Single
                  </button>
                  <button
                    onClick={() => setViewMode('double')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      viewMode === 'double'
                        ? 'bg-uwp-secondary text-gray-900'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    aria-label="Double page view"
                  >
                    Double
                  </button>
                  <button
                    onClick={() => setViewMode('all')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      viewMode === 'all'
                        ? 'bg-uwp-secondary text-gray-900'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    aria-label="All pages view"
                  >
                    All
                  </button>
                </div>
              )}
            </div>

            {/* Mobile: Right spacer to balance hamburger */}
            <div className="lg:hidden w-10"></div>

            {/* Desktop: Display Mode Toggle + View mode buttons */}
            <div className="hidden lg:flex items-center gap-4 mx-auto">
              {/* Display Mode Toggle (PDF/Flipbook) - Desktop Only */}
              <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setDisplayMode('pdf')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    displayMode === 'pdf'
                      ? 'bg-uwp-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-label="PDF view"
                >
                  PDF
                </button>
                <button
                  onClick={() => setDisplayMode('flipbook')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    displayMode === 'flipbook'
                      ? 'bg-uwp-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-label="Flipbook view"
                >
                  Flipbook
                </button>
              </div>

              {/* View mode buttons (only show in PDF mode) */}
              {displayMode === 'pdf' && (
                <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('single')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'single'
                    ? 'bg-uwp-secondary text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-label="Single page view"
              >
                Single
              </button>
              <button
                onClick={() => setViewMode('double')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'double'
                    ? 'bg-uwp-secondary text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-label="Double page view"
              >
                Double
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'all'
                    ? 'bg-uwp-secondary text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-label="All pages view"
              >
                All Pages
              </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {displayMode === 'pdf' ? (
          <PdfViewer
            pdfProxy={pdfProxy}
            numPages={pdfDocument.numPages}
            pageVisibility={pageVisibility}
            searchResults={[]}
            viewMode={viewMode}
            onPageClick={scrollToPage}
            onViewModeChange={setViewMode}
            isScrolled={isScrolled}
          />
        ) : (
          <FlipbookViewer
            pdfProxy={pdfProxy}
            numPages={pdfDocument.numPages}
            activePage={pageVisibility.activePage}
            onPageChange={scrollToPage}
          />
        )}
      </div>
    </div>
  );
};
