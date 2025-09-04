import React, { useState } from "react";
import { Html } from "@react-three/drei";
import useProjectileSettingsStore from "../../../stores/projectiles/useProjectileSettingsStore";

const ProjectileSettingsPanel = ({ isVisible, onClose }) => {
  const { 
    velocityMultipliers,
    projectileSettings,
    uiSettings,
    updateVelocityMultiplier,
    updateProjectileSettings,
    updateUISettings,
    resetToDefaults
  } = useProjectileSettingsStore();

  if (!isVisible) return null;

  return (
    <Html>
      <div style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "rgba(0, 0, 0, 0.9)",
        color: "white",
        padding: "20px",
        borderRadius: "12px",
        zIndex: 2000,
        maxWidth: "500px",
        maxHeight: "80vh",
        overflowY: "auto",
        border: "2px solid #3b82f6",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          borderBottom: "1px solid #4b5563",
          paddingBottom: "10px",
        }}>
          <h2 style={{ margin: 0, color: "#3b82f6" }}>🎯 Projectile Settings</h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "20px",
              cursor: "pointer",
              padding: "5px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Velocity Settings */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ color: "#10b981", marginBottom: "10px" }}>🚀 Velocity Multipliers</h3>
          {Object.entries(velocityMultipliers).map(([type, velocity]) => (
            <div key={type} style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", marginBottom: "5px", textTransform: "capitalize" }}>
                {type}: {velocity}
              </label>
              <input
                type="range"
                min="20"
                max="200"
                value={velocity}
                onChange={(e) => updateVelocityMultiplier(type, parseInt(e.target.value))}
                style={{
                  width: "100%",
                  background: "#4b5563",
                }}
              />
            </div>
          ))}
        </div>

        {/* UI Settings */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ color: "#8b5cf6", marginBottom: "10px" }}>🎨 UI Settings</h3>
          
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                checked={uiSettings.showToggleButton}
                onChange={(e) => updateUISettings({ showToggleButton: e.target.checked })}
              />
              Show Toggle Button
            </label>
          </div>
          
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                checked={uiSettings.showProjectileCounter}
                onChange={(e) => updateUISettings({ showProjectileCounter: e.target.checked })}
              />
              Show Projectile Counter
            </label>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Toggle Button Position:
            </label>
            <select
              value={uiSettings.toggleButtonPosition}
              onChange={(e) => updateUISettings({ toggleButtonPosition: e.target.value })}
              style={{
                background: "#4b5563",
                color: "white",
                border: "1px solid #6b7280",
                borderRadius: "4px",
                padding: "5px",
                width: "100%",
              }}
            >
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
          </div>
        </div>

        {/* Reset Button */}
        <div style={{ textAlign: "center", paddingTop: "20px", borderTop: "1px solid #4b5563" }}>
          <button
            onClick={resetToDefaults}
            style={{
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "10px 20px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            🔄 Reset to Defaults
          </button>
        </div>
      </div>
    </Html>
  );
};

export default ProjectileSettingsPanel;
