'use client';

import { useState, useEffect } from 'react';
import { getSectionForPage } from '@/lib/tableOfContents';

interface SidebarSearchProps {
  onSearchChange: (query: string) => void;
  onResultClick: (pageNumber: number) => void;
  pageTexts: Map<number, string>;
  searchQuery: string;
}

function getMatchedSnippet(text: string, query: string, maxLength: number = 80): { snippet: string; matchIndex: number } {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return { snippet: '', matchIndex: -1 };
  }

  // Find the line containing the match
  const lines = text.split(/\r?\n/);
  let currentPos = 0;
  let matchLine = '';
  let lineMatchIndex = -1;

  for (const line of lines) {
    const lineEnd = currentPos + line.length;
    if (matchIndex >= currentPos && matchIndex < lineEnd) {
      matchLine = line.trim();
      lineMatchIndex = matchIndex - currentPos;
      break;
    }
    currentPos = lineEnd + 1; // +1 for newline character
  }

  if (!matchLine) {
    return { snippet: '', matchIndex: -1 };
  }

  // If the line is too long, truncate around the match
  if (matchLine.length > maxLength) {
    const halfLength = Math.floor((maxLength - query.length) / 2);
    let start = Math.max(0, lineMatchIndex - halfLength);
    let end = Math.min(matchLine.length, lineMatchIndex + query.length + halfLength);

    if (start === 0) {
      end = Math.min(matchLine.length, maxLength);
    } else if (end === matchLine.length) {
      start = Math.max(0, matchLine.length - maxLength);
    }

    let snippet = matchLine.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < matchLine.length) snippet = snippet + '...';

    return { snippet, matchIndex: lineMatchIndex - start + (start > 0 ? 3 : 0) };
  }

  return { snippet: matchLine, matchIndex: lineMatchIndex };
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

export const SidebarSearch = ({ onSearchChange, onResultClick, pageTexts, searchQuery }: SidebarSearchProps) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<number[]>([]);

  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearchChange(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    const results: number[] = [];
    const lowerQuery = value.toLowerCase();

    pageTexts.forEach((text, pageNumber) => {
      if (text.toLowerCase().includes(lowerQuery)) {
        results.push(pageNumber);
      }
    });

    setSearchResults(results);
  };

  const handleClear = () => {
    setQuery('');
    onSearchChange('');
    setSearchResults([]);
  };

  return (
    <div>
      <div className="relative mb-3">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search..."
          className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
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
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {query.trim() && searchResults.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2 px-1">
            Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
          </p>
          <div className="space-y-2">
            {searchResults.map((pageNumber) => {
              const sectionTitle = getSectionForPage(pageNumber);
              const pageText = pageTexts.get(pageNumber) || '';
              const { snippet, matchIndex } = getMatchedSnippet(pageText, query);

              if (!snippet) return null;

              return (
                <button
                  key={pageNumber}
                  onClick={() => onResultClick(pageNumber)}
                  className="w-full text-left px-3 py-2.5 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                >
                  <div className="flex flex-col gap-1.5">
                    {sectionTitle && (
                      <span className="text-xs font-semibold text-blue-600">{sectionTitle}</span>
                    )}
                    <p className="text-xs text-gray-700 leading-relaxed line-clamp-1">
                      <HighlightedText text={snippet} query={query} matchIndex={matchIndex} />
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {query.trim() && searchResults.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">No results found</p>
        </div>
      )}
    </div>
  );
};
