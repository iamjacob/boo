import React from 'react';
import useBookScannerStore from '../stores/useBookScannerStore';

const YearStep = () => {
  const { bookData, updateBookData } = useBookScannerStore();

  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  
  // Generate year options from current year back to 1000 AD
  for (let year = currentYear; year >= 1000; year--) {
    yearOptions.push(year);
  }

  // Quick year selections
  const quickYears = [
    { label: 'This Year', value: currentYear },
    { label: 'Last Year', value: currentYear - 1 },
    { label: '2020s', value: 2020 },
    { label: '2010s', value: 2010 },
    { label: '2000s', value: 2000 },
    { label: '1990s', value: 1990 },
    { label: '1980s', value: 1980 },
    { label: 'Classic', value: 1950 }
  ];

  const handleYearChange = (e) => {
    updateBookData('year', e.target.value);
  };

  const selectQuickYear = (year) => {
    updateBookData('year', year.toString());
  };

  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-xl p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">📅 Publication Year</h2>
        <p className="text-white/80">When was "{bookData.title}" published?</p>
      </div>

      {/* Quick year buttons */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {quickYears.map((yearItem, index) => (
          <button
            key={index}
            onClick={() => selectQuickYear(yearItem.value)}
            className={`p-3 rounded-lg border transition-all ${
              bookData.year === yearItem.value.toString()
                ? 'bg-blue-500/50 border-blue-400 text-white'
                : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
            }`}
          >
            <div className="text-sm font-medium">{yearItem.label}</div>
            <div className="text-xs opacity-80">{yearItem.value}</div>
          </button>
        ))}
      </div>

      {/* Manual year input */}
      <div className="mb-6">
        <label className="block text-white/80 text-sm font-medium mb-2">
          Or enter specific year:
        </label>
        <input
          type="number"
          value={bookData.year}
          onChange={handleYearChange}
          min="1000"
          max={currentYear}
          placeholder="e.g., 1997"
          className="w-full p-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
        />
      </div>

      {/* Year validation */}
      {bookData.year && (parseInt(bookData.year) < 1000 || parseInt(bookData.year) > currentYear) && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-300 mr-2">⚠️</span>
            <span className="text-red-200 text-sm">
              Please enter a year between 1000 and {currentYear}
            </span>
          </div>
        </div>
      )}

      {/* Show current book info */}
      {bookData.title && bookData.author && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-200 text-sm">
            📚 <strong>"{bookData.title}"</strong> by {bookData.author}
            {bookData.year && ` (${bookData.year})`}
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
        <p className="text-blue-200 text-sm">
          💡 <strong>Tips:</strong> Publication year helps identify different editions. You can skip this step if unsure!
        </p>
      </div>
    </div>
  );
};

export default YearStep;