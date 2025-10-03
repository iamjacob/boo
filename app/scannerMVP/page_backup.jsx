"use client";

import React, { useState, useEffect } from "react";
import LogoMorpher from "../LogoMorpher";
import StepViewer from "./StepViewer";
// import Book3d from "./Book3d";

import Scanner from "./scanner";
import Book from "./Book";
import Ruler3D from "./Ruler3D";

import { Canvas } from "@react-three/fiber";

// Dummy database for local storage and duplicate checking
const DummyDB = {
  // Get all books from localStorage
  getAllBooks: () => {
    try {
      const books = localStorage.getItem('scannedBooks');
      return books ? JSON.parse(books) : [];
    } catch (error) {
      console.error('Error reading from dummy DB:', error);
      return [];
    }
  },

  // Add a book to localStorage
  addBook: (bookData) => {
    try {
      const books = DummyDB.getAllBooks();
      const newBook = {
        ...bookData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      books.push(newBook);
      localStorage.setItem('scannedBooks', JSON.stringify(books));
      return newBook;
    } catch (error) {
      console.error('Error adding to dummy DB:', error);
      return null;
    }
  },

  // Check for duplicates based on title and author
  checkDuplicates: (title, author = '') => {
    try {
      const books = DummyDB.getAllBooks();
      const normalizedTitle = title.toLowerCase().trim();
      const normalizedAuthor = author.toLowerCase().trim();
      
      return books.filter(book => {
        const bookTitle = book.title?.toLowerCase().trim() || '';
        const bookAuthor = book.author?.toLowerCase().trim() || '';
        
        // Exact title match
        if (bookTitle === normalizedTitle) {
          // If author provided, check author similarity too
          if (normalizedAuthor && bookAuthor) {
            return bookAuthor.includes(normalizedAuthor) || normalizedAuthor.includes(bookAuthor);
          }
          return true;
        }
        
        // Partial title match (for typos/variations)
        if (normalizedTitle.length > 3 && bookTitle.includes(normalizedTitle)) {
          return true;
        }
        
        return false;
      });
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return [];
    }
  },

  // Get book suggestions for autocomplete
  getSuggestions: (query, field = 'title') => {
    try {
      const books = DummyDB.getAllBooks();
      const normalizedQuery = query.toLowerCase().trim();
      
      if (normalizedQuery.length < 2) return [];
      
      const suggestions = new Set();
      
      books.forEach(book => {
        const value = book[field]?.toLowerCase().trim() || '';
        if (value.includes(normalizedQuery)) {
          suggestions.add(book[field]);
        }
      });
      
      return Array.from(suggestions).slice(0, 5);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }
};

// Google Books API integration
const GoogleBooksAPI = {
  // Base URL for Google Books API
  baseURL: 'https://www.googleapis.com/books/v1/volumes',
  
  // Search books by title, author, or ISBN
  searchBooks: async (query, maxResults = 10) => {
    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `${GoogleBooksAPI.baseURL}?q=${encodedQuery}&maxResults=${maxResults}&orderBy=relevance`
      );
      
      if (!response.ok) {
        throw new Error(`Google Books API error: ${response.status}`);
      }
      
      const data = await response.json();
      return GoogleBooksAPI.formatBookResults(data.items || []);
    } catch (error) {
      console.error('Error searching Google Books:', error);
      return [];
    }
  },

  // Search specifically by title
  searchByTitle: async (title) => {
    const query = `intitle:"${title}"`;
    return await GoogleBooksAPI.searchBooks(query, 5);
  },

  // Search by author
  searchByAuthor: async (author) => {
    const query = `inauthor:"${author}"`;
    return await GoogleBooksAPI.searchBooks(query, 5);
  },

  // Search by ISBN
  searchByISBN: async (isbn) => {
    const query = `isbn:${isbn}`;
    return await GoogleBooksAPI.searchBooks(query, 1);
  },

  // Format Google Books API results
  formatBookResults: (items) => {
    return items.map(item => {
      const volumeInfo = item.volumeInfo || {};
      const imageLinks = volumeInfo.imageLinks || {};
      
      return {
        googleId: item.id,
        title: volumeInfo.title || '',
        subtitle: volumeInfo.subtitle || '',
        authors: volumeInfo.authors || [],
        author: volumeInfo.authors?.[0] || '',
        publishedDate: volumeInfo.publishedDate || '',
        year: volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate).getFullYear().toString() : '',
        description: volumeInfo.description || '',
        categories: volumeInfo.categories || [],
        pageCount: volumeInfo.pageCount || null,
        language: volumeInfo.language || '',
        isbn10: volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier || '',
        isbn13: volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier || '',
        thumbnail: imageLinks.thumbnail || imageLinks.smallThumbnail || null,
        largeThumbnail: imageLinks.large || imageLinks.medium || imageLinks.thumbnail || null,
        publisher: volumeInfo.publisher || '',
        averageRating: volumeInfo.averageRating || null,
        ratingsCount: volumeInfo.ratingsCount || null,
        previewLink: volumeInfo.previewLink || '',
        infoLink: volumeInfo.infoLink || ''
      };
    });
  },

  // Get suggestions based on partial input
  getSuggestions: async (query, type = 'title') => {
    if (query.length < 3) return [];
    
    try {
      let searchQuery = '';
      switch (type) {
        case 'title':
          searchQuery = `intitle:${query}`;
          break;
        case 'author':
          searchQuery = `inauthor:${query}`;
          break;
        default:
          searchQuery = query;
      }
      
      const results = await GoogleBooksAPI.searchBooks(searchQuery, 5);
      
      // Extract unique values based on type
      const suggestions = new Set();
      results.forEach(book => {
        if (type === 'title' && book.title) {
          suggestions.add(book.title);
        } else if (type === 'author' && book.author) {
          suggestions.add(book.author);
        }
      });
      
      return Array.from(suggestions);
    } catch (error) {
      console.error('Error getting Google Books suggestions:', error);
      return [];
    }
  }
};

const page = () => {
  const [step, setStep] = useState(1);
  
  // Store transformed book images from scanner
  const [bookImages, setBookImages] = useState({
    front: null,
    spine: null, 
    back: null
  });

  // Comprehensive book form state
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    year: '',
    size: { width: '', height: '', depth: '', unit: 'inches' },
    weight: { value: '', unit: 'grams' },
    coverMethod: '', // 'url', 'upload', 'camera', 'none'
    coverData: null,
    uploadedFiles: [], // Array to store multiple uploaded files
    images: {
      front: null,
      spine: null,
      back: null
    },
    hasDustJacket: false,
    hasFlaps: false,
    language: '',
    categories: {
      main: [], // Main categories
      sub: []   // Sub-categories
    },
    tags: [], // Separate tags system
    readingStatus: 'want-to-read', // 'want-to-read', 'reading', 'read'
    notes: '',
    rating: 0 // 0-5 heart rating
  });

  // Search and validation states
  const [isSearching, setIsSearching] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [authorSuggestions, setAuthorSuggestions] = useState([]);
  const [coverSuggestions, setCoverSuggestions] = useState([]);
  const [duplicateWarning, setDuplicateWarning] = useState(false);

  // Dynamic steps based on user choices
  const [maxSteps, setMaxSteps] = useState(12); // Updated for JSON output step

  // Update book data helper
  const updateBookData = (field, value) => {
    setBookData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });
  };

  // Enhanced title search with both local DB and Google Books
  const searchTitleSuggestions = async (title) => {
    if (!title.trim()) {
      setTitleSuggestions([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Get suggestions from both sources
      const [localSuggestions, googleSuggestions] = await Promise.all([
        Promise.resolve(DummyDB.getSuggestions(title, 'title')),
        GoogleBooksAPI.getSuggestions(title, 'title')
      ]);
      
      // Combine and deduplicate suggestions
      const allSuggestions = [...new Set([...localSuggestions, ...googleSuggestions])];
      setTitleSuggestions(allSuggestions.slice(0, 6));
      
    } catch (error) {
      console.error('Error searching title suggestions:', error);
      // Fallback to mock data if API fails
      const mockSuggestions = [
        `${title} (Complete Edition)`,
        `${title}: A Novel`,
        `The ${title}`,
        `${title} Series`
      ].filter(suggestion => suggestion.toLowerCase().includes(title.toLowerCase()));
      setTitleSuggestions(mockSuggestions);
    } finally {
      setIsSearching(false);
    }
  };

  // Enhanced author search with Google Books integration
  const searchAuthorSuggestions = async (title) => {
    if (!title.trim()) {
      setAuthorSuggestions([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Search Google Books for this title to get author suggestions
      const googleResults = await GoogleBooksAPI.searchByTitle(title);
      const localSuggestions = DummyDB.getSuggestions(title, 'author');
      
      // Extract unique authors
      const authors = new Set();
      
      // Add authors from Google Books results
      googleResults.forEach(book => {
        if (book.authors && book.authors.length > 0) {
          book.authors.forEach(author => authors.add(author));
        }
      });
      
      // Add local suggestions
      localSuggestions.forEach(author => authors.add(author));
      
      setAuthorSuggestions(Array.from(authors).slice(0, 5));
      
    } catch (error) {
      console.error('Error searching author suggestions:', error);
      // Fallback to mock data
      const mockAuthors = [
        'Stephen King',
        'J.K. Rowling', 
        'George R.R. Martin',
        'Agatha Christie',
        'Dan Brown'
      ];
      setAuthorSuggestions(mockAuthors);
    } finally {
      setIsSearching(false);
    }
  };

  // Enhanced cover search with Google Books images
  const searchCoverSuggestions = async (title, author) => {
    if (!title.trim()) {
      setCoverSuggestions([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Search Google Books for cover images
      const query = author ? `${title} ${author}` : title;
      const googleResults = await GoogleBooksAPI.searchBooks(query, 3);
      
      // Extract cover images
      const covers = googleResults
        .filter(book => book.largeThumbnail || book.thumbnail)
        .map(book => ({
          url: book.largeThumbnail || book.thumbnail,
          title: book.title,
          author: book.author,
          source: 'Google Books'
        }));
      
      setCoverSuggestions(covers);
      
    } catch (error) {
      console.error('Error searching cover suggestions:', error);
      // Fallback to mock covers
      const mockCovers = [
        { url: './covers/001.webp', title: 'Mock Cover 1', source: 'Local' },
        { url: './covers/002.webp', title: 'Mock Cover 2', source: 'Local' },
        { url: './covers/003.webp', title: 'Mock Cover 3', source: 'Local' }
      ];
      setCoverSuggestions(mockCovers);
    } finally {
      setIsSearching(false);
    }
  };

  // Auto-fill book data from Google Books
  const autoFillFromGoogleBooks = async (title, author = '') => {
    if (!title.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Search for exact match
      const query = author ? `${title} ${author}` : title;
      const results = await GoogleBooksAPI.searchBooks(query, 1);
      
      if (results.length > 0) {
        const book = results[0];
        
        // Auto-fill available data
        if (book.title && !bookData.title) {
          updateBookData('title', book.title);
        }
        if (book.author && !bookData.author) {
          updateBookData('author', book.author);
        }
        if (book.year && !bookData.year) {
          updateBookData('year', book.year);
        }
        if (book.language && !bookData.language) {
          updateBookData('language', book.language);
        }
        if (book.largeThumbnail && !bookData.coverData) {
          updateBookData('coverData', book.largeThumbnail);
          updateBookData('coverMethod', 'url');
        }
        if (book.description && !bookData.notes) {
          updateBookData('notes', book.description.substring(0, 500) + '...');
        }
        
        // Auto-fill categories if available
        if (book.categories && book.categories.length > 0) {
          const mainCats = book.categories.slice(0, 2);
          updateBookData('categories.main', mainCats);
        }
        
        console.log('✅ Auto-filled book data from Google Books:', book);
        alert('📚 Book data auto-filled from Google Books!');
      } else {
        alert('📖 No exact match found in Google Books. Try adjusting the title.');
      }
      
    } catch (error) {
      console.error('Error auto-filling from Google Books:', error);
      alert('❌ Error connecting to Google Books. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Save book to dummy database
  const saveBookToDatabase = async () => {
    try {
      const savedBook = DummyDB.addBook(bookData);
      if (savedBook) {
        console.log('💾 Book saved to local database:', savedBook);
        return savedBook;
      } else {
        throw new Error('Failed to save book');
      }
    } catch (error) {
      console.error('Error saving book to database:', error);
      throw error;
    }
  };

  // Debounced search effects
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (bookData.title) {
        searchTitleSuggestions(bookData.title);
        searchForDuplicates(bookData.title, bookData.author);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [bookData.title]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (bookData.title && step === 2) {
        searchAuthorSuggestions(bookData.title);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [bookData.title, step]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (bookData.title && step === 6) {
        searchCoverSuggestions(bookData.title, bookData.author);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [bookData.title, bookData.author, step]);

  // Validation helper
  const canProceedFromStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        return bookData.title.trim();
      case 2:
        return bookData.author.trim();
      case 3:
        return true; // Year is optional
      case 4:
        return bookData.size.width && bookData.size.height && bookData.size.depth;
      case 5:
        return true; // Weight is optional
      case 6:
        return bookData.coverMethod; // Must select a cover method
      case 7:
        return bookData.images.front || bookData.images.spine || bookData.images.back; // At least one image
      case 8:
        return true; // Enhancement is optional
      case 9:
        return bookData.language; // Language required
      case 10:
        return true; // Categories and details are optional
      case 11:
        return true; // Preview is always valid
      case 12:
        return true; // JSON export is always valid
      default:
        return true;
    }
  };

  const steps = [
    { id: 1, content: 'Title' },
    { id: 2, content: 'Author' },
    { id: 3, content: 'Year' },
    { id: 4, content: 'Size' },
    { id: 5, content: 'Weight' },
    { id: 6, content: 'Cover Method' },
    { id: 7, content: 'Cover Crop' },
    { id: 8, content: 'Enhance' },
    { id: 9, content: 'Language' },
    { id: 10, content: 'Details' },
    { id: 11, content: 'Preview' },
    { id: 12, content: 'JSON Export' },
  ];

  // Handle receiving transformed images from Scanner
  const handleBookImagesUpdate = (transformedImages) => {
    console.log('🔥 Received transformed images in page.jsx:', transformedImages);
    setBookImages(transformedImages);
    
    // Don't auto-advance - let user use header next button
    console.log('📱 Images ready - use header next button to view book');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-black via-gray-900 to-black pb-24">
            <div className="w-full max-w-lg mx-auto">
              {/* Header */}
              <div className="text-center mb-8 sm:mb-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-3 sm:mb-4">Book Title</h1>
                <p className="text-gray-400 text-sm sm:text-base">What's the title of your book?</p>
              </div>

              {/* Search Status Indicator */}
              {(isSearching || duplicateWarning) && (
                <div className={`mb-6 sm:mb-8 p-4 sm:p-5 rounded-xl border ${
                  isSearching 
                    ? 'bg-blue-900/20 border-blue-500/30 text-blue-300' 
                    : duplicateWarning 
                    ? 'bg-yellow-900/20 border-yellow-500/30 text-yellow-300'
                    : 'bg-green-900/20 border-green-500/30 text-green-300'
                }`}>
                  <div className="flex items-center gap-3 sm:gap-4">
                    {isSearching && (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm sm:text-base">Searching for suggestions...</span>
                      </>
                    )}
                    {duplicateWarning && (
                      <>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm sm:text-base">Similar book found in collection</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Title Input */}
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-300 mb-3 sm:mb-4">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    value={bookData.title}
                    onChange={(e) => updateBookData('title', e.target.value)}
                    placeholder="Enter the book title"
                    className="w-full px-4 sm:px-5 lg:px-6 py-4 sm:py-5 text-base sm:text-lg bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  />
                </div>

                {/* Title Suggestions */}
                {titleSuggestions.length > 0 && (
                  <div className="space-y-3 sm:space-y-4">
                    <p className="text-sm sm:text-base text-gray-400">Suggestions:</p>
                    <div className="space-y-2 sm:space-y-3">
                      {titleSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => updateBookData('title', suggestion)}
                          className="w-full text-left px-4 sm:px-5 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-sm sm:text-base"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Google Books Auto-fill */}
                {bookData.title.length > 3 && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="border-t border-white/10 pt-4 sm:pt-6">
                      <button
                        onClick={() => autoFillFromGoogleBooks(bookData.title)}
                        disabled={isSearching}
                        className="w-full flex items-center justify-center gap-3 px-4 sm:px-5 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-500 text-white rounded-xl transition-all duration-300 text-sm sm:text-base font-medium"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {isSearching ? 'Searching Google Books...' : '🚀 Auto-fill from Google Books'}
                      </button>
                      <p className="text-xs sm:text-sm text-gray-500 text-center mt-2">
                        Automatically fill book details from Google Books database
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Validation Hint */}
              <div className="mt-8 sm:mt-10 text-center">
                <p className="text-xs sm:text-sm text-gray-500">
                  {bookData.title ? 
                    "Great! Continue to add the author." : 
                    "Title is required to continue"
                  }
                </p>
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-black via-gray-900 to-black pb-24">
            <div className="w-full max-w-lg mx-auto">
              {/* Header */}
              <div className="text-center mb-8 sm:mb-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-3 sm:mb-4">Author</h1>
                <p className="text-gray-400 text-sm sm:text-base">Who wrote "{bookData.title}"?</p>
              </div>

              {/* Search Status */}
              {isSearching && (
                <div className="mb-6 sm:mb-8 p-4 sm:p-5 rounded-xl border bg-blue-900/20 border-blue-500/30 text-blue-300">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm sm:text-base">Finding author suggestions...</span>
                  </div>
                </div>
              )}

              {/* Author Input */}
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-300 mb-3 sm:mb-4">
                    Author *
                  </label>
                  <input
                    type="text"
                    value={bookData.author}
                    onChange={(e) => updateBookData('author', e.target.value)}
                    placeholder="Enter the author's name"
                    className="w-full px-4 sm:px-5 lg:px-6 py-4 sm:py-5 text-base sm:text-lg bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  />
                </div>

                {/* Author Suggestions */}
                {authorSuggestions.length > 0 && (
                  <div className="space-y-3 sm:space-y-4">
                    <p className="text-sm sm:text-base text-gray-400">Suggested authors:</p>
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      {authorSuggestions.map((author, index) => (
                        <button
                          key={index}
                          onClick={() => updateBookData('author', author)}
                          className="text-left px-4 sm:px-5 py-4 sm:py-5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                        >
                          <div className="font-medium text-base sm:text-lg">{author}</div>
                          <div className="text-xs sm:text-sm text-gray-400 mt-1">Popular author</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Validation Hint */}
              <div className="mt-8 sm:mt-10 text-center">
                <p className="text-xs sm:text-sm text-gray-500">
                  {bookData.author ? 
                    "Perfect! Let's continue with the publication year." : 
                    "Author name is required to continue"
                  }
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-black via-gray-900 to-black pb-24">
            <div className="w-full max-w-lg mx-auto">
              {/* Header */}
              <div className="text-center mb-8 sm:mb-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-3 sm:mb-4">Publication Year</h1>
                <p className="text-gray-400 text-sm sm:text-base">When was "{bookData.title}" published?</p>
              </div>

              <div className="space-y-6 sm:space-y-8">
                {/* Year Input */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-300 mb-3 sm:mb-4">
                    Publication Year
                  </label>
                  <input
                    type="number"
                    value={bookData.year}
                    onChange={(e) => updateBookData('year', e.target.value)}
                    placeholder="e.g., 2024"
                    min="1000"
                    max={new Date().getFullYear() + 5}
                    className="w-full px-4 sm:px-5 lg:px-6 py-4 sm:py-5 text-base sm:text-lg bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  />
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">Optional - can be auto-filled later</p>
                </div>

                {/* Common Years */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-300 mb-3 sm:mb-4">
                    Quick Select
                  </label>
                  <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    {[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2, 
                      2020, 2015, 2010].map((year) => (
                      <button
                        key={year}
                        onClick={() => updateBookData('year', year.toString())}
                        className="px-3 sm:px-4 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-sm sm:text-base"
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skip Option */}
                <div className="text-center pt-4 sm:pt-6">
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        updateBookData('year', '');
                        setStep(Math.min(step + 1, maxSteps));
                      }}
                      className="text-gray-400 text-sm sm:text-base hover:text-white transition-colors duration-300 block mx-auto"
                    >
                      Skip year for now
                    </button>
                    
                    {/* Skip to end option */}
                    {bookData.title && bookData.coverMethod && (
                      <button
                        onClick={() => setStep(11)}
                        className="text-blue-400 text-sm sm:text-base hover:text-white transition-colors duration-300 block mx-auto"
                      >
                        Skip all details and go to preview →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-black via-gray-900 to-black pb-24">
            <div className="w-full max-w-7xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8 sm:mb-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-3 sm:mb-4">Book Dimensions</h1>
                <p className="text-gray-400 text-sm sm:text-base">Measure your book with our 3D ruler</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                {/* 3D Scene */}
                <div className="h-80 sm:h-96 lg:h-[28rem] rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                  <Canvas camera={{ position: [4, 2, 4], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    
                    {/* Book with dynamic size */}
                    <Book 
                      scale={[
                        bookData.size.width ? parseFloat(bookData.size.width) / 6 : 1,
                        bookData.size.height ? parseFloat(bookData.size.height) / 6 : 1.5,
                        bookData.size.depth ? parseFloat(bookData.size.depth) / 6 : 0.3
                      ]}
                      cover={bookImages.front || "./covers/000.webp"}
                      spine={bookImages.spine}
                      back={bookImages.back}
                      images={bookImages}
                      title={bookData.title || "Sample Book"}
                    />
                    
                    {/* 3D Ruler */}
                    <Ruler3D 
                      unit={bookData.size.unit} 
                      length={bookData.size.unit === 'inches' ? 12 : 30}
                      position={[3, 0, 0]}
                    />
                  </Canvas>
                </div>

                {/* Size Input Controls */}
                <div className="space-y-6 sm:space-y-8">
                  {/* Unit Toggle */}
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-300 mb-3 sm:mb-4">
                      Measurement Unit
                    </label>
                    <div className="flex rounded-xl bg-white/5 border border-white/10 p-1.5">
                      <button
                        onClick={() => updateBookData('size.unit', 'inches')}
                        className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 ${
                          bookData.size.unit === 'inches'
                            ? 'bg-white text-black'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Inches
                      </button>
                      <button
                        onClick={() => updateBookData('size.unit', 'cm')}
                        className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 ${
                          bookData.size.unit === 'cm'
                            ? 'bg-white text-black'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Centimeters
                      </button>
                    </div>
                  </div>

                  {/* Dimension Inputs */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2 sm:mb-3">
                        Width
                      </label>
                      <input
                        type="number"
                        value={bookData.size.width}
                        onChange={(e) => updateBookData('size.width', e.target.value)}
                        placeholder="0"
                        step="0.1"
                        min="0"
                        className="w-full px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                      />
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">{bookData.size.unit}</p>
                    </div>

                    <div>
                      <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2 sm:mb-3">
                        Height
                      </label>
                      <input
                        type="number"
                        value={bookData.size.height}
                        onChange={(e) => updateBookData('size.height', e.target.value)}
                        placeholder="0"
                        step="0.1"
                        min="0"
                        className="w-full px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                      />
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">{bookData.size.unit}</p>
                    </div>

                    <div>
                      <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2 sm:mb-3">
                        Depth
                      </label>
                      <input
                        type="number"
                        value={bookData.size.depth}
                        onChange={(e) => updateBookData('size.depth', e.target.value)}
                        placeholder="0"
                        step="0.1"
                        min="0"
                        className="w-full px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                      />
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">{bookData.size.unit}</p>
                    </div>
                  </div>

                  {/* Helper Text */}
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-blue-300 text-sm sm:text-base font-medium mb-2">Measurement Tips</p>
                        <ul className="text-blue-200 text-xs sm:text-sm space-y-1">
                          <li>• Place book on a flat surface</li>
                          <li>• Use the 3D ruler as a reference</li>
                          <li>• Width = spine to spine, Height = top to bottom</li>
                          <li>• Depth = front cover to back cover</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Quick Size Presets */}
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-300 mb-3 sm:mb-4">
                      Common Book Sizes
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {[
                        { name: 'Paperback', sizes: { inches: [4.25, 6.87, 0.5], cm: [10.8, 17.5, 1.3] } },
                        { name: 'Hardcover', sizes: { inches: [6, 9, 1], cm: [15.2, 22.9, 2.5] } },
                        { name: 'Mass Market', sizes: { inches: [4.19, 6.75, 0.75], cm: [10.6, 17.1, 1.9] } },
                        { name: 'Textbook', sizes: { inches: [8.5, 11, 1.5], cm: [21.6, 27.9, 3.8] } }
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => {
                            const [w, h, d] = preset.sizes[bookData.size.unit];
                            updateBookData('size.width', w.toString());
                            updateBookData('size.height', h.toString());
                            updateBookData('size.depth', d.toString());
                          }}
                          className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                        >
                          <div className="text-white text-sm sm:text-base font-medium">{preset.name}</div>
                          <div className="text-gray-400 text-xs sm:text-sm">
                            {preset.sizes[bookData.size.unit].join(' × ')} {bookData.size.unit}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-black via-gray-900 to-black">
            <div className="w-full max-w-md mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-light text-white mb-2">Book Weight</h1>
                <p className="text-gray-400 text-sm">How much does your book weigh?</p>
              </div>

              <div className="space-y-6">
                {/* Unit Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Weight Unit
                  </label>
                  <div className="flex rounded-lg bg-white/5 border border-white/10 p-1">
                    {['grams', 'oz', 'lbs'].map((unit) => (
                      <button
                        key={unit}
                        onClick={() => updateBookData('weight.unit', unit)}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                          bookData.weight.unit === unit
                            ? 'bg-white text-black'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {unit === 'grams' ? 'g' : unit}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weight Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Weight
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={bookData.weight.value}
                      onChange={(e) => updateBookData('weight.value', e.target.value)}
                      placeholder="0"
                      step={bookData.weight.unit === 'grams' ? '1' : '0.1'}
                      min="0"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all pr-16"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                      {bookData.weight.unit === 'grams' ? 'g' : bookData.weight.unit}
                    </span>
                  </div>
                </div>

                {/* Weight Comparison */}
                {bookData.weight.value && (
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-purple-300 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-purple-300 text-sm font-medium mb-1">Weight Reference</p>
                        <p className="text-purple-200 text-xs">
                          {(() => {
                            const weight = parseFloat(bookData.weight.value);
                            const unit = bookData.weight.unit;
                            
                            // Convert to grams for comparison
                            let weightInGrams = weight;
                            if (unit === 'oz') weightInGrams = weight * 28.35;
                            if (unit === 'lbs') weightInGrams = weight * 453.59;
                            
                            if (weightInGrams < 200) return "About as light as a magazine";
                            if (weightInGrams < 400) return "Similar to a typical paperback";
                            if (weightInGrams < 800) return "Like a standard hardcover book";
                            if (weightInGrams < 1500) return "Heavy textbook weight";
                            return "That's quite a hefty book!";
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Common Weight Presets */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Common Book Weights
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Light Paperback', weights: { grams: 200, oz: 7, lbs: 0.4 } },
                      { name: 'Standard Paperback', weights: { grams: 300, oz: 10.5, lbs: 0.7 } },
                      { name: 'Hardcover', weights: { grams: 600, oz: 21, lbs: 1.3 } },
                      { name: 'Heavy Textbook', weights: { grams: 1200, oz: 42, lbs: 2.6 } }
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          updateBookData('weight.value', preset.weights[bookData.weight.unit].toString());
                        }}
                        className="p-3 bg-white/5 border border-white/10 rounded-lg text-left hover:bg-white/10 transition-all"
                      >
                        <div className="text-white text-sm font-medium">{preset.name}</div>
                        <div className="text-gray-400 text-xs">
                          {preset.weights[bookData.weight.unit]} {bookData.weight.unit === 'grams' ? 'g' : bookData.weight.unit}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skip Option */}
                <div className="text-center pt-4">
                  <button
                    onClick={() => {
                      updateBookData('weight.value', '');
                      if (canProceedFromStep(step)) {
                        setStep(Math.min(step + 1, maxSteps));
                      }
                    }}
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    Skip weight for now
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-black via-gray-900 to-black">
            <div className="w-full max-w-4xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-light text-white mb-2">Book Cover</h1>
                <p className="text-gray-400 text-sm">How would you like to add your book cover?</p>
              </div>

              {/* Cover Method Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* URL Input Option */}
                <div 
                  onClick={() => updateBookData('coverMethod', 'url')}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    bookData.coverMethod === 'url' 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-white/20 bg-white/5 hover:border-white/40'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <svg className="w-12 h-12 text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <h3 className="text-xl font-medium text-white mb-2">URL Link</h3>
                    <p className="text-gray-400 text-sm">Paste a link to your book cover image</p>
                  </div>
                </div>

                {/* File Upload Option */}
                <div 
                  onClick={() => updateBookData('coverMethod', 'upload')}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    bookData.coverMethod === 'upload' 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-white/20 bg-white/5 hover:border-white/40'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <svg className="w-12 h-12 text-green-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <h3 className="text-xl font-medium text-white mb-2">File Upload</h3>
                    <p className="text-gray-400 text-sm">Upload an image from your device</p>
                  </div>
                </div>

                {/* Camera Option */}
                <div 
                  onClick={() => updateBookData('coverMethod', 'camera')}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    bookData.coverMethod === 'camera' 
                      ? 'border-purple-500 bg-purple-500/10' 
                      : 'border-white/20 bg-white/5 hover:border-white/40'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <svg className="w-12 h-12 text-purple-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="text-xl font-medium text-white mb-2">Take Photo</h3>
                    <p className="text-gray-400 text-sm">Use camera to photograph the cover</p>
                  </div>
                </div>

                {/* No Cover Option */}
                <div 
                  onClick={() => updateBookData('coverMethod', 'none')}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    bookData.coverMethod === 'none' 
                      ? 'border-gray-500 bg-gray-500/10' 
                      : 'border-white/20 bg-white/5 hover:border-white/40'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 21h10a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v7z" />
                    </svg>
                    <h3 className="text-xl font-medium text-white mb-2">No Cover Available</h3>
                    <p className="text-gray-400 text-sm">I don't have a cover image</p>
                  </div>
                </div>
              </div>

              {/* Method-specific Input */}
              {bookData.coverMethod && (
                <div className="max-w-md mx-auto">
                  {bookData.coverMethod === 'url' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Image URL
                        </label>
                        <input
                          type="url"
                          value={bookData.coverData || ''}
                          onChange={(e) => updateBookData('coverData', e.target.value)}
                          placeholder="https://example.com/book-cover.jpg"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        />
                      </div>
                      {bookData.coverData && (
                        <div className="text-center">
                          <img 
                            src={bookData.coverData} 
                            alt="Cover preview" 
                            className="max-w-32 max-h-48 mx-auto rounded-lg border border-white/20"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {bookData.coverMethod === 'upload' && (
                    <div className="space-y-4">
                      <div 
                        className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-white/50 transition-colors cursor-pointer"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-white text-sm mb-1">Click to upload or drag and drop</p>
                        <p className="text-gray-400 text-xs">PNG, JPG, WEBP up to 10MB (Multiple files allowed)</p>
                        <input
                          id="file-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                              // Store file objects and create preview URLs
                              const fileData = files.map(file => ({
                                file,
                                url: URL.createObjectURL(file),
                                name: file.name,
                                size: file.size
                              }));
                              
                              updateBookData('uploadedFiles', [...bookData.uploadedFiles, ...fileData]);
                              
                              // Set first image as cover preview
                              if (!bookData.coverData && fileData.length > 0) {
                                updateBookData('coverData', fileData[0].url);
                              }
                            }
                          }}
                        />
                      </div>
                      
                      {/* Display uploaded files */}
                      {bookData.uploadedFiles.length > 0 && (
                        <div className="space-y-4">
                          <p className="text-sm text-gray-300">Uploaded files ({bookData.uploadedFiles.length}):</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {bookData.uploadedFiles.map((fileData, index) => (
                              <div key={index} className="relative group">
                                <img 
                                  src={fileData.url} 
                                  alt={`Upload ${index + 1}`} 
                                  className={`w-full h-24 object-cover rounded-lg border transition-all cursor-pointer ${
                                    bookData.coverData === fileData.url 
                                      ? 'border-blue-500 ring-2 ring-blue-500/50' 
                                      : 'border-white/20 hover:border-white/40'
                                  }`}
                                  onClick={() => updateBookData('coverData', fileData.url)}
                                />
                                {/* Remove button */}
                                <button
                                  onClick={() => {
                                    const newFiles = bookData.uploadedFiles.filter((_, i) => i !== index);
                                    updateBookData('uploadedFiles', newFiles);
                                    // If removed file was the cover, set new cover or clear
                                    if (bookData.coverData === fileData.url) {
                                      updateBookData('coverData', newFiles.length > 0 ? newFiles[0].url : null);
                                    }
                                  }}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                  ×
                                </button>
                                {/* File name and size */}
                                <div className="mt-1 text-xs text-gray-400 truncate">
                                  {fileData.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {(fileData.size / 1024 / 1024).toFixed(1)}MB
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 text-center">
                            Click on an image to set it as the main cover
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {bookData.coverMethod === 'camera' && (
                    <div className="space-y-4">
                      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 text-center">
                        <svg className="w-8 h-8 text-purple-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        </svg>
                        <p className="text-purple-300 text-sm font-medium">Camera Mode</p>
                        <p className="text-purple-200 text-xs">Camera interface will open in the next step</p>
                      </div>
                    </div>
                  )}

                  {bookData.coverMethod === 'none' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Cover Color (Optional)
                        </label>
                        <div className="flex gap-3 justify-center">
                          {['#8B4513', '#2F4F4F', '#800080', '#008000', '#FF4500', '#4682B4'].map((color) => (
                            <button
                              key={color}
                              onClick={() => updateBookData('coverData', color)}
                              className={`w-10 h-10 rounded-lg border-2 transition-all ${
                                bookData.coverData === color ? 'border-white scale-110' : 'border-white/30'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-center">
                        <div 
                          className="w-32 h-48 mx-auto rounded-lg border border-white/20 flex items-center justify-center text-white/60"
                          style={{ backgroundColor: bookData.coverData || '#333333' }}
                        >
                          <span className="text-xs">No Cover</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-black via-gray-900 to-black">
            <div className="w-full max-w-2xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-light text-white mb-2">Capture Book Images</h1>
                <p className="text-gray-400 text-sm">Take photos of all three sides of your book</p>
              </div>

              {/* Photo Progress */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { key: 'front', label: 'Front Cover', icon: '📖' },
                  { key: 'spine', label: 'Spine', icon: '📚' },
                  { key: 'back', label: 'Back Cover', icon: '📕' }
                ].map((side) => (
                  <div key={side.key} className={`p-4 rounded-lg border-2 text-center ${
                    bookData.images[side.key] 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-white/20 bg-white/5'
                  }`}>
                    <div className="text-2xl mb-2">{side.icon}</div>
                    <div className="text-white text-sm font-medium">{side.label}</div>
                    <div className={`text-xs mt-1 ${
                      bookData.images[side.key] ? 'text-green-300' : 'text-gray-400'
                    }`}>
                      {bookData.images[side.key] ? 'Captured ✓' : 'Not captured'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Camera Interface Placeholder */}
              <div className="bg-black/50 rounded-lg p-8 text-center border border-white/10">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-white text-lg font-medium mb-2">Camera Interface</h3>
                <p className="text-gray-400 text-sm mb-4">Camera will be integrated here</p>
                
                {/* Mock capture buttons */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'front', label: 'Capture Front' },
                    { key: 'spine', label: 'Capture Spine' },
                    { key: 'back', label: 'Capture Back' }
                  ].map((side) => (
                    <button
                      key={side.key}
                      onClick={() => {
                        // Mock image capture
                        updateBookData(`images.${side.key}`, `./covers/mock-${side.key}.jpg`);
                      }}
                      className={`py-2 px-4 rounded-lg text-sm transition-all ${
                        bookData.images[side.key]
                          ? 'bg-green-600 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {bookData.images[side.key] ? 'Retake' : side.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skip Option */}
              <div className="text-center mt-6">
                <button
                  onClick={() => setStep(Math.min(step + 1, maxSteps))}
                  className="text-gray-400 text-sm hover:text-white transition-colors"
                >
                  Skip photos for now
                </button>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-black via-gray-900 to-black pb-24">
            <div className="w-full max-w-6xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8 sm:mb-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-3 sm:mb-4">Enhance Images</h1>
                <p className="text-gray-400 text-sm sm:text-base">Crop and adjust your book photos</p>
              </div>

              {/* Image Enhancement Options */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                {/* Options Panel */}
                <div className="space-y-6 sm:space-y-8">
                  {/* Dust Jacket Toggle */}
                  <div className="p-4 sm:p-5 lg:p-6 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <label className="text-white font-medium text-base sm:text-lg">Dust Jacket</label>
                      <button
                        onClick={() => updateBookData('hasDustJacket', !bookData.hasDustJacket)}
                        className={`w-12 h-6 sm:w-14 sm:h-7 rounded-full transition-all duration-300 ${
                          bookData.hasDustJacket ? 'bg-blue-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full transition-transform duration-300 ${
                          bookData.hasDustJacket ? 'translate-x-6 sm:translate-x-7' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm sm:text-base">Book has a removable dust jacket cover</p>
                  </div>

                  {/* Page Flaps Toggle */}
                  <div className="p-4 sm:p-5 lg:p-6 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <label className="text-white font-medium text-base sm:text-lg">Page Flaps</label>
                      <button
                        onClick={() => updateBookData('hasFlaps', !bookData.hasFlaps)}
                        className={`w-12 h-6 sm:w-14 sm:h-7 rounded-full transition-all duration-300 ${
                          bookData.hasFlaps ? 'bg-blue-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full transition-transform duration-300 ${
                          bookData.hasFlaps ? 'translate-x-6 sm:translate-x-7' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm sm:text-base">Book cover has fold-out flaps</p>
                  </div>

                  {/* Crop Quality */}
                  <div className="p-4 sm:p-5 lg:p-6 bg-white/5 rounded-xl border border-white/10">
                    <h3 className="text-white font-medium mb-3 sm:mb-4 text-base sm:text-lg">Enhancement Options</h3>
                    <div className="space-y-3 sm:space-y-4">
                      {['Auto-enhance', 'Remove shadows', 'Straighten edges', 'Adjust brightness'].map((option) => (
                        <label key={option} className="flex items-center gap-3 sm:gap-4 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded border-white/30 bg-white/5 text-blue-500 focus:ring-blue-500/50" 
                            defaultChecked 
                          />
                          <span className="text-gray-300 text-sm sm:text-base">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Uploaded Files Display */}
                  {bookData.uploadedFiles?.length > 0 && (
                    <div className="p-4 sm:p-5 lg:p-6 bg-white/5 rounded-xl border border-white/10">
                      <h3 className="text-white font-medium mb-3 sm:mb-4 text-base sm:text-lg">Uploaded Images ({bookData.uploadedFiles.length})</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        {bookData.uploadedFiles.slice(0, 6).map((fileData, index) => (
                          <div key={index} className="relative">
                            <img 
                              src={fileData.url} 
                              alt={`Upload ${index + 1}`} 
                              className="w-full h-16 sm:h-20 object-cover rounded-lg border border-white/20"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs">Edit</span>
                            </div>
                          </div>
                        ))}
                        {bookData.uploadedFiles.length > 6 && (
                          <div className="flex items-center justify-center h-16 sm:h-20 bg-white/10 rounded-lg border border-white/20">
                            <span className="text-gray-400 text-xs">+{bookData.uploadedFiles.length - 6} more</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview Panel */}
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-white font-medium text-base sm:text-lg">Preview</h3>
                  <div className="bg-black/50 rounded-xl p-4 sm:p-6 lg:p-8 border border-white/10 min-h-64 sm:min-h-80 lg:min-h-96 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-400 text-sm sm:text-base">Image cropping interface will appear here</p>
                      <p className="text-gray-500 text-xs sm:text-sm mt-2">Integration with existing scanner crop tool</p>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <button className="px-4 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300 text-sm sm:text-base">
                      Reset All
                    </button>
                    <button className="px-4 py-3 sm:py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-300 text-sm sm:text-base">
                      Apply Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-black via-gray-900 to-black">
            <div className="w-full max-w-2xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-light text-white mb-2">Language</h1>
                <p className="text-gray-400 text-sm">What language is "{bookData.title}" written in?</p>
              </div>

              <div className="space-y-6">
                {/* Preferred Languages (Mock user preferences) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Your Preferred Languages
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['English', 'Spanish', 'French', 'German'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => updateBookData('language', lang)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          bookData.language === lang
                            ? 'border-blue-500 bg-blue-500/10 text-white'
                            : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40'
                        }`}
                      >
                        <div className="font-medium">{lang}</div>
                        <div className="text-xs text-gray-400">Preferred</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* All Languages */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Other Languages
                  </label>
                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                    {[
                      'Italian', 'Portuguese', 'Dutch', 'Russian', 'Chinese', 'Japanese', 
                      'Korean', 'Arabic', 'Hindi', 'Swedish', 'Norwegian', 'Danish'
                    ].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => updateBookData('language', lang)}
                        className={`p-2 rounded-lg text-sm transition-all ${
                          bookData.language === lang
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Language Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Custom Language
                  </label>
                  <input
                    type="text"
                    placeholder="Enter language if not listed above"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all"
                    onBlur={(e) => {
                      if (e.target.value.trim()) {
                        updateBookData('language', e.target.value.trim());
                      }
                    }}
                  />
                </div>
              </div>

              {/* Selected Language Display */}
              {bookData.language && (
                <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-300 text-sm">Selected: <strong>{bookData.language}</strong></span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 10:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-black via-gray-900 to-black pb-24">
            <div className="w-full max-w-6xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8 sm:mb-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-3 sm:mb-4">Categories & Details</h1>
                <p className="text-gray-400 text-sm sm:text-base">Organize your book with categories, tags, and rating</p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                {/* Main Categories */}
                <div className="space-y-6 sm:space-y-8">
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-300 mb-3 sm:mb-4">
                      Main Categories
                    </label>
                    
                    {/* Selected main categories */}
                    {bookData.categories.main.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {bookData.categories.main.map((category) => (
                          <span
                            key={category}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-full"
                          >
                            {category}
                            <button
                              onClick={() => {
                                const newMain = bookData.categories.main.filter(c => c !== category);
                                updateBookData('categories.main', newMain);
                              }}
                              className="text-blue-200 hover:text-white transition-colors"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        'Social Sciences', 'Economics & Business', 'Literature & Fiction', 
                        'Science & Technology', 'Arts & Humanities', 'Health & Medicine',
                        'Education & Teaching', 'Religion & Spirituality', 'History & Politics'
                      ].map((category) => {
                        const isSelected = bookData.categories.main.includes(category);
                        return (
                          <button
                            key={category}
                            onClick={() => {
                              if (isSelected) {
                                const newMain = bookData.categories.main.filter(c => c !== category);
                                updateBookData('categories.main', newMain);
                              } else {
                                updateBookData('categories.main', [...bookData.categories.main, category]);
                              }
                            }}
                            className={`p-3 sm:p-4 rounded-xl text-sm sm:text-base transition-all text-left ${
                              isSelected
                                ? 'bg-blue-500 text-white ring-2 ring-blue-400'
                                : 'bg-white/5 text-gray-300 hover:bg-white/10'
                            }`}
                          >
                            {category}
                            {isSelected && ' ✓'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Sub Categories */}
                <div className="space-y-6 sm:space-y-8">
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-300 mb-3 sm:mb-4">
                      Sub Categories
                    </label>
                    
                    {/* Selected sub categories */}
                    {bookData.categories.sub.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {bookData.categories.sub.map((subCat) => (
                          <span
                            key={subCat}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500 text-white text-sm rounded-full"
                          >
                            {subCat}
                            <button
                              onClick={() => {
                                const newSub = bookData.categories.sub.filter(c => c !== subCat);
                                updateBookData('categories.sub', newSub);
                              }}
                              className="text-purple-200 hover:text-white transition-colors"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 gap-2 sm:gap-3">
                      {[
                        'Psychology', 'Sociology', 'Business', 'Philosophy',
                        'Marketing', 'Management', 'Finance', 'Economics',
                        'Behavioral Science', 'Decision Making', 'Leadership',
                        'Innovation', 'Strategy', 'Analytics'
                      ].map((subCat) => {
                        const isSelected = bookData.categories.sub.includes(subCat);
                        return (
                          <button
                            key={subCat}
                            onClick={() => {
                              if (isSelected) {
                                const newSub = bookData.categories.sub.filter(c => c !== subCat);
                                updateBookData('categories.sub', newSub);
                              } else {
                                updateBookData('categories.sub', [...bookData.categories.sub, subCat]);
                              }
                            }}
                            className={`p-2 sm:p-3 rounded-lg text-sm transition-all text-left ${
                              isSelected
                                ? 'bg-purple-500 text-white ring-2 ring-purple-400'
                                : 'bg-white/5 text-gray-300 hover:bg-white/10'
                            }`}
                          >
                            {subCat}
                            {isSelected && ' ✓'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Tags & Details */}
                <div className="space-y-6 sm:space-y-8">
                  {/* Tags */}
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-300 mb-3 sm:mb-4">
                      Tags
                    </label>
                    
                    {/* Tag input */}
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Add custom tag..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            const newTag = e.target.value.trim().toLowerCase();
                            if (!bookData.tags.includes(newTag)) {
                              updateBookData('tags', [...bookData.tags, newTag]);
                            }
                            e.target.value = '';
                          }
                        }}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                      />
                    </div>
                    
                    {/* Quick tags */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        'bestseller', 'classic', 'award winner', 'series',
                        'hardcover', 'paperback', 'first edition', 'signed',
                        'rare', 'educational', 'reference', 'cookbook'
                      ].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            const newTags = bookData.tags.includes(tag)
                              ? bookData.tags.filter(t => t !== tag)
                              : [...bookData.tags, tag];
                            updateBookData('tags', newTags);
                          }}
                          className={`p-2 rounded-lg text-xs sm:text-sm transition-all ${
                            bookData.tags.includes(tag)
                              ? 'bg-orange-500 text-white'
                              : 'bg-white/5 text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    
                    {/* Selected tags display */}
                    {bookData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {bookData.tags.map((tag, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center gap-2 px-2 py-1 bg-orange-500/20 text-orange-300 rounded text-xs"
                          >
                            {tag}
                            <button
                              onClick={() => {
                                const newTags = bookData.tags.filter((_, i) => i !== index);
                                updateBookData('tags', newTags);
                              }}
                              className="text-orange-200 hover:text-white transition-colors"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Heart Rating */}
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-300 mb-3 sm:mb-4">
                      Rating
                    </label>
                    <div className="flex items-center gap-2 sm:gap-3 mb-4">
                      {[1, 2, 3, 4, 5].map((heart) => (
                        <button
                          key={heart}
                          onClick={() => updateBookData('rating', heart === bookData.rating ? 0 : heart)}
                          className="transition-all duration-300 hover:scale-110"
                        >
                          <svg 
                            width="32" 
                            height="32" 
                            viewBox="0 0 24 24" 
                            className={`${
                              heart <= bookData.rating 
                                ? 'text-red-500 fill-current' 
                                : 'text-gray-600'
                            }`}
                          >
                            <path 
                              strokeWidth={heart <= bookData.rating ? 0 : 2}
                              stroke="currentColor"
                              fill={heart <= bookData.rating ? "currentColor" : "none"}
                              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                            />
                          </svg>
                        </button>
                      ))}
                      {bookData.rating > 0 && (
                        <button
                          onClick={() => updateBookData('rating', 0)}
                          className="ml-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {bookData.rating === 0 ? 'No rating' : 
                       bookData.rating === 1 ? 'Didn\'t like it' :
                       bookData.rating === 2 ? 'It was okay' :
                       bookData.rating === 3 ? 'Liked it' :
                       bookData.rating === 4 ? 'Really liked it' :
                       'Loved it!'}
                    </p>
                  </div>

                  {/* Reading Status */}
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-300 mb-3 sm:mb-4">
                      Reading Status
                    </label>
                    <div className="space-y-2 sm:space-y-3">
                      {[
                        { key: 'want-to-read', label: 'Want to Read', icon: '📚' },
                        { key: 'reading', label: 'Currently Reading', icon: '📖' },
                        { key: 'read', label: 'Finished Reading', icon: '✅' }
                      ].map((status) => (
                        <button
                          key={status.key}
                          onClick={() => updateBookData('readingStatus', status.key)}
                          className={`w-full p-3 sm:p-4 rounded-xl border-2 text-left transition-all duration-300 text-sm sm:text-base ${
                            bookData.readingStatus === status.key
                              ? 'border-blue-500 bg-blue-500/10 text-white'
                              : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40'
                          }`}
                        >
                          <span className="mr-3">{status.icon}</span>
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-300 mb-3 sm:mb-4">
                      Personal Notes
                    </label>
                    <textarea
                      value={bookData.notes}
                      onChange={(e) => updateBookData('notes', e.target.value)}
                      placeholder="Add your thoughts, memories, or notes about this book..."
                      rows={4}
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Skip Option */}
              <div className="text-center mt-8 sm:mt-10">
                <button
                  onClick={() => setStep(11)}
                  className="text-gray-400 text-sm sm:text-base hover:text-white transition-colors duration-300"
                >
                  Skip categories and continue →
                </button>
              </div>
            </div>
          </div>
        );

      case 11:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-black via-gray-900 to-black">
            <div className="w-full max-w-6xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-light text-white mb-2">Preview & Finalize</h1>
                <p className="text-gray-400 text-sm">Review your book details before adding to collection</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 3D Preview */}
                <div className="space-y-4">
                  <h3 className="text-white font-medium text-lg">3D Preview</h3>
                  <div className="h-96 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                    <Canvas camera={{ position: [4, 2, 4], fov: 50 }}>
                      <ambientLight intensity={0.5} />
                      <pointLight position={[10, 10, 10]} />
                      
                      <Book 
                        scale={[
                          bookData.size.width ? parseFloat(bookData.size.width) / 6 : 1,
                          bookData.size.height ? parseFloat(bookData.size.height) / 6 : 1.5,
                          bookData.size.depth ? parseFloat(bookData.size.depth) / 6 : 0.3
                        ]}
                        cover={bookData.images.front || bookData.coverData || "./covers/000.webp"}
                        spine={bookData.images.spine}
                        back={bookData.images.back}
                        images={bookData.images}
                        title={bookData.title}
                      />
                    </Canvas>
                  </div>
                </div>

                {/* Book Details Summary */}
                <div className="space-y-6">
                  <h3 className="text-white font-medium text-lg">Book Details</h3>
                  
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <span className="text-gray-400 text-sm">Title:</span>
                        <p className="text-white font-medium">{bookData.title || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <span className="text-gray-400 text-sm">Author:</span>
                        <p className="text-white">{bookData.author || 'Not specified'}</p>
                      </div>
                      
                      {bookData.year && (
                        <div>
                          <span className="text-gray-400 text-sm">Year:</span>
                          <p className="text-white">{bookData.year}</p>
                        </div>
                      )}

                      {bookData.language && (
                        <div>
                          <span className="text-gray-400 text-sm">Language:</span>
                          <p className="text-white">{bookData.language}</p>
                        </div>
                      )}

                      {bookData.categories.main.length > 0 && (
                        <div>
                          <span className="text-gray-400 text-sm">Main Categories:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {bookData.categories.main.map((category, index) => (
                              <span 
                                key={category}
                                className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {bookData.categories.sub.length > 0 && (
                        <div>
                          <span className="text-gray-400 text-sm">Sub Categories:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {bookData.categories.sub.map((subCat, index) => (
                              <span 
                                key={subCat}
                                className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                              >
                                {subCat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {bookData.tags.length > 0 && (
                        <div>
                          <span className="text-gray-400 text-sm">Tags:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {bookData.tags.map((tag, index) => (
                              <span 
                                key={tag}
                                className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {bookData.rating > 0 && (
                        <div>
                          <span className="text-gray-400 text-sm">Rating:</span>
                          <div className="flex gap-1 mt-1">
                            {[...Array(bookData.rating)].map((_, i) => (
                              <svg key={i} width="16" height="16" viewBox="0 0 24 24" className="text-red-500 fill-current">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                              </svg>
                            ))}
                            <span className="text-gray-400 text-xs ml-2">
                              ({bookData.rating === 1 ? 'Didn\'t like it' :
                                bookData.rating === 2 ? 'It was okay' :
                                bookData.rating === 3 ? 'Liked it' :
                                bookData.rating === 4 ? 'Really liked it' :
                                'Loved it!'})
                            </span>
                          </div>
                        </div>
                      )}

                      {(bookData.size.width && bookData.size.height && bookData.size.depth) && (
                        <div>
                          <span className="text-gray-400 text-sm">Dimensions:</span>
                          <p className="text-white">
                            {bookData.size.width} × {bookData.size.height} × {bookData.size.depth} {bookData.size.unit}
                          </p>
                        </div>
                      )}

                      {bookData.weight.value && (
                        <div>
                          <span className="text-gray-400 text-sm">Weight:</span>
                          <p className="text-white">
                            {bookData.weight.value} {bookData.weight.unit === 'grams' ? 'g' : bookData.weight.unit}
                          </p>
                        </div>
                      )}

                      <div>
                        <span className="text-gray-400 text-sm">Reading Status:</span>
                        <p className="text-white capitalize">{bookData.readingStatus.replace('-', ' ')}</p>
                      </div>

                      {bookData.tags && bookData.tags.length > 0 && (
                        <div>
                          <span className="text-gray-400 text-sm">Tags:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {bookData.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {bookData.rating && (
                        <div>
                          <span className="text-gray-400 text-sm">Rating:</span>
                          <div className="flex gap-1">
                            {[...Array(bookData.rating)].map((_, i) => (
                              <span key={i} className="text-yellow-400">⭐</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {bookData.notes && (
                        <div>
                          <span className="text-gray-400 text-sm">Notes:</span>
                          <p className="text-white text-sm">{bookData.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button 
                      onClick={() => setStep(12)}
                      className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-600 transition-all"
                    >
                      ✅ View JSON & Submit
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setStep(1)}
                        className="py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                      >
                        Edit Details
                      </button>
                      <button className="py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all">
                        Save Draft
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 12:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-black via-gray-900 to-black pb-24">
            <div className="w-full max-w-4xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8 sm:mb-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-3 sm:mb-4">Complete Book Data</h1>
                <p className="text-gray-400 text-sm sm:text-base">JSON ready for server submission</p>
              </div>

              {/* JSON Output */}
              <div className="space-y-6 sm:space-y-8">
                <div className="bg-gray-900/50 rounded-xl border border-white/10 overflow-hidden">
                  <div className="bg-white/5 px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-white font-medium text-base sm:text-lg">Book Data JSON</h3>
                    <button
                      onClick={() => {
                        const jsonData = JSON.stringify({
                          ...bookData,
                          // Convert file objects to serializable format
                          uploadedFiles: bookData.uploadedFiles?.map(file => ({
                            name: file.name,
                            size: file.size,
                            url: file.url
                          })),
                          // Add metadata
                          metadata: {
                            scannedAt: new Date().toISOString(),
                            version: "1.0",
                            source: "book-scanner-mvp"
                          }
                        }, null, 2);
                        
                        navigator.clipboard.writeText(jsonData);
                        // You could show a toast notification here
                      }}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm rounded-lg transition-all duration-300"
                    >
                      Copy JSON
                    </button>
                  </div>
                  
                  <div className="p-4 sm:p-6 max-h-96 overflow-y-auto">
                    <pre className="text-xs sm:text-sm text-green-300 font-mono whitespace-pre-wrap">
                      {JSON.stringify({
                        ...bookData,
                        // Convert file objects to serializable format for display
                        uploadedFiles: bookData.uploadedFiles?.map(file => ({
                          name: file.name,
                          size: file.size,
                          url: file.url.startsWith('blob:') ? '[Blob URL]' : file.url
                        })),
                        // Add metadata
                        metadata: {
                          scannedAt: new Date().toISOString(),
                          version: "1.0",
                          source: "book-scanner-mvp"
                        }
                      }, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-6">
                  <div className="bg-white/5 rounded-xl p-4 sm:p-5 text-center border border-white/10">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-400">
                      {Object.values(bookData).filter(val => 
                        val !== '' && val !== null && val !== undefined && 
                        !(Array.isArray(val) && val.length === 0) &&
                        !(typeof val === 'object' && Object.values(val).every(v => v === '' || v === null))
                      ).length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400 mt-1">Fields Filled</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 sm:p-5 text-center border border-white/10">
                    <div className="text-2xl sm:text-3xl font-bold text-green-400">
                      {bookData.uploadedFiles?.length || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400 mt-1">Images</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 sm:p-5 text-center border border-white/10">
                    <div className="text-2xl sm:text-3xl font-bold text-purple-400">
                      {bookData.categories.main.length + bookData.categories.sub.length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400 mt-1">Categories</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 sm:p-5 text-center border border-white/10">
                    <div className="text-2xl sm:text-3xl font-bold text-orange-400">
                      {bookData.tags?.length || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400 mt-1">Tags</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 sm:p-5 text-center border border-white/10">
                    <div className="text-2xl sm:text-3xl font-bold text-red-400">
                      {DummyDB.getAllBooks().length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400 mt-1">In Library</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 sm:space-y-6">
                  <button 
                    onClick={async () => {
                      const jsonData = {
                        ...bookData,
                        uploadedFiles: bookData.uploadedFiles?.map(file => ({
                          name: file.name,
                          size: file.size,
                          url: file.url
                        })),
                        metadata: {
                          scannedAt: new Date().toISOString(),
                          version: "1.0",
                          source: "book-scanner-mvp"
                        }
                      };

                      console.log('📚 Submitting book data:', jsonData);
                      
                      try {
                        // Save to local dummy database first
                        const savedBook = await saveBookToDatabase();
                        console.log('💾 Book saved to local database:', savedBook);
                        
                        // Simulate server submission
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        // Show success message with database info
                        const totalBooks = DummyDB.getAllBooks().length;
                        alert(`✅ Book successfully added to your collection!\n📚 Total books in library: ${totalBooks}`);
                        
                        // Optionally redirect or reset form
                        // setStep(1);
                        // setBookData(initialBookData);
                        
                      } catch (error) {
                        console.error('❌ Error submitting book:', error);
                        alert('❌ Error submitting book. Please try again.');
                      }
                    }}
                    className="w-full py-4 sm:py-5 bg-gradient-to-r from-green-600 to-green-500 text-white font-medium rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-300 text-base sm:text-lg"
                  >
                    🚀 Submit to Server & Save Locally
                  </button>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
                    <button 
                      onClick={() => setStep(11)}
                      className="py-3 sm:py-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 text-sm sm:text-base"
                    >
                      ← Back to Preview
                    </button>
                    <button 
                      onClick={() => setStep(1)}
                      className="py-3 sm:py-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 text-sm sm:text-base"
                    >
                      🔄 Start Over
                    </button>
                    <button 
                      onClick={() => {
                        const books = DummyDB.getAllBooks();
                        const booksData = JSON.stringify(books, null, 2);
                        const blob = new Blob([booksData], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `library-books-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="py-3 sm:py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all duration-300 text-sm sm:text-base"
                    >
                      📚 Export Library
                    </button>
                    <button 
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(bookData, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `book-${bookData.title?.replace(/[^a-z0-9]/gi, '-') || 'untitled'}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="py-3 sm:py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-300 text-sm sm:text-base"
                    >
                      💾 Download JSON
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Step not implemented yet</div>;
    }
  };

  useEffect(() => {
    const splash = document.getElementById("splash");
    if (splash) {
      splash.classList.add("fade-out");
      setTimeout(() => splash.remove(), 800);
    }
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 flex w-screen justify-between items-center p-2 bg-black bg-opacity-90 backdrop-blur z-10">
        <div
          className="backBtn cursor-pointer"
          onClick={() => {
            console.log("back");
            setStep(Math.max(step - 1, 1));
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-left-icon lucide-chevron-left"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </div>

        <LogoMorpher morphed={false} />


        <div
          className={`nextBtn cursor-pointer transition-opacity ${
            canProceedFromStep(step) ? 'opacity-100' : 'opacity-50 cursor-not-allowed'
          }`}
          onClick={() => {
            if (canProceedFromStep(step)) {
              console.log("next");
              setStep(Math.min(step + 1, maxSteps));
            }
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-right-icon lucide-chevron-right"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </header>
      {renderStep()}
      <StepViewer step={step} setStep={setStep} />
    </>
  );
};

export default page;
