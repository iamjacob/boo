import { create } from "zustand";

export const useOpenBookStore = create((set, get) => ({
  activeOpenBook: null,
  bookObject: null,
  openBookId: null,
  loadingBookId: null,
  closeBookBeforeMoveToShelf: false,
  closeHandler: null, // Will hold the custom close function from OpenBook
  setBookObject: (obj) => set({ bookObject: obj }),
  setCloseHandler: (handler) => set({ closeHandler: handler }),
  setLoadingBookId: (id) => set({ loadingBookId: id }),
  setOpenBookId: (id) => set({ openBookId: id, loadingBookId: null }),
  closeBook: () => set({ openBookId: null, loadingBookId: null, activeOpenBook: null }),
  /**
   * Toggle book open/close with animation and logging
   * @param {string|number} id - Book id to open
   * @param {object} options - Optional animation params
   */
  toggleBook: (id, options = {}) => {
    const { activeOpenBook } = get();
    if (activeOpenBook) {
        // set({
        //   closeBookBeforeMoveToShelf: true
        // });
        // set({ closeHandler: true });
        set({ openBookId: null, loadingBookId: null, activeOpenBook: null });

    // setTimeout(() => {
    //     set({ closeBookBeforeMoveToShelf: false, closeHandler: null });

    //   // Part 1: Close open book
    // }, 400); 
    
    // Default delay 4200ms, can be customized
      // TODO: Animate scale/position back to initial values here
      console.log('Closed book, scaled back to initial, flew to initial position');
    }


    // Part 2: Fly in book with id, scale to 0, set active
    // TODO: Animate book with id flying in and scaling to 0 here
    set({ openBookId: id });
    console.log(`Opened book ${id}, scaled to 0, set as active`);

    setTimeout(() => {
      set({ activeOpenBook: id });
      console.log(`Opened book ${id}, scaled to 0, set as active`);
    }, options.delay || 4200); // Default delay 4200ms, can be customized
  },
}));
