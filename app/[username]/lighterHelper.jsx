import { useRef } from "react"
import { PointLightHelper } from "three"
import { useHelper } from "@react-three/drei"
import { Leva, useControls } from "leva"

export default function Lighter({ intensity = 1, color = "white", position = [2, 2, 2], rotation = [0, 0, 0] }) {
  const lightRef = useRef();
  useHelper(lightRef, PointLightHelper, 0.5, "hotpink");
  return (
    <pointLight
      ref={lightRef}
      position={position}
      intensity={intensity}
      color={color}
      rotation={rotation}
    />
  );
}
export function LighterWithControls() {
  const { intensity, color, x, y, z, rotX, rotY, rotZ } = useControls("Point Light", {
    intensity: { value: 1, min: 0, max: 10, step: 0.1 },
    color: { value: "#ffffff" },
    x: { value: 2, min: -10, max: 10, step: 0.1 },
    y: { value: 2, min: -10, max: 10, step: 0.1 },
    z: { value: 2, min: -10, max: 10, step: 0.1 },
    rotX: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
    rotY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
    rotZ: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 }
  });

  return (
    <>
      <Leva collapsed={false} />
      <Lighter
        intensity={intensity}
        color={color}
        position={[x, y, z]}
        rotation={[rotX, rotY, rotZ]}
      />
    </>
  );
}