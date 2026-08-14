"use client"
import { useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from "lenis"

gsap.registerPlugin(ScrollTrigger)

export function MotionLayer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis()
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    // GSAP Reveal animations
    const reveals = document.querySelectorAll("[data-reveal]")
    reveals.forEach((el) => {
      gsap.fromTo(el, 
        { y: 50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", scrollTrigger: {
          trigger: el,
          start: "top 85%",
        }}
      )
    })

    return () => {
      lenis.destroy()
    }
  }, [])

  return (
    <div className="motion-layer">
      {/* Custom leaf cursor logic can go here */}
      {children}
    </div>
  )
}
