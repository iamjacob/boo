import React, { useState, useRef, useEffect } from "react";
import "./menu.css";

export default function Menu({ 
  visible = false, 
  onClose = () => {}, 
  onAddToCollection = () => {}, 
  onEditBook = () => {}, 
  onEditRotation = () => {}, 
  onRemoveFromShelf = () => {}, 
  onDeleteBook = () => {},
  bookId = null 
}) {
  const [active, setActive] = useState(false);
  const [showSubmenu, setShowSubmenu] = useState(false);
  const holdTimer = useRef(null);
  const menuRef = useRef(null);

  // Sync external visibility with internal state
  useEffect(() => {
    setActive(visible);
  }, [visible]);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActive(false);
        onClose();
      }
    };

    if (active) {
      // Add event listener after a short delay to prevent immediate closure
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('pointerdown', handleClickOutside);
      }, 300);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('pointerdown', handleClickOutside);
      };
    }
  }, [active, onClose]);

  const handlePointerDown = (e) => {
    if (visible) {
      e.stopPropagation(); // Prevent event bubbling
      return;
    }
    
    holdTimer.current = setTimeout(() => {
      setActive((prev) => !prev);
    }, 1000); // trigger after 1s hold
  };

  const handlePointerUp = (e) => {
    if (visible) {
      e.stopPropagation(); // Prevent event bubbling
    }
    clearTimeout(holdTimer.current);
  };

  const handleMenuAction = (action, event) => {
    event.stopPropagation(); // Prevent event bubbling
    
    switch (action) {
      case 'add':
        setShowSubmenu(true);
        break;
      case 'add-bookmark':
        onAddToCollection(bookId, 'bookmark');
        setActive(false);
        setShowSubmenu(false);
        onClose();
        break;
      case 'add-note':
        onEditBook(bookId, 'notes');
        setActive(false);
        setShowSubmenu(false);
        onClose();
        break;
      case 'add-data':
        onEditBook(bookId, 'metadata');
        setActive(false);
        setShowSubmenu(false);
        onClose();
        break;
      case 'back':
        setShowSubmenu(false);
        break;
      case 'share':
        navigator.clipboard.writeText(window.location.href);
        setActive(false);
        onClose();
        break;
      case 'donate':
        onAddToCollection(bookId, 'favorites');
        setActive(false);
        onClose();
        break;
      case 'edit':
        onEditRotation(bookId, 'live-transform');
        setActive(false);
        onClose();
        break;
      case 'delete':
        onDeleteBook(bookId);
        setActive(false);
        onClose();
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={menuRef}
      className={`menu-container ${active ? "active" : ""} ${showSubmenu ? "submenu" : ""}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {!showSubmenu ? (
        // Main Menu
        <>
          <div className="menu-item" onClick={(e) => handleMenuAction('add', e)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="lucide lucide-plus">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            <span>Add</span>
          </div>

          <div className="menu-item" onClick={(e) => handleMenuAction('edit', e)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="lucide lucide-wrench">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" />
            </svg>
            <span>Edit</span>
          </div>

          <div className="menu-item" onClick={(e) => handleMenuAction('delete', e)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="lucide lucide-trash-2">
              <path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span>Delete</span>
          </div>
        </>
      ) : (
        // Submenu for Add
        <>
          <div className="menu-item submenu-back" onClick={(e) => handleMenuAction('back', e)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="lucide lucide-arrow-left">
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            <span>Back</span>
          </div>

          <div className="menu-item" onClick={(e) => handleMenuAction('add-bookmark', e)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="lucide lucide-bookmark">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
            <span>Bookmark</span>
          </div>

          <div className="menu-item" onClick={(e) => handleMenuAction('add-note', e)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="lucide lucide-file-text">
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M10 9H8" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
            </svg>
            <span>Note</span>
          </div>

          <div className="menu-item" onClick={(e) => handleMenuAction('add-data', e)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="lucide lucide-database">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5v14c0 1.66 7.16 3 9 3s9-1.34 9-3V5" />
              <path d="M3 12c0 1.66 7.16 3 9 3s9-1.34 9-3" />
            </svg>
            <span>Data</span>
          </div>
        </>
      )}
    </div>
  );
}
