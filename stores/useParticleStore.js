import { create } from 'zustand'

export const useParticleStore = create((set) => ({
  isFormingBook: false,
  formingBookData: null,
  
  startBookFormation: (bookData) => set({ 
    isFormingBook: true, 
    formingBookData: bookData 
  }),
  
  completeBookFormation: () => set({ 
    isFormingBook: false, 
    formingBookData: null 
  })
}))