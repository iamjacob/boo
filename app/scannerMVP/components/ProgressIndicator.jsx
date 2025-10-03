import React from 'react';
import useBookScannerStore from '../stores/useBookScannerStore';

const ProgressIndicator = () => {
  const { currentStep, maxSteps, setCurrentStep, canProceedFromStep, bookData } = useBookScannerStore();

  const steps = [
    { number: 1, name: 'Title', icon: '📖', required: true },
    { number: 2, name: 'Author', icon: '✍️', required: true },
    { number: 3, name: 'Year', icon: '📅', required: false },
    { number: 4, name: 'Size', icon: '📏', required: true },
    { number: 5, name: 'Weight', icon: '⚖️', required: false },
    { number: 6, name: 'Cover', icon: '📸', required: true },
    { number: 7, name: 'Images', icon: '🖼️', required: false },
    { number: 8, name: 'Enhance', icon: '✨', required: false },
    { number: 9, name: 'Language', icon: '🌍', required: true },
    { number: 10, name: 'Categories', icon: '🏷️', required: false },
    { number: 11, name: 'Preview', icon: '👀', required: false },
    { number: 12, name: 'Export', icon: '📄', required: false }
  ];

  const getStepStatus = (stepNumber) => {
    if (stepNumber < currentStep) {
      return canProceedFromStep(stepNumber) ? 'completed' : 'skipped';
    } else if (stepNumber === currentStep) {
      return 'current';
    } else {
      return 'upcoming';
    }
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500 border-green-400';
      case 'current': return 'bg-blue-500 border-blue-400';
      case 'skipped': return 'bg-yellow-500 border-yellow-400';
      case 'upcoming': return 'bg-gray-600 border-gray-500';
      default: return 'bg-gray-600 border-gray-500';
    }
  };

  const handleStepClick = (stepNumber) => {
    // Allow navigation to previous steps or current step
    if (stepNumber <= currentStep) {
      setCurrentStep(stepNumber);
    }
  };

  const canSkipAfterStep = (stepNumber) => {
    // Can skip after completing title and cover (steps 1 and 6)
    return bookData.title && bookData.coverMethod && stepNumber >= 6;
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 mb-6">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/80 text-sm font-medium">Progress</span>
          <span className="text-white/80 text-sm">
            {currentStep}/{maxSteps}
            {canSkipAfterStep(currentStep) && (
              <span className="ml-2 text-yellow-300 text-xs">(Can skip remaining)</span>
            )}
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / maxSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Desktop step indicators */}
      <div className="hidden lg:flex justify-between items-center">
        {steps.map((step) => {
          const status = getStepStatus(step.number);
          const canClick = step.number <= currentStep;
          
          return (
            <button
              key={step.number}
              onClick={() => handleStepClick(step.number)}
              disabled={!canClick}
              className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                canClick ? 'cursor-pointer hover:bg-white/10' : 'cursor-not-allowed opacity-50'
              }`}
              title={`${step.name} ${step.required ? '(Required)' : '(Optional)'}`}
            >
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-white font-medium text-sm mb-1 ${getStepColor(status)}`}>
                {status === 'completed' ? '✓' : 
                 status === 'skipped' ? '⊘' : 
                 step.number}
              </div>
              <span className="text-white/70 text-xs text-center">{step.name}</span>
              {step.required && (
                <span className="text-red-400 text-xs">*</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile step indicators */}
      <div className="lg:hidden">
        <div className="flex items-center justify-center gap-2 mb-3">
          {steps.map((step) => {
            const status = getStepStatus(step.number);
            const canClick = step.number <= currentStep;
            
            return (
              <button
                key={step.number}
                onClick={() => handleStepClick(step.number)}
                disabled={!canClick}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-white font-medium text-xs transition-all ${
                  getStepColor(status)
                } ${canClick ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
              >
                {status === 'completed' ? '✓' : 
                 status === 'skipped' ? '⊘' : 
                 step.number}
              </button>
            );
          })}
        </div>
        
        {/* Current step info */}
        <div className="text-center">
          <div className="text-white font-medium mb-1">
            {steps[currentStep - 1]?.icon} {steps[currentStep - 1]?.name}
          </div>
          <div className="text-white/60 text-sm">
            Step {currentStep} of {maxSteps}
            {steps[currentStep - 1]?.required ? ' (Required)' : ' (Optional)'}
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/20">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white/80 hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        <div className="text-center">
          <div className="text-white/60 text-sm">
            {steps.filter(s => getStepStatus(s.number) === 'completed').length} completed
          </div>
        </div>

        <button
          onClick={() => setCurrentStep(Math.min(maxSteps, currentStep + 1))}
          disabled={currentStep === maxSteps}
          className="px-4 py-2 bg-blue-500/30 border border-blue-500/50 rounded-lg text-blue-200 hover:bg-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>

      {/* Skip option for optional steps */}
      {!steps[currentStep - 1]?.required && currentStep > 1 && (
        <div className="mt-3 text-center">
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="text-yellow-300 hover:text-yellow-200 text-sm underline"
          >
            Skip this step (optional)
          </button>
        </div>
      )}

      {/* Quick skip to end if minimum requirements met */}
      {canSkipAfterStep(currentStep) && currentStep < maxSteps - 1 && (
        <div className="mt-3 text-center">
          <button
            onClick={() => setCurrentStep(maxSteps - 1)} // Go to preview
            className="text-green-300 hover:text-green-200 text-sm underline"
          >
            🚀 Skip to Preview (minimum data collected)
          </button>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;