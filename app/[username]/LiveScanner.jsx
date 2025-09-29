import React from 'react'
import CameraTexturePlane from "./CameraTexturePlane";
import ScannerOverlay from '../scanner/components/ScannerOverlay';


const LiveScanner = ({}) => {
  return (
    <>
      {/* null = ask user what they want, true = force video, false = force camera */}
      <CameraTexturePlane useLocalVideo={null} width={2} />
      <group position={[0, 0, 1]} rotation={[0, -Math.PI / 2, 0]}>
        <ScannerOverlay isBookOpen={true} isDJOpen={true} isDJ={true} />
      </group>
    </>
  )
}

export default LiveScanner