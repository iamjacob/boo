'use client';
import React, { useState, useEffect } from 'react';
import { Billboard, Text } from '@react-three/drei';
import { Html } from '@react-three/drei';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Coordinates } from 'react-three-map/maplibre';
// import { Leva } from 'leva';
// import Header from '../components/Header/Header';
import BoooksHeart from '../BoooksHeart';
import { StoryMap } from './story-map';
import { createTornado } from './Tornado';

// const Box = ({ position }: { position?: [number, number, number] }) => {
//     const ref = useRef(null);
//     const [hovered, setHovered] = useState(false);
//     const [clicked, setClicked] = useState(false);

//     // useFrame((_, delta) => {
//     //     if (ref.current) {
//     //         ref.current.rotation.x += delta;
//     //         ref.current.rotation.z -= delta;
//     //     }
//     // });

//     return (
//         <mesh
//             position={position}
//             ref={ref}
//             scale={clicked ? 1.5 : 1}
//             onClick={() => setClicked(!clicked)}
//             onPointerOver={() => setHovered(true)}
//             onPointerOut={() => setHovered(false)}
//         >
//             <boxGeometry args={[1, 1, 1]} />
//             <meshBasicMaterial color={hovered ? 'hotpink' : 'orange'} />
//         </mesh>
//     );
// };

const Maplibre = () => {
    const [bookCount] = useState(500);
    const [rotationSpeed] = useState(0.5);

    useEffect(() => {
      const splash = document.getElementById("splash");
      
      if (splash) {
        splash.classList.add("fade-out");
        setTimeout(() => splash.remove(), 800);
      }
    }, []);

    const tornado = createTornado({
        bookCount,
        rotationSpeed,
        height: Math.max(20, Math.min(100, bookCount * 0.1)),
        radius: Math.max(4, Math.min(20, bookCount * 0.02)),
    });

    return (
        <>
            {/* <Leva theme={{ sizes: { rootWidth: '340px', controlWidth: '150px' } }} /> */}
            <div className='w-screen h-screen absolute top-0 right-0'>
                {/* <Header></Header> */}
                <StoryMap
                    //start position == users town++
                    latitude={55.707813}
                    longitude={9.55368}
                    zoom={16}
                    pitch={85}
                    bearing={305}
                    // canvas={{ frameloop: 'demand' }}
                >

                    {/* fix light! */}
                    <hemisphereLight
                        args={['#ffffff', '#60666C']}
                        position={[1, 4.5, 3]}
                        intensity={Math.PI}
                    />

                    {/* <Coordinates latitude={55.707813} longitude={9.55368}>

                        <object3D scale={10}>
                            <Box position={[0, 0, 0]} />
                            <Html>
                                <BoooksHeart />
                            </Html>
                        </object3D>
                    </Coordinates>

                     <Coordinates latitude={52} longitude={0}>
                        <object3D scale={10}>
                            <Box position={[0, 0, 0]} />
                            <Html>
                                <BoooksHeart />
                            </Html>
                        </object3D>
                    </Coordinates> */}

                    <Coordinates latitude={55.707813} longitude={9.55368}>

                        <object3D>
                            {tornado}
                            <Billboard position={[0, 60, 0]}>
                                <Html scale={4} position={[0,0,20]} >
                                    <BoooksHeart/>
                                </Html>
                                <Text fontSize={7} color="#000000">
                                    Jacob G.
                                </Text>
                            </Billboard>
                        </object3D>
                    </Coordinates>
{/*
                    <Coordinates latitude={55.407813} longitude={9.45368}>
                        <object3D>
                            {tornado}
                            <Billboard position={[0, 60, 0]}>
                                <Html scale={4} position={[0,0,20]} >
                                    <BoooksHeart/>
                                </Html>
                                <Text fontSize={7} color="#000000">
                                    Jacob G.
                                </Text>
                            </Billboard>
                        </object3D>
                    </Coordinates>


                    <Coordinates latitude={55.007813} longitude={9.58368}>
                        <object3D>
                            {tornado}
                            <Billboard position={[0, 60, 0]}>
                                <Html scale={4} position={[0,0,20]} >
                                    <BoooksHeart/>
                                </Html>
                                <Text fontSize={7} color="#000000">
                                    Jacob G.
                                </Text>
                            </Billboard>
                        </object3D>
                    </Coordinates> */}


                </StoryMap>
            </div>
        </>
    );
}

export default Maplibre;
