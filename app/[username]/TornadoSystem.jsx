import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";

export default function TornadoSystem({ bookCount, height, radius, rotationSpeed, books, bookRefs }) {
  const groupRef = useRef();

  useLayoutEffect(() => {
    if (!groupRef.current || !books || books.length === 0) return;

    const tl = gsap.timeline({ repeat: -1, defaults: { ease: "none" } });

    // animate each book into its spiral slot
    books.forEach((book, i) => {
      const mesh = bookRefs.current[book.id];
      if (!mesh) return;

      // Single continuous spiral - each book follows sequentially along ONE path
      const spiralPosition = i / bookCount; // Position along the single spiral (0 to 1)
      const r = radius * (1 - Math.pow(spiralPosition, 1.2)); // Funnel shape
      const angle = spiralPosition * Math.PI * 80; // MUCH more turns for ONE tight spiral
      const tangentAngle = Math.atan2(Math.cos(angle), -Math.sin(angle));

      // Single spiral path - books follow one after another
      const x = r * Math.cos(angle);
      const y = height * (1 - spiralPosition);
      const z = r * Math.sin(angle);

      // Keep original book scale
      const originalScale = {
        x: book.scale?.width || 1,
        y: book.scale?.height || 1.5,
        z: book.scale?.thickness || 0.2
      };

      tl.to(mesh.position, { x, y, z, duration: 1 }, 0); // place instantly on start
      tl.to(mesh.rotation, { x: 0, y: tangentAngle, z: spiralPosition * Math.PI * 0.5, duration: 1 }, 0);
      tl.to(mesh.scale, { x: originalScale.x, y: originalScale.y, z: originalScale.z, duration: 1 }, 0);
    });

    // Animate the entire tornado rotation by rotating all books around the center
    const centerRotation = { rotation: 0 };
    
    tl.to(centerRotation, {
      rotation: Math.PI * 2,
      duration: rotationSpeed,
      repeat: -1,
      ease: "none",
      onUpdate: () => {
        // Rotate all books around the tornado center
        books.forEach((book, i) => {
          const mesh = bookRefs.current[book.id];
          if (!mesh) return;
          
          const spiralPosition = i / bookCount;
          const r = radius * (1 - Math.pow(spiralPosition, 1.2)); // Single spiral
          const baseAngle = spiralPosition * Math.PI * 80; // MUCH more spiraling
          const rotatedAngle = baseAngle + centerRotation.rotation;
          
          const x = r * Math.cos(rotatedAngle);
          const z = r * Math.sin(rotatedAngle);
          
          mesh.position.x = x;
          mesh.position.z = z;
        });
      }
    }, 0);

    return () => tl.kill();
  }, [bookCount, height, radius, rotationSpeed, books, bookRefs]);

  // Return an empty group that will be animated
  // The actual book meshes are managed by the Books component
  return <group ref={groupRef} />;
}