'use client';

import { useState, useRef, useEffect } from 'react';
import { tableOfContents } from '@/lib/tableOfContents';
import { SidebarSearch } from './SidebarSearch';

interface ContextProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  activePage: number;
  pageText: string;
  onPageClick: (pageNumber: number) => void;
  pageTexts: Map<number, string>;
}

export const Context = ({ isOpen, onClose, onToggle, activePage, pageText, onPageClick, pageTexts }: ContextProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [width, setWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleItemClick = (pageNumber: number) => {
    onPageClick(pageNumber);
    // Don't close sidebar on desktop when clicking table of contents
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setIsSearching(query.trim().length > 0);
  };

  const handleSearchResultClick = (pageNumber: number) => {
    onPageClick(pageNumber);
    // Don't close sidebar on desktop when clicking search results
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = e.clientX;
      if (newWidth >= 280 && newWidth <= 600) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        ref={sidebarRef}
        style={{ width: isOpen ? `${width}px` : '0px' }}
        className={`fixed lg:relative inset-y-0 left-0 z-50 bg-white shadow-xl transition-all duration-300 ease-in-out ${
          isOpen ? '' : 'lg:w-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-6 flex items-center justify-between border-b border-gray-200 flex-shrink-0 shadow-sm">
            <img
              src="/uwp-final.png"
              alt="United Workers Party Logo"
              className="w-32 h-32 object-contain mx-auto"
            />
            <button
              onClick={onClose}
              className="lg:hidden absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-800">
              {isSearching ? 'Search Results' : 'Table of Contents'}
            </h2>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            <div className="mb-4">
              <SidebarSearch
                onSearchChange={handleSearchChange}
                onResultClick={handleSearchResultClick}
                pageTexts={pageTexts}
                searchQuery={searchQuery}
              />
            </div>

            {!isSearching && (
              <div>
                <nav className="space-y-1">
                  {tableOfContents.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleItemClick(item.page)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                        activePage === item.page
                          ? 'bg-uwp-primary text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="leading-tight">{item.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </div>

        {/* Collapse/Expand Button */}
        <button
          onClick={onToggle}
          className={`hidden lg:flex absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-50 w-8 h-16 rounded-r-lg shadow-md items-center justify-center transition-all ${
            isOpen
              ? 'bg-yellow-400 hover:bg-yellow-500 border border-yellow-500'
              : 'bg-uwp-primary hover:bg-green-700 border border-green-700 translate-x-0'
          }`}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${
              isOpen ? 'rotate-0 text-uwp-primary' : 'rotate-180 text-yellow-400'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {isOpen && (
          <div
            onMouseDown={startResizing}
            className={`hidden lg:block absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors ${
              isResizing ? 'bg-blue-500' : 'bg-transparent'
            }`}
            style={{ touchAction: 'none' }}
          />
        )}
      </div>
    </>
  );
};
