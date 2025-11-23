'use client';

import { useEffect } from 'react';

interface KeyboardShortcuts {
  onOpenSearch?: () => void;
  onCloseSearch?: () => void;
  onNextMatch?: () => void;
  onPreviousMatch?: () => void;
}

/**
 * Hook for managing keyboard shortcuts
 * @param shortcuts - Object mapping shortcut names to handler functions
 * @param enabled - Whether shortcuts are enabled (default: true)
 */
export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcuts,
  enabled: boolean = true
): void => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // "/" key - Open search (only when not in input field)
      if (event.key === '/' && !isInputField) {
        event.preventDefault();
        shortcuts.onOpenSearch?.();
        return;
      }

      // "Escape" key - Close search
      if (event.key === 'Escape') {
        event.preventDefault();
        shortcuts.onCloseSearch?.();
        return;
      }

      // When in search input field
      if (isInputField && target.getAttribute('data-search-input') === 'true') {
        // "Enter" key - Next match
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          shortcuts.onNextMatch?.();
          return;
        }

        // "Shift+Enter" - Previous match
        if (event.key === 'Enter' && event.shiftKey) {
          event.preventDefault();
          shortcuts.onPreviousMatch?.();
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, enabled]);
};
