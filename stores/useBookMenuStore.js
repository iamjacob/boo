import { create } from 'zustand';

export const useBookMenuStore = create((set, get) => ({
  // UI State
  isMenuVisible: false,
  currentPage: 0,
  pages: 0,
  bookOpen: false,
  hoveredPage: null,
  book: null,

  // Actions
  setMenuVisible: (visible) => set({ isMenuVisible: visible }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setPages: (pages) => set({ pages }),
  setBookOpen: (open) => set({ bookOpen: open }),
  setHoveredPage: (page) => set({ hoveredPage: page }),
  setBook: (book) => set({ book }),

  // Book Controls
  flipForward: null,
  flipBackward: null,
  openBook: null,
  closeBook: null,
  toggleBook: null,

  // Register functions from OpenBook component
  registerControls: (controls) => set({
    flipForward: controls.flipForward,
    flipBackward: controls.flipBackward,
    openBook: controls.openBook,
    closeBook: controls.closeBook,
    toggleBook: controls.toggleBook,
  }),

  // Clear controls on unmount
  clearControls: () => set({
    flipForward: null,
    flipBackward: null,
    openBook: null,
    closeBook: null,
    toggleBook: null,
  }),

  // Reset all state
  reset: () => set({
    isMenuVisible: false,
    currentPage: 0,
    pages: 0,
    bookOpen: false,
    hoveredPage: null,
    book: null,
  }),
}));