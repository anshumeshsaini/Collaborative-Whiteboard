import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Whiteboard</h2>
        <p className="text-gray-600">Please wait while we prepare your workspace...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;