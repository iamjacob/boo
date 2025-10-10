import React from 'react';
import { createPortal } from 'react-dom';

const DragActiveBar = ({ visible, selectedBookTitle }) => {
  if (!visible) return null;

  return createPortal(
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-white/20 flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-sm">
          Drag Active {selectedBookTitle && `- ${selectedBookTitle}`}
        </span>
      </div>
    </div>,
    document.body
  );
};

export default DragActiveBar;