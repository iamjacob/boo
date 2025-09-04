import { useRef, useState } from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { Html, useGLTF } from "@react-three/drei";

export function ThrowableHeart({ 
  position = [0, 0, 0], 
  scale = 1, 
  linearVelocity = [0, 0, 0], 
  color = "#ff0000",
  // Persistence props for future collection system
  id = null,
  thrownBy = null,
  thrownAt = null,
  isCollectible = false,
  onCollect = null
}) {
  const hasCollided = useRef(false);
  const [isCollected, setIsCollected] = useState(false);
  const rigidBodyRef = useRef();

  // Load the 3D heart model
  const { nodes, materials } = useGLTF('/models/heart.glb');

  const handleCollision = ({ other }) => {
    if (other.rigidBodyObject?.name === 'santa') {
      if (!hasCollided.current) {
        hasCollided.current = true;
      }
    }
    else if (!other.colliderObject?.parent?.name?.includes('terrain')) {
      if (!hasCollided.current) {
        hasCollided.current = true;
        
        // After collision, make heart collectible (future feature)
        if (!isCollectible && rigidBodyRef.current) {
          // Mark as collectible after settling
          setTimeout(() => {
          }, 2000);
        }
      }
    }
  };

  // Handle heart collection
  const handleClick = (e) => {
    e.stopPropagation();
    if (isCollectible && !isCollected && onCollect) {
      setIsCollected(true);
      console.log(`💖 Collecting heart ${id} thrown by ${thrownBy}`);
      onCollect({
        type: 'heart',
        id,
        thrownBy,
        thrownAt,
        collectedAt: new Date().toISOString(),
        position: rigidBodyRef.current?.translation()
      });
    }
  };

  return (
    <RigidBody 
      ref={rigidBodyRef}
      type="dynamic" 
      position={position} 
      colliders={false}
      linearVelocity={linearVelocity}
      mass={0.2} // Lighter than snowball
      enabledTranslations={[true, true, true]}
      ccd={true}
      onCollisionEnter={handleCollision}
      name={`heart-${id || 'temp'}`}
      linearDamping={0.1}
      angularDamping={0.2}
      restitution={0.6} // More bouncy than snowball
    >
      <CuboidCollider args={[0.3 * scale, 0.3 * scale, 0.1 * scale]} />
      
      {/* 3D Heart Model */}
      <group onClick={handleClick} scale={[scale, scale, scale]} style={{ cursor: isCollectible ? 'pointer' : 'default' }}>
        <mesh
          geometry={nodes.mesh_0.geometry} // Updated to match the actual property name
          material={materials[""]} // Updated to match the actual property name
          material-color={isCollected ? '#666666' : color}
          material-transparent
          material-opacity={isCollected ? 0.1 : 1}
        />
      </group>
    </RigidBody>
  );
}

useGLTF.preload('/models/heart.glb');
