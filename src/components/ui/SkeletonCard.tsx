import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="p-4 bg-white rounded-xl shadow-md border border-gray-100 animate-pulse">
      <div className="flex items-center">
        <div className="w-24 h-24 rounded-full bg-gray-200 mr-4"></div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2 mt-4">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
