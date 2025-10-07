import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { perlinNoise } from './shaders'

const particleVertexShader = `
  ${perlinNoise}
  
  uniform float uTime;
  uniform float uProgress;
  uniform float uEdge;
  uniform float uFreq;
  uniform float uAmp;
  uniform float uBaseSize;
  
  attribute vec3 originalPosition;
  attribute vec3 velocity;
  attribute float maxOffset;
  attribute float angle;
  
  varying float vNoise;
  varying float vAngle;
  varying float vDistance;
  
  void main() {
    // Calculate noise for this particle
    vNoise = snoise(originalPosition * uFreq + uTime * 0.1) * uAmp;
    vAngle = angle + uTime;
    
    // Calculate current position based on time and velocity
    vec3 currentPos = originalPosition + velocity * uTime * 0.5;
    
    // Calculate distance from original position
    vDistance = length(currentPos - originalPosition);
    
    // Reset position if too far
    if (vDistance > maxOffset) {
      currentPos = originalPosition;
    }
    
    // Transform position
    vec4 viewPosition = modelViewMatrix * vec4(currentPos, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    
    // Calculate particle size based on distance
    float size = uBaseSize / (vDistance + 1.0);
    gl_PointSize = size / -viewPosition.z;
  }
`;

const particleFragmentShader = `
  uniform vec3 uColor;
  uniform float uProgress;
  uniform float uEdge;
  uniform sampler2D uTexture;
  
  varying float vNoise;
  varying float vAngle;
  varying float vDistance;
  
  void main() {
    // Only show particles on the dissolving edge
    if (vNoise < uProgress) discard;
    if (vNoise > uProgress + uEdge) discard;
    
    // Rotate the point coordinate for texture rotation
    vec2 coord = gl_PointCoord;
    coord = coord - 0.5;
    coord = coord * mat2(cos(vAngle), sin(vAngle), -sin(vAngle), cos(vAngle));
    coord = coord + 0.5;
    
    // Simple circular particle
    float dist = length(gl_PointCoord - 0.5);
    if (dist > 0.5) discard;
    
    // Fade based on distance from center and particle distance
    float alpha = (1.0 - dist * 2.0) * (1.0 / (vDistance + 1.0));
    
    gl_FragColor = vec4(uColor, alpha);
  }
`;

const DissolveParticles = ({ dissolveProgress, bookGeometry }) => {
  const pointsRef = useRef()
  const materialRef = useRef()
  
  const { geometry, material } = useMemo(() => {
    if (!bookGeometry) return { geometry: null, material: null }
    
    const particleCount = bookGeometry.attributes.position.count
    const positions = bookGeometry.attributes.position.array
    
    // Create particle geometry
    const particleGeometry = new THREE.BufferGeometry()
    
    // Arrays for particle attributes
    const particlePositions = new Float32Array(particleCount * 3)
    const originalPositions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    const maxOffsets = new Float32Array(particleCount)
    const angles = new Float32Array(particleCount)
    
    // Initialize particle attributes
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Copy original positions
      particlePositions[i3] = positions[i3]
      particlePositions[i3 + 1] = positions[i3 + 1]
      particlePositions[i3 + 2] = positions[i3 + 2]
      
      originalPositions[i3] = positions[i3]
      originalPositions[i3 + 1] = positions[i3 + 1]
      originalPositions[i3 + 2] = positions[i3 + 2]
      
      // Random velocity (mainly upward)
      velocities[i3] = (Math.random() - 0.5) * 0.1
      velocities[i3 + 1] = Math.random() * 0.2 + 0.05
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.1
      
      maxOffsets[i] = Math.random() * 1.5 + 0.5
      angles[i] = Math.random() * Math.PI * 2
    }
    
    // Set geometry attributes
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    particleGeometry.setAttribute('originalPosition', new THREE.BufferAttribute(originalPositions, 3))
    particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))
    particleGeometry.setAttribute('maxOffset', new THREE.BufferAttribute(maxOffsets, 1))
    particleGeometry.setAttribute('angle', new THREE.BufferAttribute(angles, 1))
    
    // Create particle material
    const particleMaterial = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: -1.2 },
        uEdge: { value: 0.2 },
        uFreq: { value: 2.0 },
        uAmp: { value: 1.0 },
        uColor: { value: new THREE.Color('#ff6600') },
        uBaseSize: { value: 8.0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    
    return { geometry: particleGeometry, material: particleMaterial }
  }, [bookGeometry])
  
  // Update progress uniform when dissolveProgress changes
  useEffect(() => {
    if (materialRef.current) {
      const shaderProgress = THREE.MathUtils.lerp(-1.2, 1.2, dissolveProgress)
      materialRef.current.uniforms.uProgress.value = shaderProgress
    }
  }, [dissolveProgress])
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })
  
  if (!geometry || !material) return null
  
  return (
    <points ref={pointsRef} geometry={geometry} material={material}>
      <primitive ref={materialRef} object={material} attach="material" />
    </points>
  )
}

export default DissolveParticles