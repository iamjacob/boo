'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import ParticleBook from './components/ParticleBook'
import ParticleSystem3D from './components/ParticleSystem3D'
import { useParticleStore } from '../../stores/useParticleStore'

// Sample book data for testing - Better size matching
const sampleBookData = {
  id: "learningweb",
  title: "Learning Web Development",
  cover: "./covers/learningweb.webp",
  scale: {
    width: 0.4,      // Match particle system width
    height: 0.75,     // Match particle system height
    thickness: 0.2 // Match particle system thickness
  }
}

// Animation controller component
const ParticleController = ({ targetProgress, onProgressUpdate }) => {
  const progressRef = useRef(0)
  
  useFrame(() => {
    // Smooth interpolation towards target - MUCH FASTER (3x speed)
    const speed = 0.015 // 3x faster than 0.005
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

  const handleShowBook = () => {
    setIsParticleMode(true)
    setTargetProgress(1)
    startBookFormation(sampleBookData)
  }

  const handleRestart = () => {
    setTargetProgress(0)
    setIsParticleMode(false)
    completeBookFormation()
  }

  const handleProgressUpdate = (progress) => {
    setParticleProgress(progress)
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
      {/* Simple Controls - Just two buttons */}
      <div className="absolute top-4 left-4 z-10 space-x-4">
        <button
          onClick={handleShowBook}
          disabled={isParticleMode}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-semibold transition-colors"
        >
          Show Book
        </button>
        <button
          onClick={handleRestart}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          Restart
        </button>
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