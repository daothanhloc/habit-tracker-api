import React from 'react'

export const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col justify-center items-center p-12 animate-fade-in">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
      <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
    <p className="mt-4 text-gray-600 font-medium">Loading...</p>
  </div>
)
