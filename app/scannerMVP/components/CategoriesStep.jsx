import React, { useState } from 'react';
import useBookScannerStore from '../stores/useBookScannerStore';

const CategoriesStep = () => {
  const { bookData, updateBookData } = useBookScannerStore();
  const [customTag, setCustomTag] = useState('');
  const [activeTab, setActiveTab] = useState('main');
  const [showMoreMain, setShowMoreMain] = useState(false);
  const [showMoreSub, setShowMoreSub] = useState(false);
  const [showMoreTags, setShowMoreTags] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Main categories - showing most popular first
  const mainCategories = [
    { id: 'fiction', name: 'Fiction', icon: '📚', description: 'Novels, stories, literature', popular: true },
    { id: 'non-fiction', name: 'Non-Fiction', icon: '📖', description: 'Real world topics, facts', popular: true },
    { id: 'science', name: 'Science', icon: '🔬', description: 'Scientific topics, research', popular: true },
    { id: 'history', name: 'History', icon: '⏳', description: 'Historical events, periods', popular: true },
    { id: 'business', name: 'Business', icon: '💼', description: 'Entrepreneurship, economics', popular: true },
    { id: 'technology', name: 'Technology', icon: '💻', description: 'Tech, programming, digital', popular: true },
    { id: 'biography', name: 'Biography', icon: '👤', description: 'Life stories, memoirs', popular: false },
    { id: 'art', name: 'Art', icon: '🎨', description: 'Visual arts, creativity', popular: false },
    { id: 'health', name: 'Health', icon: '🏥', description: 'Medicine, wellness, fitness', popular: false },
    { id: 'cooking', name: 'Cooking', icon: '👨‍🍳', description: 'Recipes, culinary arts', popular: false },
    { id: 'travel', name: 'Travel', icon: '✈️', description: 'Places, adventures, guides', popular: false },
    { id: 'philosophy', name: 'Philosophy', icon: '🤔', description: 'Thinking, wisdom, ethics', popular: false }
  ];

  // Sub-categories organized by main category
  const subCategories = {
    fiction: ['Mystery', 'Romance', 'Fantasy', 'Sci-Fi', 'Thriller', 'Literary Fiction', 'Historical Fiction', 'Horror', 'Adventure', 'Young Adult'],
    'non-fiction': ['Self-Help', 'Essay', 'Documentary', 'Reference', 'How-To', 'Educational', 'Academic', 'True Crime', 'Current Events'],
    biography: ['Autobiography', 'Memoir', 'Celebrity', 'Historical Figure', 'Political Figure', 'Artist Biography', 'Sports Biography'],
    science: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Psychology', 'Astronomy', 'Medicine', 'Environment', 'Research'],
    history: ['Ancient History', 'Modern History', 'World War', 'American History', 'European History', 'Asian History', 'Military History'],
    art: ['Painting', 'Sculpture', 'Photography', 'Design', 'Architecture', 'Music', 'Theater', 'Film', 'Fashion'],
    business: ['Entrepreneurship', 'Leadership', 'Marketing', 'Finance', 'Economics', 'Management', 'Investing', 'Career'],
    technology: ['Programming', 'AI/ML', 'Web Development', 'Mobile Apps', 'Cybersecurity', 'Data Science', 'Gaming', 'Hardware'],
    health: ['Nutrition', 'Exercise', 'Mental Health', 'Alternative Medicine', 'Medical Reference', 'Wellness', 'Fitness'],
    cooking: ['Baking', 'Cuisine', 'Healthy Cooking', 'Quick Meals', 'Vegetarian', 'International', 'Desserts', 'Beverages'],
    travel: ['Travel Guide', 'Adventure', 'Cultural', 'Budget Travel', 'Luxury Travel', 'Photography', 'Maps', 'Language'],
    philosophy: ['Ethics', 'Logic', 'Metaphysics', 'Political Philosophy', 'Eastern Philosophy', 'Western Philosophy', 'Modern Philosophy']
  };

  // Popular tags - showing most common first
  const popularTags = [
    'bestseller', 'classic', 'award-winner', 'contemporary', 'series',
    'standalone', 'beginner-friendly', 'illustrated', 'educational', 'reference'
  ];

  // All additional tags
  const allTags = [
    'bestseller', 'award-winner', 'classic', 'contemporary', 'beginner-friendly', 
    'advanced', 'illustrated', 'series', 'standalone', 'short-read',
    'long-read', 'educational', 'inspirational', 'humorous', 'dark',
    'light-hearted', 'thought-provoking', 'page-turner', 'reference',
    'practical', 'theoretical', 'vintage', 'modern', 'popular-science',
    'memoir', 'autobiography', 'textbook', 'workbook', 'guidebook',
    'cookbook', 'travel-guide', 'self-help', 'motivational', 'biography'
  ];

  const toggleMainCategory = (categoryId) => {
    const current = bookData.categories.main || [];
    const updated = current.includes(categoryId)
      ? current.filter(id => id !== categoryId)
      : [...current, categoryId];
    updateBookData('categories.main', updated);
  };

  const toggleSubCategory = (subcategory) => {
    const current = bookData.categories.sub || [];
    const updated = current.includes(subcategory)
      ? current.filter(cat => cat !== subcategory)
      : [...current, subcategory];
    updateBookData('categories.sub', updated);
  };

  const toggleTag = (tag) => {
    const current = bookData.tags || [];
    const updated = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    updateBookData('tags', updated);
  };

  const addCustomTag = () => {
    if (customTag.trim() && !bookData.tags.includes(customTag.trim())) {
      toggleTag(customTag.trim());
      setCustomTag('');
    }
  };

  const getSelectedMainCategories = () => bookData.categories.main || [];
  const getSelectedSubCategories = () => bookData.categories.sub || [];
  const getSelectedTags = () => bookData.tags || [];

  const getAvailableSubCategories = () => {
    const selectedMain = getSelectedMainCategories();
    let availableSubs = [];
    selectedMain.forEach(mainCat => {
      if (subCategories[mainCat]) {
        availableSubs = [...availableSubs, ...subCategories[mainCat]];
      }
    });
    return [...new Set(availableSubs)]; // Remove duplicates
  };

  // Filter functions for search
  const filteredMainCategories = mainCategories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTags = allTags.filter(tag => 
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDisplayedMainCategories = () => {
    const popular = filteredMainCategories.filter(cat => cat.popular);
    const others = filteredMainCategories.filter(cat => !cat.popular);
    return showMoreMain ? [...popular, ...others] : popular;
  };

  const getDisplayedTags = () => {
    return showMoreTags ? filteredTags : popularTags.filter(tag => 
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="bg-gray-900/90 backdrop-blur-lg rounded-xl border border-gray-700/50 shadow-2xl p-8 max-w-5xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">🏷️ Categories & Details</h2>
        <p className="text-gray-300">Organize your book with categories and tags</p>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories and tags..."
            className="w-full p-4 bg-gray-800/70 backdrop-blur-md border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { id: 'main', label: 'Main Categories', icon: '📂' },
          { id: 'sub', label: 'Sub-Categories', icon: '📁' },
          { id: 'tags', label: 'Tags', icon: '🏷️' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600/70 border-blue-500 text-white shadow-lg'
                : 'bg-gray-800/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
            {tab.id === 'main' && getSelectedMainCategories().length > 0 && (
              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {getSelectedMainCategories().length}
              </span>
            )}
            {tab.id === 'sub' && getSelectedSubCategories().length > 0 && (
              <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {getSelectedSubCategories().length}
              </span>
            )}
            {tab.id === 'tags' && getSelectedTags().length > 0 && (
              <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {getSelectedTags().length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Categories */}
      {activeTab === 'main' && (
        <div className="mb-6">
          <h3 className="text-white font-medium mb-4 flex items-center justify-between">
            <span>📂 Select Main Categories</span>
            <span className="text-sm text-gray-400">
              {getSelectedMainCategories().length} selected
            </span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {getDisplayedMainCategories().map((category) => (
              <button
                key={category.id}
                onClick={() => toggleMainCategory(category.id)}
                className={`p-4 rounded-lg border transition-all text-left hover:scale-105 ${
                  getSelectedMainCategories().includes(category.id)
                    ? 'bg-blue-600/70 border-blue-500 text-white shadow-lg ring-2 ring-blue-500/30'
                    : 'bg-gray-800/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/70 hover:border-gray-500/70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium mb-1">{category.name}</div>
                    <div className="text-sm opacity-70">{category.description}</div>
                  </div>
                </div>
                {getSelectedMainCategories().includes(category.id) && (
                  <div className="mt-2 flex justify-end">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Show more button for main categories */}
          {!showMoreMain && filteredMainCategories.filter(cat => !cat.popular).length > 0 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowMoreMain(true)}
                className="px-6 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-300 hover:bg-gray-600/50 transition-all"
              >
                Show {filteredMainCategories.filter(cat => !cat.popular).length} more categories
              </button>
            </div>
          )}

          {showMoreMain && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowMoreMain(false)}
                className="px-6 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-300 hover:bg-gray-600/50 transition-all"
              >
                Show less
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sub-Categories */}
      {activeTab === 'sub' && (
        <div className="mb-6">
          <h3 className="text-white font-medium mb-4 flex items-center justify-between">
            <span>📁 Select Sub-Categories</span>
            <span className="text-sm text-gray-400">
              {getSelectedSubCategories().length} selected
            </span>
          </h3>
          {getSelectedMainCategories().length === 0 ? (
            <div className="text-center p-12 bg-gray-800/30 rounded-lg border border-gray-600/30">
              <div className="text-6xl mb-4">📂</div>
              <p className="text-gray-300 mb-4 text-lg">Select main categories first</p>
              <p className="text-gray-400 text-sm mb-6">Sub-categories will appear based on your main category selections</p>
              <button
                onClick={() => setActiveTab('main')}
                className="px-6 py-3 bg-blue-600/70 border border-blue-500 rounded-lg text-white hover:bg-blue-600/90 transition-all"
              >
                Go to Main Categories
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {getSelectedMainCategories().map((mainCat) => {
                const availableSubs = subCategories[mainCat] || [];
                const displayedSubs = showMoreSub ? availableSubs : availableSubs.slice(0, 6);
                
                return (
                  <div key={mainCat} className="bg-gray-800/30 rounded-lg p-4 border border-gray-600/30">
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      {mainCategories.find(c => c.id === mainCat)?.icon}
                      <span>{mainCategories.find(c => c.id === mainCat)?.name}</span>
                      <span className="text-sm text-gray-400">
                        ({availableSubs.filter(sub => getSelectedSubCategories().includes(sub)).length}/{availableSubs.length})
                      </span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {displayedSubs.map((subCat) => (
                        <button
                          key={subCat}
                          onClick={() => toggleSubCategory(subCat)}
                          className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                            getSelectedSubCategories().includes(subCat)
                              ? 'bg-green-600/70 border-green-500 text-white shadow-md'
                              : 'bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-600/70'
                          }`}
                        >
                          {subCat}
                          {getSelectedSubCategories().includes(subCat) && ' ✓'}
                        </button>
                      ))}
                    </div>
                    
                    {!showMoreSub && availableSubs.length > 6 && (
                      <button
                        onClick={() => setShowMoreSub(true)}
                        className="mt-3 text-sm text-blue-400 hover:text-blue-300 underline"
                      >
                        Show {availableSubs.length - 6} more...
                      </button>
                    )}
                  </div>
                );
              })}
              
              {showMoreSub && (
                <div className="text-center">
                  <button
                    onClick={() => setShowMoreSub(false)}
                    className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-300 hover:bg-gray-600/50 transition-all"
                  >
                    Show less
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {activeTab === 'tags' && (
        <div className="mb-6">
          <h3 className="text-white font-medium mb-4 flex items-center justify-between">
            <span>🏷️ Add Tags</span>
            <span className="text-sm text-gray-400">
              {getSelectedTags().length} selected
            </span>
          </h3>
          
          {/* Custom tag input */}
          <div className="mb-6 bg-gray-800/30 rounded-lg p-4 border border-gray-600/30">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Create Custom Tag
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                placeholder="Enter your custom tag..."
                className="flex-1 p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button
                onClick={addCustomTag}
                disabled={!customTag.trim()}
                className="px-6 py-3 bg-blue-600/70 border border-blue-500 rounded-lg text-white hover:bg-blue-600/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>

          {/* Popular/All tags */}
          <div className="mb-4">
            <h4 className="text-gray-300 font-medium mb-3 flex items-center justify-between">
              <span>{showMoreTags ? 'All Tags' : 'Popular Tags'}</span>
              <span className="text-sm text-gray-400">
                {getDisplayedTags().length} available
              </span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {getDisplayedTags().map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-2 rounded-lg border transition-all text-sm hover:scale-105 ${
                    getSelectedTags().includes(tag)
                      ? 'bg-purple-600/70 border-purple-500 text-white shadow-md ring-2 ring-purple-500/30'
                      : 'bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-600/70'
                  }`}
                >
                  {tag}
                  {getSelectedTags().includes(tag) && ' ✓'}
                </button>
              ))}
            </div>
            
            {/* Show more tags button */}
            <div className="mt-4 text-center">
              {!showMoreTags ? (
                <button
                  onClick={() => setShowMoreTags(true)}
                  className="px-6 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-300 hover:bg-gray-600/50 transition-all"
                >
                  Show {allTags.length - popularTags.length} more tags
                </button>
              ) : (
                <button
                  onClick={() => setShowMoreTags(false)}
                  className="px-6 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-300 hover:bg-gray-600/50 transition-all"
                >
                  Show less
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selection summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg backdrop-blur-sm">
          <h4 className="text-blue-200 font-medium mb-2 flex items-center gap-2">
            📂 Main Categories
            <span className="bg-blue-500/70 text-white rounded-full px-2 py-1 text-xs">
              {getSelectedMainCategories().length}
            </span>
          </h4>
          <div className="text-blue-300 text-sm">
            {getSelectedMainCategories().length > 0
              ? getSelectedMainCategories().map(id => 
                  mainCategories.find(c => c.id === id)?.name
                ).join(', ')
              : 'None selected'
            }
          </div>
        </div>
        
        <div className="p-4 bg-green-600/20 border border-green-500/30 rounded-lg backdrop-blur-sm">
          <h4 className="text-green-200 font-medium mb-2 flex items-center gap-2">
            📁 Sub-Categories
            <span className="bg-green-500/70 text-white rounded-full px-2 py-1 text-xs">
              {getSelectedSubCategories().length}
            </span>
          </h4>
          <div className="text-green-300 text-sm">
            {getSelectedSubCategories().length > 0
              ? getSelectedSubCategories().slice(0, 3).join(', ') + 
                (getSelectedSubCategories().length > 3 ? '...' : '')
              : 'None selected'
            }
          </div>
        </div>
        
        <div className="p-4 bg-purple-600/20 border border-purple-500/30 rounded-lg backdrop-blur-sm">
          <h4 className="text-purple-200 font-medium mb-2 flex items-center gap-2">
            🏷️ Tags
            <span className="bg-purple-500/70 text-white rounded-full px-2 py-1 text-xs">
              {getSelectedTags().length}
            </span>
          </h4>
          <div className="text-purple-300 text-sm">
            {getSelectedTags().length > 0
              ? getSelectedTags().slice(0, 3).join(', ') + 
                (getSelectedTags().length > 3 ? '...' : '')
              : 'None selected'
            }
          </div>
        </div>
      </div>

      {/* Current book info */}
      {bookData.title && (
        <div className="mb-6 p-4 bg-gray-700/30 border border-gray-600/30 rounded-lg backdrop-blur-sm">
          <p className="text-gray-200 text-sm flex items-center gap-2">
            📖 <strong>"{bookData.title}"</strong> by {bookData.author || 'Unknown Author'}
            {bookData.language && (
              <span className="bg-gray-600/50 text-gray-300 px-2 py-1 rounded text-xs">
                {bookData.language.toUpperCase()}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg backdrop-blur-sm">
        <p className="text-blue-200 text-sm">
          💡 <strong>Tips:</strong> Categories help organize your library, while tags add specific details. Use search to find specific categories quickly!
        </p>
      </div>
    </div>
  );
};

export default CategoriesStep;