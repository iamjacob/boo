// LightHelpers.js
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";

// A helper component for a spot light
export function SpotLightHelperComponent({ lightRef, scaleFactor = 2 }) {
  const { scene } = useThree();
  const helperRef = useRef();

  useEffect(() => {
    if (lightRef.current) {
      // Pass red color (0xff0000) to the helper constructor.
      helperRef.current = new THREE.SpotLightHelper(lightRef.current, 0xff0000);
      // Scale the helper to make it bigger.
      helperRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
      scene.add(helperRef.current);
    }
    return () => {
      if (helperRef.current) {
        scene.remove(helperRef.current);
        helperRef.current.dispose();
      }
    };
  }, [lightRef, scene, scaleFactor]);

  useFrame(() => {
    if (helperRef.current) {
      helperRef.current.update();
    }
  });

  return null;
}

// A helper component for a directional light
export function DirectionalLightHelperComponent({ lightRef, size = 10 }) {
  const { scene } = useThree();
  const helperRef = useRef();

  useEffect(() => {
    if (lightRef.current) {
      // Create the helper with the specified size and red color.
      helperRef.current = new THREE.DirectionalLightHelper(
        lightRef.current,
        size,
        0xff0000
      );
      scene.add(helperRef.current);
    }
    return () => {
      if (helperRef.current) {
        scene.remove(helperRef.current);
        helperRef.current.dispose();
      }
    };
  }, [lightRef, scene, size]);

  useFrame(() => {
    if (helperRef.current) {
      helperRef.current.update();
    }
  });

  return null;
}
