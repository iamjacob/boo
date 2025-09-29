import React from 'react'
import CameraTexturePlane from "./CameraTexturePlane";
import ScannerOverlay from '../scanner/components/ScannerOverlay';


const LiveScanner = ({}) => {
//  const [useCamera, setUseCamera] = React.useState(true)

  return (

<>

    <CameraTexturePlane useLocalVideo={faslse}  width={2} />
    <group position={[0, 0, 1]} rotation={[0, -Math.PI / 2, 0]}>
    <ScannerOverlay isBookOpen={true} isDJOpen={true} isDJ={true} />
    </group>
</>
)
}

export default LiveScanner