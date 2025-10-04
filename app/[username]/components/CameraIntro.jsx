import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import gsap from 'gsap'

export function CameraIntro() {
  const { camera } = useThree()

  useEffect(() => {
    // Startposition – fugleperspektiv
    camera.position.set(0, 3.5, 4.5)
    camera.rotation.x = -0.7

    // Cinematic GSAP timeline
    const tl = gsap.timeline({ defaults: { duration: 3, ease: 'power2.inOut' } })

    tl.to(camera.position, { y: 1.2, z: 3.5 }, 0)  // bevæg ned mod øjenhøjde
      .to(camera.rotation, { x: -0.1 }, 0)        // ret op vinklen
      .to(camera.position, { z: 3.2, duration: 1.5, ease: 'power1.out' }, '+=0.2') // zoom ind
      .to(camera.position, { z: 3.5, duration: 2, ease: 'power1.inOut' }) // zoom ud lidt igen

    // Mikro-sway efter intro (gentagen bevægelse)
    gsap.to(camera.rotation, {
      x: -0.1 + 0.005,
      y: 0.02,
      repeat: -1,
      yoyo: true,
      duration: 4,
      ease: 'sine.inOut',
      delay: 6, // starter efter intro
    })
  }, [camera])

  return null
}
