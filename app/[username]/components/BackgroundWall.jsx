import React from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";

const BackgroundWall = ({ debug = false }) => {
  return (
    <group>
      {/* Back wall - behind the shelves */}
      <RigidBody type="fixed" colliders={false} name="back-wall">
        <CuboidCollider args={[15, 10, 0.5]} position={[0, 0, -10]} />
        {/* Optional: Add a visible mesh for debugging */}
        {debug && (
          <mesh position={[0, 0, -10]}>
            <boxGeometry args={[30, 20, 1]} />
            <meshStandardMaterial color="red" transparent opacity={0.1} />
          </mesh>
        )}
      </RigidBody>

      {/* Left wall */}
      <RigidBody type="fixed" colliders={false} name="left-wall">
        <CuboidCollider args={[0.5, 10, 10]} position={[-15, 0, 0]} />
        {debug && (
          <mesh position={[-15, 0, 0]}>
            <boxGeometry args={[1, 20, 20]} />
            <meshStandardMaterial color="blue" transparent opacity={0.1} />
          </mesh>
        )}
      </RigidBody>

      {/* Right wall */}
      <RigidBody type="fixed" colliders={false} name="right-wall">
        <CuboidCollider args={[0.5, 10, 10]} position={[15, 0, 0]} />
        {debug && (
          <mesh position={[15, 0, 0]}>
            <boxGeometry args={[1, 20, 20]} />
            <meshStandardMaterial color="green" transparent opacity={0.1} />
          </mesh>
        )}
      </RigidBody>

      {/* Ceiling - to prevent books from flying up too high */}
      <RigidBody type="fixed" colliders={false} name="ceiling">
        <CuboidCollider args={[15, 0.5, 10]} position={[0, 8, 0]} />
        {debug && (
          <mesh position={[0, 8, 0]}>
            <boxGeometry args={[30, 1, 20]} />
            <meshStandardMaterial color="yellow" transparent opacity={0.1} />
          </mesh>
        )}
      </RigidBody>
    </group>
  );
};

export default BackgroundWall;
