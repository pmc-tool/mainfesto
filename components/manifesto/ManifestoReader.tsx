'use client';

import { useState } from 'react';
import { usePdfDocument } from '@/hooks/usePdfDocument';
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { PdfViewer } from './pages/PdfViewer';
import { Context } from './Context';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

export const ManifestoReader = () => {
  const { document: pdfDocument, pdfProxy, pageTexts, reload } = usePdfDocument();
  const pageVisibility = usePageVisibility();
  const [isContextOpen, setIsContextOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'single' | 'double' | 'all'>('single');

  const scrollToPage = (pageNumber: number) => {
    const pageElement = document.querySelector(`[data-page-number="${pageNumber}"]`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
        {!isContextOpen && (
          <button
            onClick={() => setIsContextOpen(true)}
            className="hidden lg:block fixed top-4 left-4 z-30 p-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg shadow-md transition-all"
            aria-label="Show sidebar"
            title="Show sidebar"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollToPage(Math.max(1, pageVisibility.activePage - 1))}
                disabled={pageVisibility.activePage === 1}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed border border-gray-300"
                aria-label="Previous page"
                title="Previous page"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                aria-label="Zoom"
                title="Zoom"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </button>

              <button
                onClick={() => scrollToPage(Math.min(pdfDocument.numPages, pageVisibility.activePage + 1))}
                disabled={pageVisibility.activePage === pdfDocument.numPages}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed border border-gray-300"
                aria-label="Next page"
                title="Next page"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('single')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'single'
                    ? 'bg-blue-600 text-white'
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
                    ? 'bg-blue-600 text-white'
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
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-label="All pages view"
              >
                All Pages
              </button>
            </div>

            <div className="w-32"></div>
          </div>
        </div>

        <PdfViewer
          pdfProxy={pdfProxy}
          numPages={pdfDocument.numPages}
          pageVisibility={pageVisibility}
          searchResults={[]}
          viewMode={viewMode}
        />
      </div>
    </div>
  );
};
