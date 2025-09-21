import React, { useRef, useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';
import Lenis from '@studio-freight/lenis';
gsap.registerPlugin(ScrollTrigger);

const COLORS = [
  '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#845EC2',
  '#FFC75F', '#F9F871', '#F67280', '#36EEE0', '#B8F2E6',
  '#FF9671', '#0081CF', '#B39CD0', '#FF61A6', '#00C9A7',
  '#F6D6AD', '#A3F7BF', '#F9F871', '#F67280', '#36EEE0'
];

export default function WishList() {
  const gridRef = useRef(null);
  const boxRefs = useRef([]);

  useEffect(() => {
    // 1. Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      smooth: true,
      lerp: 0.1,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 2. Sync ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);

    // 3. GSAP animation (enhanced 3D)
    if (gridRef.current) {
      gsap.set(boxRefs.current, { perspective: 1200 });
      gsap.fromTo(
        boxRefs.current,
        { opacity: 0, y: 120, rotateX: 90 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1.4,
          ease: 'power4.out',
          stagger: {
            amount: 1.4,
            grid: [4, 5],
            from: 'start',
          },
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }

    // Cleanup
    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div style={{ minHeight: '250vh', background: '#181818', padding: '120px 0 200px 0', position: 'relative' }}>
      <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: 40, fontFamily: 'monospace', fontWeight: 400, fontSize: 32, letterSpacing: 2 }}>Wish List Animation</h2>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          ref={gridRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 120px)',
            gridGap: '32px',
            justifyContent: 'center',
            marginBottom: 0,
            perspective: 1200,
          }}
        >
          {COLORS.map((color, i) => (
            <div
              key={i}
              ref={el => (boxRefs.current[i] = el)}
              style={{
                width: 120,
                height: 120,
                background: color,
                borderRadius: 18,
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                opacity: 0,
                transform: 'translateY(120px) rotateX(90deg)',
                margin: 0,
                position: 'relative',
                zIndex: 2,
              }}
            />
          ))}
        </div>
        {/* Reflection effect */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 120px)',
            gridGap: '32px',
            justifyContent: 'center',
            marginTop: -10,
            filter: 'blur(2px) brightness(0.7)',
            opacity: 0.5,
            transform: 'scaleY(-1) translateY(-10px)',
            zIndex: 1,
          }}
        >
          {COLORS.map((color, i) => (
            <div
              key={i}
              style={{
                width: 120,
                height: 120,
                background: color,
                borderRadius: 18,
                boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
                opacity: 0.7,
                margin: 0,
              }}
            />
          ))}
        </div>
      </div>
      {/* Add extra space below for scroll */}
      <div style={{ height: 600 }} />
    </div>
  );
}