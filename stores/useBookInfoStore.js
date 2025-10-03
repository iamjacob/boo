import { create } from "zustand";

export const useBookInfoStore = create((set) => ({
  selectedBook: null,
  showBookInfo: false,
  
  // Set the selected book and show info
  setSelectedBook: (book) => set({ 
    selectedBook: book, 
    showBookInfo: !!book 
  }),
  
  // Hide book info
  hideBookInfo: () => set({ 
    selectedBook: null, 
    showBookInfo: false 
  }),
  
  // Toggle book info for a specific book
  toggleBookInfo: (book) => set((state) => ({
    selectedBook: state.selectedBook?.id === book?.id ? null : book,
    showBookInfo: state.selectedBook?.id === book?.id ? false : !!book
  })),
}));