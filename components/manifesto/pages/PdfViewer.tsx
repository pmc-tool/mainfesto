'use client';

import { useState, useEffect } from 'react';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import { PdfPage } from './PdfPage';
import { PageIndicator } from '../navigation/PageIndicator';

type ViewMode = 'single' | 'double' | 'all';

interface PdfViewerProps {
  pdfProxy: PDFDocumentProxy | null;
  numPages: number;
  pageVisibility: {
    visiblePages: number[];
    activePage: number;
    registerPage: (pageNumber: number, element: HTMLElement) => void;
    unregisterPage: (pageNumber: number) => void;
  };
  searchResults?: number[];
  viewMode: ViewMode;
  onPageClick?: (pageNumber: number) => void;
}

export const PdfViewer = ({ pdfProxy, numPages, pageVisibility, searchResults = [], viewMode, onPageClick }: PdfViewerProps) => {
  const [pages, setPages] = useState<PDFPageProxy[]>([]);

  const handlePageClick = (pageNumber: number) => {
    if (viewMode === 'all' && onPageClick) {
      onPageClick(pageNumber);
    }
  };

  useEffect(() => {
    if (!pdfProxy) return;

    const loadPages = async () => {
      const loadedPages: PDFPageProxy[] = [];
      for (let i = 1; i <= numPages; i++) {
        const page = await pdfProxy.getPage(i);
        loadedPages.push(page);
      }
      setPages(loadedPages);
    };

    loadPages();
  }, [pdfProxy, numPages]);

  const pageGroups: PDFPageProxy[][] = [];

  if (viewMode === 'all') {
    pages.forEach((page) => pageGroups.push([page]));
  } else if (viewMode === 'double') {
    for (let i = 0; i < pages.length; i += 2) {
      if (pages[i + 1]) {
        pageGroups.push([pages[i], pages[i + 1]]);
      } else {
        pageGroups.push([pages[i]]);
      }
    }
  } else {
    pages.forEach((page) => pageGroups.push([page]));
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-6">
          <PageIndicator activePage={pageVisibility.activePage} totalPages={numPages} />
        </div>

        <div className="space-y-8">
          {viewMode === 'single' ? (
            pages.map((page, index) => (
              <PdfPage
                key={index + 1}
                page={page}
                pageNumber={index + 1}
                onRegister={pageVisibility.registerPage}
                onUnregister={pageVisibility.unregisterPage}
                isHighlighted={searchResults.includes(index + 1)}
              />
            ))
          ) : viewMode === 'double' ? (
            pageGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="flex gap-4 justify-center">
                {group.map((page, pageIndex) => {
                  const pageNumber = groupIndex * 2 + pageIndex + 1;
                  return (
                    <div key={pageNumber} className="flex-1 max-w-[50%]">
                      <PdfPage
                        page={page}
                        pageNumber={pageNumber}
                        onRegister={pageVisibility.registerPage}
                        onUnregister={pageVisibility.unregisterPage}
                        isHighlighted={searchResults.includes(pageNumber)}
                      />
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pages.map((page, index) => (
                <div
                  key={index + 1}
                  className="aspect-[1/1.414] cursor-pointer transition-transform hover:scale-105"
                  onClick={() => handlePageClick(index + 1)}
                >
                  <PdfPage
                    page={page}
                    pageNumber={index + 1}
                    onRegister={pageVisibility.registerPage}
                    onUnregister={pageVisibility.unregisterPage}
                    isHighlighted={searchResults.includes(index + 1)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
