import React from 'react';

interface ProcessingOverlayProps {
  isVisible: boolean;
}

const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="در حال پردازش"
    >
      <span className="loader"></span>
    </div>
  );
};

export default ProcessingOverlay;