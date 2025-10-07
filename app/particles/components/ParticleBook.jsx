import React, { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { fadeVertexShader, fadeFragmentShader } from './shaders'

// Safe texture loader similar to the existing book components
const useSafeLoader = (url, fallbackUrl = "./covers/000.webp") => {
  const [texture, setTexture] = useState(null)

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(
      url,
      (loadedTexture) => {
        // Set texture properties to maintain aspect ratio
        loadedTexture.wrapS = THREE.ClampToEdgeWrapping
        loadedTexture.wrapT = THREE.ClampToEdgeWrapping
        loadedTexture.minFilter = THREE.LinearFilter
        loadedTexture.magFilter = THREE.LinearFilter
        setTexture(loadedTexture)
      },
      undefined,
      () =>
        loader.load(fallbackUrl, (fallbackTexture) => {
          fallbackTexture.wrapS = THREE.ClampToEdgeWrapping
          fallbackTexture.wrapT = THREE.ClampToEdgeWrapping
          fallbackTexture.minFilter = THREE.LinearFilter
          fallbackTexture.magFilter = THREE.LinearFilter
          setTexture(fallbackTexture)
        })
    )
  }, [url, fallbackUrl])
  return texture
}

const ParticleBook = ({ isParticleMode, particleProgress = 0 }) => {
  const meshRef = useRef()
  const materialRefs = useRef([])

  // Create the book geometry with more subdivisions for better particle distribution
  const geometry = useMemo(() => {
    return new THREE.BoxGeometry(2, 3, 0.3, 64, 96, 16) // Higher subdivisions for more particles
  }, [])

  // Load textures with proper aspect ratio handling
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
      
      if (isParticleMode) {
        // Use shader material when in particle mode
        return new THREE.ShaderMaterial({
          vertexShader: fadeVertexShader,
          fragmentShader: fadeFragmentShader,
          uniforms: {
            uProgress: { value: 0 },
            uTexture: { value: texture },
            uColor: { value: new THREE.Color('#ffffff') }
          },
          side: THREE.DoubleSide,
          transparent: true
        })
      } else {
        // Use standard material when showing book
        return new THREE.MeshStandardMaterial({
          map: texture,
          side: THREE.DoubleSide
        })
      }
    })
  }, [textures, isParticleMode])

  // Update progress uniform when particleProgress changes
  useEffect(() => {
    if (isParticleMode) {
      materialRefs.current.forEach((material) => {
        if (material && material.uniforms) {
          material.uniforms.uProgress.value = particleProgress
        }
      })
    }
  }, [particleProgress, isParticleMode])

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle rotation for better viewing
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  return (
    <group>
      {/* Only render the mesh if it's not completely dissolved or if not in particle mode */}
      {(!isParticleMode || particleProgress < 0.9) && (
        <mesh ref={meshRef} geometry={geometry} position={[0, 0, 0]}>
          {materials.map((material, index) => (
            <primitive 
              key={`${index}-${isParticleMode}`} // Key changes when mode changes to force re-creation
              ref={(ref) => { if (ref) materialRefs.current[index] = ref }}
              object={material} 
              attach={`material-${index}`} 
            />
          ))}
        </mesh>
      )}
    </group>
  )
}

export default ParticleBook