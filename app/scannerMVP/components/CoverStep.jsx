import React, { useState, useRef } from 'react';
import useBookScannerStore from '../stores/useBookScannerStore';

const CoverStep = () => {
  const {
    bookData,
    updateBookData,
    searchCoverSuggestions,
    coverSuggestions,
    isSearching
  } = useBookScannerStore();

  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  // Search for cover suggestions when component mounts or title/author changes
  React.useEffect(() => {
    if (bookData.title) {
      searchCoverSuggestions(bookData.title, bookData.author);
    }
  }, [bookData.title, bookData.author, searchCoverSuggestions]);

  const handleCoverMethodChange = (method) => {
    updateBookData('coverMethod', method);
    
    // Clear previous data when changing methods
    if (method !== 'upload') {
      updateBookData('uploadedFiles', []);
    }
    if (method !== 'url') {
      updateBookData('coverData', null);
    }
  };

  const handleUrlChange = (e) => {
    updateBookData('coverData', e.target.value);
  };

  const handleFileUpload = (files) => {
    const fileList = Array.from(files);
    const validFiles = fileList.filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB limit
    );

    if (validFiles.length === 0) {
      alert('Please select valid image files (under 10MB each)');
      return;
    }

    // Process each file
    validFiles.forEach((file, index) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const newFile = {
          id: Date.now() + index,
          name: file.name,
          size: file.size,
          type: file.type,
          data: e.target.result,
          uploadedAt: new Date().toISOString()
        };

        // Add to uploaded files array
        updateBookData('uploadedFiles', [...bookData.uploadedFiles, newFile]);
        
        // Set as cover data if it's the first file
        if (bookData.uploadedFiles.length === 0 && index === 0) {
          updateBookData('coverData', e.target.result);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const selectUploadedFile = (file) => {
    updateBookData('coverData', file.data);
  };

  const removeUploadedFile = (fileId) => {
    const updatedFiles = bookData.uploadedFiles.filter(file => file.id !== fileId);
    updateBookData('uploadedFiles', updatedFiles);
    
    // If removed file was the current cover, clear it
    const removedFile = bookData.uploadedFiles.find(file => file.id === fileId);
    if (removedFile && bookData.coverData === removedFile.data) {
      updateBookData('coverData', updatedFiles.length > 0 ? updatedFiles[0].data : null);
    }
  };

  const selectSuggestedCover = (cover) => {
    updateBookData('coverData', cover.url);
    updateBookData('coverMethod', 'url');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-xl p-8 max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">📸 Book Cover</h2>
        <p className="text-white/80">How would you like to add the cover?</p>
      </div>

      {/* Cover method selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { method: 'upload', icon: '📤', label: 'Upload Images' },
          { method: 'url', icon: '🔗', label: 'Image URL' },
          { method: 'camera', icon: '📷', label: 'Take Photo' },
          { method: 'none', icon: '🚫', label: 'Skip Cover' }
        ].map((option) => (
          <button
            key={option.method}
            onClick={() => handleCoverMethodChange(option.method)}
            className={`p-4 rounded-lg border transition-all text-center ${
              bookData.coverMethod === option.method
                ? 'bg-blue-500/50 border-blue-400 text-white'
                : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
            }`}
          >
            <div className="text-2xl mb-1">{option.icon}</div>
            <div className="text-sm font-medium">{option.label}</div>
          </button>
        ))}
      </div>

      {/* Upload method */}
      {bookData.coverMethod === 'upload' && (
        <div className="mb-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragActive
                ? 'border-blue-400 bg-blue-500/20'
                : 'border-white/30 bg-white/10'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-4xl mb-4">📤</div>
            <p className="text-white/80 mb-4">
              Drag and drop images here, or{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-300 hover:text-blue-200 underline"
              >
                browse files
              </button>
            </p>
            <p className="text-white/60 text-sm">
              Supports: JPG, PNG, WEBP (Max: 10MB each, Multiple files allowed)
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Uploaded files grid */}
          {bookData.uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-white font-medium mb-3">
                Uploaded Images ({bookData.uploadedFiles.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {bookData.uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`relative group border-2 rounded-lg overflow-hidden transition-all ${
                      bookData.coverData === file.data
                        ? 'border-blue-400 ring-2 ring-blue-400/50'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <img
                      src={file.data}
                      alt={file.name}
                      className="w-full h-32 object-cover cursor-pointer"
                      onClick={() => selectUploadedFile(file)}
                    />
                    
                    {/* File info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2">
                      <div className="text-xs truncate" title={file.name}>
                        {file.name}
                      </div>
                      <div className="text-xs text-white/70">
                        {formatFileSize(file.size)}
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeUploadedFile(file.id)}
                      className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>

                    {/* Selected indicator */}
                    {bookData.coverData === file.data && (
                      <div className="absolute top-2 left-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* URL method */}
      {bookData.coverMethod === 'url' && (
        <div className="mb-6">
          <label className="block text-white/80 text-sm font-medium mb-2">
            Image URL:
          </label>
          <input
            type="url"
            value={bookData.coverData || ''}
            onChange={handleUrlChange}
            placeholder="https://example.com/book-cover.jpg"
            className="w-full p-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          />
          
          {/* URL preview */}
          {bookData.coverData && (
            <div className="mt-4 flex justify-center">
              <img
                src={bookData.coverData}
                alt="Cover preview"
                className="max-w-32 max-h-48 object-contain border border-white/30 rounded-lg"
                onError={() => alert('Invalid image URL')}
              />
            </div>
          )}
        </div>
      )}

      {/* Camera method placeholder */}
      {bookData.coverMethod === 'camera' && (
        <div className="mb-6 p-8 border border-white/30 rounded-lg text-center">
          <div className="text-4xl mb-4">📷</div>
          <p className="text-white/80 mb-4">Camera functionality coming soon!</p>
          <p className="text-white/60 text-sm">
            For now, please use the upload or URL methods.
          </p>
        </div>
      )}

      {/* Suggested covers from Google Books */}
      {coverSuggestions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-white font-medium mb-3 flex items-center">
            🎯 Suggested Covers
            {isSearching && (
              <div className="ml-2 animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
            )}
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {coverSuggestions.map((cover, index) => (
              <button
                key={index}
                onClick={() => selectSuggestedCover(cover)}
                className="group relative border border-white/20 rounded-lg overflow-hidden hover:border-white/40 transition-all"
              >
                <img
                  src={cover.url}
                  alt={cover.title}
                  className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs">Select</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current cover preview */}
      {bookData.coverData && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-4">
            <img
              src={bookData.coverData}
              alt="Selected cover"
              className="w-16 h-20 object-cover rounded border border-green-400/50"
            />
            <div>
              <p className="text-green-200 text-sm font-medium">✅ Cover Selected</p>
              <p className="text-green-300/80 text-xs">
                Method: {bookData.coverMethod}
                {bookData.uploadedFiles.length > 0 && ` (${bookData.uploadedFiles.length} files uploaded)`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
        <p className="text-blue-200 text-sm">
          💡 <strong>Tips:</strong> Upload multiple angles of your book cover! You can select different images later. High-quality images work best.
        </p>
      </div>
    </div>
  );
};

export default CoverStep;