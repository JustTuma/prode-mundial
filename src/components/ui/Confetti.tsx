'use client'
import { useEffect, useRef } from 'react'

/** Ráfaga de confetti a pantalla completa. Se desmonta sola a los ~2.5s. */
export default function Confetti({ onDone }: { onDone?: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = ['#75aadb', '#ffffff', '#f59e0b', '#fbbf24', '#2E8BE6', '#FFD23F']
    const N = 160
    const parts = Array.from({ length: N }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 120,
      y: canvas.height / 3 + (Math.random() - 0.5) * 60,
      w: Math.random() * 9 + 4,
      h: Math.random() * 5 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 9,
      vy: Math.random() * -11 - 3,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.3,
    }))

    let frame = 0
    let raf = 0
    const animate = () => {
      frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      parts.forEach(p => {
        p.vy += 0.32 // gravedad
        p.x += p.vx
        p.y += p.vy
        p.angle += p.spin
        ctx.save()
        ctx.globalAlpha = Math.max(0, 1 - frame / 150)
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      })
      if (frame < 150) raf = requestAnimationFrame(animate)
      else onDone?.()
    }
    animate()
    return () => cancelAnimationFrame(raf)
  }, [onDone])

  return (
    <canvas ref={ref} style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9998 }} />
  )
}
