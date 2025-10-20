import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#60a5fa' }} />
            <stop offset="100%" style={{ stopColor: '#c084fc' }} />
        </linearGradient>
    </defs>
    <path
      d="M15 3.5L11.5 10.5H16L10.5 20.5L12.5 13.5H8L15 3.5Z"
      fill="url(#logoGradient)"
      stroke="url(#logoGradient)"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);
