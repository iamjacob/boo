import React, { useState } from 'react';
import useBookScannerStore from '../stores/useBookScannerStore';

const PreviewStep = () => {
  const { bookData, updateBookData } = useBookScannerStore();
  const [showFullNotes, setShowFullNotes] = useState(false);

  // Heart rating component
  const HeartRating = ({ rating, onRatingChange, editable = true }) => {
    const hearts = [1, 2, 3, 4, 5];
    
    return (
      <div className="flex gap-1">
        {hearts.map((heart) => (
          <button
            key={heart}
            onClick={() => editable && onRatingChange(heart)}
            disabled={!editable}
            className={`text-2xl transition-all ${
              editable ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
            }`}
          >
            {heart <= rating ? (
              <span className="text-red-400">❤️</span>
            ) : (
              <span className="text-gray-500">🤍</span>
            )}
          </button>
        ))}
      </div>
    );
  };

  const handleRatingChange = (newRating) => {
    updateBookData('rating', newRating === bookData.rating ? 0 : newRating);
  };

  const handleNotesChange = (e) => {
    updateBookData('notes', e.target.value);
  };

  const handleReadingStatusChange = (status) => {
    updateBookData('readingStatus', status);
  };

  const getCompletionPercentage = () => {
    const fields = [
      bookData.title,
      bookData.author,
      bookData.year,
      bookData.size.width && bookData.size.height && bookData.size.depth,
      bookData.weight.value,
      bookData.coverData,
      Object.values(bookData.images).some(img => img !== null),
      bookData.language,
      bookData.categories.main.length > 0,
      bookData.notes
    ];
    
    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const getImageCount = () => {
    return Object.values(bookData.images).filter(img => img !== null).length;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getEstimatedDataSize = () => {
    let totalSize = 0;
    
    // Estimate JSON size
    totalSize += JSON.stringify(bookData).length;
    
    // Add uploaded files size
    if (bookData.uploadedFiles) {
      bookData.uploadedFiles.forEach(file => {
        totalSize += file.size || 0;
      });
    }
    
    return formatFileSize(totalSize);
  };

  const readingStatusOptions = [
    { value: 'want-to-read', label: 'Want to Read', icon: '📚', color: 'blue' },
    { value: 'reading', label: 'Currently Reading', icon: '📖', color: 'green' },
    { value: 'read', label: 'Finished', icon: '✅', color: 'purple' }
  ];

  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-xl p-8 max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">👀 Preview & Details</h2>
        <p className="text-white/80">Review your book details and add final touches</p>
      </div>

      {/* Completion status */}
      <div className="mb-8 p-4 bg-gradient-to-r from-blue-500/20 to-green-500/20 border border-blue-500/30 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-medium">📊 Completion Progress</span>
          <span className="text-white font-bold">{getCompletionPercentage()}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${getCompletionPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Book preview card */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Book cover and images */}
        <div className="space-y-4">
          {/* Main cover */}
          <div className="aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden border border-white/30">
            {bookData.coverData ? (
              <img
                src={bookData.coverData}
                alt="Book cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/50">
                <div className="text-center">
                  <div className="text-4xl mb-2">📚</div>
                  <div className="text-sm">No Cover</div>
                </div>
              </div>
            )}
          </div>

          {/* Additional images */}
          {getImageCount() > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(bookData.images).map(([type, image]) => (
                image && (
                  <div key={type} className="aspect-square bg-gray-800 rounded overflow-hidden border border-white/20">
                    <img
                      src={image}
                      alt={`${type} view`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        {/* Book details */}
        <div className="md:col-span-2 space-y-4">
          {/* Title and author */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {bookData.title || 'Untitled Book'}
            </h3>
            <p className="text-white/80 text-lg mb-1">
              by {bookData.author || 'Unknown Author'}
            </p>
            {bookData.year && (
              <p className="text-white/60">Published: {bookData.year}</p>
            )}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-white/60 text-sm">Language</div>
              <div className="text-white font-medium">
                {bookData.language ? bookData.language.toUpperCase() : 'Not set'}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-white/60 text-sm">Size</div>
              <div className="text-white font-medium">
                {bookData.size.width && bookData.size.height && bookData.size.depth 
                  ? `${bookData.size.width}×${bookData.size.height}×${bookData.size.depth} ${bookData.size.unit}`
                  : 'Not measured'
                }
              </div>
            </div>
          </div>

          {/* Categories and tags */}
          <div>
            <div className="mb-2">
              <span className="text-white/60 text-sm">Categories: </span>
              <span className="text-white">
                {bookData.categories.main.length > 0 
                  ? bookData.categories.main.join(', ')
                  : 'None'
                }
              </span>
            </div>
            {bookData.categories.sub.length > 0 && (
              <div className="mb-2">
                <span className="text-white/60 text-sm">Sub-categories: </span>
                <span className="text-white text-sm">
                  {bookData.categories.sub.join(', ')}
                </span>
              </div>
            )}
            {bookData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {bookData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-500/30 border border-blue-500/50 rounded text-blue-200 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating section */}
      <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
        <h4 className="text-red-200 font-medium mb-3">❤️ Your Rating</h4>
        <div className="flex items-center gap-4">
          <HeartRating rating={bookData.rating} onRatingChange={handleRatingChange} />
          <span className="text-white/70">
            {bookData.rating === 0 ? 'Not rated' : `${bookData.rating}/5 hearts`}
          </span>
        </div>
      </div>

      {/* Reading status */}
      <div className="mb-6 p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg">
        <h4 className="text-purple-200 font-medium mb-3">📖 Reading Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {readingStatusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleReadingStatusChange(option.value)}
              className={`p-3 rounded-lg border transition-all text-left ${
                bookData.readingStatus === option.value
                  ? `bg-${option.color}-500/50 border-${option.color}-400 text-white`
                  : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{option.icon}</span>
                <span className="font-medium">{option.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Notes section */}
      <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
        <h4 className="text-green-200 font-medium mb-3">📝 Notes & Comments</h4>
        <textarea
          value={bookData.notes}
          onChange={handleNotesChange}
          placeholder="Add your thoughts, quotes, or notes about this book..."
          className="w-full h-24 p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400/50 resize-none"
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-green-300/70 text-sm">
            {bookData.notes.length} characters
          </span>
          {bookData.notes.length > 100 && (
            <button
              onClick={() => setShowFullNotes(!showFullNotes)}
              className="text-green-300 text-sm hover:text-green-200"
            >
              {showFullNotes ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      </div>

      {/* Data summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl text-blue-300">{getImageCount()}</div>
          <div className="text-blue-200 text-sm">Images</div>
        </div>
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl text-green-300">{bookData.uploadedFiles?.length || 0}</div>
          <div className="text-green-200 text-sm">Files</div>
        </div>
        <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl text-purple-300">{bookData.categories.main.length + bookData.tags.length}</div>
          <div className="text-purple-200 text-sm">Tags</div>
        </div>
        <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 text-center">
          <div className="text-lg text-orange-300">{getEstimatedDataSize()}</div>
          <div className="text-orange-200 text-sm">Data Size</div>
        </div>
      </div>

      {/* Tips */}
      <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
        <p className="text-blue-200 text-sm">
          💡 <strong>Almost done!</strong> Review your book details above. You can edit rating, reading status, and notes here. Next step will generate your book data!
        </p>
      </div>
    </div>
  );
};

export default PreviewStep;