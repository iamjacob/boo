import React from 'react'

const Book3d = ({images}) => {
  return (
    <>
        <div style={{width: '100vw', height: '100vh', backgroundColor: 'black'}}>
        {images} 
        <Book/>
        </div>
    </>
  )
}

export default Book3d