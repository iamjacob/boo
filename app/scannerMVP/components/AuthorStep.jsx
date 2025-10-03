import React, { useState, useEffect } from 'react';
import useBookScannerStore from '../stores/useBookScannerStore';

const AuthorStep = () => {
  const {
    bookData,
    updateBookData,
    searchAuthorSuggestions,
    autoFillFromGoogleBooks,
    authorSuggestions,
    isSearching
  } = useBookScannerStore();

  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (bookData.title.length > 2) {
      searchAuthorSuggestions(bookData.title);
    }
  }, [bookData.title, searchAuthorSuggestions]);

  const handleAuthorChange = (e) => {
    updateBookData('author', e.target.value);
    setShowSuggestions(e.target.value.length > 1);
  };

  const selectSuggestion = (suggestion) => {
    updateBookData('author', suggestion);
    setShowSuggestions(false);
    
    // Try to auto-fill more details now that we have both title and author
    if (bookData.title) {
      autoFillFromGoogleBooks(bookData.title, suggestion);
    }
  };

  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-xl p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">✍️ Author</h2>
        <p className="text-white/80">Who wrote "{bookData.title}"?</p>
      </div>

      <div className="relative">
        <input
          type="text"
          value={bookData.author}
          onChange={handleAuthorChange}
          onFocus={() => setShowSuggestions(bookData.author.length > 1)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Enter author name..."
          className="w-full p-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          autoFocus
        />

        {/* Suggestions dropdown */}
        {showSuggestions && authorSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-md rounded-lg border border-white/30 shadow-xl max-h-60 overflow-y-auto z-50">
            {authorSuggestions.map((suggestion, index) => (
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
            <span className="text-white/80">Finding authors...</span>
          </div>
        </div>
      )}

      {/* Character count */}
      <div className="mt-4 text-right text-white/60 text-sm">
        {bookData.author.length} characters
      </div>

      {/* Show current book info */}
      {bookData.title && (
        <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-200 text-sm">
            📚 <strong>Book:</strong> {bookData.title}
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
        <p className="text-blue-200 text-sm">
          💡 <strong>Tips:</strong> We'll suggest authors based on your book title. Multiple authors? Use "Author 1, Author 2" format.
        </p>
      </div>
    </div>
  );
};

export default AuthorStep;