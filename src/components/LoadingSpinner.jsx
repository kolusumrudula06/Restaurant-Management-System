import React from 'react';

export const LoadingSpinner = ({ text = 'Loading culinary delight...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-3 border-[#E5DFD5] border-t-[#EA580C] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs">🍲</span>
        </div>
      </div>
      {text && <p className="mt-4 text-sm font-medium text-[#1B3F2D]/80 animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
