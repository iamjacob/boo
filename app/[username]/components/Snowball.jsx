import { useRef } from "react";
import { RigidBody, BallCollider } from "@react-three/rapier";
import { Sphere } from "@react-three/drei";
// import { usePlayOof, usePlaySnowballHit } from '../useAppSounds';

export function Snowball({ position = [0, 0, 0], scale = 1, linearVelocity = [0, 0, 0] }) {
  //const [playOof] = usePlayOof();
  //const [playSnowballHit] = usePlaySnowballHit();
  const hasCollided = useRef(false);

  const handleCollision = ({ other }) => {
    if (other.rigidBodyObject?.name === 'santa') {
      if (!hasCollided.current) {
        //playOof();
        hasCollided.current = true;
      }
    }
    else if (!other.colliderObject?.parent?.name?.includes('terrain')) {
      if (!hasCollided.current) {
        //playSnowballHit();
        console.log('Snowball hit:', other.colliderObject?.name || other.rigidBodyObject?.name);
        hasCollided.current = true;
      }
    }
  };

  return (
    <RigidBody 
      type="dynamic" 
      position={position} 
      colliders={false}
      linearVelocity={linearVelocity}
      mass={0.3} // Light but not too light
      enabledTranslations={[true, true, true]}
      ccd={true}
      onCollisionEnter={handleCollision}
      name="snowball"
      linearDamping={0.2} // More air resistance than coin
      angularDamping={0.3} // More rotational damping
      restitution={0.4} // Moderate bounce
    >
      <BallCollider args={[0.5 * scale]} />
      <Sphere args={[0.5, 32, 32]} scale={scale}>
        <meshStandardMaterial color="white" roughness={0.2} />
      </Sphere>
    </RigidBody>
  );
} 