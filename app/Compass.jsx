import React, { useState, useEffect } from 'react';

const Compass = () => {
  const [heading, setHeading] = useState(0);
  const [accuracy, setAccuracy] = useState(null);
  const [isCalibrated, setIsCalibrated] = useState(true);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState('checking');
  const [displayHeading, setDisplayHeading] = useState(0);

  useEffect(() => {
    let watchId = null;

    const initCompass = async () => {
      // Check for DeviceOrientationEvent support
      if (!window.DeviceOrientationEvent) {
        setError('Device orientation not supported');
        setPermission('denied');
        return;
      }

      // Request permission for iOS 13+
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission !== 'granted') {
            setError('Permission denied for device orientation');
            setPermission('denied');
            return;
          }
        } catch (error) {
          setError('Error requesting permission: ' + error.message);
          setPermission('denied');
          return;
        }
      }

      setPermission('granted');

      // Handle device orientation
      const handleOrientation = (event) => {
        if (event.webkitCompassHeading !== undefined) {
          // iOS Safari
          setHeading(event.webkitCompassHeading);
          setAccuracy(event.webkitCompassAccuracy);
        } else if (event.alpha !== null) {
          // Android Chrome and others
          let alpha = event.alpha;
          if (alpha < 0) alpha += 360;
          setHeading(360 - alpha);
        } else {
          setError('Compass data not available');
        }
      };

      window.addEventListener('deviceorientation', handleOrientation);

      // Fallback: try to use Geolocation API for heading
      if (navigator.geolocation && navigator.geolocation.watchPosition) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            if (position.coords.heading !== null) {
              setHeading(position.coords.heading);
              setAccuracy(position.coords.headingAccuracy);
            }
          },
          (error) => console.log('Geolocation error:', error),
          { enableHighAccuracy: true }
        );
      }

      return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
        if (watchId) navigator.geolocation.clearWatch(watchId);
      };
    };

    initCompass();

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const requestPermission = async () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          setPermission('granted');
          setError(null);
          window.location.reload(); // Restart the compass
        } else {
          setError('Permission denied');
          setPermission('denied');
        }
      } catch (error) {
        setError('Error requesting permission: ' + error.message);
      }
    }
  };

  // Direction labels with their angles
  const directions = [
    { label: 'N', angle: 0, main: true },
    { label: 'NE', angle: 45, main: false },
    { label: 'E', angle: 90, main: true },
    { label: 'SE', angle: 135, main: false },
    { label: 'S', angle: 180, main: true },
    { label: 'SW', angle: 225, main: false },
    { label: 'W', angle: 270, main: true },
    { label: 'NW', angle: 315, main: false }
  ];

  // Generate tick marks for degrees
  const generateTicks = () => {
    const ticks = [];
    for (let i = 0; i < 360; i += 5) {
      const isMainTick = i % 30 === 0;
      const tickLength = isMainTick ? 15 : 8;
      const tickWidth = isMainTick ? 2 : 1;
      
      ticks.push(
        <line
          key={i}
          x1="0"
          y1={-140}
          x2="0"
          y2={-140 + tickLength}
          stroke="white"
          strokeWidth={tickWidth}
          transform={`rotate(${i})`}
          opacity={0.7}
        />
      );
    }
    return ticks;
  };

  // Get cardinal direction from heading
  const getCardinalDirection = (deg) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
  };

  const accuracyColor = accuracy !== null 
    ? accuracy < 10 ? '#00ff00' 
    : accuracy < 25 ? '#ffff00' 
    : '#ff6600'
    : '#666';

  // // Permission/Error screen
  // if (permission === 'checking') {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4 mx-auto"></div>
  //         <p className="text-lg">Checking compass availability...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (permission === 'denied' || error) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
  //       <div className="text-center max-w-md">
  //         <div className="text-6xl mb-4">🧭</div>
  //         <h2 className="text-xl font-bold mb-4">Compass Access Required</h2>
  //         {error && <p className="text-red-400 mb-4">{error}</p>}
  //         <p className="text-gray-300 mb-6">
  //           This compass needs access to your device's orientation sensors to work properly.
  //         </p>
  //         {typeof DeviceOrientationEvent.requestPermission === 'function' && (
  //           <button
  //             onClick={requestPermission}
  //             className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
  //           >
  //             Enable Compass
  //           </button>
  //         )}
  //         <div className="mt-6 text-sm text-gray-400">
  //           <p>📱 Make sure you're on a mobile device</p>
  //           <p>🔒 HTTPS connection required</p>
  //           <p>🌐 Some browsers may not support this feature</p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    // <div className="flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div>



        {/* Main compass circle */}
        <svg width="320" height="320" className="drop-shadow-2xl invert">
          {/* Outer ring gradient */}
          <defs>
            <radialGradient id="compassGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
            <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#374151" />
              <stop offset="100%" stopColor="#1f2937" />
            </radialGradient>
          </defs>
          
          
          {/* Rotate the entire compass based on heading */}
          <g transform={`translate(160, 160) rotate(${-displayHeading})`}>
            {/* Tick marks */}
            {generateTicks()}
            
            {/* Direction labels */}
            {directions.map(({ label, angle, main }) => (
              <g key={label} transform={`rotate(${angle})`}>
                <text
                  x="0"
                  y={-115}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={main ? '#fff' : '#cbd5e1'}
                  fontSize={main ? '18' : '14'}
                  fontWeight={main ? 'bold' : 'normal'}
                  className="select-none"
                >
                  {label}
                </text>
                {main && (
                  <circle
                    cx="0"
                    cy={-130}
                    r="3"
                    fill={label === 'N' ? '#ef4444' : '#fff'}
                  />
                )}
              </g>
            ))}
          </g>
          
          {/* Center pivot point */}
          {/* <circle 
            cx="160" 
            cy="160" 
            r="8" 
            fill="url(#centerGradient)"
            stroke="#9ca3af"
            strokeWidth="2"
          /> */}
          
          {/* Compass needle */}
          <g transform="translate(160, 160)">
            {/* North pointer (red) */}
            <polygon
              points="0,-100 -8,-20 8,-20"
              fill="#ef4444"
              stroke="#dc2626"
              strokeWidth="1"
              className="drop-shadow-lg"
            />
            {/* South pointer (white) */}
            <polygon
              points="0,100 -8,20 8,20"
              fill="#f8fafc"
              stroke="#e2e8f0"
              strokeWidth="1"
              className="drop-shadow-lg"
            />
            {/* Center dot */}
            <circle cx="0" cy="0" r="4" fill="#374151" stroke="#9ca3af" strokeWidth="1" />
          </g>
        </svg>


      {/* Digital display
      <div className="mt-6 bg-black/50 backdrop-blur-sm rounded-lg p-4 min-w-[280px]">
        <div className="text-center space-y-2">
          <div className="text-3xl font-mono font-bold">
            {Math.round(heading)}°
          </div>
          <div className="text-lg text-blue-400">
            {getCardinalDirection(heading)}
          </div>
          {accuracy !== null && (
            <div className="flex items-center justify-center space-x-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{backgroundColor: accuracyColor}}></div>
              <span>Accuracy: ±{Math.round(accuracy)}°</span>
            </div>
          )}
          {!isCalibrated && (
            <div className="text-yellow-400 text-sm animate-pulse">
              ⚠ Calibration needed - Move in figure-8 pattern
            </div>
          )}
        </div>
      </div> */}
      
      {/* Test controls 
      <div className="mt-6 flex space-x-4">
        <button
          onClick={() => setDisplayHeading(0)}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm transition-colors"
        >
          North
        </button>
        <button
          onClick={() => setDisplayHeading(90)}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm transition-colors"
        >
          East
        </button>
        <button
          onClick={() => setDisplayHeading(180)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition-colors"
        >
          South
        </button>
        <button
          onClick={() => setDisplayHeading(270)}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm transition-colors"
        >
          West
        </button>
      </div>
    </div>*/}

      </div>

  );
};

export default Compass;