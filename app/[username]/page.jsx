"use client";

import { useState } from "react";
import Experience from "./Experience";
import Header from "../Header";
import books from "./boooks.json";
import Book from "./components/Book";
import Footer from "../Footer";

export default function Page() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [drag, setDrag] = useState(false);

  return (
    <div className="fixed top-0 left-0 w-full h-full">
      <Header />

      <Experience drag={drag} setDrag={setDrag}>

        {books.map((book, index) => {
          return (
            <Book
              key={book.id}
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
          );
        })}
      </Experience>
      <Footer />
    </div>
  );
}
