import React, { useState, useEffect, useMemo } from 'react'
import ConfettiDopamine from "./components/ConfettiDopamine";
import { useLevelStore } from '../../stores/useLevelStore';
import { levelSettings } from '../../config/levelConfig';

// Separate component for countdown to prevent confetti rerender
const CountdownTimer = ({ startTime, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  
  useEffect(() => {
    if (!startTime) return;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.ceil((30000 - elapsed) / 1000));
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime, onComplete]);
  
  return (
    <div className="text-xs text-gray-500">
      🎊 Celebration ends in {timeLeft} seconds
    </div>
  );
};

const Levels = () => {
  const level = useLevelStore((s) => s.level);
  const showConfetti = useLevelStore((s) => s.showConfetti);
  const confettiStartTime = useLevelStore((s) => s.confettiStartTime);
  const stopConfetti = useLevelStore((s) => s.stopConfetti);
  
  // Get level settings for displaying unlocks and text
  const settings = levelSettings[level - 1] || {};

  const handleConfettiComplete = () => {
    stopConfetti();
  };

  // Memoize the confetti component to prevent rerenders
  const confettiComponent = useMemo(() => {
    if (!showConfetti) return null;
    
    return (
      <ConfettiDopamine 
        direction="up" 
        images={["/favicon/apple-touch-icon.png"]} 
        duration={30000}
        onComplete={handleConfettiComplete}
      />
    );
  }, [showConfetti]); // Only recreate when showConfetti changes

  return (
    <>

      {/* Level stigning fra useStore */}
      {/* Show confetti when level increases */}
      {showConfetti && (
        <>
          {/* Level up celebration display */}
          <div className="fixed inset-0 z-[10000] flex justify-center items-center pointer-events-none">
            <div className="w-[350px] h-auto p-6 z-[10001] bg-white/50 backdrop-blur rounded-xl shadow-2xl border-2 border-yellow-400">
              <h1 className="text-3xl font-bold text-center text-black mb-4">Level {level}!</h1>
              <p className="text-lg text-center text-gray-800 mb-4">🎉 Tillykke, du er nu på level {level}! 🎉</p>
              
              {/* Show unlocks if available */}
              <div className="unlocks">
                <h3 className="text-lg font-semibold text-black mb-2">New Unlocks:</h3>
                <ul className="space-y-1">
                  {settings.maps && <li className="text-sm text-gray-700">🗺️ Access to Maps</li>}
                  {settings.scroll && <li className="text-sm text-gray-700">📜 Scroll Feature</li>}
                  {settings.shelfTwo && <li className="text-sm text-gray-700">📚 Additional Shelf</li>}
                  <li className="text-sm text-gray-700">📖 Bigger shelf capacity</li>
                  <li className="text-sm text-gray-700">⭐ Increased verification level</li>
                </ul>
              </div>
              
              <div className="text-center mt-4">
                <CountdownTimer 
                  startTime={confettiStartTime} 
                  onComplete={handleConfettiComplete}
                />
              </div>
            </div>
          </div>
          
          {/* Confetti animation - runs for 30 seconds - memoized to prevent rerenders */}
          {confettiComponent}
          <a onClick={() => stopConfetti()} href="#closeLevelUp" className="fixed z-[1000] bg-gray/50 border-1 border p-2  top-10 right-2 text-gray-500 hover:text-gray-800">X</a>
        </>
      )}


    </>
  )
}

export default Levels