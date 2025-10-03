import React, { useState } from 'react';
import useBookScannerStore from '../stores/useBookScannerStore';

const ImageStep = () => {
  const { bookData, updateBookData, bookImages, setBookImages } = useBookScannerStore();
  const [activeView, setActiveView] = useState('front');
  const [dragActive, setDragActive] = useState(null);

  const imageTypes = [
    { key: 'front', label: 'Front Cover', icon: '📘', description: 'Main cover image' },
    { key: 'spine', label: 'Spine', icon: '📖', description: 'Side view of book' },
    { key: 'back', label: 'Back Cover', icon: '📙', description: 'Rear cover image' }
  ];

  const handleImageUpload = (type, file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be under 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const newImages = {
        ...bookData.images,
        [type]: e.target.result
      };
      updateBookData('images', newImages);
      setBookImages(newImages);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(type);
    } else if (e.type === 'dragleave') {
      setDragActive(null);
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(type, e.dataTransfer.files[0]);
    }
  };

  const removeImage = (type) => {
    const newImages = {
      ...bookData.images,
      [type]: null
    };
    updateBookData('images', newImages);
    setBookImages(newImages);
  };

  const useFromUploaded = (type) => {
    if (bookData.uploadedFiles.length > 0) {
      const selectedFile = bookData.uploadedFiles[0]; // Use first uploaded file
      const newImages = {
        ...bookData.images,
        [type]: selectedFile.data
      };
      updateBookData('images', newImages);
      setBookImages(newImages);
    }
  };

  const getUploadedCount = () => bookData.uploadedFiles?.length || 0;
  const getImageCount = () => {
    return Object.values(bookData.images).filter(img => img !== null).length;
  };

  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-xl p-8 max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">📸 Book Images</h2>
        <p className="text-white/80">Capture all angles of your book</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl text-blue-300">{getImageCount()}/3</div>
          <div className="text-blue-200 text-sm">Images Set</div>
        </div>
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl text-green-300">{getUploadedCount()}</div>
          <div className="text-green-200 text-sm">Files Uploaded</div>
        </div>
        <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl text-purple-300">{bookData.coverData ? '✅' : '❌'}</div>
          <div className="text-purple-200 text-sm">Cover Set</div>
        </div>
        <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl text-orange-300">📏</div>
          <div className="text-orange-200 text-sm">Size Measured</div>
        </div>
      </div>

      {/* Quick actions if files already uploaded */}
      {getUploadedCount() > 0 && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-200 text-sm mb-3">
            📁 You have {getUploadedCount()} uploaded files. Quick assign to positions:
          </p>
          <div className="flex gap-2 flex-wrap">
            {imageTypes.map((type) => (
              <button
                key={type.key}
                onClick={() => useFromUploaded(type.key)}
                className="px-3 py-1 bg-green-600/30 border border-green-500/50 rounded text-green-200 text-sm hover:bg-green-600/50 transition-colors"
              >
                Set as {type.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {imageTypes.map((type) => (
          <button
            key={type.key}
            onClick={() => setActiveView(type.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all whitespace-nowrap ${
              activeView === type.key
                ? 'bg-blue-500/50 border-blue-400 text-white'
                : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
            }`}
          >
            <span className="text-lg">{type.icon}</span>
            <span className="font-medium">{type.label}</span>
            {bookData.images[type.key] && (
              <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Active image view */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Upload area */}
        <div>
          <h3 className="text-white font-medium mb-3 flex items-center gap-2">
            {imageTypes.find(t => t.key === activeView)?.icon}
            {imageTypes.find(t => t.key === activeView)?.label}
          </h3>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragActive === activeView
                ? 'border-blue-400 bg-blue-500/20'
                : 'border-white/30 bg-white/10'
            }`}
            onDragEnter={(e) => handleDrag(e, activeView)}
            onDragLeave={(e) => handleDrag(e, activeView)}
            onDragOver={(e) => handleDrag(e, activeView)}
            onDrop={(e) => handleDrop(e, activeView)}
          >
            {bookData.images[activeView] ? (
              <div className="relative">
                <img
                  src={bookData.images[activeView]}
                  alt={`${activeView} view`}
                  className="max-w-full max-h-48 mx-auto object-contain rounded"
                />
                <button
                  onClick={() => removeImage(activeView)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-4">📤</div>
                <p className="text-white/80 mb-4">
                  Drop image here or{' '}
                  <label className="text-blue-300 hover:text-blue-200 underline cursor-pointer">
                    browse files
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(activeView, e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-white/60 text-sm">
                  {imageTypes.find(t => t.key === activeView)?.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Preview area */}
        <div>
          <h3 className="text-white font-medium mb-3">📱 Mobile Preview</h3>
          <div className="bg-gray-800 rounded-lg p-4 aspect-[9/16] max-h-80">
            <div className="text-white/60 text-sm mb-2">Book Scanner App</div>
            <div className="grid grid-cols-3 gap-2 h-20">
              {imageTypes.map((type) => (
                <div key={type.key} className="bg-gray-700 rounded text-center flex flex-col items-center justify-center">
                  {bookData.images[type.key] ? (
                    <img
                      src={bookData.images[type.key]}
                      alt={type.label}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <>
                      <span className="text-lg">{type.icon}</span>
                      <span className="text-xs text-gray-400">{type.label}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 text-white/70 text-xs">
              <div className="truncate">{bookData.title || 'Book Title'}</div>
              <div className="truncate text-white/50">{bookData.author || 'Author Name'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhancement features */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg">
          <h4 className="text-purple-200 font-medium mb-2">📚 Book Features</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={bookData.hasDustJacket}
                onChange={(e) => updateBookData('hasDustJacket', e.target.checked)}
                className="mr-2"
              />
              <span className="text-purple-200 text-sm">Has dust jacket</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={bookData.hasFlaps}
                onChange={(e) => updateBookData('hasFlaps', e.target.checked)}
                className="mr-2"
              />
              <span className="text-purple-200 text-sm">Has cover flaps</span>
            </label>
          </div>
        </div>

        <div className="p-4 bg-orange-500/20 border border-orange-500/30 rounded-lg">
          <h4 className="text-orange-200 font-medium mb-2">📏 Quick Tips</h4>
          <ul className="text-orange-200 text-sm space-y-1">
            <li>• Good lighting improves scan quality</li>
            <li>• Capture all text clearly</li>
            <li>• Include ISBN if visible</li>
            <li>• Remove dust jacket for spine shot</li>
          </ul>
        </div>
      </div>

      {/* Progress summary */}
      <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
        <p className="text-blue-200 text-sm">
          💡 <strong>Progress:</strong> {getImageCount()}/3 images captured. 
          {getImageCount() === 0 && ' Start with the front cover for best results!'}
          {getImageCount() > 0 && ' Great job! Add more angles for a complete scan.'}
        </p>
      </div>
    </div>
  );
};

export default ImageStep;