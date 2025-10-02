"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const DraftsPage = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const loadDrafts = () => {
      try {
        const savedDrafts = JSON.parse(localStorage.getItem('bookDrafts') || '[]');
        setDrafts(savedDrafts);
      } catch (error) {
        console.error('Error loading drafts:', error);
        setDrafts([]);
      } finally {
        setLoading(false);
      }
    };

    loadDrafts();
  }, []);

  const createTestDraft = () => {
    const testDraft = {
      id: 'test-1',
      title: 'Test Book',
      author: 'Test Author',
      overview: 'This is a test book to demonstrate the drafts functionality.',
      poster: 'https://via.placeholder.com/300x400/4F46E5/white?text=Test+Book',
      genres: ['Test', 'Demo'],
      release_date: new Date().getTime() / 1000,
      type: 'book',
      draftId: `test-${Date.now()}`,
      addedToDraft: new Date().toISOString(),
      status: 'draft',
      personalRating: 3,
      personalNotes: 'This is a test book I created to check the drafts functionality.',
      readingStatus: 'want-to-read',
      tags: ['test', 'demo'],
      isPublic: true
    };

    const existingDrafts = JSON.parse(localStorage.getItem('bookDrafts') || '[]');
    existingDrafts.push(testDraft);
    localStorage.setItem('bookDrafts', JSON.stringify(existingDrafts));
    setDrafts(existingDrafts);
  };

  const clearAllDrafts = () => {
    if (confirm('Are you sure you want to clear all drafts?')) {
      localStorage.removeItem('bookDrafts');
      setDrafts([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading drafts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Book Drafts</h1>
            <div className="flex gap-2">
              <button
                onClick={createTestDraft}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Test Draft
              </button>
              {drafts.length > 0 && (
                <button
                  onClick={clearAllDrafts}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
          
          <p className="text-gray-600">
            Manage your book drafts. Books added from search will appear here.
          </p>
        </div>

        {drafts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No drafts yet</h3>
            <p className="text-gray-500 mb-6">Start by searching for books and adding them to drafts</p>
            <div className="flex justify-center gap-4">
              <Link href="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Go to Search
              </Link>
              <button
                onClick={createTestDraft}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Create Test Draft
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drafts.map((draft) => (
              <div key={draft.draftId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[3/4] relative">
                  <img
                    src={draft.poster}
                    alt={draft.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      DRAFT
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 truncate">{draft.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{draft.author}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      {draft.personalRating && (
                        <span className="text-yellow-500">
                          {'⭐'.repeat(draft.personalRating)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(draft.addedToDraft).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                    {draft.overview.substring(0, 100)}...
                  </p>
                  
                  <div className="flex gap-2">
                    <Link
                      href={`/draft/${draft.draftId}`}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 text-center"
                    >
                      View/Edit
                    </Link>
                    <button
                      onClick={() => {
                        const updatedDrafts = drafts.filter(d => d.draftId !== draft.draftId);
                        localStorage.setItem('bookDrafts', JSON.stringify(updatedDrafts));
                        setDrafts(updatedDrafts);
                      }}
                      className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            ← Back to Search
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DraftsPage;