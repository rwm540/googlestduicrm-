import React from 'react';

export const FingerPrintIcon: React.FC<{ className?: string }> = ({ className }) => (
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
      d="M12 11.25a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM12 4.5A5.25 5.25 0 1017.25 9.75 5.25 5.25 0 0012 4.5z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 19.5a2.25 2.25 0 01-2.25-2.25V15a2.25 2.25 0 014.5 0v2.25A2.25 2.25 0 0112 19.5z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
    />
     <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 13.5c0-4.03 3.27-7.3 7.3-7.3s7.3 3.27 7.3 7.3"
    />
     <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.25 13.5c0-2.899 2.351-5.25 5.25-5.25S15.75 10.601 15.75 13.5"
    />
  </svg>
);
