import { Canvas } from '@react-three/fiber';
import { Preload, Stats } from '@react-three/drei';
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
      {process.env.NODE_ENV === 'development' || process.env.REACT_APP_SHOW_STATS === 'true' ? <Stats/> : null}
      <Scene id={sceneId}/>
        <Preload all />
    </Canvas>
  );
}