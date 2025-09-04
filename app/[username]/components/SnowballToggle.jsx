import React from "react";
import { Html } from "@react-three/drei";
import useProjectileSettingsStore from "../../stores/projectiles/useProjectileSettingsStore";

const SnowballToggle = () => {
  const { 
    isSnowballMode, 
    projectileType, 
    uiSettings,
    toggleSnowballMode, 
    setProjectileType,
    getVelocityMultiplier,
    getProjectileSettings
  } = useProjectileSettingsStore();

  const projectileTypes = [
    { 
      key: 'heart', 
      emoji: '❤️', 
      label: 'Heart',
      strength: 'Medium',
      description: 'Loving and bouncy'
    },
    { 
      key: 'coin', 
      emoji: '🪙', 
      label: 'Coin',
      strength: 'Heavy',
      description: 'Dense and powerful'
    },
  ];

  const currentProjectile = projectileTypes.find(p => p.key === projectileType) || projectileTypes[0];

  // Get position style based on UI settings
  const getPositionStyle = () => {
    const { toggleButtonPosition } = uiSettings;
    const baseStyle = {
      position: "fixed",
      zIndex: 1000,
    };

    switch (toggleButtonPosition) {
      case 'top-left':
        return { ...baseStyle, top: "20px", left: "20px" };
      case 'top-right':
        return { ...baseStyle, top: "20px", right: "20px" };
      case 'bottom-left':
        return { ...baseStyle, bottom: "20px", left: "20px" };
      case 'bottom-right':
        return { ...baseStyle, bottom: "20px", right: "20px" };
      default:
        return { ...baseStyle, top: "20px", right: "20px" };
    }
  };

  if (!uiSettings.showToggleButton) return null;

  return (
    <Html>
      <div style={{
        ...getPositionStyle(),
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}>
        {/* Main toggle button */}
        <button
          onClick={toggleSnowballMode}
          style={{
            padding: "12px 20px",
            backgroundColor: isSnowballMode ? "#ef4444" : "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
          }}
        >
          <span style={{ fontSize: "20px" }}>
            {isSnowballMode ? currentProjectile.emoji : "📚"}
          </span>
          {isSnowballMode ? `Exit ${currentProjectile.label} Mode` : `Enter ${currentProjectile.label} Mode`}
        </button>

        {/* Projectile type selector (only show when in throwing mode) */}
        {isSnowballMode && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            background: "rgba(0, 0, 0, 0.8)",
            padding: "10px",
            borderRadius: "8px",
            minWidth: "200px",
          }}>
            <div style={{
              color: "white",
              fontSize: "12px",
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: "5px",
            }}>
              Select Projectile
            </div>
            
            {projectileTypes.map((type) => (
              <button
                key={type.key}
                onClick={() => setProjectileType(type.key)}
                style={{
                  padding: "10px 12px",
                  backgroundColor: projectileType === type.key ? "#3b82f6" : "transparent",
                  color: "white",
                  border: `2px solid ${projectileType === type.key ? "#3b82f6" : "#4b5563"}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (projectileType !== type.key) {
                    e.target.style.backgroundColor = "rgba(59, 130, 246, 0.2)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (projectileType !== type.key) {
                    e.target.style.backgroundColor = "transparent";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "16px" }}>{type.emoji}</span>
                  <span style={{ fontWeight: "bold" }}>{type.label}</span>
                </div>
                <div style={{ 
                  fontSize: "10px", 
                  color: type.strength === 'Light' ? '#22c55e' : 
                         type.strength === 'Medium' ? '#f59e0b' : '#ef4444',
                  fontWeight: "bold"
                }}>
                  {type.strength} • {type.description}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Html>
  );
};

export default SnowballToggle;
