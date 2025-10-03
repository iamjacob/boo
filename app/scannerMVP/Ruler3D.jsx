"use client";
import React, { useRef } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const Ruler3D = ({ unit = 'inches', length = 12, position = [2, 0, 0] }) => {
  const rulerRef = useRef();
  
  // Convert measurements based on unit
  const getDisplayLength = () => {
    return unit === 'inches' ? length : length * 2.54; // inches to cm
  };
  
  const getTickMarks = () => {
    const ticks = [];
    const displayLength = getDisplayLength();
    const tickCount = unit === 'inches' ? length : Math.floor(displayLength / 5) * 5; // Every 5cm for metric
    const tickInterval = unit === 'inches' ? 1 : 5;
    
    for (let i = 0; i <= tickCount; i += tickInterval) {
      const position = (i / displayLength) * 3 - 1.5; // Scale to 3 units long
      ticks.push(
        <group key={i} position={[0, position, 0]}>
          {/* Tick mark */}
          <mesh position={[0.1, 0, 0]}>
            <boxGeometry args={[0.02, 0.05, 0.01]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Number label */}
          <Text
            position={[0.2, 0, 0]}
            fontSize={0.08}
            color="#ffffff"
            anchorX="left"
            anchorY="middle"
          >
            {i}
          </Text>
        </group>
      );
    }
    return ticks;
  };

  return (
    <group ref={rulerRef} position={position} rotation={[0, 0, Math.PI / 2]}>
      {/* Main ruler body */}
      <mesh>
        <boxGeometry args={[0.05, 3, 0.02]} />
        <meshBasicMaterial color="#ffcc00" transparent opacity={0.9} />
      </mesh>
      
      {/* Ruler markings */}
      {getTickMarks()}
      
      {/* Unit label */}
      <Text
        position={[0.3, -1.8, 0]}
        fontSize={0.1}
        color="#ffffff"
        anchorX="left"
        anchorY="middle"
      >
        {unit}
      </Text>
      
      {/* End caps */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.06, 0.02, 0.03]} />
        <meshBasicMaterial color="#ff6600" />
      </mesh>
      <mesh position={[0, -1.5, 0]}>
        <boxGeometry args={[0.06, 0.02, 0.03]} />
        <meshBasicMaterial color="#ff6600" />
      </mesh>
    </group>
  );
};

export default Ruler3D;