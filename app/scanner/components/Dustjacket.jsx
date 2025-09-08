import React from 'react'

const Dustjacket = ({ DJrightPageRef, DJrightPageFlipRef, DJleftPageRef, DJleftPageFlipRef, DJspinePageRef, glassMaterialProps, width, height, thickness }) => {
  return (
    <>
    {/* Dust jacket */}
      {/* Front cover */}
      <group position={[-.1, 0, 0]}>
      <group
        ref={DJrightPageRef}
        position={[-width * 0.5, 0, thickness * 0.5]}
        rotation={[0, 0, 0]}
      >
        <mesh position={[width / 2, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, height, 0.001]} />
          <meshPhysicalMaterial {...glassMaterialProps} />
        </mesh>
      </group>

      {/* Front cover flip */}
      <group
        ref={DJrightPageFlipRef}
        position={[-width * 0.5, 0, thickness * 0.5]}
        rotation={[0, 0, 0]}
      >
        <mesh position={[width*0.75, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[width/2, height, 0.001]} />
          <meshPhysicalMaterial {...glassMaterialProps} />
        </mesh>
      </group>

      {/* DJ Back cover */}
      <group
        ref={DJleftPageRef}
        position={[-width * 0.5, 0, -thickness * 0.5]}
        rotation={[0, 0, 0]}
      >
        <mesh position={[width / 2, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, height, 0.001]} />
          <meshPhysicalMaterial {...glassMaterialProps} />
        </mesh>
      </group>

      {/* DJ left flip */}
      <group
        ref={DJleftPageFlipRef}
        position={[-width * 0.5, 0, -thickness * 0.5]}
        rotation={[0, 0, 0]}
      >
        <mesh position={[width, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[width/2, height, 0.001]} />
          <meshPhysicalMaterial {...glassMaterialProps} />
        </mesh>
      </group>


      {/* Spine */}
      <mesh
        ref={DJspinePageRef}
        position={[-width * 0.5, 0, 0]}
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.001, height, thickness + 0.001]} />
        <meshPhysicalMaterial {...glassMaterialProps} />
      </mesh>
</group>
</>
  )
}

export default Dustjacket