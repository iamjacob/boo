import React, { useState, useRef, useEffect } from 'react';

export default function InteractiveStepper({step, setStep}) {
  const [stepper, setStepper] = useState(1);
  const scrollContainerRef = useRef(null);
  const activeStepRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const steps = [
    { id: 1, content: 'Title' },
    { id: 2, content: 'Author' },
    { id: 3, content: 'Year' },
    { id: 4, content: 'Size' },
    { id: 5, content: 'Weight' },
    { id: 6, content: 'Cover Method' },
    { id: 7, content: 'Cover Crop' },
    { id: 8, content: 'Preview' },
    { id: 9, content: 'Add More' },
    { id: 10, content: 'Add to Collection' },
    { id: 11, content: 'Thanks!' },
  ];

  useEffect(() => {
    if (activeStepRef.current && scrollContainerRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [stepper]);

  const handleperClick = (perId) => {
    setper(stepId);
  };

  const handleNext = () => {
    if (stepper < steps.length) {
      setStep(stepper + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleStepClick = (sId) => {
    setStep(sId);
  };

  // Touch and mouse drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Prevent click events when dragging
  const handleStepClickWithDrag = (sId, e) => {
    if (isDragging) {
      e.preventDefault();
      return;
    }
    setStep(sId);
  };

  return (
    <div className="bg-white/70 p-1 sm:p-2 rounded-lg max-w-full overflow-hidden">
      <div className="">
      
    

        {/* Stepper Container */}
        <div className="mb-2 sm:mb-4">
          <div 
            ref={scrollContainerRef}
            className={`overflow-x-auto pb-2 scrollbar-hide select-none cursor-pointer`}
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex items-center justify-start min-w-max px-2 gap-1 sm:gap-2">
              {steps.map((s, index) => (
                <React.Fragment key={s.id}>
                  {/* Step Circle */}
                  <div
                    ref={s.id === step ? activeStepRef : null}
                    onClick={(e) => handleStepClickWithDrag(s.id, e)}
                    className="flex flex-col items-center cursor-pointer group touch-manipulation flex-shrink-0"
                  >
                    <div
                      className={`
                        w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center
                        transition-all duration-200 text-xs font-light border
                        ${s.id < step 
                          ? 'bg-neutral-800 border-neutral-800 text-white' 
                          : s.id === step
                          ? 'bg-neutral-800 border-neutral-800 text-white'
                          : 'bg-white border-neutral-300 text-neutral-400 group-hover:border-neutral-400'
                        }
                      `}
                    >
                      {s.id < step ? (
                        <span className="text-xs">✓</span>
                      ) : (
                        <span className="text-xs">{s.id}</span>
                      )}
                    </div>
                    
                    <div className={`
                      mt-1 text-xs sm:text-xs md:text-sm font-light text-center whitespace-nowrap transition-colors duration-200 max-w-[60px] sm:max-w-[80px] md:max-w-none truncate
                      ${s.id === step 
                        ? 'text-neutral-800' 
                        : s.id < step
                        ? 'text-neutral-500'
                        : 'text-neutral-400 group-hover:text-neutral-500'
                      }
                    `}>
                      {s.content}
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="flex-shrink-0 mx-1 sm:mx-2 mb-4">
                      <div
                        className={`
                          h-px w-4 sm:w-6 md:w-8 transition-colors duration-300
                          ${s.id < step 
                            ? 'bg-neutral-800' 
                            : 'bg-neutral-200'
                          }
                        `}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
{/* 
        <div className="mb-12 border-t border-neutral-200 pt-12">
          <div>
            <h2 className="text-xl font-light text-neutral-800 mb-2">
              {steps[step - 1].content}
            </h2>
            <p className="text-sm text-neutral-500 mb-12 font-light">
              Step {step} of {steps.length}
            </p>
            
            <div className="h-64 bg-neutral-50 flex items-center justify-center">
              <span className="text-neutral-300 text-sm font-light">Form content</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center border-t border-neutral-200 pt-8">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className={`
              px-8 py-3 text-sm font-light tracking-wide transition-colors duration-200
              ${step === 1
                ? 'text-neutral-300 cursor-not-allowed'
                : 'text-neutral-800 hover:text-neutral-600'
              }
            `}
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={step === steps.length}
            className={`
              px-8 py-3 text-sm font-light tracking-wide transition-colors duration-200
              ${step === steps.length
                ? 'text-neutral-300 cursor-not-allowed'
                : 'text-neutral-800 hover:text-neutral-600'
              }
            `}
          >
            {step === steps.length ? 'Complete' : 'Next'}
          </button>
        </div>
      </div> */}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Mobile touch scrolling improvements */
        @media (max-width: 640px) {
          .scrollbar-hide {
            scroll-snap-type: x proximity;
            -webkit-overflow-scrolling: touch;
          }
        }
        
        /* Prevent text selection during drag */
        .select-none {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>
    </div>
    </div>
  );
}