'use client';

import { useState } from 'react';
import { getSectionForPage } from '@/lib/tableOfContents';

interface SearchBarProps {
  onSearch: (query: string) => void;
  searchResults: number[];
  onResultClick: (pageNumber: number) => void;
  pageTexts: Map<number, string>;
}

function getMatchedSnippet(text: string, query: string, maxLength: number = 100): { snippet: string; matchIndex: number } {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return { snippet: text.substring(0, maxLength) + (text.length > maxLength ? '...' : ''), matchIndex: -1 };
  }

  // Calculate start and end positions to center the match
  const halfLength = Math.floor((maxLength - query.length) / 2);
  let start = Math.max(0, matchIndex - halfLength);
  let end = Math.min(text.length, matchIndex + query.length + halfLength);

  // Adjust if we're at the beginning or end
  if (start === 0) {
    end = Math.min(text.length, maxLength);
  } else if (end === text.length) {
    start = Math.max(0, text.length - maxLength);
  }

  let snippet = text.substring(start, end);

  // Add ellipsis
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';

  return { snippet, matchIndex: matchIndex - start + (start > 0 ? 3 : 0) };
}

function HighlightedText({ text, query, matchIndex }: { text: string; query: string; matchIndex: number }) {
  if (matchIndex === -1) {
    return <span>{text}</span>;
  }

  const beforeMatch = text.substring(0, matchIndex);
  const match = text.substring(matchIndex, matchIndex + query.length);
  const afterMatch = text.substring(matchIndex + query.length);

  return (
    <span>
      {beforeMatch}
      <mark className="bg-yellow-300 px-0.5">{match}</mark>
      {afterMatch}
    </span>
  );
}

export const SearchBar = ({ onSearch, searchResults, onResultClick, pageTexts }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isResultsOpen, setIsResultsOpen] = useState(false);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
    setIsResultsOpen(value.trim().length > 0);
  };

  return (
    <div className="flex-1 relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search in document..."
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {isResultsOpen && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          <div className="p-2">
            <p className="text-sm text-gray-500 px-3 py-2">
              Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-1">
              {searchResults.map((pageNumber) => {
                const sectionTitle = getSectionForPage(pageNumber);
                const pageText = pageTexts.get(pageNumber) || '';
                const { snippet, matchIndex } = getMatchedSnippet(pageText, query);

                return (
                  <button
                    key={pageNumber}
                    onClick={() => {
                      onResultClick(pageNumber);
                      setIsResultsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex flex-col gap-1">
                      {sectionTitle && (
                        <span className="text-xs font-medium text-gray-700">{sectionTitle}</span>
                      )}
                      <p className="text-sm text-gray-600 leading-relaxed">
                        <HighlightedText text={snippet} query={query} matchIndex={matchIndex} />
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isResultsOpen && query && searchResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <p className="text-sm text-gray-500">No results found</p>
        </div>
      )}
    </div>
  );
};
