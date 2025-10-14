import { Canvas, useThree } from '@react-three/fiber';
import { Preload, Stats } from '@react-three/drei';
import { useEffect } from 'react';
import { Scene } from './Scene';

type ShortProps = {
  sceneId: string;
  active?: boolean;
};

function InvalidateOnActive({ active }: { active?: boolean }) {
  const { invalidate } = useThree();
  useEffect(() => {
    if (active) {
      // Ensure at least one frame is drawn when becoming active
      invalidate();
    }
  }, [active, invalidate]);
  return null;
}

export function Short({ sceneId, active = false }: ShortProps) {
  return (
    <Canvas
      className="touch-none"
      camera={{ position: [0, 0, 4], fov: 50 }}
      frameloop={active ? 'always' : 'demand'}
    >
      {process.env.NODE_ENV === 'development' || process.env.REACT_APP_SHOW_STATS === 'true' ? <Stats/> : null}
      {/* Only mount the heavy Scene when the slide is active. Inactive canvases will be demand-rendered. */}
      {active ? <Scene id={sceneId} /> : null}
      <InvalidateOnActive active={active} />
      <Preload all />
    </Canvas>
  );
}

export default Short;


