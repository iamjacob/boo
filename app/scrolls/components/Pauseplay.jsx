'use client'
'use client';
import React, { useState } from 'react';
import { Maximize, Minimize, Music, Pause, Play } from 'lucide-react';

const Pauseplay = () => {
  const [isMaximized, setIsMaximized] = useState(false); // State for maximize/minimize toggle
  const [isPlaying, setIsPlaying] = useState(false); // State for play/pause toggle

  // Toggle maximize/minimize state
  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
    console.log(isMaximized ? 'Minimized' : 'Maximized'); // Debug message
  };

  // Toggle play/pause state
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    console.log(isPlaying ? 'Paused' : 'Playing'); // Debug message
  };

  return (
    <div className="bottomRightMenu absolute right-2 bottom-2 text-white p-1 flex gap-2">
      {/* Maximize/Minimize Button */}
      <div className="bg-[rgba(0,0,0,.6)] p-1 flex gap-2 rounded">
        <div
          className="camera cursor-pointer"
          title={isMaximized ? 'Minimize' : 'Maximize'}
          onClick={toggleMaximize}
        >
          {isMaximized ? <Minimize size={24} /> : <Maximize size={24} />}
        </div>
      </div>

      {/* Music Button */}
      <div className="bg-[rgba(0,0,0,.6)] p-1 flex gap-2 rounded">
        <div className="fullscreen cursor-pointer" title="Music">
          <Music size={24} />
        </div>
      </div>

      {/* Play/Pause Button */}
      <div className="bg-[rgba(0,0,0,.6)] p-1 flex gap-2 rounded">
        <div
          className="online cursor-pointer"
          title={isPlaying ? 'Pause' : 'Play'}
          onClick={togglePlayPause}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </div>
      </div>
    </div>
  );
};

export default Pauseplay;