'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import DissolveBook from './components/DissolveBook'

// Animation controller component
const DissolveController = ({ targetProgress, onProgressUpdate }) => {
  const progressRef = useRef(0)
  
  useFrame(() => {
    // Smooth interpolation towards target
    const speed = 0.02
    const diff = targetProgress - progressRef.current
    
    if (Math.abs(diff) > 0.001) {
      progressRef.current += diff * speed
      onProgressUpdate(progressRef.current)
    }
  })
  
  return null
}

const page = () => {
  const [dissolveProgress, setDissolveProgress] = useState(0)
  const [targetProgress, setTargetProgress] = useState(0)
  const [isDissolving, setIsDissolving] = useState(false)

  const handleDissolve = () => {
    setTargetProgress(1)
    setIsDissolving(true)
  }

  const handleReset = () => {
    setTargetProgress(0)
    setIsDissolving(false)
  }

  const handleProgressUpdate = (progress) => {
    setDissolveProgress(progress)
  }

    useEffect(() => {
    const splash = document.getElementById("splash");

    if (splash) {
      splash.classList.add("fade-out");
      setTimeout(() => splash.remove(), 1200);
    }
  }, []);

  return (
    <div className="w-full h-screen bg-gray-900 relative">
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 space-x-4">
        <button
          onClick={handleDissolve}
          disabled={isDissolving}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-semibold transition-colors"
        >
          {isDissolving ? 'Dissolving...' : 'Dissolve Book'}
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Progress indicator */}
      <div className="absolute top-20 left-4 z-10 text-white">
        <div className="text-sm mb-2">Dissolve Progress: {Math.round(dissolveProgress * 100)}%</div>
        <div className="w-48 h-2 bg-gray-700 rounded">
          <div 
            className="h-full bg-red-500 rounded transition-all duration-100"
            style={{ width: `${dissolveProgress * 100}%` }}
          />
        </div>
      </div>

      {/* R3F Canvas */}
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }} gl={{ antialias: true }}>
        {/* Lighting setup */}
        <ambientLight intensity={0.3} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[10, 10, 10]} intensity={0.6} color="#ffaa44" />
        <pointLight position={[-10, -10, -10]} color="#4488ff" intensity={0.4} />
        <pointLight position={[0, -5, 0]} color="#ff4400" intensity={0.3} />
        
        {/* Fog for atmosphere */}
        <fog attach="fog" args={['#1a1a1a', 8, 20]} />
        
        <DissolveController 
          targetProgress={targetProgress}
          onProgressUpdate={handleProgressUpdate}
        />
        
        <DissolveBook dissolveProgress={dissolveProgress} />
        
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  )
}

export default page