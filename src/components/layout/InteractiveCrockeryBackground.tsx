"use client"

import Image from "next/image"
import { useEffect } from "react"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion"

/**
 * InteractiveCrockeryBackground — `crockery.png` fixed behind the whole site,
 * made alive by the cursor. The photo gently pans and tilts in 3D toward the
 * pointer, and a soft warm light glides across it like a spotlight sweeping a
 * gallery wall. Reduced-motion users get the calm static art.
 */
export function InteractiveCrockeryBackground() {
  const reduced = useReducedMotion()

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const panX = useSpring(pointerX, { stiffness: 35, damping: 22, mass: 0.5 })
  const panY = useSpring(pointerY, { stiffness: 35, damping: 22, mass: 0.5 })

  useEffect(() => {
    if (reduced) return
    const onMove = (e: PointerEvent) => {
      pointerX.set(e.clientX / window.innerWidth - 0.5)
      pointerY.set(e.clientY / window.innerHeight - 0.5)
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [reduced, pointerX, pointerY])

  const imgX = useTransform(panX, [-0.5, 0.5], [18, -18])
  const imgY = useTransform(panY, [-0.5, 0.5], [12, -12])
  const rotateY = useTransform(panX, [-0.5, 0.5], [2.5, -2.5])
  const rotateX = useTransform(panY, [-0.5, 0.5], [-1.6, 1.6])

  /* Spotlight that trails the cursor — center→edge (tx,ty are vw/vh px) */
  const glowX = useTransform(panX, [-0.5, 0.5], ["50vw", "50vw"])
  const glowY = useTransform(panY, [-0.5, 0.5], ["50vh", "50vh"])
  const glowTX = useTransform(panX, [-0.5, 0.5], [-56, 56])
  const glowTY = useTransform(panY, [-0.5, 0.5], [-42, 42])

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        style={{
          x: reduced ? 0 : imgX,
          y: reduced ? 0 : imgY,
          rotateX: reduced ? 0 : rotateX,
          rotateY: reduced ? 0 : rotateY,
        }}
        className="absolute inset-0 will-change-transform"
      >
        <div className="absolute inset-0 scale-[1.06]">
          <Image
            src="/crockery.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            draggable={false}
          />
        </div>

        {/* Soft cream veil keeps content readable over the photo */}
        <div className="absolute inset-0 bg-cream/60" />
        {/* Bottom blending into the page */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-cream/80 to-transparent" />
      </motion.div>

      {/* Traveling warm spotlight */}
      <motion.div
        style={{ left: glowX, top: glowY, x: glowTX, y: glowTY }}
        className="pointer-events-none absolute h-[34rem] w-[34rem] -ml-[17rem] -mt-[17rem] rounded-full bg-gold/20 blur-[110px]"
      />
    </div>
  )
}