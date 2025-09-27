import { create } from "zustand";

// Helper function to get initial state from localStorage
const getInitialState = () => {
  if (typeof window === "undefined") return { user: null, isLoggedIn: false };

  const storedUser = localStorage.getItem("user");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    isLoggedIn: isLoggedIn, // Changed this line - use the actual isLoggedIn value
  };
};

export const useAuthStore = create((set, get) => ({
  ...getInitialState(), // Initialize with localStorage data

  setUser: (user) => {
    const loggedIn = !!user;
    set({ user, isLoggedIn: loggedIn });
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");
    } else {
      localStorage.removeItem("user");
      localStorage.setItem("isLoggedIn", "false");
    }
  },

  setLogin: (value) => {
    set({ isLoggedIn: value });
    localStorage.setItem("isLoggedIn", value.toString());
  },

  logout: () => {
    set({ user: null, isLoggedIn: false });
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
  },
}));
