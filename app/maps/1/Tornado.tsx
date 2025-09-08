import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const BOOK_TEXTURES = [
  'https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=200'
];

// interface TornadoProps {
//   height: number;
//   radius: number;
//   color: string;
//   rotationSpeed: number;
// }

// function DynamicTornado({ height, radius, color, rotationSpeed }: TornadoProps) {
//   const points = useMemo(() => {
//     const pts = [];
//     for (let i = 0; i <= 200; i++) {
//       const t = i / 200;
//       const r = radius * (1 - Math.pow(t, 1.2));
//       const angle = t * Math.PI * 16;
//       pts.push(new THREE.Vector3(
//         r * Math.cos(angle),
//         height * (1 - t),
//         r * Math.sin(angle)
//       ));
//     }
//     return pts;
//   }, [height, radius]);

//   const lineRef = useRef();
//   useFrame((state) => {
//     if (lineRef.current) {
//       lineRef.current.rotation.y += 0.01 * rotationSpeed;
//       lineRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
//     }
//   });

//   return (
//     <group ref={lineRef}>
//       <line>
//         <bufferGeometry attach="geometry">
//           <float32BufferAttribute attach="attributes-position" args={[new Float32Array(points.flatMap(p => [p.x, p.y, p.z])), 3]} />
//         </bufferGeometry>
//         <lineBasicMaterial attach="material" color={color} linewidth={4} />
//       </line>
//     </group>
//   );
// }

interface BookProps {
  position: [number, number, number];
  rotation: [number, number, number];
  index: number;
  scale: number;
  rotationSpeed: number;
}

function AnimatedBook({ position, rotation, index, scale, rotationSpeed }: BookProps) {
  const texture = useTexture(BOOK_TEXTURES[index % BOOK_TEXTURES.length]);
  const meshRef = useRef<THREE.Mesh>(null);
  const initialRotation = rotation;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01 * rotationSpeed;
      meshRef.current.rotation.x = initialRotation[0] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={[scale, scale, scale]}>
      <boxGeometry args={[1, 1.5, 0.2]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

interface TornadoSystemProps {
  bookCount: number;
  height: number;
  radius: number;
  rotationSpeed: number;
}

function TornadoSystem({ bookCount, height, radius, rotationSpeed }: TornadoSystemProps) {
  const books = useMemo(() => {
    const items = [];
    for (let i = 0; i < bookCount; i++) {
      const t = i / (bookCount - 1);
      const r = radius * (1 - Math.pow(t, 1.2));
      const angle = t * Math.PI * 16;
      const scale = Math.max(0.4, Math.min(1, 1 - (bookCount / 2000)));
      
      // Calculate position along the spiral
      const x = r * Math.cos(angle);
      const y = height * (1 - t);
      const z = r * Math.sin(angle);

      // Calculate rotation to align with spiral
      const tangentAngle = Math.atan2(Math.cos(angle), -Math.sin(angle));
      
      items.push(
        <AnimatedBook
          key={i}
          position={[x, y, z]}
          rotation={[0, tangentAngle, t * Math.PI * 0.5]}
          index={i}
          scale={scale}
          rotationSpeed={rotationSpeed}
        />
      );
    }
    return items;
  }, [bookCount, height, radius, rotationSpeed]);

  const tornadoRef = useRef<THREE.Group>(null);
  //const initialRotation = rotation;

  useFrame(() => {
    if (tornadoRef.current) {
        tornadoRef.current.rotation.y += 0.01 * rotationSpeed;
        //tornadoRef.current.rotation.x = initialRotation[0] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={tornadoRef}>
      {/* <DynamicTornado height={height} radius={radius} color={color} rotationSpeed={rotationSpeed} /> */}
      {books}
    </group>
  );
}

interface TornadoConfig {
  bookCount: number;
  height: number;
  radius: number;
  rotationSpeed?: number;
}

export function createTornado({
  bookCount,
  height,
  radius,
  rotationSpeed = 1
}: TornadoConfig) {

//   const cameraDistance = Math.max(40, Math.min(120, bookCount * 0.12));

  return (   
      <TornadoSystem
        bookCount={bookCount}
        height={height}
        radius={radius}
        rotationSpeed={rotationSpeed}
      />
  );
}