'use client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useMemo, useEffect } from 'react'

function Dreamcatcher() {
  const ringRadius = 2
  const webPoints = useMemo(() => {
    const points = []
    const rings = 5
    const segments = 12

    for (let r = 0; r < rings; r++) {
      const radius = (r / rings) * ringRadius
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2
        points.push(new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0
        ))
      }
    }
    return points
  }, [])

  // Linjerne (nettet)
  const webGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const positions = []
    for (let i = 0; i < webPoints.length - 1; i++) {
      positions.push(webPoints[i].x, webPoints[i].y, webPoints[i].z)
      positions.push(webPoints[i + 1].x, webPoints[i + 1].y, webPoints[i + 1].z)
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geometry
  }, [webPoints])

    useEffect(() => {
      const splash = document.getElementById("splash");
  
      if (splash) {
        splash.classList.add("fade-out");
        setTimeout(() => splash.remove(), 1200);
      }
    }, []);

  return (
    <group>
      {/* Ring */}
      <mesh>
        <torusGeometry args={[ringRadius, 0.05, 16, 100]} />
        <meshStandardMaterial color="#ff0000"  />
      </mesh>

      {/* Net */}
      <lineSegments geometry={webGeometry}>
        <lineBasicMaterial color="#b58c4f" />
      </lineSegments>

      {/* Bøger */}
      {webPoints.slice(0, 6).map((p, i) => (
        <mesh key={i} position={p}>
          <planeGeometry args={[0.4, 0.3]} />
          <meshStandardMaterial color="#fff8dc" />
        </mesh>
      ))}

      {/* Fjer */}
      {[-1, 0, 1].map((x, i) => (
        <group key={i} position={[x, -2.5, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5]} />
          <meshStandardMaterial color="#b58c4f" />
          <mesh position={[0, -0.4, 0]}>
            <coneGeometry args={[0.15, 0.8, 8]} />
            <meshStandardMaterial color="#deb887" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 0, 6] }}>
      <ambientLight intensity={1} />
      <pointLight position={[5, 5, 5]} />
      <Dreamcatcher />
      <OrbitControls />
    </Canvas>
  )
}
