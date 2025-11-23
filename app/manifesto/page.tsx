'use client';

import { ManifestoReader } from '@/components/manifesto/ManifestoReader';

export default function ManifestoPage() {
  return (
    <>
      <noscript>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              JavaScript Required
            </h1>
            <p className="text-gray-600 mb-4">
              This manifesto reader requires JavaScript to function properly. Please enable
              JavaScript in your browser settings to view the UWP Manifesto.
            </p>
            <p className="text-sm text-gray-500">
              Alternatively, you can download the PDF directly from our website.
            </p>
          </div>
        </div>
      </noscript>
      <div className="min-h-screen bg-gray-50">
        <ManifestoReader />
      </div>
    </>
  );
}
