import React from "react";
import BooksStand from "./components/BooksStand";

const ReadingNow = () => {
  const BOOK_STAND_COUNT = 8;
  const RADIUS = 3;
  const [toggleReading, setToggleReading] = useState(true);
  const [toggleCones, setToggleCones] = useState(false);
  const [activeBookstand, setActiveBookstand] = useState(0);
  
  return (
    <>
      {toggleReading &&
        Array.from({ length: 4 }).map((_, i) => {
          const angle = (i / BOOK_STAND_COUNT) * 2 * Math.PI;
          const x = Math.cos(angle) * RADIUS;
          const z = Math.sin(angle) * RADIUS;
          return (
            <BooksStand
              key={i}
              position={[x, 0, z]}
              rotation={[0, -angle + Math.PI / 2, 0]}
              active={i === activeBookstand}
            />
          );
        })}
    </>
  );
};

export default ReadingNow;
