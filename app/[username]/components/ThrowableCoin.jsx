import { useRef, useState } from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

export function ThrowableCoin({ 
  position = [0, 0, 0], 
  scale = 1, 
  linearVelocity = [0, 0, 0], 
  color = "#ffd700",
  // Persistence props for future collection system
  id = null,
  thrownBy = null,
  thrownAt = null,
  isCollectible = false,
  onCollect = null
}) {
  const hasCollided = useRef(false);
  const [modelError, setModelError] = useState(false);
  const [isCollected, setIsCollected] = useState(false);
  const rigidBodyRef = useRef();
  
  // Load the coin GLB model with proper error handling
  let gltf = null;
  let modelLoaded = false;
  
  try {
    gltf = useLoader(GLTFLoader, "/models/coin.glb");
    modelLoaded = true;
  } catch (error) {
    console.warn("❌ Could not load coin.glb model, using fallback geometry:", error);
    // modelError will be handled in rendering
  }
  
  const handleCollision = ({ other }) => {
    if (other.rigidBodyObject?.name === 'santa') {
      if (!hasCollided.current) {
        console.log('Coin hit Santa! 🪙');
        hasCollided.current = true;
      }
    }
    else if (!other.colliderObject?.parent?.name?.includes('terrain')) {
      if (!hasCollided.current) {
        console.log('Coin hit:', other.colliderObject?.name || other.rigidBodyObject?.name, '🪙');
        hasCollided.current = true;
        
        // After collision, make coin collectible (future feature)
        if (!isCollectible && rigidBodyRef.current) {
          // Mark as collectible after settling
          setTimeout(() => {
            console.log(`💰 Coin ${id} is now collectible!`);
          }, 2000);
        }
      }
    }
  };

  // Handle coin collection
  const handleClick = (e) => {
    e.stopPropagation();
    if (isCollectible && !isCollected && onCollect) {
      setIsCollected(true);
      console.log(`💰 Collecting coin ${id} thrown by ${thrownBy}`);
      onCollect({
        type: 'coin',
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
      mass={0.8} // Heaviest - coins are dense!
      enabledTranslations={[true, true, true]}
      ccd={true}
      onCollisionEnter={handleCollision}
      name={`coin-${id || 'temp'}`}
      linearDamping={0.05} // Less air resistance - cuts through air better
      angularDamping={0.1} // Spins more freely
      restitution={0.8} // Very bouncy - metallic
    >
      <CuboidCollider args={[0.15 * scale, 0.15 * scale, 0.05 * scale]} />
      
      {/* 3D Coin model or fallback */}
      <group 
        scale={scale * 0.3}
        onClick={handleClick}
        style={{ cursor: isCollectible ? 'pointer' : 'default' }}
      >
        {gltf && modelLoaded ? (
          <primitive object={gltf.scene.clone()} />
        ) : (
          /* Fallback coin geometry */
          <mesh>
            <cylinderGeometry args={[0.5, 0.5, 0.1, 16]} />
            <meshStandardMaterial 
              color={isCollected ? '#666666' : color}
              metalness={0.8} 
              roughness={0.2}
              emissive={isCollectible ? color : '#000000'}
              emissiveIntensity={isCollectible ? 0.2 : 0.1}
              transparent={isCollected}
              opacity={isCollected ? 0.3 : 1}
            />
          </mesh>
        )}
        
        {/* Collection glow effect for collectible coins */}
        {isCollectible && !isCollected && (
          <mesh>
            <cylinderGeometry args={[0.7, 0.7, 0.05, 16]} />
            <meshBasicMaterial 
              color={color}
              transparent
              opacity={0.3}
              emissive={color}
              emissiveIntensity={0.5}
            />
          </mesh>
        )}
        
        {/* Show who threw it (for future UI) */}
        {thrownBy && isCollectible && (
          <group position={[0, 1, 0]}>
            {/* Future: Add text or UI showing thrownBy username */}
          </group>
        )}
      </group>
    </RigidBody>
  );
}
