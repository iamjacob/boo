import { create } from "zustand";

export const useShelfZoomStore = create((set, get) => ({
  // State
  isZoomed: false,
  selectedShelf: null, // 0, 1, 2, or 3 for shelf index
  isTransitioning: false,
  
  // Default camera positions
  defaultCameraPosition: [0, 0.0001, 5],
  defaultCameraTarget: [0, 0, 0],
  
  // Shelf-specific zoom positions (positioned to look at each shelf optimally)
  shelfZoomPositions: {
    0: { 
      position: [0, -1.8, 3], 
      target: [0, -1.8, 0],
      fov: 45 
    }, // Bottom shelf
    1: { 
      position: [0, -0.8, 3], 
      target: [0, -0.8, 0],
      fov: 45 
    }, // Second shelf
    2: { 
      position: [0, 0.2, 3], 
      target: [0, 0.2, 0],
      fov: 45 
    }, // Third shelf  
    3: { 
      position: [0, 1.2, 3], 
      target: [0, 1.2, 0],
      fov: 45 
    }, // Top shelf
  },
  
  // Actions
  zoomToShelf: (shelfIndex) => {
    const { isZoomed, selectedShelf, isTransitioning } = get();
    
    // Prevent zoom during transition
    if (isTransitioning) return;
    
    console.log('📚 Zoom to shelf:', shelfIndex, 'Current:', { isZoomed, selectedShelf });
    
    // If already zoomed to this shelf, zoom out
    if (isZoomed && selectedShelf === shelfIndex) {
      set({
        isZoomed: false,
        selectedShelf: null,
        isTransitioning: true,
      });
      
      // Reset transition state after animation
      setTimeout(() => {
        set({ isTransitioning: false });
      }, 1500); // Match animation duration
      
      return;
    }
    
    // Zoom to new shelf
    set({
      isZoomed: true,
      selectedShelf: shelfIndex,
      isTransitioning: true,
    });
    
    // Reset transition state after animation
    setTimeout(() => {
      set({ isTransitioning: false });
    }, 1500); // Match animation duration
  },
  
  zoomOut: () => {
    const { isTransitioning } = get();
    if (isTransitioning) return;
    
    set({
      isZoomed: false,
      selectedShelf: null,
      isTransitioning: true,
    });
    
    setTimeout(() => {
      set({ isTransitioning: false });
    }, 1500);
  },
  
  // Get current camera settings based on zoom state
  getCurrentCameraSettings: () => {
    const { isZoomed, selectedShelf, defaultCameraPosition, defaultCameraTarget, shelfZoomPositions } = get();
    
    if (!isZoomed || selectedShelf === null) {
      return {
        position: defaultCameraPosition,
        target: defaultCameraTarget,
        fov: 75, // Default FOV
      };
    }
    
    return shelfZoomPositions[selectedShelf] || {
      position: defaultCameraPosition,
      target: defaultCameraTarget,
      fov: 75,
    };
  },
  
  // Update shelf zoom positions (for fine-tuning)
  updateShelfZoomPosition: (shelfIndex, position, target, fov = 45) => {
    set((state) => ({
      shelfZoomPositions: {
        ...state.shelfZoomPositions,
        [shelfIndex]: { position, target, fov },
      },
    }));
  },
}));