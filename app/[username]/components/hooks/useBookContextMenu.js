import { useState, useRef, useCallback, useEffect } from 'react';
import * as THREE from "three";

/**
 * Custom hook to handle all context menu functionality for books
 * Manages menu state, positioning, and interaction handlers
 */
export const useBookContextMenu = ({
  meshRef,
  camera,
  bookID,
  title,
  bookObject,
  setDrag,
  setSelectedBook,
  onSwitchPlace,
  drag = false // Add drag parameter to prevent context menu when dragging
}) => {
  // Context menu state
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState([0, 0, 0]);
  const [isMenuOnRightSide, setIsMenuOnRightSide] = useState(false);
  const [menuSize, setMenuSize] = useState({ width: 280, height: 240 }); // Consistent sizing

  // Long press detection
  const longPressTimer = useRef();

  /**
   * Hide context menu
   */
  const hideContextMenu = useCallback(() => {
    setShowContextMenu(false);
  }, []);

  // Auto-hide context menu when drag mode is activated
  useEffect(() => {
    if (drag && showContextMenu) {
      console.log("🎯 Auto-hiding context menu - drag mode activated");
      hideContextMenu();
    }
  }, [drag, showContextMenu, hideContextMenu]);

  /**
   * Show context menu at book position with consistent sizing
   * Prevents opening when drag mode is active
   */
  const showBookContextMenu = useCallback((event) => {
    // Prevent context menu when drag mode is active
    if (drag) {
      console.log("🚫 Context menu blocked - drag mode is active");
      // Optional: You could show a toast notification here
      // toast.info("Context menu disabled while in drag mode");
      return;
    }

    if (!meshRef.current) return;

    // Get the book's world position
    const worldPosition = new THREE.Vector3();
    meshRef.current.getWorldPosition(worldPosition);

    // Check mouse position relative to screen edges if event is available
    let isOnRightSide = false;

    if (event && event.clientX !== undefined) {
      // Get actual mouse distance from screen edges
      const screenWidth = window.innerWidth;
      const mouseX = event.clientX;
      const distanceFromRight = screenWidth - mouseX;

      // Use mouse position: if closer to right edge, show menu on left side of book
      // This prevents menu from going off-screen
      isOnRightSide = distanceFromRight < (menuSize.width + 50); // Use dynamic menu width
    } else {
      // Fallback: use book's screen position if no mouse event
      const screenPosition = worldPosition.clone();
      screenPosition.project(camera);
      isOnRightSide = screenPosition.x > 0.2;
    }

    setIsMenuOnRightSide(isOnRightSide);

    // Set menu position relative to book
    setContextMenuPosition([
      worldPosition.x,
      worldPosition.y + 0.3, // Slightly above the book
      worldPosition.z,
    ]);

    setShowContextMenu(true);
  }, [meshRef, camera, menuSize.width, drag]);

  /**
   * Handle pointer down with long press detection
   * Respects drag mode and prevents context menu when dragging
   */
  const handlePointerDown = useCallback((e) => {
    // Prevent context menu when drag mode is active
    if (drag) {
      console.log("🚫 Long press blocked - drag mode is active (book selection still works)");
      if (setSelectedBook) setSelectedBook(bookID);
      return;
    }

    // Check if it's a right-click (context menu)
    if (e && e.button === 2) {
      showBookContextMenu(e);
      return;
    }

    if (setSelectedBook) setSelectedBook(bookID);
    
    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      showBookContextMenu(e);
    }, 500); // Long press detection (500ms)
  }, [bookID, setSelectedBook, showBookContextMenu, drag]);

  /**
   * Handle pointer up - clear long press timer
   */
  const handlePointerUp = useCallback(() => {
    clearTimeout(longPressTimer.current);
    // Removed auto-close timer - let the menu handle its own closing logic
    if (onSwitchPlace) onSwitchPlace("home");
  }, [onSwitchPlace]);

  /**
   * Handle context menu (right-click)
   * Respects drag mode and prevents context menu when dragging
   */
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent context menu when drag mode is active
    if (drag) {
      console.log("🚫 Right-click context menu blocked - drag mode is active");
      return;
    }
    
    showBookContextMenu(e);
  }, [showBookContextMenu, drag]);

  // Context menu action handlers
  const handleAddToCollection = useCallback((bookId, collectionType) => {
    console.log("Add to collection:", bookId, "Type:", collectionType);
    
    switch (collectionType) {
      case "reading":
        console.log("Adding to reading list");
        break;
      case "favorites":
        console.log("Adding to favorites");
        break;
      case "wishlist":
        console.log("Adding to wishlist");
        break;
      case "new":
        console.log("Creating new collection");
        break;
      default:
        console.log("General add to collection");
    }
    hideContextMenu();
  }, [hideContextMenu]);

  const handleEditBook = useCallback((bookId, editType) => {
    console.log("Edit book:", bookId, "Type:", editType);
    
    switch (editType) {
      case "metadata":
        console.log("Opening metadata editor");
        break;
      case "cover":
        console.log("Opening cover editor");
        break;
      case "notes":
        console.log("Opening notes editor");
        break;
      case "properties":
        console.log("Opening properties panel");
        break;
      default:
        console.log("General book edit");
    }
    hideContextMenu();
  }, [hideContextMenu]);

  const handleEditRotation = useCallback((bookId, transformType) => {
    console.log("Transform book:", bookId, "Type:", transformType);

    switch (transformType) {
      case "position":
        if (onSwitchPlace) onSwitchPlace("positionAndRotate");
        if (setDrag) setDrag(true);
        if (setSelectedBook) setSelectedBook(bookID);
        break;
      case "rotation":
        // This will be handled by transform panel
        console.log("Opening rotation controls");
        break;
      case "live-transform":
        console.log("Opening live transform controls");
        break;
      case "reset-position":
        console.log("Resetting position");
        // Reset logic would be handled by parent component
        break;
      case "reset-rotation":
        console.log("Resetting rotation");
        // Reset logic would be handled by parent component
        break;
      default:
        console.log("Default transform action");
    }

    hideContextMenu();
  }, [bookID, setDrag, setSelectedBook, onSwitchPlace, hideContextMenu]);

  // Context menu props for the component
  const contextMenuProps = {
    visible: showContextMenu,
    position: contextMenuPosition,
    onClose: hideContextMenu,
    onAddToCollection: handleAddToCollection,
    onEditBook: handleEditBook,
    onEditRotation: handleEditRotation,
    bookId: bookID,
    bookTitle: title || bookObject?.title || `Book ${bookID}`,
    bookCover: bookObject?.cover?.front || "./books/covers/000.jpg",
    bookAuthor: bookObject?.author || "Unknown Author",
    meshRef: meshRef,
    isOnRightSide: isMenuOnRightSide,
    menuSize: menuSize // Pass size information
  };

  return {
    // State
    showContextMenu,
    contextMenuPosition,
    isMenuOnRightSide,
    menuSize,
    
    // Actions
    showBookContextMenu,
    hideContextMenu,
    setMenuSize, // Allow external size control
    
    // Event handlers
    handlePointerDown,
    handlePointerUp,
    handleContextMenu,
    
    // Context menu handlers
    handleAddToCollection,
    handleEditBook,
    handleEditRotation,
    
    // Props for context menu component
    contextMenuProps
  };
};

export default useBookContextMenu;