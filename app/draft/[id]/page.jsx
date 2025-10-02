"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

const DraftBookPage = () => {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

    // Splash screen removal
  useEffect(() => {
    const splash = document.getElementById("splash");
    // will be added to a global loader later
    // header get.content lenghth from fetch 
    // read length content-length 
    // const header = document.getElementById("header");
    if (splash) {
      splash.classList.add("fade-out");
      setTimeout(() => splash.remove(), 1200);
    }
  }, []);

  // Demo/default data for when no book is found
  const demoBook = {
    id: 'demo',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    overview: 'A magical novel about a library that exists between life and death, where every book represents a different life you could have lived.',
    poster: 'https://covers.openlibrary.org/b/id/10909258-M.jpg',
    genres: ['Fiction', 'Philosophy', 'Contemporary'],
    release_date: new Date('2020-08-13').getTime() / 1000,
    type: 'book',
    draftId: 'demo',
    addedToDraft: new Date().toISOString(),
    status: 'draft',
    personalRating: 4,
    personalNotes: 'Absolutely loved this book! The concept is fascinating and really makes you think about life choices.',
    readingStatus: 'completed',
    tags: ['philosophical', 'thought-provoking', 'magical-realism'],
    isPublic: true,
    // Additional validation fields
    isbn: '9780525559474',
    pageCount: 288,
    language: 'English',
    publisher: 'Viking',
    publicationYear: 2020,
    format: 'Hardcover',
    purchasePrice: 25.99,
    purchaseDate: '2024-01-15',
    location: 'Home Library',
    condition: 'Excellent',
    series: null,
    seriesNumber: null,
    dedication: 'To everyone who has ever wondered about the paths not taken',
    firstLine: 'Nineteen years before she decided to die, Nora Seed sat in the warmth of the school library.',
    favoriteQuote: 'The only way to learn is to live.',
    recommendedBy: 'Book Club',
    readingStartDate: '2024-01-15',
    readingEndDate: '2024-01-20',
    readingDuration: 5, // days
    personalCategory: 'Must Read Again'
  };

  useEffect(() => {
    const loadDraft = () => {
      try {
        const drafts = JSON.parse(localStorage.getItem('bookDrafts') || '[]');
        const foundBook = drafts.find(draft => draft.draftId === params.id);
        
        if (foundBook) {
          setBook(foundBook);
        } else {
          // Use demo data for demonstration
          setBook(demoBook);
        }
      } catch (error) {
        console.error('Error loading draft:', error);
        setBook(demoBook);
      } finally {
        setLoading(false);
      }
    };

    loadDraft();
  }, [params.id]);

  const validateForm = () => {
    const errors = {};
    
    if (!book.title?.trim()) errors.title = 'Title is required';
    if (!book.author?.trim()) errors.author = 'Author is required';
    if (!book.overview?.trim()) errors.overview = 'Description is required';
    if (book.personalRating && (book.personalRating < 1 || book.personalRating > 5)) {
      errors.personalRating = 'Rating must be between 1 and 5';
    }
    if (book.pageCount && book.pageCount < 1) {
      errors.pageCount = 'Page count must be positive';
    }
    if (book.publicationYear && (book.publicationYear < 1000 || book.publicationYear > new Date().getFullYear())) {
      errors.publicationYear = 'Invalid publication year';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    try {
      const drafts = JSON.parse(localStorage.getItem('bookDrafts') || '[]');
      const updatedDrafts = drafts.map(draft => 
        draft.draftId === book.draftId ? book : draft
      );
      
      // If it's a new draft (like demo), add it
      if (!drafts.find(draft => draft.draftId === book.draftId)) {
        updatedDrafts.push(book);
      }
      
      localStorage.setItem('bookDrafts', JSON.stringify(updatedDrafts));
      alert('Draft saved successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft');
    }
  };

  const handlePublish = () => {
    if (!validateForm()) {
      return;
    }

    // Here you would typically make an API call to publish the book
    const publishedBook = { ...book, status: 'published', publishedAt: new Date().toISOString() };
    
    try {
      // For demo, we'll just update the localStorage
      const drafts = JSON.parse(localStorage.getItem('bookDrafts') || '[]');
      const publishedBooks = JSON.parse(localStorage.getItem('publishedBooks') || '[]');
      
      publishedBooks.push(publishedBook);
      const remainingDrafts = drafts.filter(draft => draft.draftId !== book.draftId);
      
      localStorage.setItem('publishedBooks', JSON.stringify(publishedBooks));
      localStorage.setItem('bookDrafts', JSON.stringify(remainingDrafts));
      
      alert('Book published successfully!');
      router.push('/');
    } catch (error) {
      console.error('Error publishing book:', error);
      alert('Failed to publish book');
    }
  };

  const updateField = (field, value) => {
    setBook(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading draft...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Draft not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Book Draft</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {isEditing ? 'View Mode' : 'Edit Mode'}
              </button>
              {isEditing && (
                <>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={handlePublish}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Publish
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className={`px-2 py-1 rounded-full text-xs ${
              book.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}>
              {book.status.toUpperCase()}
            </span>
            <span>Added: {new Date(book.addedToDraft).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Book Cover and Basic Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <img
                  src={book.poster}
                  alt={book.title}
                  className="w-full max-w-xs mx-auto rounded-lg shadow-md"
                />
              </div>
              
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={book.title}
                      onChange={(e) => updateField('title', e.target.value)}
                      className={`w-full p-2 border rounded-lg ${validationErrors.title ? 'border-red-500' : 'border-gray-300'}`}
                    />
                  ) : (
                    <p className="text-lg font-semibold">{book.title}</p>
                  )}
                  {validationErrors.title && <p className="text-red-500 text-xs mt-1">{validationErrors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={book.author}
                      onChange={(e) => updateField('author', e.target.value)}
                      className={`w-full p-2 border rounded-lg ${validationErrors.author ? 'border-red-500' : 'border-gray-300'}`}
                    />
                  ) : (
                    <p className="text-gray-700">{book.author}</p>
                  )}
                  {validationErrors.author && <p className="text-red-500 text-xs mt-1">{validationErrors.author}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Personal Rating</label>
                  {isEditing ? (
                    <select
                      value={book.personalRating || ''}
                      onChange={(e) => updateField('personalRating', e.target.value ? Number(e.target.value) : null)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">No Rating</option>
                      {[1,2,3,4,5].map(rating => (
                        <option key={rating} value={rating}>{'⭐'.repeat(rating)} ({rating})</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-700">
                      {book.personalRating ? '⭐'.repeat(book.personalRating) + ` (${book.personalRating}/5)` : 'Not rated'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reading Status</label>
                  {isEditing ? (
                    <select
                      value={book.readingStatus}
                      onChange={(e) => updateField('readingStatus', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="want-to-read">Want to Read</option>
                      <option value="currently-reading">Currently Reading</option>
                      <option value="completed">Completed</option>
                      <option value="dnf">Did Not Finish</option>
                    </select>
                  ) : (
                    <p className="text-gray-700 capitalize">{book.readingStatus.replace('-', ' ')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Description</h3>
              {isEditing ? (
                <textarea
                  value={book.overview}
                  onChange={(e) => updateField('overview', e.target.value)}
                  rows={4}
                  className={`w-full p-3 border rounded-lg ${validationErrors.overview ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter book description..."
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{book.overview}</p>
              )}
              {validationErrors.overview && <p className="text-red-500 text-xs mt-1">{validationErrors.overview}</p>}
            </div>

            {/* Personal Notes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Personal Notes</h3>
              {isEditing ? (
                <textarea
                  value={book.personalNotes || ''}
                  onChange={(e) => updateField('personalNotes', e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Your thoughts about this book..."
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{book.personalNotes || 'No personal notes yet.'}</p>
              )}
            </div>

            {/* Publication Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Publication Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={book.isbn || ''}
                      onChange={(e) => updateField('isbn', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <p className="text-gray-700">{book.isbn || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page Count</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={book.pageCount || ''}
                      onChange={(e) => updateField('pageCount', e.target.value ? Number(e.target.value) : null)}
                      className={`w-full p-2 border rounded-lg ${validationErrors.pageCount ? 'border-red-500' : 'border-gray-300'}`}
                    />
                  ) : (
                    <p className="text-gray-700">{book.pageCount || 'Not specified'}</p>
                  )}
                  {validationErrors.pageCount && <p className="text-red-500 text-xs mt-1">{validationErrors.pageCount}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={book.publisher || ''}
                      onChange={(e) => updateField('publisher', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <p className="text-gray-700">{book.publisher || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publication Year</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={book.publicationYear || ''}
                      onChange={(e) => updateField('publicationYear', e.target.value ? Number(e.target.value) : null)}
                      className={`w-full p-2 border rounded-lg ${validationErrors.publicationYear ? 'border-red-500' : 'border-gray-300'}`}
                    />
                  ) : (
                    <p className="text-gray-700">{book.publicationYear || 'Not specified'}</p>
                  )}
                  {validationErrors.publicationYear && <p className="text-red-500 text-xs mt-1">{validationErrors.publicationYear}</p>}
                </div>
              </div>
            </div>

            {/* Reading Experience */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Reading Experience</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={book.readingStartDate || ''}
                      onChange={(e) => updateField('readingStartDate', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <p className="text-gray-700">{book.readingStartDate ? new Date(book.readingStartDate).toLocaleDateString() : 'Not started'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={book.readingEndDate || ''}
                      onChange={(e) => updateField('readingEndDate', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <p className="text-gray-700">{book.readingEndDate ? new Date(book.readingEndDate).toLocaleDateString() : 'Not finished'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Favorite Quote</label>
                  {isEditing ? (
                    <textarea
                      value={book.favoriteQuote || ''}
                      onChange={(e) => updateField('favoriteQuote', e.target.value)}
                      rows={2}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="Your favorite quote from the book..."
                    />
                  ) : (
                    <p className="text-gray-700 italic">"{book.favoriteQuote || 'No favorite quote selected'}"</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recommended By</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={book.recommendedBy || ''}
                      onChange={(e) => updateField('recommendedBy', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="Who recommended this book?"
                    />
                  ) : (
                    <p className="text-gray-700">{book.recommendedBy || 'Self-discovered'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Tags and Categories */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Tags and Categories</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Genres</label>
                  <div className="flex flex-wrap gap-2">
                    {book.genres?.map((genre, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Personal Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {book.tags?.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Personal Category</label>
                  {isEditing ? (
                    <select
                      value={book.personalCategory || ''}
                      onChange={(e) => updateField('personalCategory', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select Category</option>
                      <option value="Must Read Again">Must Read Again</option>
                      <option value="Recommend to Others">Recommend to Others</option>
                      <option value="Life Changing">Life Changing</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Educational">Educational</option>
                      <option value="Reference">Reference</option>
                    </select>
                  ) : (
                    <p className="text-gray-700">{book.personalCategory || 'Not categorized'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            ← Back to Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraftBookPage;