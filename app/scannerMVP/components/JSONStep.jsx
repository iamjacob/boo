import React, { useState } from 'react';
import useBookScannerStore from '../stores/useBookScannerStore';

const JSONStep = () => {
  const { bookData, saveBookToDatabase, resetForm, getDatabaseStats } = useBookScannerStore();
  const [jsonView, setJsonView] = useState('formatted');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exported, setExported] = useState(false);

  const formatJSON = (data) => {
    return JSON.stringify(data, null, 2);
  };

  const minifyJSON = (data) => {
    return JSON.stringify(data);
  };

  const getCurrentJSON = () => {
    return jsonView === 'formatted' ? formatJSON(bookData) : minifyJSON(bookData);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getCurrentJSON());
      alert('📋 JSON copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = getCurrentJSON();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('📋 JSON copied to clipboard!');
    }
  };

  const downloadJSON = () => {
    const jsonString = formatJSON(bookData);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const filename = bookData.title 
      ? `${bookData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_book_data.json`
      : 'book_data.json';
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setExported(true);
    alert('📥 JSON file downloaded successfully!');
  };

  const saveToDatabase = async () => {
    setSaving(true);
    try {
      await saveBookToDatabase();
      setSaved(true);
      alert('💾 Book saved to your library successfully!');
    } catch (error) {
      console.error('Error saving book:', error);
      alert('❌ Error saving book to library. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const startNewScan = () => {
    if (confirm('🔄 Start a new scan? This will clear all current data.')) {
      resetForm();
      alert('✨ Ready for a new book scan!');
    }
  };

  const getJSONSize = () => {
    const jsonString = getCurrentJSON();
    const bytes = new Blob([jsonString]).size;
    
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFieldCount = () => {
    const countFields = (obj, prefix = '') => {
      let count = 0;
      for (const [key, value] of Object.entries(obj)) {
        if (value !== null && value !== undefined && value !== '') {
          if (typeof value === 'object' && !Array.isArray(value)) {
            count += countFields(value, `${prefix}${key}.`);
          } else if (Array.isArray(value) && value.length > 0) {
            count++;
          } else if (typeof value !== 'object') {
            count++;
          }
        }
      }
      return count;
    };
    
    return countFields(bookData);
  };

  const stats = getDatabaseStats();

  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-xl p-8 max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">📄 Export & Save</h2>
        <p className="text-white/80">Your book data is ready! Export or save to your library.</p>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          onClick={copyToClipboard}
          className="p-4 bg-blue-500/30 border border-blue-500/50 rounded-lg hover:bg-blue-500/50 transition-all text-white"
        >
          <div className="text-2xl mb-2">📋</div>
          <div className="font-medium">Copy JSON</div>
          <div className="text-sm opacity-70">To clipboard</div>
        </button>

        <button
          onClick={downloadJSON}
          className="p-4 bg-green-500/30 border border-green-500/50 rounded-lg hover:bg-green-500/50 transition-all text-white"
        >
          <div className="text-2xl mb-2">📥</div>
          <div className="font-medium">Download</div>
          <div className="text-sm opacity-70">As JSON file</div>
        </button>

        <button
          onClick={saveToDatabase}
          disabled={saving || saved}
          className="p-4 bg-purple-500/30 border border-purple-500/50 rounded-lg hover:bg-purple-500/50 transition-all text-white disabled:opacity-50"
        >
          <div className="text-2xl mb-2">
            {saving ? '⏳' : saved ? '✅' : '💾'}
          </div>
          <div className="font-medium">
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save to Library'}
          </div>
          <div className="text-sm opacity-70">Local storage</div>
        </button>

        <button
          onClick={startNewScan}
          className="p-4 bg-orange-500/30 border border-orange-500/50 rounded-lg hover:bg-orange-500/50 transition-all text-white"
        >
          <div className="text-2xl mb-2">🔄</div>
          <div className="font-medium">New Scan</div>
          <div className="text-sm opacity-70">Start over</div>
        </button>
      </div>

      {/* JSON view controls */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">📄 JSON Data</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setJsonView('formatted')}
            className={`px-3 py-1 rounded text-sm ${
              jsonView === 'formatted'
                ? 'bg-blue-500/50 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Formatted
          </button>
          <button
            onClick={() => setJsonView('minified')}
            className={`px-3 py-1 rounded text-sm ${
              jsonView === 'minified'
                ? 'bg-blue-500/50 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Minified
          </button>
        </div>
      </div>

      {/* JSON display */}
      <div className="mb-6">
        <div className="bg-gray-900/50 border border-white/20 rounded-lg p-4 max-h-96 overflow-auto">
          <pre className="text-green-300 text-sm font-mono whitespace-pre-wrap break-all">
            {getCurrentJSON()}
          </pre>
        </div>
        
        {/* JSON info */}
        <div className="flex justify-between items-center mt-2 text-sm text-white/60">
          <span>Size: {getJSONSize()}</span>
          <span>Fields: {getFieldCount()}</span>
          <span>Lines: {getCurrentJSON().split('\n').length}</span>
        </div>
      </div>

      {/* Data summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl text-blue-300">📚</div>
          <div className="text-white font-medium">{bookData.title ? '✓' : '✗'}</div>
          <div className="text-blue-200 text-sm">Title</div>
        </div>
        
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl text-green-300">📸</div>
          <div className="text-white font-medium">
            {Object.values(bookData.images).filter(img => img !== null).length}
          </div>
          <div className="text-green-200 text-sm">Images</div>
        </div>
        
        <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl text-purple-300">🏷️</div>
          <div className="text-white font-medium">
            {bookData.categories.main.length + bookData.tags.length}
          </div>
          <div className="text-purple-200 text-sm">Categories</div>
        </div>
        
        <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl text-orange-300">❤️</div>
          <div className="text-white font-medium">{bookData.rating}/5</div>
          <div className="text-orange-200 text-sm">Rating</div>
        </div>
      </div>

      {/* Database stats */}
      <div className="mb-6 p-4 bg-gray-500/20 border border-gray-500/30 rounded-lg">
        <h4 className="text-gray-200 font-medium mb-2">📊 Your Library Stats</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl text-gray-300">{stats.totalBooks}</div>
            <div className="text-gray-400 text-sm">Total Books</div>
          </div>
          <div className="text-center">
            <div className="text-2xl text-gray-300">{saved ? '✅' : '⏳'}</div>
            <div className="text-gray-400 text-sm">Current Book</div>
          </div>
          <div className="text-center">
            <div className="text-2xl text-gray-300">{exported ? '✅' : '📥'}</div>
            <div className="text-gray-400 text-sm">Exported</div>
          </div>
        </div>
      </div>

      {/* Success messages */}
      {saved && (
        <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="text-green-200 font-medium">Book Successfully Saved!</p>
              <p className="text-green-300/80 text-sm">
                "{bookData.title}" has been added to your library.
              </p>
            </div>
          </div>
        </div>
      )}

      {exported && (
        <div className="mb-4 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📥</span>
            <div>
              <p className="text-blue-200 font-medium">JSON Exported!</p>
              <p className="text-blue-300/80 text-sm">
                Your book data has been downloaded as a JSON file.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
        <p className="text-blue-200 text-sm">
          💡 <strong>Congratulations!</strong> You've successfully scanned your book. The JSON data contains all the information and can be imported into other systems or shared with others.
        </p>
      </div>
    </div>
  );
};

export default JSONStep;