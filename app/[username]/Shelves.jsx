import React, { useMemo, useRef, useState } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { useLevelStore } from '../../stores/useLevelStore';
import { levelSettings } from '../../config/levelConfig';

const Shelf = ({ position = [0, 0, 0], rotation = [-Math.PI / 2, 0, 0], fraction }) => {
  const meshRef = useRef();

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
    const outerR = 7;
    const innerR = 6;
    const arcLength = Math.PI * 2 * fraction;
    const startAngle = -arcLength / 2; // Center the arc
    const endAngle = arcLength / 2;

    const shape = new THREE.Shape();
    shape.moveTo(Math.cos(startAngle) * outerR, Math.sin(startAngle) * outerR);
    shape.absarc(0, 0, outerR, startAngle, endAngle, false);
    shape.lineTo(Math.cos(endAngle) * innerR, Math.sin(endAngle) * innerR);
    shape.absarc(0, 0, innerR, endAngle, startAngle, true);
    shape.closePath();

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.08,
      bevelEnabled: false,
      steps: 1,
      curveSegments: 128,
    });
  }, [fraction]);

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial
        map={colorMap}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const Shelves = () => {
  const level = useLevelStore((s) => s.level);
  const settings = levelSettings[level - 1];

  // Live update fractions when level changes
  const [fractions, setFractions] = useState(settings.shelves);
  React.useEffect(() => {
    setFractions(settings.shelves);
  }, [settings.shelves]);

// [.11, .11, .11, .11] --- IGNORE ---
// [1, 1, 1, 1] --- IGNORE ---


  const toggle = () => {
    fractions.forEach((f, i) => {
      gsap.to({ value: f }, {
        value: f === 1 ? 0.11 : 1,
        duration: 1.2,
        delay: i * 0.2, // forskydning pr. hylde
        ease: "power2.inOut",
        onUpdate: function () {
          setFractions((prev) => {
            const copy = [...prev];
            copy[i] = this.targets()[0].value;
            return copy;
          });
        }
      });
    });
  };

  return (
    <group position={[0, -0.8, 0]} rotation={[0, Math.PI / 2, 0]} onDoubleClick={toggle}>
      {fractions.map((fraction, i) => {
        if(fraction == 0) return null;
        return <Shelf key={i} position={[0, i - 1, 0]} fraction={fraction} />;
      })}
    </group>
  );
};

export default Shelves;
