import { create } from "zustand";

export const useLevelStore = create((set, get) => ({
  level: 10, // Starting level -> set on loading user!
  showConfetti: false, // Track if confetti should be shown
  confettiStartTime: null, // Track when confetti started
  setLevel: (level) => set({ level }),
  levelUp: () => set((state) => ({ 
    level: state.level + 1,
    showConfetti: true,
    confettiStartTime: Date.now()
  })),
  levelDown: () => set((state) => ({ level: Math.max(1, state.level - 1) })),
  stopConfetti: () => set({ showConfetti: false, confettiStartTime: null }),
  // You can add more level-related state here later
}));


//use it like this!!! :D
// import { useLevelStore } from '../stores/useLevelStore';
// import { levelSettings } from '../config/levelConfig';

// const level = useLevelStore((s) => s.level);
// const settings = levelSettings[level - 1];