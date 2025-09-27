import {create} from "zustand";

export const useUserStore = create((set, get) => ({
    coins: 100,
    level: 1,
    setCoins: (value) => set({ coins: value }),
    setLevel: (value) => set({ level: value }),
    
    // Coin management methods
    spendCoins: (amount) => {
        const { coins } = get();
        if (coins >= amount) {
            set({ coins: coins - amount });
            return true; // Transaction successful
        }
        return false; // Insufficient coins
    },
    
    addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
    
    hasEnoughCoins: (amount) => {
        const { coins } = get();
        return coins >= amount;
    },
}));
