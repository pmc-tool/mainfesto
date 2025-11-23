'use client';

interface PageIndicatorProps {
  activePage: number;
  totalPages: number;
}

export const PageIndicator = ({ activePage, totalPages }: PageIndicatorProps) => {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span className="font-medium">Page {activePage}</span>
      <span className="text-gray-400">/</span>
      <span>{totalPages}</span>
    </div>
  );
};
