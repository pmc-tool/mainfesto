'use client';

import { useEffect, useState } from 'react';

export default function TestPdfPage() {
  const [status, setStatus] = useState('Starting...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testPdfLoad = async () => {
      try {
        setStatus('Importing PDF.js...');
        const pdfjsLib = await import('pdfjs-dist');

        setStatus('Setting worker path...');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.js';

        setStatus('Loading PDF document...');
        const loadingTask = pdfjsLib.getDocument('/manifesto.pdf');

        const pdf = await loadingTask.promise;
        setStatus(`Success! PDF loaded with ${pdf.numPages} pages`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('Failed');
      }
    };

    testPdfLoad();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">PDF.js Test</h1>
        <p className="mb-4">Status: {status}</p>
        {error && (
          <div className="p-4 bg-red-100 text-red-900 rounded">
            <p className="font-bold">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
