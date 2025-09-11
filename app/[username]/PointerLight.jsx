import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PointLightHelper } from "three";
import { useHelper } from "@react-three/drei";
import { Leva, useControls } from "leva";


function PointerLight({ intensity = 5, color = "white", position = [0, 2, 4], rotation = [0, 0, 0], followPointer = false }) {
  const lightRef = useRef();
  const [lightPos, setLightPos] = useState(position);
  const [lightRot, setLightRot] = useState(rotation);

  useHelper(lightRef, PointLightHelper, 0.5, "hotpink");

  // Optionally update light position based on pointer
  useFrame(({ mouse, viewport }) => {
    if (followPointer) {
      setLightPos([
        mouse.x * viewport.width / 2,
        mouse.y * viewport.height / 2,
        position[2]
      ]);
    }
  });

  return (
    <pointLight
      ref={lightRef}
      position={lightPos}
      intensity={intensity}
      color={color}
      rotation={lightRot}
    />
  );
}


export default function PointerLightWithControls() {
  const { intensity, color, x, y, z, rotX, rotY, rotZ, followPointer } = useControls("Pointer Light", {
    intensity: { value: 5, min: 0, max: 20, step: 0.1 },
    color: { value: "#ffffff" },
    x: { value: 0, min: -10, max: 10, step: 0.1 },
    y: { value: 2, min: -10, max: 10, step: 0.1 },
    z: { value: 4, min: -10, max: 10, step: 0.1 },
    rotX: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
    rotY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
    rotZ: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
    followPointer: { value: false }
  });

  return (
    <>
      <Leva collapsed={false} />
      <Canvas style={{ width: "100%", height: "400px", background: "#222" }}>
        {/* Ambient light for basic visibility */}
        <ambientLight intensity={0.2} />
        <PointerLight
          intensity={intensity}
          color={color}
          position={[x, y, z]}
          rotation={[rotX, rotY, rotZ]}
          followPointer={followPointer}
        />
        {/* Add a visible wireframe helper mesh at the light's position */}
        <mesh position={[x, y, z]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color="hotpink" wireframe />
        </mesh>
        {/* Add a simple mesh to visualize the effect */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#888" />
        </mesh>
      </Canvas>
    </>
  );
}
