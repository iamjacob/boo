// import { ThemeState, useLadleContext } from '@ladle/react';
import MapLibre from "maplibre-gl";
import 'maplibre-gl/dist/maplibre-gl.css';
import { FC, memo, useEffect, useRef } from "react";
import Map, { useMap } from 'react-map-gl/maplibre';
import { StoryMapProps } from './story-map';
import { Canvas } from 'react-three-map/maplibre';

/** Maplibre `<Map>` styled for stories */
export const StoryMaplibre: FC<Omit<StoryMapProps, 'mapboxChildren'>> = ({
  latitude, longitude, canvas, mapChildren, maplibreChildren, children, ...rest
}) => {

//   const theme = useLadleContext().globalState.theme;

//   const mapStyle = theme === ThemeState.Dark
//     ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
//     : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
    //const mapStyle =  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
    
    const mapStyle =  "https://tiles.openfreemap.org/styles/liberty";
    //const mapStyle = "./styles/liberty-no-labels.json";

    //const mapStyle = "https://demotiles.maplibre.org/style.json";


  return <div className="h-screen relative">
    <Map
      mapLib={MapLibre}
      initialViewState={{ latitude, longitude, ...rest }}
      maxPitch={75} // Pokemon GO max pitch
      minPitch={0}  // Pokemon GO min pitch
      maxZoom={20}  // Pokemon GO max zoom
      minZoom={10}  // Pokemon GO min zoom
      mapStyle={mapStyle}
      interactiveLayerIds={[]} // Disable feature clicking for smoother interaction
      dragRotate={true}        // Allow rotation like Pokemon GO
      touchZoomRotate={true}   // Touch gestures
    >
      <FlyTo latitude={latitude} longitude={longitude} zoom={rest.zoom} />
      {mapChildren}
      {maplibreChildren}
      <Canvas latitude={latitude} longitude={longitude} {...canvas}>
        {children}
      </Canvas>
    </Map>
  </div>
}

interface FlyToProps {
  latitude: number,
  longitude: number,
  zoom?: number,
}

const FlyTo = memo<FlyToProps>(({ latitude, longitude }) => {

  const map = useMap();
  const firstRun = useRef(true);

  useEffect(() => {
    if (!map.current) return;   
    if (firstRun.current) return;

    map.current.easeTo({
      center: { lon: longitude, lat: latitude },
      zoom: map.current.getZoom(),
      duration: 0,
    })
  }, [map, latitude, longitude])

  // Initialize pitch based on initial zoom
  useEffect(() => {
    const currentMap = map.current?.getMap?.() as import('maplibre-gl').Map | undefined;
    if (!currentMap || !firstRun.current) return;

    const setInitialPitch = () => {
      const zoom = currentMap.getZoom();
      const minZoom = 10;
      const maxZoom = 20;
      const clampedZoom = Math.max(minZoom, Math.min(maxZoom, zoom));
      const zoomNormalized = (clampedZoom - minZoom) / (maxZoom - minZoom);
      
      // Same easing as in zoom handler
      const easeInOutCubic = (t: number) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };
      
      const zoomEased = easeInOutCubic(zoomNormalized);
      const initialPitch = 0 + (75 - 0) * zoomEased;
      
      currentMap.setPitch(initialPitch);
      console.log(`Initial pitch set to: ${initialPitch.toFixed(2)} for zoom: ${zoom.toFixed(2)}`);
    };

    if (currentMap.isStyleLoaded()) {
      setInitialPitch();
    } else {
      currentMap.once('styledata', setInitialPitch);
    }
  }, [map]);

useEffect(() => {
  const currentMap = map.current?.getMap?.() as import('maplibre-gl').Map | undefined;
  if (!currentMap) return;

  let animationFrame: number;
  let isAnimating = false;

  const handleZoom = () => {
    if (isAnimating) return;
    isAnimating = true;

    const animate = () => {
      const zoom = currentMap.getZoom();
      
      // Pokemon GO-style zoom ranges and easing
      const minZoom = 10;
      const maxZoom = 20;
      const clampedZoom = Math.max(minZoom, Math.min(maxZoom, zoom));
      
      // Normalize zoom (0 to 1)
      const zoomNormalized = (clampedZoom - minZoom) / (maxZoom - minZoom);
      
      // Pokemon GO-style easing curve (smooth S-curve)
      const easeInOutCubic = (t: number) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };
      
      const zoomEased = easeInOutCubic(zoomNormalized);
      
      // Pitch ranges - more dramatic like Pokemon GO
      const minPitch = 0;   // Flat at low zoom
      const maxPitch = 75;  // Steep at high zoom
      
      const targetPitch = minPitch + (maxPitch - minPitch) * zoomEased;
      const currentPitch = currentMap.getPitch();
      
      // Smooth interpolation for pitch changes
      const pitchDiff = targetPitch - currentPitch;
      const smoothingFactor = 0.15; // Adjust for smoothness (0.1 = slower, 0.3 = faster)
      
      if (Math.abs(pitchDiff) > 0.1) {
        const newPitch = currentPitch + (pitchDiff * smoothingFactor);
        currentMap.setPitch(newPitch);
        
        // Continue animation
        animationFrame = requestAnimationFrame(animate);
      } else {
        // Close enough, set final value and stop
        currentMap.setPitch(targetPitch);
        isAnimating = false;
      }
      
      // Debug info
      console.log(`Zoom: ${zoom.toFixed(2)} | Pitch: ${currentMap.getPitch().toFixed(2)} | Target: ${targetPitch.toFixed(2)}`);
    };
    
    animate();
  };

  // Handle both zoom and pitch events for smoother updates
  currentMap.on('zoom', handleZoom);
  currentMap.on('zoomstart', handleZoom);
  currentMap.on('zoomend', () => {
    isAnimating = false;
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });

  return () => {
    currentMap.off('zoom', handleZoom);
    currentMap.off('zoomstart', handleZoom);
    currentMap.off('zoomend', () => {});
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  };
}, [map]);





  useEffect(() => {
    firstRun.current = false;
  }, [])


    useEffect(() => {
    const currentMap = map.current?.getMap?.() as import('maplibre-gl').Map | undefined;
    if (!currentMap) return;

    const onStyleLoad = () => {
      const layers = currentMap.getStyle().layers;
      if (Array.isArray(layers)) {
        
        // Remove 3D buildings layer if it exists
        //currentMap.removeLayer('3d-buildings'); - NOT WORKING

        layers.forEach(layer => {
          if (layer.type === 'symbol') {
            currentMap.removeLayer(layer.id);
          }
        });
      }
    };

    currentMap.on('style.load', onStyleLoad);
    return () => {
      currentMap.off('style.load', onStyleLoad);
    };
  }, [map]);


  return <></>
})
FlyTo.displayName = 'FlyTo';