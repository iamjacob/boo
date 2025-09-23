
import Book from "./Book";
// import { DoubleSide } from "three";
// import { gsap } from "gsap";
// import { useMenuStore } from "../../../stores/useMenuStore";

const BooksStand = ({position, book, index = 0}) => {
  // const groupRef = useRef();
  // Use Zustand's ReadingNow state
  // const isReadingNow = useMenuStore((s) => s.ReadingNow);
  // const glassMaterialProps = {
  //   color: "#ffffff",
  //   transparent: true,
  //   opacity: 0.25,
  //   roughness: 0,
  //   metalness: 0,
  //   reflectivity: 1,
  //   transmission: 1,
  //   clearcoat: 1,
  //   clearcoatRoughness: 0,
  //   ior: 1.5,
  //   side: DoubleSide,
  // };

  // Animate in/out on ReadingNow open/close
  // useEffect(() => {
  //   if (!groupRef.current) return;
  //   const delay = index * 1; // 1 second per book
  //   if (isReadingNow) {
  //     // Animate in
  //     gsap.to(groupRef.current.position, {
  //       y: 0,
  //       duration: 0.7,
  //       delay,
  //       ease: "power3.out"
  //     });
  //     gsap.to(groupRef.current.scale, {
  //       x: 1,
  //       y: 1,
  //       z: 1,
  //       duration: 0.7,
  //       delay,
  //       ease: "power3.out"
  //     });
  //   } else {
  //     // Animate out (move down and shrink)
  //     gsap.to(groupRef.current.position, {
  //       y: -2,
  //       duration: 0.7,
  //       delay,
  //       ease: "power3.in"
  //     });
  //     gsap.to(groupRef.current.scale, {
  //       x: 0.7,
  //       y: 0.7,
  //       z: 0.7,
  //       duration: 0.7,
  //       delay,
  //       ease: "power3.in"
  //     });
  //   }
  // }, [isReadingNow, index]);

  return (
    <group position={[position[0], -.5, position[2]]}>
      {/* Stand base 
      <mesh position={[0, -1, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.2, 1.8, 16]} /> 
        <meshPhysicalMaterial {...glassMaterialProps} />
      </mesh>*/}

      {/* Books reading */}
      <Book book={book} position={[0, 0.4, 0]} rotation={[0,0, 0.45]} readPos={[position[0], -.5, position[2]]} />

    </group>
  );
};

export default BooksStand;
