"use client";
import React, { useState } from "react";
import { useBookMenuStore } from "../../../stores/useBookMenuStore";
import { useOpenBookStore } from "../../../stores/useOpenBookStore";

const BookMenu = () => {
  const [visible, setVisible] = useState(false);

  const {
    isMenuVisible,
    currentPage,
    pages,
    bookOpen,
    hoveredPage,
    book,
    flipForward,
    flipBackward,
    openBook,
    closeBook,
    setHoveredPage,
  } = useBookMenuStore();

  const { setOpenBookId, toggleBook } = useOpenBookStore();

  // Don't render if menu is not visible or functions aren't registered
  if (!isMenuVisible || !flipForward || !flipBackward) {
    return null;
  }

  const handleCloseBook = () => {
    closeBook();
    setTimeout(() => {
      setOpenBookId(null);
      toggleBook();
    }, 500);
  };

  return (
    <div className="fixed bottom-0 w-screen inset-0 pointer-events-none z-50">
      <div className="absolute top-4 right-4 flex gap-3 pointer-events-auto">
        <button
          className="p-2 bg-black/80 backdrop-blur-md text-white rounded-full border border-white/30 hover:bg-white/20 transition-all duration-200"
          title="More Options"
          onClick={() => setVisible(!visible)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-info-icon lucide-info"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </button>

        {/* Book Open/Close Toggle */}
        <button
          onClick={bookOpen ? closeBook : openBook}
          className="p-2 bg-black/80 backdrop-blur-md text-white rounded-full border border-white/30 hover:bg-white/20 transition-all duration-200"
        >
          {bookOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20px"
              viewBox="0 -960 960 960"
              width="20px"
              fill="currentColor"
            >
              <path d="M440-440v240h-80v-160H200v-80h240Zm160-320v160h160v80H520v-240h80Z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20px"
              viewBox="0 -960 960 960"
              width="20px"
              fill="currentColor"
            >
              <path d="M200-200v-240h80v160h160v80H200Zm480-320v-160H520v-80h240v240h-80Z" />
            </svg>
          )}
        </button>
        <button
          className="p-2 bg-black/80 backdrop-blur-md text-white rounded-full border border-white/30 hover:bg-white/20 transition-all duration-200"
          title="More Options"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-ellipsis-vertical-icon lucide-ellipsis-vertical"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>

        {/* Right Controls - Close Button */}
        <button
          onClick={handleCloseBook}
          className="p-2 bg-red-600/80 backdrop-blur-md text-white rounded-full border border-red-400/30 hover:bg-red-500/90 transition-all duration-200"
          title="Close Book"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* bottom Navigation Bar */}
      <div className="absolute bottom-0 p-[8px] w-screen flex justify-between items-center pointer-events-auto">
        {/* Left Controls */}
        {/* Previous Page Button */}
        <button
          onClick={flipBackward}
          disabled={currentPage === 0}
          className={`p-2 rounded-full backdrop-blur-md border transition-all duration-200 ${
            currentPage === 0
              ? "bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-black/80 border-white/30 text-white hover:bg-white/20"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20px"
            viewBox="0 -960 960 960"
            width="20px"
            fill="currentColor"
          >
            <path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" />
          </svg>
        </button>

        {/* Center - Page Counter */}
        <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white text-sm font-medium">
          Page {currentPage + 1} of {pages}
        </div>

        {/* Next Page Button */}
        <button
          onClick={flipForward}
          disabled={currentPage >= pages - 1}
          className={`p-2 rounded-full backdrop-blur-md border transition-all duration-200 ${
            currentPage >= pages - 1
              ? "bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-black/80 border-white/30 text-white hover:bg-white/20"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20px"
            viewBox="0 -960 960 960"
            width="20px"
            fill="currentColor"
          >
            <path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z" />
          </svg>
        </button>
      </div>

      {/* Bottom - Hover Info */}
      {hoveredPage !== null && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white text-sm">
            Page {hoveredPage + 1}
          </div>
        </div>
      )}

      {/* Book Info Panel */}
      {book && visible && (
        <div className="absolute bottom-4 left-4 pointer-events-auto">
          <div className="bg-black/80 backdrop-blur-md p-4 rounded-lg border border-white/30 text-white max-w-xs">
            <h3 className="font-semibold text-sm mb-1">
              {book.title || "Untitled"}
            </h3>
            {book.author && (
              <p className="text-xs text-gray-300">by {book.author}</p>
            )}
            {book.year && <p className="text-xs text-gray-400">{book.year}</p>}
            {book.categories?.main && (
              <div className="mt-2 flex flex-wrap gap-1">
                {book.categories.main.map((cat, index) => (
                  <span
                    key={index}
                    className="text-xs bg-white/20 px-2 py-1 rounded-full"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookMenu;
