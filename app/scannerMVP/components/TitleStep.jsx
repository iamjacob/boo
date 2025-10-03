import React, { useState, useEffect } from 'react';
import useBookScannerStore from '../stores/useBookScannerStore';

const TitleStep = () => {
  const {
    bookData,
    updateBookData,
    searchTitleSuggestions,
    searchForDuplicates,
    autoFillFromGoogleBooks,
    titleSuggestions,
    isSearching,
    duplicateWarning
  } = useBookScannerStore();

  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (bookData.title.length > 2) {
      const timer = setTimeout(() => {
        searchTitleSuggestions(bookData.title);
        searchForDuplicates(bookData.title, bookData.author);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [bookData.title, searchTitleSuggestions, searchForDuplicates, bookData.author]);

  const handleTitleChange = (e) => {
    updateBookData('title', e.target.value);
    setShowSuggestions(e.target.value.length > 2);
  };

  const selectSuggestion = (suggestion) => {
    updateBookData('title', suggestion);
    setShowSuggestions(false);
    
    // Auto-search for author and other details
    autoFillFromGoogleBooks(suggestion);
  };

  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-xl p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">📖 Book Title</h2>
        <p className="text-white/80">What's the title of your book?</p>
      </div>

      <div className="relative">
        <input
          type="text"
          value={bookData.title}
          onChange={handleTitleChange}
          onFocus={() => setShowSuggestions(bookData.title.length > 2)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Enter book title..."
          className="w-full p-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          autoFocus
        />

        {/* Suggestions dropdown */}
        {showSuggestions && titleSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-md rounded-lg border border-white/30 shadow-xl max-h-60 overflow-y-auto z-50">
            {titleSuggestions.map((suggestion, index) => (
              <button
                key={index}
                className="w-full text-left p-3 hover:bg-blue-500/20 transition-colors border-b border-white/20 last:border-b-0 text-gray-800"
                onClick={() => selectSuggestion(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {isSearching && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
            <span className="text-white/80">Searching...</span>
          </div>
        </div>
      )}

      {/* Duplicate warning */}
      {duplicateWarning && (
        <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
          <div className="flex items-center">
            <span className="text-yellow-300 mr-2">⚠️</span>
            <span className="text-yellow-200 text-sm">
              Similar books found in your library. Check for duplicates!
            </span>
          </div>
        </div>
      )}

      {/* Character count */}
      <div className="mt-4 text-right text-white/60 text-sm">
        {bookData.title.length} characters
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
        <p className="text-blue-200 text-sm">
          💡 <strong>Tips:</strong> Start typing for auto-suggestions. We'll search Google Books for matching titles!
        </p>
      </div>
    </div>
  );
};

export default TitleStep;