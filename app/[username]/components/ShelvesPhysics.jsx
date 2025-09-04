import React, { useMemo } from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

const Shelves = () => {
  const Shelf = ({
    position = [0, 0, 0],
    rotation = [(Math.PI / 180) * 90, 0, 0],
    index,
    innerRadius = 6,
    outerRadius = 7,
    depth = 0.08,
    segments = 32, // number of collider segments
  }) => {
    const textures = useLoader(THREE.TextureLoader, [
      "/experience/shelf/Wood051_1K-JPG_Color.jpg",
      "/experience/shelf/Wood051_1K-JPG_NormalDX.jpg",
      "/experience/shelf/Wood051_1K-JPG_Roughness.jpg",
    ]);

    const [colorMap, normalMap, roughnessMap] = textures;

    const geometry = useMemo(() => {
      const shape = new THREE.Shape();
      shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
      const hole = new THREE.Path();
      hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
      shape.holes.push(hole);
      return new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: false,
        steps: 1,
        curveSegments: 64,
      });
    }, []);

    const colliders = useMemo(() => {
      const halfHeight = depth / 2;
      const ringRadius = (innerRadius + outerRadius) / 2;
      const segmentAngle = (Math.PI * 2) / segments;
      const boxWidth = (outerRadius - innerRadius);
      const boxDepth = 2 * Math.PI * ringRadius / segments;

      return [...Array(segments)].map((_, i) => {
        const angle = i * segmentAngle;
        const x = Math.cos(angle) * ringRadius;
        const z = Math.sin(angle) * ringRadius;

        return {
          position: [x, 0, z],
          rotation: [0, -angle, 0],
          args: [boxWidth / 2, halfHeight, boxDepth / 2],
        };
      });
    }, [segments, innerRadius, outerRadius, depth]);

    return (
      <RigidBody
        type="fixed"
        colliders={false}
        name={`shelf-${index}`}
        position={position}
        rotation={rotation}
      >

        <group position={[position[0],0,position[2]+depth/2]} rotation={rotation}>
        {/* Physics colliders */}
        {colliders.map((c, i) => (
          <CuboidCollider key={i} {...c} />
        ))}

        {/* Mesh visualization for colliders */}
        {/* {colliders.map((c, i) => (
          <mesh
            key={`mesh-${i}`}
            position={c.position}
            rotation={c.rotation}
          >
            <boxGeometry args={[c.args[0] * 2, c.args[1] * 2, c.args[2] * 2]} />
            <meshStandardMaterial color="hotpink" transparent opacity={0.4} />
          </mesh>
        ))} */}
        </group>

        {/* The visible curved shelf */}
        <mesh position={[0, 0, 0]}>
          <primitive object={geometry} attach="geometry" />
          <meshStandardMaterial
            map={colorMap}
            normalMap={normalMap}
            roughnessMap={roughnessMap}
            side={THREE.DoubleSide}
          />
        </mesh>
      </RigidBody>
    );
  };

  return (
    <group position={[0, -0.8, 0]}>
      {[...Array(4)].map((_, i) => (
        <Shelf key={i} position={[0, i - 1, 0]} index={i} />
      ))}
    </group>
  );
};

export default Shelves;
