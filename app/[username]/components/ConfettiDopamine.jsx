import { useEffect, useRef } from "react";

export default function ConfettiDopamine({ images=["/favicon/apple-touch-icon.png"] }) {
  const canvasRef = useRef(null);


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

    function createParticle() {
      const img = new Image();
      img.src = images[Math.floor(Math.random() * images.length)];
      return {
        x: Math.random() * canvas.width,
        y: -20,
        size: 24 + Math.random() * 20,
        speedY: 2 + Math.random() * 4,
        speedX: (Math.random() - 0.5) * 2,
        rotation: Math.random() * 360,
        img: img,
      };
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
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (Math.random() < 0.6) particles.push(createParticle()); // density
      particles.forEach((p, i) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += 3;
        drawParticle(p);
        if (p.y > canvas.height + 50) particles.splice(i, 1);
      });
      requestAnimationFrame(loop);
    }

    loop();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [images]);

  return (
    <>
    <div className="flex">
<div className="absolute top-[50vh] left-[50vw] z-[10000] bg-[#ffffff50] rounded-xl ">
<h1 className="text-xl text-black">Level 1</h1>
<p>Tillykke, du er nu mesterlæser</p>
<div className="unlocks">
  <ul>
    <li>Bigger shelf</li>
    <li>Access to maps</li>
    <li>Public profile</li>
    <li>Verification level increased</li>
  </ul>
</div>
</div>
      </div>
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
      </>
  );
}
