import React from 'react';

export const BriefcaseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className || "h-6 w-6"}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 14.15v-2.25a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0114.25 7.5v-1.5a3.375 3.375 0 00-3.375-3.375H9.75A3.375 3.375 0 006.375 6v1.5a1.125 1.125 0 01-1.125 1.125h-1.5A3.375 3.375 0 00.375 11.9v2.25M6.375 19.5h11.25A2.625 2.625 0 0020.25 16.875V14.15M6.375 19.5v-1.125c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.125m3-3.375V14.15m11.25 2.25V14.15"
    />
  </svg>
);
