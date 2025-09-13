import { create } from "zustand";

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export const useCameraStore = create((set) => ({
  position: [0, 0.0001, 5],
  rotation: [0, 0, 0],
  zoom: 3.5,
  smooth: true,
  minPolarAngle: -Math.PI / 2,
  maxPolarAngle: Math.PI / 2,
  minAzimuthAngle: undefined,
  maxAzimuthAngle: undefined,
  dampingFactor: 0.4,
  enablePan: false,
  minDistance: 0,
  maxDistance: 16,
  enableDamping: true,
  enableZoom: true,
    // setPosition: (position) => {
    //   if (Array.isArray(position)) {
    //     // Clamp x and y to [-200, 200], z is unchanged
    //     const x = clamp(position[0], -200, 200);
    //     const y = clamp(position[1], -200, 200);
    //     const z = position[2];
    //     set({ position: [x, y, z] });
    //     console.log('Camera position set to:', [x, y, z]);
    //   } else {
    //     set({ position: [0, 0.0001, 5] });
    //     console.log('Camera position reset to default');
    //   }
    // },
  setRotation: (rotation) => set({ rotation: Array.isArray(rotation) ? rotation : [0, 0, 0] }),
  setZoom: (zoom) => set({ zoom: typeof zoom === 'number' ? zoom : 3.5 }),
  setSmooth: (smooth) => set({ smooth }),
  setOrbitRules: (rules) => set(rules),
}));

// Change rules anywhere in your app like this:
// useCameraStore.getState().setOrbitRules({
//   minPolarAngle: 0,
//   maxPolarAngle: Math.PI,
//   enablePan: true,
//   // ...etc
// });