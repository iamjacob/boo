'use client'
import React, { useEffect, useState } from 'react';
import { BookOpen, Eye,  ChevronDown, ChevronUp } from "lucide-react";

import { Short } from './components/Short';
import { useShortsStore } from './store/shorts';
import Header from '../Header';

function App() {
  const { currentIndex, history, setCurrentIndex, addNewScene, navigateToId } = useShortsStore();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  //const [setTouchEnd] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [activeButton, setActiveButton] = useState<'up' | 'down' | null>(null);
  // New state to block scroll when modal/portal is open
  const [isActiveModal, setIsActiveModal] = useState(false);

  // Handle initial URL and popstate
  useEffect(() => {
    const handleInitialURL = () => {
      const match = window.location.pathname.match(/\/scrolls\/([^/]+)/);
      if (match) {
        const id = match[1];
        navigateToId(id);
        //Need to fetch it from db
      }
    };

    const handlePopState = () => {
      handleInitialURL();
    };

    handleInitialURL();
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Preload next scene when near the end
  useEffect(() => {
    if (currentIndex >= history.length - 2) {
      addNewScene();
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isNavigating || isActiveModal) return;
      if (e.key === 'ArrowUp') {
        setActiveButton('up');
        navigateShort('down');
      } else if (e.key === 'ArrowDown') {
        setActiveButton('down');
        navigateShort('up');
      }
    };

    const handleKeyUp = () => {
      setActiveButton(null);
    };

    const handleWheel = (e: WheelEvent) => {
      if (isNavigating || isActiveModal) return;
      if (e.deltaY < 0 && currentIndex > 0) {
        setActiveButton('up');
        navigateShort('down');
        setTimeout(() => setActiveButton(null), 200);
      } else if (e.deltaY > 0) {
        setActiveButton('down');
        navigateShort('up');
        setTimeout(() => setActiveButton(null), 200);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [currentIndex, isNavigating, isActiveModal]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isNavigating || isActiveModal) return;
    setTouchStart(e.targetTouches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || isNavigating || isActiveModal) return;
    setTouchEnd(e.targetTouches[0].clientY);
    const currentDrag = e.targetTouches[0].clientY - touchStart;
    setDragOffset(currentDrag);

    if (Math.abs(currentDrag) > 70) {
      if (currentDrag > 0 && currentIndex > 0) {
        navigateShort('down');
        handleTouchReset();
      } else if (currentDrag < 0) {
        navigateShort('up');
        handleTouchReset();
      }
    }
  };

  const handleTouchReset = () => {
    setTouchStart(null);
    setTouchEnd(null);
    setDragOffset(0);
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    if (dragOffset !== 0) {
      setIsNavigating(true);
      const resetAnimation = () => {
        setDragOffset(0);
        setIsDragging(false);
        setIsNavigating(false);
      };
      setTimeout(resetAnimation, 200);
    } else {
      handleTouchReset();
    }
  };

  const navigateShort = (direction: 'up' | 'down') => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    if (direction === 'up') {
      if (currentIndex === history.length - 2) {
        addNewScene();
      }
      setCurrentIndex(currentIndex + 1);
    } else if (direction === 'down' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }

    setTimeout(() => {
      setIsNavigating(false);
    }, 200);
  };

  // Get visible scenes (previous, current, next)
  const visibleScenes = [-1, 0, 1].map((offset) => {
    const index = currentIndex + offset;
    if (index < 0 || index >= history.length) return null;
    return {
      ...history[index],
      offset,
    };
  });


    // Splash screen removal
    useEffect(() => {
      const splash = document.getElementById("splash");
      // will be added to a global loader later
      // header get.content lenghth from fetch 
      // read length content-length 
      // const header = document.getElementById("header");
      if (splash) {
        splash.classList.add("fade-out");
        setTimeout(() => splash.remove(), 1200);
      }
    }, []);

  return (
  <>
      <Header/>
    <div className="fixed inset-0 overflow-hidden">
      <div
        className="h-full w-full relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {visibleScenes.map((scene, i) => 
          scene && (
            <div
              key={scene.id}
              //title={i.toString()}
              className="absolute inset-0 w-full h-full"
              style={{
                transform: `translateY(${(scene.offset * 100) + (dragOffset / window.innerHeight * 100)}%)`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                zIndex: 2 - Math.abs(scene.offset)
              }}
            >
              {/* <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center text-white/50">
                  Loading...
                </div>
              }> */}
                
                <Short sceneId={scene.id} active={scene.offset === 0} />
                {/* <Short sceneId={scene.id} /> */}
              {/* </Suspense> */}
            </div>
          )
        )}
        
        <div className="absolute right-4 bottom-20 flex flex-col gap-4 z-50">
          <button
            title='up'
            onClick={() => {
              if (!isNavigating) {
                setActiveButton('up');
                navigateShort('down');
                setTimeout(() => setActiveButton(null), 200);
              }
            }}
            className={`p-2  rounded-full bg-black/10 text-white disabled:opacity-50 
              transition-all duration-200 hover:bg-black/20
              ${(isDragging && dragOffset > 0) || activeButton === 'up' 
                ? 'scale-125 bg-black/30' 
                : ''
              }`}
            disabled={currentIndex === 0 || isNavigating}
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          <button
            title='down'
            onClick={() => {
              if (!isNavigating) {
                setActiveButton('down');
                navigateShort('up');
                setTimeout(() => setActiveButton(null), 200);
              }
            }}
            className={`p-2 rounded-full bg-black/10 text-white 
              transition-all duration-200 hover:bg-black/20
              ${(isDragging && dragOffset < 0) || activeButton === 'down'
                ? 'scale-125 bg-black/30'
                : ''
              }`}
            disabled={isNavigating}
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>

        {/* <div className="absolute left-4 bottom-20 text-black/50 text-sm z-50">
          ID: {history[currentIndex].id}
        </div> */}

        {/* {isDragging && (
          <div 
            className="absolute inset-0 pointer-events-none z-40"
            style={{
              background: `linear-gradient(${dragOffset > 0 ? '0deg' : '180deg'}, 
                rgba(0,0,0,0) 0%, 
                rgba(0,0,0,${Math.abs(dragOffset) / 500}) 100%
              )`
            }}
          />
        )} */}
      </div>

      <footer className='fixed  bottom-0 left-0 w-screen'>
         <button
            title='eye'
            style={{ pointerEvents: "auto" }}
            onClick={() => console.log("Eye clicked")}
          >
            <Eye className="w-6 h-6 text-black" />
          </button>
          <span>200M views</span>

          

          <button
            title='open book'
            style={{ pointerEvents: "auto" }}
            onClick={() => console.log("Book Open clicked")}
          >
            <BookOpen className="w-6 h-6 text-black" />
          </button>
          {/* <span>reading now</span> */}

          {/* {!isMobile && (
            <>
              <button
                style={{ pointerEvents: "auto" }}
                onClick={() => console.log("Calendar clicked")}
              >
                <Calendar className="w-6 h-6 text-black" />
              </button>
              <span>born</span>

              <button
                style={{ pointerEvents: "auto" }}
                onClick={() => console.log("Earth clicked")}
              >
                <Earth className="w-6 h-6 text-black" />
              </button>
              <span>location</span> 
              </>
)}*/ }
              {/* <button
                title='more'
                style={{ pointerEvents: "auto" }}
                onClick={() => console.log("Chevron clicked")}
              >
                <ChevronDown />
              </button> */}

      </footer>
    </div>
  </>

  );
}

export default App