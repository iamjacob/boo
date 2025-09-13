import { create } from "zustand";

export const useLevelStore = create((set, get) => ({
  level: 4, // Starting level -> set on loading user!
  setLevel: (level) => set({ level }),
  levelUp: () => set((state) => ({ level: state.level + 1 })),
  levelDown: () => set((state) => ({ level: Math.max(1, state.level - 1) })),
  // You can add more level-related state here later
}));


//use it like this!!! :D
// import { useLevelStore } from '../stores/useLevelStore';
// import { levelSettings } from '../config/levelConfig';

// const level = useLevelStore((s) => s.level);
// const settings = levelSettings[level - 1];