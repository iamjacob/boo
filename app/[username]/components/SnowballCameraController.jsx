import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import useProjectileSettingsStore from "./../../stores/projectiles/useProjectileSettingsStore";

const SnowballCameraController = ({ onSnowballThrow }) => {
  const { camera, pointer, raycaster } = useThree();
  const { 
    isSnowballMode, 
    projectileType, 
    getVelocityMultiplier 
  } = useProjectileSettingsStore();

  useEffect(() => {
    const handleClick = (event) => {
      if (!isSnowballMode) return;
      
      // Update raycaster with current pointer position
      raycaster.setFromCamera(pointer, camera);
      
      // Calculate shooting direction (from camera through pointer)
      const direction = new THREE.Vector3();
      raycaster.ray.direction.normalize();
      direction.copy(raycaster.ray.direction);
      
      // Create projectile with velocity based on type
      const startPos = camera.position.clone();
      const velocityMultiplier = getVelocityMultiplier(projectileType);
      const velocity = direction.multiplyScalar(velocityMultiplier);
      
      onSnowballThrow({
        id: Date.now(),
        position: [startPos.x, startPos.y, startPos.z],
        velocity: [velocity.x, velocity.y, velocity.z]
      });
    };

    if (isSnowballMode) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [isSnowballMode, projectileType, camera, pointer, raycaster, onSnowballThrow, getVelocityMultiplier]);

  return null;
};

export default SnowballCameraController;
