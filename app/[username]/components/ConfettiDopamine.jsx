import { useEffect, useRef } from "react";

export default function ConfettiDopamine({ 
  images=["/favicon/apple-touch-icon.png"], 
  direction="up",
  duration = 30000, // Duration in milliseconds (default 30 seconds)
  onComplete = null // Callback when confetti completes
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);


  // Add in level up + sound? 
  //     // Vibrate for 200 milliseconds

  //     if (navigator.vibrate) {
  //       navigator.vibrate(200);
  //       // Vibrate in a pattern: vibrate, pause, vibrate
  //       navigator.vibrate([100, 50, 100]);
  //     }
  //     // music ? setMusic(false) : setMusic(true);
  //   }
  // };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    let isRunning = true;
    startTimeRef.current = Date.now();

    function createParticle() {
      const img = new Image();
      img.src = images[Math.floor(Math.random() * images.length)];
      if (direction === "up") {
        return {
          x: Math.random() * canvas.width,
          y: canvas.height + 20, // Start at the bottom
          size: 24 + Math.random() * 20,
          speedY: -(2 + Math.random() * 4), // Move up
          speedX: (Math.random() - 0.5) * 2,
          rotation: Math.random() * 360,
          img: img,
        };
      } else {
        return {
          x: Math.random() * canvas.width,
          y: -20, // Start at the top
          size: 24 + Math.random() * 20,
          speedY: 2 + Math.random() * 4, // Move down
          speedX: (Math.random() - 0.5) * 2,
          rotation: Math.random() * 360,
          img: img,
        };
      }
    }

    function drawParticle(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      if (p.img.complete) {
        ctx.drawImage(p.img, -p.size / 2, -p.size / 2, p.size, p.size);
      }
      ctx.restore();
    }

    function loop() {
      if (!isRunning) return;
      
      // Check if duration has elapsed
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed >= duration) {
        isRunning = false;
        particles.length = 0; // Clear all particles
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (onComplete) onComplete();
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (Math.random() < 0.6) particles.push(createParticle()); // density
      particles.forEach((p, i) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += 3;
        drawParticle(p);
        if (direction === "up" && p.y < -50) particles.splice(i, 1); // Remove when above the top
        if (direction === "down" && p.y > canvas.height + 50) particles.splice(i, 1); // Remove when below the bottom
      });
      animationRef.current = requestAnimationFrame(loop);
    }

    loop();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      isRunning = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [images, duration, direction, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}
