'use client';
import React, { useState } from 'react';
import bookScanData from '../[username]/bookProfile.json'; // the big JSON we built

export default function BookScanStepper() {
  const phases = bookScanData.phases;
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentSubStep, setCurrentSubStep] = useState(null);

  const handlePhaseClick = (index) => {
    setCurrentPhase(index);
    setCurrentSubStep(null); // reset when switching phases
  };

  const currentPhaseData = phases[currentPhase];
  const subSteps = currentPhaseData.children || [];

  return (
    <div className="flex flex-col items-center w-full mt-8 space-y-8">
      {/* === PHASE INDICATOR === */}
      <div className="flex justify-center items-center space-x-3 bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
        {phases.map((phase, index) => (
          <React.Fragment key={phase.id}>
            <div
              className={`flex flex-col items-center cursor-pointer transition-all ${
                index === currentPhase ? 'scale-110' : 'opacity-80'
              }`}
              onClick={() => handlePhaseClick(index)}
            >
              <div
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all
                ${
                  index < currentPhase
                    ? 'bg-green-600 text-white'
                    : index === currentPhase
                    ? 'bg-gray-300 text-black'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {phase.name}
                {index < currentPhase && <span className="ml-1">✓</span>}
              </div>
            </div>
            {index < phases.length - 1 && (
              <div
                className={`w-8 h-[2px] ${
                  index < currentPhase ? 'bg-green-600' : 'bg-gray-400'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* === SUBSTEPS (EXPANDS WHEN PHASE SELECTED) === */}
      <div className="flex flex-col items-center w-full space-y-4">
        <h3 className="text-gray-100 text-lg font-semibold">{currentPhaseData.name}</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {subSteps.map((step, i) => (
            <SubStepBubble
              key={step.id}
              step={step}
              index={i}
              isActive={currentSubStep === step.id}
              setCurrentSubStep={setCurrentSubStep}
              parentDone={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* === SUBSTEP COMPONENT === */
function SubStepBubble({ step, index, isActive, setCurrentSubStep, parentDone }) {
  const [open, setOpen] = useState(false);
  const hasChildren = step.children && step.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      <div
        onClick={() => (hasChildren ? setOpen(!open) : setCurrentSubStep(step.id))}
        className={`px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-all
          ${
            isActive
              ? 'bg-gray-300 text-black scale-105'
              : parentDone
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-500'
          }
        `}
      >
        {step.name}
        {step.optional && <span className="ml-1 text-[10px] text-gray-400">(opt)</span>}
      </div>

      {/* nested children (e.g., Dust Jacket → Front/Spine/Back) */}
      {open && hasChildren && (
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {step.children.map((child) => (
            <SubStepBubble
              key={child.id}
              step={child}
              index={index}
              isActive={isActive}
              setCurrentSubStep={setCurrentSubStep}
              parentDone={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
