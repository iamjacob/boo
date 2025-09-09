"use client";
// import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Experience from "./Experience";
import Header from "../Header";
import books from "./boooks.json";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import Book from "./components/Book";
import Footer from "../Footer";

import FooterExperience from "./FooterExperience.jsx";


export default function Page() {
  const [selectedBook, setSelectedBook] = useState(null);
  // const [texture, setTexture] = useState(null);

  // useEffect(() => {
  //   const texture = useLoader(THREE.TextureLoader, "./covers/test.jpg");
  //   setTexture(texture);
  // }, []);
  // get user name to title from url
  // const { username } = useParams();

  return (
    <div className="fixed top-0 left-0 w-full h-full">
      <Header />

      <Experience>
        
        {books.map((book, index) => {
          return (
              <Book
                key={book.id}
                id={book.id}
                scale={[book.scale.width, book.scale.height, book.scale.thickness]}
                initialPosition={[book.position.x, book.position.y, book.position.z]}
                initialRotation={[book.rotation.x, book.rotation.y, book.rotation.z]}
                shelfRadius={6}
                otherBooks={books.filter((b) => b.id !== book.id)}
                bookID={book.id}
                cover={book.cover.front}
                selectedBook={selectedBook}
                setSelectedBook={setSelectedBook}
              /> 
            
          );
        })}
      </Experience>

{/* <FooterExperience /> */}


    </div>
  );
}
