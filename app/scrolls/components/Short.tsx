import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { Suspense } from 'react';
import { Scene } from './Scene';

type ShortProps = {
  sceneId: string;
};

export function Short({ sceneId }: ShortProps) {
  return (
    <Canvas 
      className="touch-none"
      camera={{ position: [0, 0, 4], fov: 50 }}
    >
      <Suspense fallback={"loading"}>
        <Scene id={sceneId}/>
        <Preload all />
      </Suspense>
    </Canvas>
  );
}