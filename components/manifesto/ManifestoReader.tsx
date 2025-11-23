'use client';

import { useState, useEffect } from 'react';
import { usePdfDocument } from '@/hooks/usePdfDocument';
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { PdfViewer } from './pages/PdfViewer';
import { Context } from './Context';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

export const ManifestoReader = () => {
  const { document: pdfDocument, pdfProxy, pageTexts, reload } = usePdfDocument();
  const pageVisibility = usePageVisibility();
  // Open sidebar by default on desktop (>= 1024px), closed on mobile
  const [isContextOpen, setIsContextOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true; // Default to open for SSR
  });
  const [viewMode, setViewMode] = useState<'single' | 'double' | 'all'>('single');
  const [isScrolled, setIsScrolled] = useState(false);

  const scrollToPage = (pageNumber: number) => {
    const pageElement = document.querySelector(`[data-page-number="${pageNumber}"]`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
                <div className="w-10 h-10 bg-gradient-to-br from-uwp-primary to-green-700 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">UWP</span>
                </div>
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

            {/* Desktop: View mode buttons centered */}
            <div className="hidden lg:flex items-center gap-1 border border-gray-300 rounded-lg p-1 mx-auto">
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
          </div>
        </div>

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
      </div>
    </div>
  );
};
