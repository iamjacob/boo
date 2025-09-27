import { create } from "zustand";

const useProjectileSettingsStore = create((set, get) => ({
  // Core state
  isSnowballMode: true, // Default to enabled for coin throwing
  projectileType: 'coin', // 'coin', 'heart', 'snowball'
  
  // Velocity multipliers for different projectile types
  velocityMultipliers: {
    coin: 40, // Reduced from 80 to half speed
    heart: 60,
    snowball: 50,
  },
  
  // UI Settings
  uiSettings: {
    showToggleButton: true,
    showProjectileCounter: false,
    toggleButtonPosition: 'bottom-right', // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
  },
  
  // Projectile settings (for future expansion)
  projectileSettings: {
    maxProjectiles: 50, // Maximum projectiles in scene
    autoCleanup: true,  // Auto-remove old projectiles
    cleanupDelay: 30000, // 30 seconds
  },
  
  // Actions
  toggleSnowballMode: () => set((state) => ({ 
    isSnowballMode: !state.isSnowballMode 
  })),
  
  setProjectileType: (type) => set({ projectileType: type }),
  
  getVelocityMultiplier: (type) => {
    const state = get();
    return state.velocityMultipliers[type] || 50;
  },
  
  updateVelocityMultiplier: (type, velocity) => set((state) => ({
    velocityMultipliers: {
      ...state.velocityMultipliers,
      [type]: velocity,
    }
  })),
  
  updateUISettings: (newSettings) => set((state) => ({
    uiSettings: {
      ...state.uiSettings,
      ...newSettings,
    }
  })),
  
  updateProjectileSettings: (newSettings) => set((state) => ({
    projectileSettings: {
      ...state.projectileSettings,
      ...newSettings,
    }
  })),
  
  getProjectileSettings: () => get().projectileSettings,
  
  resetToDefaults: () => set({
    velocityMultipliers: {
      coin: 40, // Reduced from 80 to half speed
      heart: 60,
      snowball: 50,
    },
    uiSettings: {
      showToggleButton: true,
      showProjectileCounter: false,
      toggleButtonPosition: 'bottom-right',
    },
    projectileSettings: {
      maxProjectiles: 50,
      autoCleanup: true,
      cleanupDelay: 30000,
    },
  }),
}));

export default useProjectileSettingsStore;