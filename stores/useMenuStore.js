// I need in here menu to be able to transform.
import { create } from "zustand";

export const useMenuStore = create((set) => ({
    WishList: false,
    ReadingNow: false,
    setReadingNow: (value) => set({ ReadingNow: value }),
    setWishList: (value) => set({ WishList: value }),
}));