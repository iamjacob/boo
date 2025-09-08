
import React, { useRef, useEffect } from "react";
import { DoubleSide } from "three";
// import { gsap } from "gsap";
// import useBookExperienceStore from "../../../stores/experience/useBookExperienceStore";

const BooksStand = ({position}) => {
  // const groupRef = useRef();
  // const { isOpenBookVisible } = useBookExperienceStore();
  const glassMaterialProps = {
    color: "#ffffff",
    transparent: true,
    opacity: 0.25,
    roughness: 0,
    metalness: 0,
    reflectivity: 1,
    transmission: 1,
    clearcoat: 1,
    clearcoatRoughness: 0,
    ior: 1.5,
    side: DoubleSide,
  };

  // // Animate in/out on open/close
  // useEffect(() => {
  //   if (!groupRef.current) return;
  //   if (isOpenBookVisible) {
  //     // Animate in
  //     gsap.to(groupRef.current.position, {
  //       y: 0,
  //       duration: 0.7,
  //       ease: "power3.out"
  //     });
  //     gsap.to(groupRef.current.scale, {
  //       x: 1,
  //       y: 1,
  //       z: 1,
  //       duration: 0.7,
  //       ease: "power3.out"
  //     });
  //   } else {
  //     // Animate out (move down and shrink)
  //     gsap.to(groupRef.current.position, {
  //       y: -2,
  //       duration: 0.7,
  //       ease: "power3.in"
  //     });
  //     gsap.to(groupRef.current.scale, {
  //       x: 0.7,
  //       y: 0.7,
  //       z: 0.7,
  //       duration: 0.7,
  //       ease: "power3.in"
  //     });
  //   }
  // }, [isOpenBookVisible]);

  return (
    <group position={[position[0], -.5, position[2]]} scale={[0.7, 0.7, 0.7]}>
      {/* Stand base */}
      <mesh position={[0, -1, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.2, 1.8, 16]} /> 
        <meshPhysicalMaterial {...glassMaterialProps} />
      </mesh>

      {/* Books demo */}
      <mesh position={[0, 0.4, 0]} rotation={[Math.PI, 0, 0.45]}>
        <boxGeometry args={[0.2, 0.8, 0.5]} />
        <meshPhysicalMaterial {...glassMaterialProps} />
      </mesh>
    </group>
  );
};

export default BooksStand;
