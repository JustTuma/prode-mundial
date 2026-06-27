'use client'

/** Sol de Mayo girando lento (decoración argentina) */
export function SolDeMayo({ size = 80, opacity = 0.12, color = '#FFD23F' }: { size?: number; opacity?: number; color?: string }) {
  const rays = Array.from({ length: 16 })
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="spin-slow" style={{ opacity, pointerEvents: 'none' }} aria-hidden>
      <circle cx="50" cy="50" r="15" fill={color} />
      {rays.map((_, i) => (
        <g key={i} transform={`rotate(${(360 / 16) * i} 50 50)`}>
          <path d="M50 8 L46 26 L54 26 Z" fill={color} />
        </g>
      ))}
    </svg>
  )
}

/** Pelotas de fútbol flotando hacia arriba en el fondo */
export function FloatingBalls({ count = 7 }: { count?: number }) {
  const balls = Array.from({ length: count }).map((_, i) => {
    const left = Math.round((100 / count) * i + Math.random() * 8)
    const delay = (Math.random() * 8).toFixed(1)
    const dur = (7 + Math.random() * 6).toFixed(1)
    const size = 14 + Math.round(Math.random() * 16)
    const rot = `${Math.round(Math.random() * 360 - 180)}deg`
    const op = (0.18 + Math.random() * 0.22).toFixed(2)
    return { left, delay, dur, size, rot, op, key: i }
  })
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }} aria-hidden>
      {balls.map(b => (
        <span key={b.key} style={{
          position: 'absolute', bottom: '-30px', left: `${b.left}%`, fontSize: `${b.size}px`,
          // @ts-expect-error custom props for keyframes
          '--float-rot': b.rot, '--float-op': b.op,
          animation: `float-up ${b.dur}s linear ${b.delay}s infinite`,
        }}>⚽</span>
      ))}
    </div>
  )
}
