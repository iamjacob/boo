import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

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

const useBookScannerStore = create(
  subscribeWithSelector((set, get) => ({
    // Current step
    currentStep: 1,
    maxSteps: 12,

    // Book data state
    bookData: {
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
    },

    // Store transformed book images from scanner
    bookImages: {
      front: null,
      spine: null, 
      back: null
    },

    // Search and validation states
    isSearching: false,
    titleSuggestions: [],
    authorSuggestions: [],
    coverSuggestions: [],
    duplicateWarning: false,

    // Actions
    setCurrentStep: (step) => set({ currentStep: step }),
    
    updateBookData: (field, value) => set((state) => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          bookData: {
            ...state.bookData,
            [parent]: {
              ...state.bookData[parent],
              [child]: value
            }
          }
        };
      }
      return {
        bookData: {
          ...state.bookData,
          [field]: value
        }
      };
    }),

    setBookImages: (images) => set({ bookImages: images }),

    setIsSearching: (searching) => set({ isSearching: searching }),
    setTitleSuggestions: (suggestions) => set({ titleSuggestions: suggestions }),
    setAuthorSuggestions: (suggestions) => set({ authorSuggestions: suggestions }),
    setCoverSuggestions: (suggestions) => set({ coverSuggestions: suggestions }),
    setDuplicateWarning: (warning) => set({ duplicateWarning: warning }),

    // Enhanced search functions
    searchTitleSuggestions: async (title) => {
      if (!title.trim()) {
        set({ titleSuggestions: [] });
        return;
      }
      
      set({ isSearching: true });
      
      try {
        // Get suggestions from both sources
        const [localSuggestions, googleSuggestions] = await Promise.all([
          Promise.resolve(DummyDB.getSuggestions(title, 'title')),
          GoogleBooksAPI.getSuggestions(title, 'title')
        ]);
        
        // Combine and deduplicate suggestions
        const allSuggestions = [...new Set([...localSuggestions, ...googleSuggestions])];
        set({ titleSuggestions: allSuggestions.slice(0, 6) });
        
      } catch (error) {
        console.error('Error searching title suggestions:', error);
        // Fallback to mock data if API fails
        const mockSuggestions = [
          `${title} (Complete Edition)`,
          `${title}: A Novel`,
          `The ${title}`,
          `${title} Series`
        ].filter(suggestion => suggestion.toLowerCase().includes(title.toLowerCase()));
        set({ titleSuggestions: mockSuggestions });
      } finally {
        set({ isSearching: false });
      }
    },

    searchAuthorSuggestions: async (title) => {
      if (!title.trim()) {
        set({ authorSuggestions: [] });
        return;
      }
      
      set({ isSearching: true });
      
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
        
        set({ authorSuggestions: Array.from(authors).slice(0, 5) });
        
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
        set({ authorSuggestions: mockAuthors });
      } finally {
        set({ isSearching: false });
      }
    },

    searchCoverSuggestions: async (title, author) => {
      if (!title.trim()) {
        set({ coverSuggestions: [] });
        return;
      }
      
      set({ isSearching: true });
      
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
        
        set({ coverSuggestions: covers });
        
      } catch (error) {
        console.error('Error searching cover suggestions:', error);
        // Fallback to mock covers
        const mockCovers = [
          { url: './covers/001.webp', title: 'Mock Cover 1', source: 'Local' },
          { url: './covers/002.webp', title: 'Mock Cover 2', source: 'Local' },
          { url: './covers/003.webp', title: 'Mock Cover 3', source: 'Local' }
        ];
        set({ coverSuggestions: mockCovers });
      } finally {
        set({ isSearching: false });
      }
    },

    searchForDuplicates: async (title, author = '') => {
      if (!title.trim()) return;
      
      set({ isSearching: true, duplicateWarning: false });
      
      try {
        // Check local database for duplicates
        const duplicates = DummyDB.checkDuplicates(title, author);
        
        if (duplicates.length > 0) {
          set({ duplicateWarning: true });
          console.log('📚 Found potential duplicates:', duplicates);
        }
        
      } catch (error) {
        console.error('Error checking duplicates:', error);
      } finally {
        set({ isSearching: false });
      }
    },

    // Auto-fill book data from Google Books
    autoFillFromGoogleBooks: async (title, author = '') => {
      if (!title.trim()) return;
      
      set({ isSearching: true });
      
      try {
        // Search for exact match
        const query = author ? `${title} ${author}` : title;
        const results = await GoogleBooksAPI.searchBooks(query, 1);
        
        if (results.length > 0) {
          const book = results[0];
          const { bookData, updateBookData } = get();
          
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
        set({ isSearching: false });
      }
    },

    // Save book to dummy database
    saveBookToDatabase: async () => {
      try {
        const { bookData } = get();
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
    },

    // Validation helper
    canProceedFromStep: (currentStep) => {
      const { bookData } = get();
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
    },

    // Reset form
    resetForm: () => set({
      currentStep: 1,
      bookData: {
        title: '',
        author: '',
        year: '',
        size: { width: '', height: '', depth: '', unit: 'inches' },
        weight: { value: '', unit: 'grams' },
        coverMethod: '',
        coverData: null,
        uploadedFiles: [],
        images: { front: null, spine: null, back: null },
        hasDustJacket: false,
        hasFlaps: false,
        language: '',
        categories: { main: [], sub: [] },
        tags: [],
        readingStatus: 'want-to-read',
        notes: '',
        rating: 0
      },
      bookImages: { front: null, spine: null, back: null },
      isSearching: false,
      titleSuggestions: [],
      authorSuggestions: [],
      coverSuggestions: [],
      duplicateWarning: false
    }),

    // Get database stats
    getDatabaseStats: () => {
      return {
        totalBooks: DummyDB.getAllBooks().length,
        getAllBooks: DummyDB.getAllBooks
      };
    }
  }))
);

export default useBookScannerStore;