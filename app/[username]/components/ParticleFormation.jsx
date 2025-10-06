import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from 'gsap';
import bookLocater from './bookLocater';
import { extractBookColorsAndPixels, getBookCoverUrl, createParticleColorPalette } from './colorExtractor';

const ParticleFormation = ({ 
  bookData, 
  isActive = false, 
  onComplete,
  onBookFormed, // New callback when particles form book shape
  particleCount = 2500 // More particles for better effect
}) => {
  const pointsRef = useRef();
  const materialRef = useRef();
  const progressRef = useRef(0);
  const timeRef = useRef(0);
  const [bookColors, setBookColors] = useState(null);
  
  // Extract colors and pixel positions from book cover
  useEffect(() => {
    if (bookData && !bookColors) {
      const coverUrl = getBookCoverUrl(bookData);
      if (coverUrl) {
        console.log('Extracting colors from book cover:', coverUrl);
        console.log('Book data cover property:', bookData?.cover);
        
        // Extract both colors and pixel positions
        extractBookColorsAndPixels(coverUrl, 6)
          .then(result => {
            console.log('📚 Extracted book colors:', result.colors);
            console.log('🎨 Particle color palette:', result.palette);
            console.log('📍 Pixel positions:', result.pixelData.length, 'pixels');
            
            setBookColors({
              palette: result.palette,
              percentages: result.colors.map(c => c.percentage),
              pixelData: result.pixelData // Add pixel position data
            });
          })
          .catch(error => {
            console.warn('Color extraction failed:', error);
            // Use fallback colors
            setBookColors({
              palette: [[1.0, 0.4, 0.1], [0.2, 0.6, 1.0], [1.0, 0.9, 0.3]],
              percentages: [0.4, 0.3, 0.3],
              pixelData: null
            });
          });
      } else {
        // No cover image, use default colors
        setBookColors({
          palette: [[1.0, 0.4, 0.1], [0.2, 0.6, 1.0], [1.0, 0.9, 0.3]],
          percentages: [0.4, 0.3, 0.3],
          pixelData: null
        });
      }
    }
  }, [bookData, bookColors]);

  // Wind particle geometry with book colors and pixel-based positioning
  const geometry = useMemo(() => {
    if (!bookColors) return null; // Wait for colors to be extracted
    
    const positions = [];
    const targetPositions = [];
    const colors = [];
    const colorIndices = [];
    
    // Use exact book dimensions from bookData
    const bookWidth = bookData?.scale?.width || 0.4;
    const bookHeight = bookData?.scale?.height || 0.75;
    const bookThickness = bookData?.scale?.thickness || 0.2;

    const { palette, percentages, pixelData } = bookColors;
    
    // Use pixel data if available, otherwise fall back to geometric distribution
    if (pixelData && pixelData.length > 0) {
      console.log('🎯 Using pixel-based positioning with', pixelData.length, 'pixels');
      
      // Limit particles to a reasonable number for performance
      const maxParticles = Math.min(particleCount, pixelData.length);
      
      for (let i = 0; i < maxParticles; i++) {
        const pixelIndex = Math.floor((i / maxParticles) * pixelData.length);
        const pixel = pixelData[pixelIndex];
        
        // Use pixel color and position
        colors.push(pixel.color[0], pixel.color[1], pixel.color[2]);
        colorIndices.push(0.5); // Middle value for pixel-based colors
        
        // Target position: scale pixel position to book dimensions
        const targetX = pixel.x * bookWidth;
        const targetY = pixel.y * bookHeight;
        const targetZ = pixel.z * bookThickness + (Math.random() - 0.5) * bookThickness * 0.5;
        
        targetPositions.push(targetX, targetY, targetZ);
        
        // Starting position: scattered around in a sphere (wind effect)
        const radius = 5 + Math.random() * 3;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        const startX = radius * Math.sin(phi) * Math.cos(theta);
        const startY = radius * Math.sin(phi) * Math.sin(theta);
        const startZ = radius * Math.cos(phi);
        
        positions.push(startX, startY, startZ);
      }
    } else {
      console.log('📐 Using geometric distribution fallback');
      
      // Fall back to original geometric distribution
      let currentColorIndex = 0;
      let particlesForCurrentColor = Math.floor(particleCount * percentages[0]);
      let particlesAssigned = 0;

      for (let i = 0; i < particleCount; i++) {
        // Assign color based on percentages
        if (particlesAssigned >= particlesForCurrentColor && currentColorIndex < palette.length - 1) {
          currentColorIndex++;
          particlesForCurrentColor = Math.floor(particleCount * percentages[currentColorIndex]);
          particlesAssigned = 0;
        }
        
        const color = palette[currentColorIndex] || palette[0];
        colors.push(color[0], color[1], color[2]);
        colorIndices.push(currentColorIndex / palette.length);
        particlesAssigned++;
        
        // Target position: geometric book shape
        let targetX, targetY, targetZ;
        
        if (i < particleCount * 0.6) {
          // Main volume particles
          targetX = (Math.random() - 0.5) * bookWidth;
          targetY = (Math.random() - 0.5) * bookHeight;
          targetZ = (Math.random() - 0.5) * bookThickness;
        } else if (i < particleCount * 0.8) {
          // Edge particles for definition
          const edge = Math.floor(Math.random() * 6);
          switch (edge) {
            case 0: // Front face
              targetX = (Math.random() - 0.5) * bookWidth;
              targetY = (Math.random() - 0.5) * bookHeight;
              targetZ = bookThickness * 0.5;
              break;
            case 1: // Back face
              targetX = (Math.random() - 0.5) * bookWidth;
              targetY = (Math.random() - 0.5) * bookHeight;
              targetZ = -bookThickness * 0.5;
              break;
            case 2: // Top edge
              targetX = (Math.random() - 0.5) * bookWidth;
              targetY = bookHeight * 0.5;
              targetZ = (Math.random() - 0.5) * bookThickness;
              break;
            case 3: // Bottom edge
              targetX = (Math.random() - 0.5) * bookWidth;
              targetY = -bookHeight * 0.5;
              targetZ = (Math.random() - 0.5) * bookThickness;
              break;
            case 4: // Left edge
              targetX = -bookWidth * 0.5;
              targetY = (Math.random() - 0.5) * bookHeight;
              targetZ = (Math.random() - 0.5) * bookThickness;
              break;
            case 5: // Right edge
              targetX = bookWidth * 0.5;
              targetY = (Math.random() - 0.5) * bookHeight;
              targetZ = (Math.random() - 0.5) * bookThickness;
              break;
          }
        } else {
          // Corner definition particles
          const corner = Math.floor(Math.random() * 8);
          targetX = (corner & 1 ? 1 : -1) * bookWidth * 0.5;
          targetY = (corner & 2 ? 1 : -1) * bookHeight * 0.5;
          targetZ = (corner & 4 ? 1 : -1) * bookThickness * 0.5;
        }
        
        targetPositions.push(targetX, targetY, targetZ);
        
        // Starting position: scattered around in a sphere (wind effect)
        const radius = 5 + Math.random() * 3;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        const startX = radius * Math.sin(phi) * Math.cos(theta);
        const startY = radius * Math.sin(phi) * Math.sin(theta);
        const startZ = radius * Math.cos(phi);
        
        positions.push(startX, startY, startZ);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('targetPosition', new THREE.Float32BufferAttribute(targetPositions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setAttribute('colorIndex', new THREE.Float32BufferAttribute(colorIndices, 1));
    return geo;
  }, [bookData, particleCount, bookColors]);

  // Wind effect shader material with book colors
  const material = useMemo(() => {
    if (!bookColors) return null;
    
    const vertexShader = `
      uniform float uProgress;
      uniform float uTime;
      uniform float uSize;
      uniform float uMorphProgress;
      
      attribute vec3 targetPosition;
      attribute vec3 color;
      attribute float colorIndex;
      
      varying vec3 vPosition;
      varying vec3 vColor;
      varying float vNoise;
      varying float vDistance;
      varying float vColorIndex;
      
      // Better noise function for wind effect
      float noise(vec3 p) {
        return 0.5 * (sin(p.x * 2.0) * sin(p.y * 2.0) * sin(p.z * 2.0) + 1.0);
      }
      
      void main() {
        vPosition = position;
        vColor = color;
        vColorIndex = colorIndex;
        vNoise = noise(position);
        
        // Start from scattered position, morph to target book shape
        vec3 startPos = position;
        vec3 endPos = targetPosition;
        
        // Wind effect: particles fly in from all directions
        vec3 currentPos = mix(startPos, endPos, uProgress);
        
        // Add wind turbulence during flight
        if (uProgress > 0.0 && uProgress < 1.0) {
          float windStrength = sin(uProgress * 3.14159) * 0.2; // Strongest at middle of flight
          currentPos.x += sin(uTime * 3.0 + position.y * 2.0) * windStrength;
          currentPos.y += cos(uTime * 2.0 + position.z * 3.0) * windStrength;
          currentPos.z += sin(uTime * 2.5 + position.x * 1.5) * windStrength;
        }
        
        // No dispersal - particles stay in book shape
        
        vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
        vDistance = -mvPosition.z;
        gl_Position = projectionMatrix * mvPosition;
        
        // Dynamic particle size
        float size = uSize;
        if (uProgress < 1.0) {
          size *= (0.5 + uProgress * 0.5); // Grow as they approach
        }
        if (uMorphProgress > 0.0) {
          size *= (1.0 + uMorphProgress * 0.3); // Slightly bigger during dispersal
        }
        gl_PointSize = size * (50.0 / vDistance);
      }
    `;

    const fragmentShader = `
      uniform float uProgress;
      uniform float uMorphProgress;
      uniform float uTime;
      
      varying vec3 vPosition;
      varying vec3 vColor;
      varying float vNoise;
      varying float vDistance;
      varying float vColorIndex;
      
      void main() {
        // Only show particles that should be visible based on progress
        if (uProgress < vNoise * 0.3) discard;
        
        // Create beautiful circular particles
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        if (dist > 0.5) discard;
        
        // Create intense glowing center
        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        alpha = pow(alpha, 1.5); // Intense glow
        
        // Add sparkle effect during wind phase
        if (uProgress > 0.0 && uProgress < 1.0) {
          float sparkle = sin(uTime * 5.0 + vDistance * 0.1 + vColorIndex * 10.0) * 0.3 + 0.7;
          alpha *= sparkle;
        }
        
        // Keep particles visible - no dispersal fade
        
        // Use the extracted book colors!
        vec3 finalColor = vColor;
        
        // Add some color variation during wind phase
        if (uProgress < 0.8) {
          // Slightly desaturate during wind phase for magic effect
          float gray = dot(finalColor, vec3(0.299, 0.587, 0.114));
          finalColor = mix(finalColor, vec3(gray * 1.2), 0.3);
        }
        
        // Enhance colors during formation
        if (uProgress >= 0.8) {
          finalColor *= 1.2; // Brighten the book colors
        }
        
        // Keep book colors throughout
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uProgress: { value: 0.0 },
        uMorphProgress: { value: 0.0 },
        uTime: { value: 0.0 },
        uSize: { value: 2.0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  }, [bookColors]);

  // Enhanced animation with fly-away phase
  useEffect(() => {
    if (isActive && materialRef.current) {
      progressRef.current = 0;
      
      // Phase 1: Wind particles fly in and form book shape (4 seconds)
      gsap.to(progressRef, {
        current: 1.0,
        duration: 4.0, // Longer for wind effect
        ease: "power2.out",
        onUpdate: () => {
          if (materialRef.current) {
            materialRef.current.uniforms.uProgress.value = progressRef.current;
          }
        },
        onComplete: () => {
          // Phase 2: Hold book formation and show the actual book (2 seconds pause)
          console.log('✨ Particles formed book shape!');
          
          // Notify parent that book formation is complete
          if (onBookFormed) {
            onBookFormed({
              ...bookData,
              position: pointsRef.current.position // Current particle position
            });
          }
          
          // Hold the formation for 2 seconds to admire the effect
          gsap.delayedCall(2.0, () => {
            if (pointsRef.current && bookData) {
              
              // Fly directly to the specified position
              const targetPosition = {
                x: -0.415756, 
                y: -0.345, 
                z: -6.48669
              };
              
              console.log('📚 Flying book to position:', targetPosition);
              
              // Phase 3: Fly to exact position (1.5 seconds) and STAY THERE
              gsap.to(pointsRef.current.position, {
                x: targetPosition.x,
                y: targetPosition.y,
                z: targetPosition.z,
                duration: 1.5,
                ease: "power2.inOut",
                onComplete: () => {
                  // Hide particles before completing
                  if (materialRef.current) {
                    gsap.to(materialRef.current.uniforms.uProgress, {
                      value: 0.0, // Hide particles
                      duration: 0.5,
                      ease: "power2.in",
                      onComplete: () => {
                        // Now complete the animation and add the real book
                        if (onComplete) {
                          onComplete({
                            ...bookData,
                            position: targetPosition // Use the exact position
                          });
                        }
                      }
                    });
                  }
                }
              });
            }
          });
        }
      });
    }
  }, [isActive, bookData, onComplete]);

  // Update time only - let the wind effect handle the motion
  useFrame((state, delta) => {
    if (!isActive || !materialRef.current) return;
    
    timeRef.current += delta;
    materialRef.current.uniforms.uTime.value = timeRef.current;
  });

  // Store material reference
  useEffect(() => {
    materialRef.current = material;
  }, [material]);

  if (!isActive || !geometry || !material) return null;

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      position={[0, 0, 0]} // Start at center
    />
  );
};

export default ParticleFormation;