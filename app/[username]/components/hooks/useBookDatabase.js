import { useCallback } from 'react';
// import { openDB } from "idb";

/**
 * Custom hook to handle all database operations for books
 * Separates database concerns from the main Book component
 */
export const useBookDatabase = (bookID) => {
  
  /**
   * Save book data to IndexedDB
   * @param {Object} meshRef - Reference to the Three.js mesh
   * @param {Object} rotationRef - Reference to the book's rotation
   * @param {Object} additionalData - Any additional data to save (scale, notes, etc.)
   */
  const saveToDB = useCallback(async (meshRef, rotationRef, additionalData = {}) => {
    if (!meshRef?.current || !bookID) {
      console.warn('Cannot save to DB: missing meshRef or bookID');
      return;
    }

    // Use requestIdleCallback for performance optimization
    requestIdleCallback(async () => {
      try {
        // TODO: Uncomment when IndexedDB is ready
        // const db = await openDB("BookDatabase", 2, {
        //   upgrade(db) {
        //     if (!db.objectStoreNames.contains("books")) {
        //       db.createObjectStore("books", { keyPath: "id" });
        //     }
        //   },
        // });

        // const tx = db.transaction("books", "readwrite");
        // const book = (await tx.objectStore("books").get(bookID)) || {
        //   id: bookID,
        // };

        // Extract position data
        const position = meshRef.current.position.toArray();
        const rotation = rotationRef.current ? 
          [rotationRef.current.x, rotationRef.current.y, rotationRef.current.z] : 
          [0, 0, 0];

        // Log for debugging (remove in production)
        console.log('Saving book to DB:', {
          id: bookID,
          position,
          rotation,
          ...additionalData
        });

        // TODO: Uncomment when IndexedDB is ready
        // book.position = position;
        // book.rotation = rotation;
        // 
        // // Merge any additional data (scale, notes, etc.)
        // Object.assign(book, additionalData);
        //
        // await tx.objectStore("books").put(book);
        // await tx.done;

        console.log(`Book ${bookID} data saved successfully`);
      } catch (error) {
        console.error('Error saving book to database:', error);
      }
    });
  }, [bookID]);

  /**
   * Load book data from IndexedDB
   * @returns {Promise<Object>} Book data from database
   */
  const loadFromDB = useCallback(async () => {
    if (!bookID) {
      console.warn('Cannot load from DB: missing bookID');
      return null;
    }

    try {
      // TODO: Uncomment when IndexedDB is ready
      // const db = await openDB("BookDatabase", 2, {
      //   upgrade(db) {
      //     if (!db.objectStoreNames.contains("books")) {
      //       db.createObjectStore("books", { keyPath: "id" });
      //     }
      //   },
      // });
      
      // const tx = db.transaction("books", "readonly");
      // const book = await tx.objectStore("books").get(bookID);
      // await tx.done;
      
      // return book || null;
      
      console.log(`Loading book ${bookID} from DB (placeholder)`);
      return null;
    } catch (error) {
      console.error('Error loading book from database:', error);
      return null;
    }
  }, [bookID]);

  /**
   * Delete book data from IndexedDB
   * @returns {Promise<boolean>} Success status
   */
  const deleteFromDB = useCallback(async () => {
    if (!bookID) {
      console.warn('Cannot delete from DB: missing bookID');
      return false;
    }

    try {
      // TODO: Uncomment when IndexedDB is ready
      // const db = await openDB("BookDatabase", 2, {
      //   upgrade(db) {
      //     if (!db.objectStoreNames.contains("books")) {
      //       db.createObjectStore("books", { keyPath: "id" });
      //     }
      //   },
      // });
      
      // const tx = db.transaction("books", "readwrite");
      // await tx.objectStore("books").delete(bookID);
      // await tx.done;
      
      console.log(`Book ${bookID} deleted from DB (placeholder)`);
      return true;
    } catch (error) {
      console.error('Error deleting book from database:', error);
      return false;
    }
  }, [bookID]);

  /**
   * Update specific book properties in the database
   * @param {Object} updates - Object containing properties to update
   * @returns {Promise<boolean>} Success status
   */
  const updateBookProperties = useCallback(async (updates) => {
    if (!bookID) {
      console.warn('Cannot update DB: missing bookID');
      return false;
    }

    try {
      // TODO: Uncomment when IndexedDB is ready
      // const db = await openDB("BookDatabase", 2, {
      //   upgrade(db) {
      //     if (!db.objectStoreNames.contains("books")) {
      //       db.createObjectStore("books", { keyPath: "id" });
      //     }
      //   },
      // });
      
      // const tx = db.transaction("books", "readwrite");
      // const book = (await tx.objectStore("books").get(bookID)) || { id: bookID };
      // 
      // Object.assign(book, updates);
      // 
      // await tx.objectStore("books").put(book);
      // await tx.done;
      
      console.log(`Book ${bookID} properties updated:`, updates);
      return true;
    } catch (error) {
      console.error('Error updating book properties:', error);
      return false;
    }
  }, [bookID]);

  return {
    saveToDB,
    loadFromDB,
    deleteFromDB,
    updateBookProperties
  };
};

export default useBookDatabase;