import React from 'react';
import ShelvesClickable from './ShelvesClickable';
import ShelfCameraController from './ShelfCameraController';
import ShelfHighlight from './ShelfHighlight';
import ShelfZoomUI from './ShelfZoomUI';

/**
 * ShelfZoom - Complete shelf zoom system component
 * 
 * Features:
 * - Click on shelves to zoom in/out
 * - Keyboard shortcuts (1-4 for shelves, arrows, ESC)
 * - Smooth camera animations
 * - Visual highlights and UI feedback
 * - Independent of other systems
 */
const ShelfZoom = () => {
  return (
    <>
      {/* Clickable shelves for zoom functionality */}
      <ShelvesClickable />
      
      {/* Camera controller for smooth zoom animations */}
      <ShelfCameraController />
      
      {/* Visual highlight effect around selected shelf */}
      <ShelfHighlight />
      
      {/* UI elements for instructions and feedback */}
      <ShelfZoomUI />
    </>
  );
};

export default ShelfZoom;