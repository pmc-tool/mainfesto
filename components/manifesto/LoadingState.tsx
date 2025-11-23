'use client';

export const LoadingState = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500 mb-4"></div>
        <p className="text-gray-600 text-lg">Loading PDF document...</p>
      </div>
    </div>
  );
};
