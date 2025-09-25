import React, { useRef } from 'react'
import { useBooksStore } from '../../stores/useBooksStore'
import gsap from 'gsap'

const Add = () => {
  const [bookTitle, setBookTitle] = React.useState("");
  const addBook = useBooksStore((s) => s.addBook);
  const inputRef = useRef();

  const handleAdd = () => {
    if (!bookTitle.trim()) return;
    const newBook = {
      id: Date.now().toString(),
      title: bookTitle,
      position: { x: 0.1, y: 0.1, z: 0.1 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { width: 1, height: 1.5, thickness: 0.2 },
      cover: { front: "./books/learningweb.webp" },
    };
    addBook(newBook);
    setBookTitle("");
    
  };

  return (
    <div className="flex fixed top-0 left-0 w-screen h-1/2 bg-black/10 backdrop-blur flex-col justify-center items-center gap-4 z-50">
      <input
        ref={inputRef}
        type="text"
        value={bookTitle}
        onChange={e => setBookTitle(e.target.value)}
        placeholder="Book title"
        className="border p-2 bg-white/80 rounded"
      />
      <button className="bg-blue-500 text-white p-2" onClick={handleAdd}>Add</button>
      <div>Add book here to array</div>
    </div>
  );
}

export default Add