import React, { useEffect } from "react";
import Book from "../components/Book"; // Adjust path as needed
// import books from "../boooks.json";

export default function Books({
  books,
  selectedMainCat,
  selectedSubCat,
  bookRefs,
  selectedBook,
  setSelectedBook,
  drag,
  setDrag,
}) {

  // Animate all books to their filtered or fly-away positions
  useEffect(() => {
    books.forEach(book => {
      const mesh = bookRefs.current[book.id];
      if (mesh) {
        const mainMatch = selectedMainCat === "All" || book.categories?.main?.includes(selectedMainCat);
        const subMatch = !selectedSubCat || book.categories?.sub?.includes(selectedSubCat);
        const targetY = (mainMatch && subMatch) ? book.position.y : 14;
        window.gsap && window.gsap.to(mesh.position, {
          x: book.position.x,
          y: targetY,
          z: book.position.z,
          duration: 1,
          ease: "power2.out",
        });
      }
    });
  }, [books, selectedMainCat, selectedSubCat, bookRefs]);

  // Always render all books, animate their positions
  return (
    <>
      {books.map((book, index) => (
        <Book
          key={book.id}
          ref={el => (bookRefs.current[book.id] = el)}
          {...book}
          scale={[
            book.scale.width,
            book.scale.height,
            book.scale.thickness,
          ]}
          initialPosition={[
            book.position.x,
            book.position.y,
            book.position.z,
          ]}
          initialRotation={[
            book.rotation.x,
            book.rotation.y,
            book.rotation.z,
          ]}
          shelfRadius={6}
          otherBooks={books.filter((b) => b.id !== book.id)}
          id={book.id}
          cover={book.cover.front}
          selectedBook={selectedBook}
          setSelectedBook={setSelectedBook}
          drag={drag}
          setDrag={setDrag}
        />
      ))}
    </>
  );
}