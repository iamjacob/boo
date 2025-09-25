import { create } from "zustand";

export const useBooksStore = create((set) => ({
  books: [],
  addBook: (book) => set((state) => ({
    books: [
      ...state.books,
      {
        id: book.id || Date.now().toString(),
        title: book.title || "Untitled",
        position: book.position || { x: 0, y: 0, z: 0 },
        rotation: book.rotation || { x: 0, y: 0, z: 0 },
        scale: book.scale || { width: 1, height: 1.5, thickness: 0.2 },
        cover: book.cover || { front: "" },
        categories: book.categories || { main: [], sub: [] },
        tags: book.tags || [],
        author: book.author || "",
        year: book.year || null,
        pages: book.pages || null,
        ...book,
      }
    ]
  })),
  setBooks: (books) => set({ books }),
  setBooksFromJson: (jsonBooks) => set({ books: jsonBooks }),
}));
