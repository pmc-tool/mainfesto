'use client';

import { useEffect, useRef } from 'react';
import type { PDFPageProxy } from 'pdfjs-dist';

interface PdfPageProps {
  page: PDFPageProxy;
  pageNumber: number;
  onRegister: (pageNumber: number, element: HTMLElement) => void;
  onUnregister: (pageNumber: number) => void;
  isHighlighted?: boolean;
}

export const PdfPage = ({ page, pageNumber, onRegister, onUnregister, isHighlighted }: PdfPageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    onRegister(pageNumber, container);

    return () => {
      onUnregister(pageNumber);
    };
  }, [pageNumber, onRegister, onUnregister]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !page) return;

    const renderPage = async () => {
      const context = canvas.getContext('2d');
      if (!context) return;

      const viewport = page.getViewport({ scale: 1.5 });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Cancel any existing render task
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      renderTaskRef.current = page.render({
        canvasContext: context,
        viewport: viewport,
      });

      try {
        await renderTaskRef.current.promise;
      } catch (error: any) {
        if (error?.name === 'RenderingCancelledException') {
          // Rendering was cancelled, this is expected
          return;
        }
        console.error('Error rendering page:', error);
      }
    };

    renderPage();

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [page]);

  return (
    <div
      ref={containerRef}
      data-page-number={pageNumber}
      className={`mb-4 bg-white shadow-lg ${isHighlighted ? 'ring-2 ring-blue-500' : ''}`}
    >
      <canvas ref={canvasRef} className="w-full h-auto" />
    </div>
  );
};
