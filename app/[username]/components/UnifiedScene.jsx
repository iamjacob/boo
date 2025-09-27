import React from 'react';
import { Books } from '../boooks/';
import { Physics } from '@react-three/rapier';
import PhysicsBooks from './PhysicsBooks';
import ThrowCoins from '../ThrowCoins';
import * as THREE from 'three';

const UnifiedScene = ({
  books,
  selectedMainCat,
  selectedSubCat,
  bookRefs,
  selectedBook,
  setSelectedBook,
  drag,
  setDrag,
  throwCoins
}) => {
  // Show physics mode when throwCoins is active (now unified with physics toggle)
  const shouldUsePhysics = throwCoins;

  return (
    <group>
      {shouldUsePhysics ? (
        <Physics 
          gravity={[0, -4.9, 0]} // Lighter gravity for more floaty feel
          debug={false}
          timeStep={1/30} // Reduce physics simulation frequency for performance
          paused={false}
          maxStabilizationIterations={1} // Reduce iterations for performance
          maxVelocityIterations={2} // Reduce velocity iterations
        >
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
          
          {/* Include throwing logic when in physics mode or throwCoins is active */}
          {throwCoins && <ThrowCoins />}
        </Physics>
      ) : (
        <Books
          books={books}
          selectedMainCat={selectedMainCat}
          selectedSubCat={selectedSubCat}
          bookRefs={bookRefs}
          selectedBook={selectedBook}
          setSelectedBook={setSelectedBook}
          drag={drag}
          setDrag={setDrag}
        />
      )}
    </group>
  );
};

export default UnifiedScene;