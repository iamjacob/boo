import React, { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { useShelfZoomStore } from "../../../stores/useShelfZoomStore";

const ShelvesClickable = () => {
  const { zoomToShelf } = useShelfZoomStore();
  
  const Shelf = ({ 
    position = [0, 0, 0], 
    rotation = [(Math.PI / 180) * 90, 0, 0],
    index
  }) => {
    const textures = useLoader(THREE.TextureLoader, [
      "/experience/shelf/Wood051_1K-JPG_Color.webp",
      "/experience/shelf/Wood051_1K-JPG_NormalDX.webp",
      "/experience/shelf/Wood051_1K-JPG_Roughness.webp",
    ]);

    const [colorMap, normalMap, roughnessMap] = useMemo(() => {
      textures.forEach((map) => {
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(1, 1);
      });
      return textures;
    }, [textures]);

    const geometry = useMemo(() => {
      const shape = new THREE.Shape();
      shape.absarc(0, 0, 7, 0, Math.PI * 2, false);

      const holePath = new THREE.Path();
      holePath.absarc(0, 0, 6, 0, Math.PI * 2, true);
      shape.holes.push(holePath);

      return new THREE.ExtrudeGeometry(shape, {
        depth: 0.08,
        bevelEnabled: false,
        steps: 1,
        curveSegments: 64,
      });
    }, []);

    const handleShelfClick = (event) => {
      event.stopPropagation();
      
      const actualY = position[1] + (-0.8); // group offset
      console.log('🔍 Shelf clicked:', {
        visualIndex: index,
        shelfPosition: position,
        actualWorldY: actualY,
        isTopShelf: actualY > 1,
        isBottomShelf: actualY < -1.5,
        clickPoint: event.point
      });
      
      // Determine which shelf this actually is based on Y position
      let targetShelfIndex = index;
      
      if (actualY > 1) {
        console.log('🔝 Top shelf clicked - should go to shelf 3');
        targetShelfIndex = 3;
      } else if (actualY > 0) {
        console.log('🔼 Third shelf clicked - should go to shelf 2');  
        targetShelfIndex = 2;
      } else if (actualY > -1) {
        console.log('🔽 Second shelf clicked - should go to shelf 1');
        targetShelfIndex = 1;
      } else {
        console.log('🔻 Bottom shelf clicked - should go to shelf 0');
        targetShelfIndex = 0;
      }
      
      zoomToShelf(targetShelfIndex);
    };

    return (
      <group position={position} rotation={rotation} name={`shelf-group-${index}`}>
        {/* Visible shelf */}
        <mesh>
          <primitive object={geometry} attach="geometry" />
          <meshStandardMaterial
            map={colorMap}
            normalMap={normalMap}
            roughnessMap={roughnessMap}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Invisible click area - smaller and more precise */}
        <mesh 
          position={[0, 0, 0]}
          onClick={handleShelfClick}
          onPointerEnter={() => document.body.style.cursor = 'pointer'}
          onPointerLeave={() => document.body.style.cursor = 'auto'}
          name={`shelf-click-${index}`}
        >
          <cylinderGeometry args={[6.5, 6.5, 0.2, 32]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>
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

export default ShelvesClickable;