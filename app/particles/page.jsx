'use client'
import React, { useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import ParticleBook from './components/ParticleBook'
import ParticleSystem3D from './components/ParticleSystem3D'
import { useParticleStore } from '../../stores/useParticleStore'

// Sample book data for testing
const sampleBookData = {
  id: "learningweb",
  title: "Learning Web Development",
  cover: "./covers/learningweb.webp",
  scale: {
    width: 2,
    height: 3,
    thickness: 0.3
  }
}

// Animation controller component
const ParticleController = ({ targetProgress, onProgressUpdate }) => {
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
  const [isParticleMode, setIsParticleMode] = useState(false)
  const [particleProgress, setParticleProgress] = useState(0)
  const [targetProgress, setTargetProgress] = useState(0)

  // Get particle store state
  const isFormingBook = useParticleStore((s) => s.isFormingBook)
  const formingBookData = useParticleStore((s) => s.formingBookData)
  const startBookFormation = useParticleStore((s) => s.startBookFormation)
  const completeBookFormation = useParticleStore((s) => s.completeBookFormation)

  const handleSwitchToParticles = () => {
    setIsParticleMode(true)
    setTargetProgress(1)
    startBookFormation(sampleBookData)
  }

  const handleSwitchToBook = () => {
    setTargetProgress(0)
    setTimeout(() => {
      setIsParticleMode(false)
      completeBookFormation()
    }, 1000) // Wait for animation to complete
  }

  const handleProgressUpdate = (progress) => {
    setParticleProgress(progress)
  }

  return (
    <div className="w-full h-screen bg-gray-900 relative">
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 space-x-4">
        <button
          onClick={handleSwitchToParticles}
          disabled={isParticleMode}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-semibold transition-colors"
        >
          {isParticleMode ? 'Particles Active' : 'Switch to Particles'}
        </button>
        <button
          onClick={handleSwitchToBook}
          disabled={!isParticleMode}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-colors"
        >
          Switch to Book
        </button>
      </div>

      {/* Progress indicator */}
      <div className="absolute top-20 left-4 z-10 text-white">
        <div className="text-sm mb-2">
          Mode: {isParticleMode ? 'Particles' : 'Book'} | Progress: {Math.round(particleProgress * 100)}%
        </div>
        <div className="w-48 h-2 bg-gray-700 rounded">
          <div 
            className="h-full bg-purple-500 rounded transition-all duration-100"
            style={{ width: `${particleProgress * 100}%` }}
          />
        </div>
      </div>

      {/* Book info */}
      <div className="absolute top-32 left-4 z-10 text-white text-sm">
        <div>Book: {sampleBookData.title}</div>
        <div>Colors extracted from: {sampleBookData.cover}</div>
        <div>Store state: {isFormingBook ? 'Forming' : 'Idle'}</div>
        <div>🔥 Ultra High-Res 3D Particle Field (200+ resolution)</div>
        <div>📖 All 6 faces: Cover, Back, Spine, Sides, Edges</div>
        <div>📏 Size matches book dimensions exactly</div>
        <div>🎨 Face-specific colors and sizing</div>
      </div>

      {/* R3F Canvas */}
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }} gl={{ antialias: true }}>
        {/* Lighting setup */}
        <ambientLight intensity={0.4} />
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
        
        <ParticleController 
          targetProgress={targetProgress}
          onProgressUpdate={handleProgressUpdate}
        />
        
        {/* Book Component */}
        <ParticleBook 
          bookData={sampleBookData}
          isParticleMode={isParticleMode}
          particleProgress={particleProgress}
        />
        
        {/* Particle System */}
        <ParticleSystem3D 
          bookData={sampleBookData}
          isParticleMode={isParticleMode}
          particleProgress={particleProgress}
        />
        
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