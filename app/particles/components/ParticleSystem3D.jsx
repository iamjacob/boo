import React, { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { extractBookColorsAndPixels, getBookCoverUrl } from '../../[username]/components/colorExtractor'

const ParticleSystem3D = ({ 
  bookData, 
  isParticleMode = false, 
  particleProgress = 0,
  resolution = 300 // Reduced from 500 for better performance
}) => {
  const pointsRef = useRef()
  const materialRef = useRef()
  const [bookColors, setBookColors] = useState(null)
  
  // Extract colors and pixel positions from book cover
  useEffect(() => {
    if (bookData && !bookColors) {
      const coverUrl = getBookCoverUrl(bookData)
      if (coverUrl) {
        console.log('Extracting colors from book cover:', coverUrl)
        
        extractBookColorsAndPixels(coverUrl, 8)
          .then(result => {
            console.log('📚 Extracted book colors:', result.colors)
            console.log('🎨 Particle color palette:', result.palette)
            console.log('📍 Pixel positions:', result.pixelData?.length, 'pixels')
            
            setBookColors({
              palette: result.palette,
              percentages: result.colors.map(c => c.percentage),
              pixelData: result.pixelData
            })
          })
          .catch(error => {
            console.warn('Color extraction failed:', error)
            // Use fallback colors
            setBookColors({
              palette: [[1.0, 0.4, 0.1], [0.2, 0.6, 1.0], [1.0, 0.9, 0.3]],
              percentages: [0.4, 0.3, 0.3],
              pixelData: null
            })
          })
      } else {
        // No cover image, use default colors
        setBookColors({
          palette: [[1.0, 0.4, 0.1], [0.2, 0.6, 1.0], [1.0, 0.9, 0.3]],
          percentages: [0.4, 0.3, 0.3],
          pixelData: null
        })
      }
    }
  }, [bookData, bookColors])

  // Create 3D particle field for all 6 faces of the book
  const geometry = useMemo(() => {
    if (!bookColors) return null

    const positions = []
    const targetPositions = []
    const colors = []
    const sizes = []
    const velocities = []
    const faceIds = []

    // Use exact book dimensions from bookData
    const bookWidth = bookData?.scale?.width || 2
    const bookHeight = bookData?.scale?.height || 3
    const bookThickness = bookData?.scale?.thickness || 0.3

    const { palette, percentages } = bookColors

    // Define the 6 faces of the book cube with specific textures
    const faces = [
      // Front face (main cover) - highest detail
      { 
        name: 'Front Cover',
        normal: [0, 0, 1], 
        position: [0, 0, bookThickness/2],
        width: bookWidth, 
        height: bookHeight,
        uDir: [1, 0, 0], // U direction (right)
        vDir: [0, 1, 0], // V direction (up)
        id: 0,
        priority: 3, // Highest priority for detail
        textureType: 'cover'
      },
      // Back face - good detail
      { 
        name: 'Back Cover',
        normal: [0, 0, -1], 
        position: [0, 0, -bookThickness/2],
        width: bookWidth, 
        height: bookHeight,
        uDir: [-1, 0, 0], 
        vDir: [0, 1, 0],
        id: 1,
        priority: 2,
        textureType: 'back'
      },
      // Left face (spine) - important for book identity
      { 
        name: 'Spine',
        normal: [-1, 0, 0], 
        position: [-bookWidth/2, 0, 0],
        width: bookThickness, 
        height: bookHeight,
        uDir: [0, 0, 1], 
        vDir: [0, 1, 0],
        id: 2,
        priority: 2, // High priority for spine
        textureType: 'spine'
      },
      // Right face
      { 
        name: 'Right Side',
        normal: [1, 0, 0], 
        position: [bookWidth/2, 0, 0],
        width: bookThickness, 
        height: bookHeight,
        uDir: [0, 0, -1], 
        vDir: [0, 1, 0],
        id: 3,
        priority: 1,
        textureType: 'side'
      },
      // Top face
      { 
        name: 'Top Edge',
        normal: [0, 1, 0], 
        position: [0, bookHeight/2, 0],
        width: bookWidth, 
        height: bookThickness,
        uDir: [1, 0, 0], 
        vDir: [0, 0, -1],
        id: 4,
        priority: 1,
        textureType: 'edge'
      },
      // Bottom face
      { 
        name: 'Bottom Edge',
        normal: [0, -1, 0], 
        position: [0, -bookHeight/2, 0],
        width: bookWidth, 
        height: bookThickness,
        uDir: [1, 0, 0], 
        vDir: [0, 0, 1],
        id: 5,
        priority: 1,
        textureType: 'edge'
      }
    ]

    // Generate particles for each face with priority-based density
    faces.forEach((face, faceIndex) => {
      // Calculate particle density based on face priority and size
      const faceArea = face.width * face.height
      const baseDensity = resolution * face.priority
      const particlesForFace = Math.max(
        face.priority * 30, // Minimum particles based on priority
        Math.floor(baseDensity * faceArea / (bookWidth * bookHeight))
      )
      
      // Special handling for spine - ensure good coverage
      let actualParticles = particlesForFace
      if (face.textureType === 'spine') {
        actualParticles = Math.max(particlesForFace, resolution * 0.3) // At least 30% of resolution for spine
      }
      
      // Calculate grid resolution for this face
      const aspectRatio = face.width / face.height
      const resU = Math.ceil(Math.sqrt(actualParticles * aspectRatio))
      const resV = Math.ceil(actualParticles / resU)

      console.log(`${face.name}: ${resU}x${resV} = ${resU * resV} particles (priority: ${face.priority})`)

      for (let u = 0; u < resU; u++) {
        for (let v = 0; v < resV; v++) {
          // Calculate position on face with slight randomization for organic feel
          const uCoord = (u / Math.max(1, resU - 1) - 0.5) * face.width + 
                        (Math.random() - 0.5) * (face.width / resU) * 0.3
          const vCoord = (v / Math.max(1, resV - 1) - 0.5) * face.height + 
                        (Math.random() - 0.5) * (face.height / resV) * 0.3

          // Target position: on the face surface
          const targetX = face.position[0] + 
                         uCoord * face.uDir[0] + 
                         vCoord * face.vDir[0]
          const targetY = face.position[1] + 
                         uCoord * face.uDir[1] + 
                         vCoord * face.vDir[1]
          const targetZ = face.position[2] + 
                         uCoord * face.uDir[2] + 
                         vCoord * face.vDir[2]

          targetPositions.push(targetX, targetY, targetZ)

          // Starting position: scattered around in a larger sphere
          const radius = 10 + Math.random() * 8
          const theta = Math.random() * Math.PI * 2
          const phi = Math.random() * Math.PI

          const startX = radius * Math.sin(phi) * Math.cos(theta)
          const startY = radius * Math.sin(phi) * Math.sin(theta)
          const startZ = radius * Math.cos(phi)

          positions.push(startX, startY, startZ)

          // Assign colors based on face type
          let colorIndex
          if (face.textureType === 'cover') {
            // Front cover gets the most prominent colors
            colorIndex = Math.floor(Math.random() * Math.min(3, palette.length))
          } else if (face.textureType === 'back') {
            // Back cover gets varied colors
            colorIndex = Math.floor(Math.random() * palette.length)
          } else if (face.textureType === 'spine') {
            // Spine gets distinctive colors (usually darker or more muted)
            const spineColors = palette.length > 3 ? 
              [Math.floor(palette.length * 0.6), Math.floor(palette.length * 0.8)] :
              [0, 1]
            colorIndex = spineColors[Math.floor(Math.random() * spineColors.length)]
          } else {
            // Edges get neutral colors
            colorIndex = Math.floor(Math.random() * Math.min(2, palette.length))
          }

          const color = palette[colorIndex] || palette[0]
          colors.push(color[0], color[1], color[2])

          // Random velocities for floating effect
          velocities.push(
            (Math.random() - 0.5) * 0.008,
            (Math.random() - 0.5) * 0.008,
            (Math.random() - 0.5) * 0.008
          )

          // Size based on face importance and type
          let baseSize = 0.6
          if (face.textureType === 'cover') baseSize = 1.4      // Largest for covers
          else if (face.textureType === 'spine') baseSize = 1.1  // Medium for spine
          else if (face.textureType === 'back') baseSize = 1.2   // Good size for back
          else baseSize = 0.8                                    // Smaller for edges
          
          sizes.push(baseSize + Math.random() * 0.3)
          faceIds.push(faceIndex)
        }
      }
    })

    console.log(`Generated ${positions.length / 3} particles for ${faces.length} faces`)

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('targetPosition', new THREE.Float32BufferAttribute(targetPositions, 3))
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
    geo.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3))
    geo.setAttribute('faceId', new THREE.Float32BufferAttribute(faceIds, 1))
    
    return geo
  }, [bookColors, resolution, bookData])

  // Simple particle material without perlin noise
  const material = useMemo(() => {
    if (!bookColors) return null
    
    const vertexShader = `
      uniform float uProgress;
      uniform float uTime;
      uniform float uSize;
      
      attribute vec3 targetPosition;
      attribute vec3 color;
      attribute float size;
      attribute vec3 velocity;
      attribute float faceId;
      
      varying vec3 vColor;
      varying float vAlpha;
      varying float vFaceId;
      
      void main() {
        vColor = color;
        vFaceId = faceId;
        
        vec3 pos;
        
        if (uProgress < 1.0) {
          // Particles flying in and forming book (0.0-1.0)
          float phase1Progress = uProgress;
          pos = mix(position, targetPosition, smoothstep(0.0, 1.0, phase1Progress));
          
          // Add swirling motion as they fly in, reduces as they get closer
          float swirl = sin(uTime * 2.0 + length(position) * 0.1) * (1.0 - phase1Progress) * 1.5;
          pos.x += swirl * sin(uTime * 1.5);
          pos.y += swirl * cos(uTime * 1.3) * 0.5;
          
          // When particles reach end position (progress = 1.0), make them transparent
          if (phase1Progress >= 0.98) {
            vAlpha = 0.0; // Instant transparency when at end position
          } else {
            vAlpha = mix(0.3, 1.0, phase1Progress);
          }
          
        } else {
          // Should never reach here, but just in case
          pos = targetPosition;
          vAlpha = 0.0;
        }
        
        // Transform position
        vec4 viewPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * viewPosition;
        
        // Point size - larger for covers and spine, medium for back, smaller for edges
        float sizeMultiplier = 1.0;
        if (vFaceId < 1.5) sizeMultiplier = 1.5;        // Front cover (id 0)
        else if (vFaceId < 2.5) sizeMultiplier = 1.3;   // Back cover (id 1)  
        else if (vFaceId < 3.5) sizeMultiplier = 1.4;   // Spine (id 2) - important!
        else sizeMultiplier = 0.9;                      // Other sides (id 3,4,5)
        
        gl_PointSize = size * uSize * sizeMultiplier / -viewPosition.z;
      }
    `
    
    const fragmentShader = `
      varying vec3 vColor;
      varying float vAlpha;
      varying float vFaceId;
      
      void main() {
        // Create circular particles
        float dist = length(gl_PointCoord - 0.5);
        if (dist > 0.5) discard;
        
        // Soft edges with glow
        float alpha = (1.0 - dist * 2.0) * vAlpha;
        
        // Different visual treatment for each face type
        vec3 finalColor = vColor;
        
        if (vFaceId < 1.5) {
          // Front cover - brightest and most vibrant
          finalColor *= 1.4;
        } else if (vFaceId < 2.5) {
          // Back cover - good brightness
          finalColor *= 1.2;
        } else if (vFaceId < 3.5) {
          // Spine - distinctive, slightly muted for book-like appearance
          finalColor *= 1.1;
          finalColor = mix(finalColor, finalColor * 0.8, 0.2); // Slight desaturation
        } else {
          // Edges - subtle
          finalColor *= 0.9;
        }
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `
    
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uSize: { value: 12.0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  }, [bookColors])

  // Update uniforms
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uProgress.value = particleProgress
    }
  }, [particleProgress])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  // Show particles only when in particle mode
  if (!geometry || !material || !isParticleMode) return null

  return (
    <points ref={pointsRef} geometry={geometry} material={material}>
      <primitive ref={materialRef} object={material} attach="material" />
    </points>
  )
}

export default ParticleSystem3D