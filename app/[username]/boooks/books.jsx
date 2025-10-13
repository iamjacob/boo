import React from "react";
import Book from "../components/Book"; // Adjust path as needed

const Boooks = ({
  books,
  selectedMainCat,
  selectedSubCat,
  bookRefs,
  selectedBook,
  setSelectedBook,
  drag,
  setDrag,
}) =>  {
  // Render all books, let parent animate positions
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
          cover={book.cover}
          selectedBook={selectedBook}
          setSelectedBook={setSelectedBook}
          drag={drag}
          setDrag={setDrag}
          bookObject={book}
        />
      ))}
    </>
  );
}


export default Boooks