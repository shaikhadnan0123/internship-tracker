import React from 'react';

interface AiIconProps {
  className?: string;
}

export default function AiIcon({ className = '' }: AiIconProps) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main curved star outline */}
      <path 
        d="M 45,15 Q 45,50 10,50 Q 45,50 45,85 Q 45,50 80,50 Q 45,50 45,15" 
        stroke="currentColor" 
        strokeWidth="9" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Small circle at bottom left */}
      <circle cx="16" cy="74" r="6" fill="currentColor" />
      {/* Plus sign at top right */}
      <path 
        d="M 62,36 H 74 M 68,30 V 42" 
        stroke="currentColor" 
        strokeWidth="7" 
        strokeLinecap="round" 
      />
      {/* Small star at top right (further right) */}
      <path 
        d="M 83,16 Q 83,26 73,26 Q 83,26 83,36 Q 83,26 93,26 Q 83,26 83,16" 
        fill="currentColor" 
      />
    </svg>
  );
}
