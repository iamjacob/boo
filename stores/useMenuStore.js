// I need in here menu to be able to transform.
import { create } from "zustand";

export const useMenuStore = create((set) => ({
    WishList: false,
    Secret: false,
    ReadingNow: false,
    Scanner: false,
    MenuOpen: false,
    FilterOpen: false,
    toggleFilter: () => set((state) => ({ FilterOpen: !state.FilterOpen })),
    setMenuOpen: (value) => set({ MenuOpen: value }),
    setScanner: (value) => set({ Scanner: value }),
    setReadingNow: (value) => set({ ReadingNow: value }),
    setWishList: (value) => set({ WishList: value }),
    setSecret: (value) => set({ Secret: value }),
}));