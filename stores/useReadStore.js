// I need in here menu to be able to transform.
import { create } from "zustand";

export const useReadStore = create((set) => ({
    ReadingNow: false,
    setReadingNow: (value) => set({ ReadingNow: value }),
}));