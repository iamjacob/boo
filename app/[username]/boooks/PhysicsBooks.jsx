import React from "react";
import BookPhysics from "../components/BookPhysics";

const PhysicsBooks = ({
  books,
  selectedMainCat,
  selectedSubCat,
  bookRefs,
  selectedBook,
  setSelectedBook,
  drag,
  setDrag,
}) => {
  // Handle book opening in physics mode
  const handleBookOpen = (bookId) => {
    console.log("📖 Opening book in physics mode:", bookId);
    // Could trigger book open animation or state change
    setSelectedBook(bookId);
  };

  return (
    <>
      {books.map((book, index) => (
        <BookPhysics
          key={book.id}
          ref={el => (bookRefs.current[book.id] = el)}
          id={book.id}
          bookID={book.id}
          color={book.color || "#8B4513"}
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
            book.rotation.x || 0,
            book.rotation.y || 0,
            book.rotation.z || 0,
          ]}
          selectedBook={selectedBook}
          setSelectedBook={setSelectedBook}
          onBookOpen={handleBookOpen}
          cover={book.cover?.front || book.cover}
          book={book}
        />
      ))}
    </>
  );
};

export default PhysicsBooks;