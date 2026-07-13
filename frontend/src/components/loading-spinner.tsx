import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-24 h-24 border-4 border-primary/20 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
        
        {/* Middle ring */}
        <div className="absolute inset-3 w-18 h-18 border-4 border-primary/40 border-t-primary rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
        
        {/* Inner ring */}
        <div className="absolute inset-6 w-12 h-12 border-3 border-primary/60 border-r-primary border-b-primary rounded-full animate-spin"></div>
        
        {/* Center dot */}
        <div className="absolute inset-9 w-6 h-6 bg-primary rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;