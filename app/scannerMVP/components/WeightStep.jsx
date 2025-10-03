import React from 'react';
import useBookScannerStore from '../stores/useBookScannerStore';

const WeightStep = () => {
  const { bookData, updateBookData } = useBookScannerStore();

  const units = ['grams', 'ounces', 'pounds', 'kg'];
  
  // Common weight ranges for different book types
  const weightRanges = [
    { name: 'Paperback (Light)', min: 100, max: 300, unit: 'grams', avg: 200 },
    { name: 'Paperback (Standard)', min: 300, max: 500, unit: 'grams', avg: 400 },
    { name: 'Hardcover (Small)', min: 400, max: 800, unit: 'grams', avg: 600 },
    { name: 'Hardcover (Standard)', min: 600, max: 1200, unit: 'grams', avg: 900 },
    { name: 'Large/Coffee Table', min: 1000, max: 3000, unit: 'grams', avg: 2000 },
    { name: 'Textbook/Reference', min: 800, max: 2500, unit: 'grams', avg: 1500 }
  ];

  const handleWeightChange = (value) => {
    updateBookData('weight.value', value);
  };

  const handleUnitChange = (unit) => {
    updateBookData('weight.unit', unit);
  };

  const selectWeightRange = (range) => {
    updateBookData('weight.value', range.avg.toString());
    updateBookData('weight.unit', range.unit);
  };

  // Convert weight to display in different units
  const convertWeight = (value, fromUnit, toUnit) => {
    if (!value || !fromUnit || !toUnit) return '';
    
    const grams = fromUnit === 'grams' ? parseFloat(value) :
                  fromUnit === 'ounces' ? parseFloat(value) * 28.35 :
                  fromUnit === 'pounds' ? parseFloat(value) * 453.59 :
                  fromUnit === 'kg' ? parseFloat(value) * 1000 : 0;
    
    switch (toUnit) {
      case 'grams': return Math.round(grams);
      case 'ounces': return (grams / 28.35).toFixed(1);
      case 'pounds': return (grams / 453.59).toFixed(2);
      case 'kg': return (grams / 1000).toFixed(2);
      default: return '';
    }
  };

  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-xl p-8 max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">⚖️ Book Weight</h2>
        <p className="text-white/80">How much does your book weigh?</p>
      </div>

      {/* Weight input and unit selector */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1">
          <label className="block text-white/80 text-sm font-medium mb-2">
            Weight
          </label>
          <input
            type="number"
            step="0.1"
            value={bookData.weight.value}
            onChange={(e) => handleWeightChange(e.target.value)}
            placeholder="0.0"
            className="w-full p-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          />
        </div>
        
        <div className="w-24">
          <label className="block text-white/80 text-sm font-medium mb-2">
            Unit
          </label>
          <select
            value={bookData.weight.unit}
            onChange={(e) => handleUnitChange(e.target.value)}
            className="w-full p-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          >
            {units.map((unit) => (
              <option key={unit} value={unit} className="bg-gray-800">
                {unit}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Weight range suggestions */}
      <div className="mb-6">
        <label className="block text-white/80 text-sm font-medium mb-3">
          Select typical weight for book type:
        </label>
        <div className="grid grid-cols-1 gap-2">
          {weightRanges.map((range, index) => (
            <button
              key={index}
              onClick={() => selectWeightRange(range)}
              className="p-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all text-left"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-white font-medium">{range.name}</div>
                  <div className="text-white/60 text-sm">
                    {range.min}-{range.max} {range.unit}
                  </div>
                </div>
                <div className="text-white/80 text-sm font-mono">
                  ~{range.avg} {range.unit}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Weight conversions */}
      {bookData.weight.value && (
        <div className="mb-6 p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg">
          <div className="text-purple-200 text-sm font-medium mb-2">📊 Weight Conversions:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {units.map((unit) => (
              <div key={unit} className="flex justify-between">
                <span className="text-purple-300 capitalize">{unit}:</span>
                <span className="text-purple-100 font-mono">
                  {convertWeight(bookData.weight.value, bookData.weight.unit, unit)} {unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current book info */}
      {bookData.title && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-200 text-sm">
            📚 <strong>"{bookData.title}"</strong>
            {bookData.weight.value && ` - ${bookData.weight.value} ${bookData.weight.unit}`}
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
        <p className="text-blue-200 text-sm">
          💡 <strong>Tips:</strong> Use a kitchen scale for accuracy! Weight can be optional if you don't have a scale handy.
        </p>
      </div>
    </div>
  );
};

export default WeightStep;