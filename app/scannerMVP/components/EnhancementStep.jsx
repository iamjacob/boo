import React, { useState } from 'react';
import useBookScannerStore from '../stores/useBookScannerStore';

const EnhancementStep = () => {
  const { bookData } = useBookScannerStore();
  const [selectedEnhancement, setSelectedEnhancement] = useState('none');
  const [processing, setProcessing] = useState(false);

  const enhancements = [
    {
      id: 'none',
      name: 'No Enhancement',
      icon: '✨',
      description: 'Keep images as-is',
      features: ['Original quality', 'Fastest processing'],
      preview: 'Original image quality maintained'
    },
    {
      id: 'basic',
      name: 'Basic Enhancement',
      icon: '🎨',
      description: 'Light improvements',
      features: ['Auto brightness', 'Color correction', 'Noise reduction'],
      preview: 'Improved brightness and colors'
    },
    {
      id: 'advanced',
      name: 'Advanced Enhancement',
      icon: '🚀',
      description: 'AI-powered improvements',
      features: ['Edge sharpening', 'Text enhancement', 'Background cleanup', 'Perspective correction'],
      preview: 'Professional quality enhancement'
    },
    {
      id: 'ocr',
      name: 'OCR Text Extraction',
      icon: '📝',
      description: 'Extract text from images',
      features: ['Title recognition', 'Author detection', 'ISBN extraction', 'Text searchable'],
      preview: 'Text extracted and digitized'
    }
  ];

  const handleEnhancement = async (enhancementId) => {
    setSelectedEnhancement(enhancementId);
    
    if (enhancementId === 'none') return;
    
    setProcessing(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setProcessing(false);
    
    // Show completion message
    alert(`${enhancements.find(e => e.id === enhancementId)?.name} completed!`);
  };

  const getImageCount = () => {
    return Object.values(bookData.images).filter(img => img !== null).length;
  };

  const hasImages = getImageCount() > 0;

  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-xl p-8 max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">✨ Image Enhancement</h2>
        <p className="text-white/80">Improve your book images with AI processing</p>
      </div>

      {!hasImages ? (
        <div className="text-center p-12">
          <div className="text-6xl mb-4">📸</div>
          <h3 className="text-xl text-white mb-2">No Images to Enhance</h3>
          <p className="text-white/70 mb-6">
            You need to capture some book images first before you can enhance them.
          </p>
          <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-200 text-sm">
              💡 Go back to the previous step to add images, or skip this step to continue.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Image preview grid */}
          <div className="mb-8">
            <h3 className="text-white font-medium mb-4">📷 Your Images ({getImageCount()})</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(bookData.images).map(([type, image]) => {
                if (!image) return null;
                return (
                  <div key={type} className="relative">
                    <img
                      src={image}
                      alt={`${type} view`}
                      className="w-full h-32 object-cover rounded-lg border border-white/30"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm capitalize">
                      {type}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enhancement options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {enhancements.map((enhancement) => (
              <div
                key={enhancement.id}
                className={`p-6 rounded-lg border transition-all cursor-pointer ${
                  selectedEnhancement === enhancement.id
                    ? 'bg-blue-500/30 border-blue-400'
                    : 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/40'
                }`}
                onClick={() => handleEnhancement(enhancement.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{enhancement.icon}</div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-lg mb-2">
                      {enhancement.name}
                    </h4>
                    <p className="text-white/70 text-sm mb-3">
                      {enhancement.description}
                    </p>
                    
                    {/* Features list */}
                    <ul className="space-y-1 mb-3">
                      {enhancement.features.map((feature, index) => (
                        <li key={index} className="text-white/60 text-sm flex items-center">
                          <span className="w-1 h-1 bg-white/60 rounded-full mr-2"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    {/* Preview text */}
                    <div className="text-xs text-blue-300 italic">
                      {enhancement.preview}
                    </div>
                  </div>
                </div>
                
                {/* Selection indicator */}
                {selectedEnhancement === enhancement.id && (
                  <div className="mt-4 flex items-center justify-center">
                    <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      <span>✓</span>
                      <span>Selected</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Processing indicator */}
          {processing && (
            <div className="mb-6 p-6 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-300/30 border-t-yellow-300"></div>
                <div>
                  <p className="text-yellow-200 font-medium">Processing Images...</p>
                  <p className="text-yellow-300/80 text-sm">
                    Applying {enhancements.find(e => e.id === selectedEnhancement)?.name}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Enhancement results */}
          {selectedEnhancement !== 'none' && !processing && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-green-200 font-medium">Enhancement Complete!</p>
                  <p className="text-green-300/80 text-sm">
                    Applied {enhancements.find(e => e.id === selectedEnhancement)?.name} to {getImageCount()} images
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-center">
              <div className="text-2xl text-blue-300">{getImageCount()}</div>
              <div className="text-blue-200 text-sm">Images</div>
            </div>
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 text-center">
              <div className="text-2xl text-purple-300">
                {selectedEnhancement === 'none' ? '0%' : '100%'}
              </div>
              <div className="text-purple-200 text-sm">Enhanced</div>
            </div>
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center">
              <div className="text-2xl text-green-300">
                {selectedEnhancement === 'ocr' ? '📝' : '🎨'}
              </div>
              <div className="text-green-200 text-sm">AI Features</div>
            </div>
            <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 text-center">
              <div className="text-2xl text-orange-300">⚡</div>
              <div className="text-orange-200 text-sm">Fast Process</div>
            </div>
          </div>
        </>
      )}

      {/* Tips */}
      <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
        <p className="text-blue-200 text-sm">
          💡 <strong>Tips:</strong> Enhancement is optional but recommended for better quality. OCR can automatically extract book details from images!
        </p>
      </div>
    </div>
  );
};

export default EnhancementStep;