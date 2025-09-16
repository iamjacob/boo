import { create } from "zustand";

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
  setPosition: (position) => set({ position: Array.isArray(position) ? position : [0, 0.0001, 5] }),
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