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
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-3 flex items-center justify-center">
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
          </div>
        </div>

        <PdfViewer
          pdfProxy={pdfProxy}
          numPages={pdfDocument.numPages}
          pageVisibility={pageVisibility}
          searchResults={[]}
          viewMode={viewMode}
          onPageClick={scrollToPage}
        />
      </div>
    </div>
  );
};
