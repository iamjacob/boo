'use client';

import React from 'react';
import useBookScannerStore from './stores/useBookScannerStore';
import ProgressIndicator from './components/ProgressIndicator';
import TitleStep from './components/TitleStep';
import AuthorStep from './components/AuthorStep';
import YearStep from './components/YearStep';
import SizeStep from './components/SizeStep';
import WeightStep from './components/WeightStep';
import CoverStep from './components/CoverStep';
import ImageStep from './components/ImageStep';
import EnhancementStep from './components/EnhancementStep';
import LanguageStep from './components/LanguageStep';
import CategoriesStep from './components/CategoriesStep';
import PreviewStep from './components/PreviewStep';
import JSONStep from './components/JSONStep';

const BookScannerPage = () => {
  const { currentStep } = useBookScannerStore();

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <TitleStep />;
      case 2:
        return <AuthorStep />;
      case 3:
        return <YearStep />;
      case 4:
        return <SizeStep />;
      case 5:
        return <WeightStep />;
      case 6:
        return <CoverStep />;
      case 7:
        return <ImageStep />;
      case 8:
        return <EnhancementStep />;
      case 9:
        return <LanguageStep />;
      case 10:
        return <CategoriesStep />;
      case 11:
        return <PreviewStep />;
      case 12:
        return <JSONStep />;
      default:
        return <TitleStep />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            📚 Super Pro Book Scanner
          </h1>
          <p className="text-white/80 text-lg">
            Professional book digitization with multi-file upload, AI enhancement, and smart categorization
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator />

        {/* Current Step */}
        <div className="mb-8">
          {renderCurrentStep()}
        </div>

        {/* Footer */}
        <div className="text-center text-white/60 text-sm">
          <p>
            🚀 Enhanced with Zustand state management, Google Books API, and modular architecture
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookScannerPage;