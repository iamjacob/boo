import React, { useState, useRef, useCallback, useEffect } from "react";
import { Physics } from "@react-three/rapier";
import { Html } from "@react-three/drei";
import { ThrowableCoin } from "./components/ThrowableCoin";
import { ThrowableHeart } from "./components/ThrowableHeart";
import { Snowball } from "./components/Snowball";
import SnowballCameraController from "./components/SnowballCameraController";

import ShelvesPhysics from "./components/ShelvesPhysics";
import Floor from "./components/Floor";
import BackgroundWall from "./components/BackgroundWall";
import PhysicsBooks from "./boooks/PhysicsBooks";
import useProjectileSettingsStore from "../../stores/projectiles/useProjectileSettingsStore";
import { useUserStore } from "../../stores/useUserStore";

const ThrowCoins = ({ 
  books = [], 
  bookRefs = {},
  selectedBook,
  setSelectedBook,
  selectedMainCat,
  selectedSubCat,
  drag,
  setDrag
}) => {
  const [projectiles, setProjectiles] = useState([]);
  const projectileCounter = useRef(0);
  const { 
    projectileType, 
    projectileSettings, 
    uiSettings,
    isSnowballMode,
    toggleSnowballMode 
  } = useProjectileSettingsStore();
  
  // User store for coin management
  const { coins, spendCoins, hasEnoughCoins } = useUserStore();

  // Ensure throwing mode is enabled when ThrowCoins component is active
  useEffect(() => {
    console.log('🎯 ThrowCoins mounted. Current mode:', isSnowballMode);
    
    if (!isSnowballMode) {
      console.log('🔄 Enabling throwing mode...');
      toggleSnowballMode();
    }
    
    // Cleanup: disable throwing mode when component unmounts
    return () => {
      console.log('🎯 ThrowCoins unmounting. Disabling throwing mode.');
      // Don't disable on unmount - let the user control it via the UI
    };
  }, []); // Empty dependency array so it only runs on mount/unmount

  // Handle projectile throwing
  const handleProjectileThrow = useCallback(({ position, velocity }) => {
    console.log('🎯 ThrowCoins: Handling projectile throw', { position, velocity, projectileType });
    
    // Check if trying to throw a coin and validate coin count
    if (projectileType === 'coin') {
      if (!hasEnoughCoins(1)) {
        console.log('🪙 Insufficient coins! Current coins:', coins);
        // Optional: Show a notification or feedback to user
        return; // Don't throw if no coins available
      }
      
      // Spend a coin for throwing
      const coinSpent = spendCoins(1);
      if (!coinSpent) {
        console.log('🚫 Failed to spend coin!');
        return;
      }
      
      console.log('💰 Coin spent! Remaining coins:', coins - 1);
    }
    
    const id = Date.now() + projectileCounter.current++;
    const newProjectile = {
      id,
      type: projectileType,
      position,
      velocity,
      createdAt: Date.now(),
    };

    console.log('🪙 Creating new projectile:', newProjectile);

    setProjectiles(prev => {
      const updated = [...prev, newProjectile];
      console.log('📦 Total projectiles:', updated.length);
      
      // Auto-cleanup old projectiles if enabled
      if (projectileSettings.autoCleanup && updated.length > projectileSettings.maxProjectiles) {
        return updated.slice(-projectileSettings.maxProjectiles);
      }
      
      return updated;
    });

    // Auto-remove after delay if enabled
    if (projectileSettings.autoCleanup && projectileSettings.cleanupDelay) {
      setTimeout(() => {
        setProjectiles(prev => prev.filter(p => p.id !== id));
      }, projectileSettings.cleanupDelay);
    }
  }, [projectileType, projectileSettings, hasEnoughCoins, spendCoins, coins]);

  // Handle projectile collection (for future features)
  const handleProjectileCollect = useCallback((collectData) => {
    console.log('📦 Projectile collected:', collectData);
    
    // Remove from active projectiles
    setProjectiles(prev => prev.filter(p => p.id !== collectData.id));
    
    // Future: Add to inventory, increase score, etc.
  }, []);

  // Render projectile based on type
  const renderProjectile = (projectile) => {
    const props = {
      key: projectile.id,
      id: projectile.id,
      position: projectile.position,
      linearVelocity: projectile.velocity,
      thrownBy: 'player', // Future: get from user context
      thrownAt: new Date(projectile.createdAt).toISOString(),
      isCollectible: false, // Future: make true after settling
      onCollect: handleProjectileCollect,
    };

    switch (projectile.type) {
      case 'coin':
        return <ThrowableCoin {...props} />;
      case 'heart':
        return <ThrowableHeart {...props} />;
      case 'snowball':
        return <Snowball {...props} />;
      default:
        return <ThrowableCoin {...props} />;
    }
  };

  return (
    <Physics 
      gravity={[0, -9.81, 0]} 
      debug={false} // Set to true for physics debugging
    >
      {/* Physics Environment */}
      <ShelvesPhysics />
      <Floor />
      <BackgroundWall debug={false} />
      
      {/* Camera Controller for Throwing */}
      <SnowballCameraController onSnowballThrow={handleProjectileThrow} />
      
      {/* UI Toggle removed - using coin button in BottomNav instead */}
      
      {/* Physics Books */}
      <PhysicsBooks
        books={books}
        selectedMainCat={selectedMainCat}
        selectedSubCat={selectedSubCat}
        bookRefs={bookRefs}
        selectedBook={selectedBook}
        setSelectedBook={setSelectedBook}
        drag={drag}
        setDrag={setDrag}
      />
      
      {/* Active Projectiles */}
      {projectiles.map(renderProjectile)}
      
      {/* Coin Counter - Show current coins when in coin throwing mode */}
      {/* {projectileType === 'coin' && (
        <Html>
          <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.8)',
            color: coins > 0 ? '#ffd700' : '#ff6b6b',
            padding: '8px 12px',
            borderRadius: '8px',
            zIndex: 1000,
            fontSize: '16px',
            fontWeight: 'bold',
            border: `2px solid ${coins > 0 ? '#ffd700' : '#ff6b6b'}`,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          }}>
            🪙 Coins: {coins}
            {coins === 0 && (
              <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
                No coins left!
              </div>
            )}
          </div>
        </Html>
      )} */}
      
      {/* Projectile Counter (if enabled) - using Html wrapper */}
      {/* {uiSettings.showProjectileCounter && (
        <Html>
          <div style={{
            position: 'fixed',
            top: '60px',
            right: '10px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            zIndex: 1000,
            fontSize: '14px',
          }}>
            🎯 Active Projectiles: {projectiles.length}
          </div>
        </Html>
      )} */}
      
      {/* Debug info for throwing mode - using Html wrapper */}
      {/* <Html>
        <div style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          zIndex: 1000,
          fontSize: '12px',
        }}>
          🎯 Throwing Mode: {isSnowballMode ? '✅ ON' : '❌ OFF'}<br/>
          🪙 Projectile: {projectileType}<br/>
          📦 Active: {projectiles.length}
        </div>
      </Html>
       */}
      {/* Instructions overlay - using Html wrapper */}
      {/* {isSnowballMode && (
        <Html>
          <div style={{
            position: 'fixed',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            zIndex: 1000,
            fontSize: '14px',
          }}>
            🪙 Click anywhere to throw coins!
          </div>
        </Html>
      )} */}
    </Physics>
  );
};

export default ThrowCoins;