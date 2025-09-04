import React from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";

const Floor = () => {
    return (
        <RigidBody type="fixed" colliders={false} name="floor">
            <CuboidCollider args={[20, 0.1, 20]} position={[0, -2, 0]} />
            <mesh position={[0, -2, 0]}>
                <cylinderGeometry args={[20, 20, 0.2, 64]} />
                <meshStandardMaterial transparent opacity={0} />
            </mesh>
        </RigidBody>
    );
};

export default Floor;
