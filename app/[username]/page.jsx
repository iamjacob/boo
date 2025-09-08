import Experience from "./Experience";
import Header from "../Header";
import books from './boooks.json';

export default function Page() {

  // get user name to title

  return (
    <div className="fixed top-0 left-0 w-full h-full">
      <Header/>
      <Experience>



          {books.map((book, index) => (
            <mesh key={index} position={[book.position.x, book.position.y, book.position.z]}
              rotation={[book.rotation.x, book.rotation.y, book.rotation.z]}>
              <boxGeometry args={[book.size.width, book.size.height, book.size.thickness]} />
              <meshBasicMaterial color={'red'} />
            </mesh>
          ))}

          

        </Experience>
    </div>
  );
}