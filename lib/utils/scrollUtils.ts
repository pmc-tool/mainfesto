/**
 * Smoothly scrolls to an element by ID
 * @param elementId - ID of element to scroll to (without '#')
 * @param options - ScrollIntoView options (defaults to smooth + center)
 */
export const smoothScrollToElement = (
  elementId: string,
  options: ScrollIntoViewOptions = {
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
  }
): void => {
  const element = document.getElementById(elementId);

  if (!element) {
    console.warn(`Element with ID "${elementId}" not found`);
    return;
  }

  element.scrollIntoView(options);
};

/**
 * Calculates scroll progress as percentage (0-100)
 * @returns Scroll progress percentage
 */
export const getScrollProgress = (): number => {
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollY = window.scrollY;

  if (scrollHeight === 0) {
    return 0;
  }

  return (scrollY / scrollHeight) * 100;
};

/**
 * Gets the currently visible element based on scroll position
 * @param elementIds - Array of element IDs to check
 * @param threshold - Visibility threshold (0-1)
 * @returns ID of most visible element or null
 */
export const getMostVisibleElement = (
  elementIds: string[],
  threshold: number = 0.5
): string | null => {
  let maxVisibility = 0;
  let mostVisibleId: string | null = null;

  elementIds.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const viewHeight = window.innerHeight;

    // Calculate visibility ratio
    const visibleHeight = Math.min(rect.bottom, viewHeight) - Math.max(rect.top, 0);
    const visibility = Math.max(0, visibleHeight / rect.height);

    if (visibility > maxVisibility && visibility >= threshold) {
      maxVisibility = visibility;
      mostVisibleId = id;
    }
  });

  return mostVisibleId;
};

/**
 * Scrolls to a specific match within a page
 * @param matchElement - Element containing the match
 */
export const scrollToMatch = (matchElement: HTMLElement): void => {
  matchElement.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
  });
};
