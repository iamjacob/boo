import React,{useState} from "react";
import BooksStand from "./BooksStand";
import reading from "../Reading.json";


const ReadingNow = () => {
  const BOOK_STAND_COUNT = 8;
  const RADIUS = 3;
  const [toggleReading, setToggleReading] = useState(true);
  const [toggleCones, setToggleCones] = useState(true);
  const [activeBookstand, setActiveBookstand] = useState(0);
  
  return (
    <>
       {/* {toggleReading && */}
      
 {/* {reading.map((book, index) => (
         <BooksStand key={index} position={book.position} book={book} />
       ))}  */}

       {toggleCones &&

        reading.map((book, index)  => {
          const angle = (index / BOOK_STAND_COUNT) * 2 * Math.PI;
          const x = Math.cos(angle) * RADIUS;
          const z = Math.sin(angle) * RADIUS;
          return (
            <BooksStand
              key={index}
              position={[x, 0, z]}
              rotation={[0, -angle + Math.PI / 2, 0]}
              active={index === activeBookstand}
              book={book}
            />
          );
        })} 


    </>
  );
};

export default ReadingNow;
