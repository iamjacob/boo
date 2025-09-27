import React from 'react';
import { Html } from '@react-three/drei';
import { useShelfZoomStore } from '../../../stores/useShelfZoomStore';

const ShelfZoomUI = () => {
  const { isZoomed, selectedShelf, zoomOut } = useShelfZoomStore();

  return (
    <>
      {/* Shelf Zoom UI - When zoomed in */}
    {/* </>  {isZoomed && (
    //     <Html>
    //       <div style={{
    //         position: 'fixed',
    //         top: '10px',
    //         left: '10px',
    //         background: 'rgba(0,0,0,0.8)',
    //         color: '#4fc3f7',
    //         padding: '12px 16px',
    //         borderRadius: '8px',
    //         zIndex: 1000,
    //         fontSize: '16px',
    //         fontWeight: 'bold',
    //         border: '2px solid #4fc3f7',
    //         boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
    //       }}>
    //         📚 Shelf {selectedShelf + 1} 
    //         <div style={{ 
    //           fontSize: '12px', 
    //           marginTop: '4px', 
    //           opacity: 0.9,
    //           cursor: 'pointer',
    //         }}
    //         onClick={zoomOut}>
    //           Click here or on shelf to zoom out
    //         </div>
    //       </div>
    //     </Html>
    //   )}
      
    //   {!isZoomed && (
    //     <Html>
    //       <div style={{
    //         position: 'fixed',
    //         top: '10px',
    //         left: '10px',
    //         background: 'rgba(0,0,0,0.7)',
    //         color: '#90a4ae',
    //         padding: '8px 12px',
    //         borderRadius: '6px',
    //         zIndex: 1000,
    //         fontSize: '12px',
    //         border: '1px solid #90a4ae',
    //         lineHeight: '1.4',
    //       }}>
    //         📚 <strong>Shelf Navigation</strong><br/>
    //         🖱️ Click on shelf to zoom<br/>
    //         ⌨️ Press 1-4 for shelves<br/>
    //         ⬆️⬇️ Arrow keys to navigate
    //       </div>
    //     </Html>
    //   )}
      
    //   {isZoomed && (
    //     <Html>
    //       <div style={{
    //         position: 'fixed',
    //         bottom: '10px',
    //         left: '50%',
    //         transform: 'translateX(-50%)',
    //         background: 'rgba(0,0,0,0.8)',
    //         color: '#4fc3f7',
    //         padding: '8px 16px',
    //         borderRadius: '20px',
    //         zIndex: 1000,
    //         fontSize: '12px',
    //         textAlign: 'center',
    //         border: '1px solid #4fc3f7',
    //       }}>
    //         Press <strong>ESC</strong> to zoom out • <strong>↑↓</strong> to switch shelves • Click shelf to zoom out
    //       </div>
    //     </Html>
     // )} */}
    </>
  );
};

export default ShelfZoomUI;