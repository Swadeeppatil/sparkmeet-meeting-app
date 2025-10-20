import React from 'react';

const iconProps = {
  className: "w-6 h-6 text-white",
  fill: "none",
  viewBox: "0 0 24 24",
  stroke: "currentColor",
  strokeWidth: 2,
};

export const MicOnIcon = () => (
  <svg {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

export const MicOffIcon = () => (
  <svg {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.586 8.586a7 7 0 01-8.172 8.172l-1.414-1.414A7 7 0 0114.172 7.172l1.414 1.414zM9 9v6a3 3 0 003 3h0m0-6a3 3 0 00-3-3h0M9 9H6m3 0h3m-3 6H6m3 0h3m-6-3a3 3 0 003 3h0" />
     <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
     <path strokeLinecap="round" strokeLinejoin="round" d="M5 5l14 14" />
  </svg>
);

export const VideoOnIcon = () => (
  <svg {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

export const VideoOffIcon = () => (
  <svg {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
  </svg>
);

export const EndCallIcon = () => (
  <svg {...iconProps} stroke="none" fill="currentColor" viewBox="0 0 24 24">
    <g transform="rotate(-135 12 12)">
      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.21-3.73-6.56-6.56l1.97-1.57a.996.996 0 0 0 .24-1.01c-.36-1.11-.56-2.3-.56-3.53A1 1 0 0 0 7.62 3H4.62A1 1 0 0 0 3.62 4c0 9.38 7.62 17 17 17a1 1 0 0 0 1-1v-3.01a1 1 0 0 0-.99-1.61z" />
    </g>
  </svg>
);