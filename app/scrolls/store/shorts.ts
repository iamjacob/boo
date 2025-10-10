import {create} from 'zustand';

const generateRandomId = () => Math.random().toString(36).substring(2, 15);

type HistoryItem = {
  id: string;
};

type ShortsStore = {
  currentIndex: number;
  history: HistoryItem[];
  setCurrentIndex: (index: number) => void;
  addNewScene: () => void;
  navigateToId: (id: string) => boolean;
  updateURL: (id: string) => void;
};

const createInitialHistory = (): HistoryItem[] => {
  return Array.from({ length: 3 }, () => ({
    id: generateRandomId(),
  }));
};

export const useShortsStore = create<ShortsStore>((set, get) => ({
  currentIndex: 0,
  history: createInitialHistory(),
  setCurrentIndex: (index) => {
    set({ currentIndex: index });
    const { history } = get();
    if (history[index]) {
      get().updateURL(history[index].id);
    }
  },
  addNewScene: () =>
    set((state) => ({
      history: [
        ...state.history,
        {
          id: generateRandomId(),
        },
      ],
    })),
  navigateToId: (id: string) => {
    const { history } = get();
    const index = history.findIndex(item => item.id === id);
    if (index !== -1) {
      set({ currentIndex: index });
      return true;
    }
    return false;
  },
  updateURL: (id: string) => {
    window.history.pushState(null, "", `/scrolls/${id}`);
  }
}));