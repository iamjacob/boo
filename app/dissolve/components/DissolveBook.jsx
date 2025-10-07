import React, { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { dissolveVertexShader, dissolveFragmentShader } from './shaders'
import DissolveParticles from './DissolveParticles'

// Safe texture loader similar to the existing book components
const useSafeLoader = (url, fallbackUrl = "./covers/000.webp") => {
  const [texture, setTexture] = useState(null)

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(
      url,
      (loadedTexture) => setTexture(loadedTexture),
      undefined,
      () =>
        loader.load(fallbackUrl, (fallbackTexture) =>
          setTexture(fallbackTexture)
        )
    )
  }, [url, fallbackUrl])
  return texture
}

const DissolveBook = ({ dissolveProgress }) => {
  const meshRef = useRef()
  const materialRefs = useRef([])

  // Create the book geometry with more subdivisions for better particle distribution
  const geometry = useMemo(() => {
    return new THREE.BoxGeometry(2, 3, 0.3, 32, 32, 8)
  }, [])

  // Load textures like in your other book components
  const textures = [
    useSafeLoader("./books/booktextureRotated.webp"), // Side spine
    useSafeLoader("./covers/learningweb.webp"), // Front cover
    useSafeLoader("./books/booktexture.webp"), // Back
    useSafeLoader("./books/booktexture.webp"), // Top
    useSafeLoader("./covers/learningweb.webp"), // Bottom (another cover view)
    useSafeLoader("./books/learningweb.webp"), // Right side
  ]

  // Create materials array (one for each face of the box)
  const materials = useMemo(() => {
    return textures.map((texture, index) => {
      if (!texture) return new THREE.MeshStandardMaterial({ color: '#8B4513' })
      
      return new THREE.ShaderMaterial({
        vertexShader: dissolveVertexShader,
        fragmentShader: dissolveFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uProgress: { value: -1.2 },
          uEdge: { value: 0.2 },
          uFreq: { value: 2.0 },
          uAmp: { value: 1.0 },
          uTexture: { value: texture },
          uColor: { value: new THREE.Color('#ffffff') }, // White to show texture
          uEdgeColor: { value: new THREE.Color('#ff4400') }
        },
        side: THREE.DoubleSide,
        transparent: false
      })
    })
  }, [textures])

  // Update progress uniform when dissolveProgress changes
  useEffect(() => {
    materialRefs.current.forEach((material) => {
      if (material && material.uniforms) {
        const shaderProgress = THREE.MathUtils.lerp(-1.2, 1.2, dissolveProgress)
        material.uniforms.uProgress.value = shaderProgress
      }
    })
  }, [dissolveProgress])

  useFrame((state) => {
    // Update time uniform for animated noise on all materials
    materialRefs.current.forEach((material) => {
      if (material && material.uniforms) {
        material.uniforms.uTime.value = state.clock.elapsedTime
      }
    })
    
    if (meshRef.current) {
      // Gentle rotation for better viewing
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  return (
    <group>
      {/* Only render the mesh if it's not completely dissolved */}
      {dissolveProgress < 0.9 && (
        <mesh ref={meshRef} geometry={geometry} position={[0, 0, 0]}>
          {materials.map((material, index) => (
            <primitive 
              key={index}
              ref={(ref) => { if (ref) materialRefs.current[index] = ref }}
              object={material} 
              attach={`material-${index}`} 
            />
          ))}
        </mesh>
      )}
      
      {/* Particle system */}
      <DissolveParticles 
        dissolveProgress={dissolveProgress} 
        bookGeometry={geometry}
      />
    </group>
  )
}

export default DissolveBook