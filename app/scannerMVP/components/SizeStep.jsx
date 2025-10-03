import React from 'react';
import useBookScannerStore from '../stores/useBookScannerStore';

const SizeStep = () => {
  const { bookData, updateBookData } = useBookScannerStore();

  const units = ['inches', 'cm', 'mm'];
  
  // Common book sizes for quick selection
  const commonSizes = [
    { name: 'Mass Market Paperback', width: '4.25', height: '6.87', depth: '0.5', unit: 'inches' },
    { name: 'Trade Paperback', width: '5.5', height: '8.5', depth: '0.75', unit: 'inches' },
    { name: 'Hardcover', width: '6', height: '9', depth: '1.25', unit: 'inches' },
    { name: 'Large Format', width: '7', height: '10', depth: '1.5', unit: 'inches' },
    { name: 'Pocket Book', width: '10.8', height: '17.5', depth: '1.2', unit: 'cm' },
    { name: 'Standard (A5)', width: '14.8', height: '21', depth: '2', unit: 'cm' }
  ];

  const handleSizeChange = (dimension, value) => {
    updateBookData(`size.${dimension}`, value);
  };

  const selectCommonSize = (size) => {
    updateBookData('size.width', size.width);
    updateBookData('size.height', size.height);
    updateBookData('size.depth', size.depth);
    updateBookData('size.unit', size.unit);
  };

  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-xl p-8 max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">📏 Book Size</h2>
        <p className="text-white/80">Measure your book's dimensions</p>
      </div>

      {/* Unit selector */}
      <div className="mb-6">
        <label className="block text-white/80 text-sm font-medium mb-2">
          Measurement Unit:
        </label>
        <div className="flex gap-2">
          {units.map((unit) => (
            <button
              key={unit}
              onClick={() => updateBookData('size.unit', unit)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                bookData.size.unit === unit
                  ? 'bg-blue-500/50 border-blue-400 text-white'
                  : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
              }`}
            >
              {unit}
            </button>
          ))}
        </div>
      </div>

      {/* Dimension inputs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Width
          </label>
          <input
            type="number"
            step="0.1"
            value={bookData.size.width}
            onChange={(e) => handleSizeChange('width', e.target.value)}
            placeholder="0.0"
            className="w-full p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          />
          <div className="text-xs text-white/60 mt-1">{bookData.size.unit}</div>
        </div>
        
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Height
          </label>
          <input
            type="number"
            step="0.1"
            value={bookData.size.height}
            onChange={(e) => handleSizeChange('height', e.target.value)}
            placeholder="0.0"
            className="w-full p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          />
          <div className="text-xs text-white/60 mt-1">{bookData.size.unit}</div>
        </div>
        
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Depth
          </label>
          <input
            type="number"
            step="0.1"
            value={bookData.size.depth}
            onChange={(e) => handleSizeChange('depth', e.target.value)}
            placeholder="0.0"
            className="w-full p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          />
          <div className="text-xs text-white/60 mt-1">{bookData.size.unit}</div>
        </div>
      </div>

      {/* Common sizes */}
      <div className="mb-6">
        <label className="block text-white/80 text-sm font-medium mb-3">
          Or select a common book size:
        </label>
        <div className="grid grid-cols-1 gap-2">
          {commonSizes.map((size, index) => (
            <button
              key={index}
              onClick={() => selectCommonSize(size)}
              className="p-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all text-left"
            >
              <div className="text-white font-medium">{size.name}</div>
              <div className="text-white/60 text-sm">
                {size.width} × {size.height} × {size.depth} {size.unit}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current dimensions display */}
      {(bookData.size.width || bookData.size.height || bookData.size.depth) && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-200 text-sm">
            📐 <strong>Current size:</strong> {bookData.size.width || '?'} × {bookData.size.height || '?'} × {bookData.size.depth || '?'} {bookData.size.unit}
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
        <p className="text-blue-200 text-sm">
          💡 <strong>Tips:</strong> Width × Height × Depth. Use a ruler for accuracy, or select from common book sizes above!
        </p>
      </div>
    </div>
  );
};

export default SizeStep;