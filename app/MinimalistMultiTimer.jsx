'use client';
import { useState, useEffect } from 'react';

export default function MinimalistMultiTimer() {
  const [mode, setMode] = useState('clock'); // 'clock', 'stopwatch', 'timer'
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [timerTime, setTimerTime] = useState(0);
  const [timerInput, setTimerInput] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Stopwatch update
  useEffect(() => {
    let interval = null;
    if (isStopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchTime(prev => prev + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isStopwatchRunning]);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerTime > 0) {
      interval = setInterval(() => {
        setTimerTime(prev => {
          if (prev <= 1000) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerTime]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('da-DK', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatStopwatch = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const formatTimer = (ms) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStopwatch = () => {
    setIsStopwatchRunning(!isStopwatchRunning);
  };

  const resetStopwatch = () => {
    setStopwatchTime(0);
    setIsStopwatchRunning(false);
  };

  const startTimer = () => {
    const [minutes, seconds = 0] = timerInput.split(':').map(Number);
    const totalMs = (minutes * 60 + seconds) * 1000;
    setTimerTime(totalMs);
    setIsTimerRunning(true);
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setTimerTime(0);
    setIsTimerRunning(false);
  };

  return (
    <div className="h-screen w-full bg-black flex flex-col">
      {/* Mode selector */}
      <div className="flex justify-center pt-8 pb-4">
        <div className="flex bg-gray-900 rounded-full p-1">
          {['clock', 'stopwatch', 'timer'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                mode === m 
                  ? 'bg-white text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {m === 'clock' ? 'Ur' : m === 'stopwatch' ? 'Stopur' : 'Timer'}
            </button>
          ))}
        </div>
      </div>

      {/* Main display */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-8xl md:text-[10rem] lg:text-[12rem] font-thin tracking-tight font-mono select-none mb-8">
            {mode === 'clock' && formatTime(currentTime)}
            {mode === 'stopwatch' && formatStopwatch(stopwatchTime)}
            {mode === 'timer' && (timerTime > 0 ? formatTimer(timerTime) : '00:00')}
          </div>

          {/* Controls */}
          {mode === 'stopwatch' && (
            <div className="flex justify-center gap-8">
              <button
                onClick={handleStopwatch}
                className="w-20 h-20 rounded-full bg-green-600 hover:bg-green-500 text-white font-medium transition-colors"
              >
                {isStopwatchRunning ? 'Stop' : 'Start'}
              </button>
              <button
                onClick={resetStopwatch}
                className="w-20 h-20 rounded-full bg-gray-600 hover:bg-gray-500 text-white font-medium transition-colors"
              >
                Reset
              </button>
            </div>
          )}

          {mode === 'timer' && (
            <div className="flex flex-col items-center gap-6">
              {timerTime === 0 && !isTimerRunning && (
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="5:00"
                    value={timerInput}
                    onChange={(e) => setTimerInput(e.target.value)}
                    className="bg-gray-900 text-white text-center py-3 px-4 rounded-lg text-xl w-32 focus:outline-none focus:bg-gray-800"
                  />
                  <button
                    onClick={startTimer}
                    disabled={!timerInput}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Start
                  </button>
                </div>
              )}
              
              {timerTime > 0 && (
                <div className="flex justify-center gap-8">
                  <button
                    onClick={toggleTimer}
                    className="w-20 h-20 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
                  >
                    {isTimerRunning ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    onClick={resetTimer}
                    className="w-20 h-20 rounded-full bg-gray-600 hover:bg-gray-500 text-white font-medium transition-colors"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Timer completed notification */}
      {mode === 'timer' && timerTime === 0 && !isTimerRunning && timerInput && (
        <div className="absolute inset-0 bg-red-900 bg-opacity-90 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-6xl font-bold mb-4">Tid udløbet!</div>
            <button
              onClick={() => setTimerInput('')}
              className="px-8 py-4 bg-white text-black rounded-lg font-medium text-xl"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}