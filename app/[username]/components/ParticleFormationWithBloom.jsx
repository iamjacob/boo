import React, { useRef, useMemo } from 'react';
import { useFrame, extend, useThree } from '@react-three/fiber';
import { EffectComposer, RenderPass, UnrealBloomPass } from 'three-stdlib';
import * as THREE from 'three';

// Extend react-three-fiber with the effect composer
extend({ EffectComposer, RenderPass, UnrealBloomPass });

const ParticleFormationWithBloom = ({ 
  children,
  bloomStrength = 1.5,
  bloomRadius = 0.4,
  bloomThreshold = 0.85
}) => {
  const composerRef = useRef();
  const { gl, scene, camera, size } = useThree();

  // Create the effect composer
  const [composer, renderPass, bloomPass] = useMemo(() => {
    const effectComposer = new EffectComposer(gl);
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      bloomStrength,
      bloomRadius,
      bloomThreshold
    );

    effectComposer.addPass(renderPass);
    effectComposer.addPass(bloomPass);

    return [effectComposer, renderPass, bloomPass];
  }, [gl, scene, camera, size, bloomStrength, bloomRadius, bloomThreshold]);

  // Update composer size when window resizes
  useFrame(() => {
    if (composer) {
      composer.setSize(size.width, size.height);
      composer.render();
    }
  }, 1); // Render priority 1 to ensure it renders after the scene

  // Update render pass scene and camera
  if (renderPass) {
    renderPass.scene = scene;
    renderPass.camera = camera;
  }

  // Update bloom parameters
  if (bloomPass) {
    bloomPass.strength = bloomStrength;
    bloomPass.radius = bloomRadius;
    bloomPass.threshold = bloomThreshold;
  }

  return (
    <>
      {children}
      <primitive ref={composerRef} object={composer} />
    </>
  );
};

export default ParticleFormationWithBloom;