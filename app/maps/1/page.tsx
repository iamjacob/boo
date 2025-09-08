'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Billboard, Text } from '@react-three/drei';
import { Html } from '@react-three/drei';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Coordinates } from 'react-three-map/maplibre';
// import { Leva } from 'leva';
// import Header from '../../components/Header';
import BoooksHeart from '../../BoooksHeart';
import { StoryMap } from './story-map';
import { createTornado } from './Tornado';

// Import the functions that return location data
import { tornado } from './tornadoData'; // Assumes you have a function returning city locations
import { box } from './trainStationData'; // Assumes you have a function returning train station locations

// Box component for train stations
const Box = ({ position }: { position?: [number, number, number] }) => {
    const ref = useRef(null);
    const [hovered, setHovered] = useState(false);
    const [clicked, setClicked] = useState(false);

    return (
        <mesh
            position={position}
            ref={ref}
            scale={clicked ? 1.5 : 1}
            onClick={() => setClicked(!clicked)}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color={hovered ? 'hotpink' : 'orange'} />
        </mesh>
    );
};

// Main Map Component
const Maplibre = () => {
    useEffect(() => {
      const splash = document.getElementById("splash");
      
      if (splash) {
        splash.classList.add("fade-out");
        setTimeout(() => splash.remove(), 800);
      }
    }, []);

    const [userPosition, setUserPosition] = useState<{ lat: number, lng: number } | null>(null);
    
    // Fetch user's live location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    setUserPosition({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => console.error('Error fetching location:', error),
                { enableHighAccuracy: true }
            );
        }
    }, []);

    const [bookCount] = useState(500);
    const [rotationSpeed] = useState(0.5);

    return (
        <>
            {/* <Leva theme={{ sizes: { rootWidth: '340px', controlWidth: '150px' } }} /> */}
            <div className='h-screen'>
                {/* <Header /> */}
                <StoryMap
                    latitude={55.707813}
                    longitude={9.55368}
                    zoom={16}
                    pitch={85}
                    bearing={305}
                >

                    {/* Fix lighting */}
                    <hemisphereLight args={['#ffffff', '#60666C']} position={[1, 4.5, 3]} intensity={Math.PI} />

                    {/* Loop through train stations and add Box components */}
                    {box().map((station, index) => (
                        <Coordinates key={index} latitude={station.lat} longitude={station.lng}>
                            <object3D scale={10}>
                                <Box position={[0, 0, 0]} />
                                <Html>
                                    <BoooksHeart />
                                </Html>
                            </object3D>
                        </Coordinates>
                    ))}

                    {/* Loop through cities and add tornado effects */}
                    {tornado().map((city, index) => {
                        const tornadoEffect = createTornado({
                            bookCount,
                            rotationSpeed,
                            height: Math.max(20, Math.min(100, bookCount * 0.1)),
                            radius: Math.max(4, Math.min(20, bookCount * 0.02)),
                        });

                        return (
                            <Coordinates key={index} latitude={city.lat} longitude={city.lng}>
                                <object3D>
                                    {tornadoEffect}
                                    <Billboard position={[0, 60, 0]}>
                                        <Html scale={4} position={[0, 0, 20]}>
                                            <BoooksHeart />
                                        </Html>
                                        <Text fontSize={7} color="#000000">
                                            {city.name}
                                        </Text>
                                    </Billboard>
                                </object3D>
                            </Coordinates>
                        );
                    })}

                    {/* Show user's live location */}
                    {userPosition && (
                        <Coordinates latitude={userPosition.lat} longitude={userPosition.lng}>
                            <object3D scale={10}>
                                <Html>
                                    <BoooksHeart />
                                </Html>
                                <Text fontSize={5} color="blue">
                                    You are here!
                                </Text>
                            </object3D>
                        </Coordinates>
                    )}

                </StoryMap>
            </div>
        </>
    );
}

export default Maplibre;
