'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface Props {
  profile: any
  upcomingMatches: any[]
  recentPredictions: any[]
  liveMatches: any[]
  rank: number
  accuracy: number
}

// Contador animado
function AnimatedNumber({ target, duration = 1500, suffix = '' }: { target: number | string; duration?: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const isNumber = typeof target === 'number'

  useEffect(() => {
    if (!isNumber) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setDisplay(target); clearInterval(timer) }
      else setDisplay(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, isNumber])

  if (!isNumber) return <>{target}</>
  return <>{display}{suffix}</>
}

// Countdown al próximo partido
function Countdown({ date }: { date: string }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 })

  useEffect(() => {
    const calc = () => {
      const diff = new Date(date).getTime() - Date.now()
      if (diff <= 0) return
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const t = setInterval(calc, 1000)
    return () => clearInterval(t)
  }, [date])

  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {[timeLeft.h, timeLeft.m, timeLeft.s].map((v, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            background: 'rgba(0,0,0,0.4)', borderRadius: '6px', padding: '3px 6px',
            fontWeight: 900, fontSize: '15px', color: '#fff', fontVariantNumeric: 'tabular-nums',
            minWidth: '28px', textAlign: 'center',
          }}>{pad(v)}</span>
          {i < 2 && <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900 }}>:</span>}
        </span>
      ))}
    </div>
  )
}

// Confetti canvas
function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const colors = ['#75aadb','#ffffff','#f59e0b','#fbbf24','#003087','#0050c8']
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 8 + 4,
      h: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 2 + 1,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.15,
      opacity: Math.random() * 0.7 + 0.3,
    }))

    let frame = 0
    const animate = () => {
      if (frame > 180) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.y += p.speed
        p.angle += p.spin
        p.opacity -= 0.003
        if (p.opacity <= 0) return
        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.translate(p.x + p.w/2, p.y + p.h/2)
        ctx.rotate(p.angle)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h)
        ctx.restore()
      })
      frame++
      requestAnimationFrame(animate)
    }
    animate()
  }, [])

  return (
    <canvas ref={ref} style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      pointerEvents: 'none', borderRadius: '20px',
    }} />
  )
}

export default function DashboardClient({ profile, upcomingMatches, recentPredictions, liveMatches, rank, accuracy }: Props) {
  const [mounted, setMounted] = useState(false)
  const [showConfetti] = useState(() => typeof window !== 'undefined' && sessionStorage.getItem('confetti_shown') !== '1')

  useEffect(() => {
    setMounted(true)
    if (showConfetti) sessionStorage.setItem('confetti_shown', '1')
  }, [showConfetti])

  const greetings = ['¡Dale campeón! 🔥', '¡Vamos Argentina! 🇦🇷', '¡A romperla! ⚡', '¡Esta es la nuestra! 🏆', '¡Metele! 💪']
  const greeting = greetings[new Date().getMinutes() % greetings.length]
  const nextMatch = upcomingMatches[0]

  return (
    <div style={{ paddingBottom: '100px' }}>

      {/* ═══ HERO BANNER ═══ */}
      <div style={{
        position: 'relative', borderRadius: '20px', overflow: 'hidden',
        marginBottom: '16px', minHeight: '240px',
        background: 'linear-gradient(160deg, #001a4d 0%, #003087 35%, #0050c8 65%, #1a6fd4 100%)',
      }}>
        {/* Imagen estadio */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&q=60)',
          backgroundSize: 'cover', backgroundPosition: 'center top',
          opacity: 0.15,
        }} />
        {/* Rayas camiseta Argentina animadas */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 22px, rgba(117,170,219,0.12) 22px, rgba(117,170,219,0.12) 44px)',
          animation: 'none',
        }} />
        {/* Gradiente inferior */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(0deg, rgba(0,0,0,0.5) 0%, transparent 100%)' }} />

        {/* Confetti al entrar */}
        {mounted && showConfetti && <Confetti />}

        {/* Estrellas campeón */}
        <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px' }}>
          {['⭐','⭐','⭐'].map((s,i) => (
            <span key={i} style={{ fontSize: '14px', animation: `pulse ${1 + i * 0.3}s ease-in-out infinite`, filter: 'drop-shadow(0 0 4px #f59e0b)' }}>{s}</span>
          ))}
        </div>

        <div style={{ position: 'relative', padding: '36px 20px 20px' }}>
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 2px', fontSize: '12px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
                {greeting}
              </p>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
                {profile?.username}
              </h1>
            </div>
            {/* Avatar con borde dorado */}
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
              padding: '2px',
              boxShadow: '0 0 20px rgba(245,158,11,0.5)',
            }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#003087' }}>
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '24px' }}>
                      {profile?.username?.[0]?.toUpperCase()}
                    </div>
                }
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {[
              { emoji: '⭐', label: 'Puntos', value: profile?.total_points ?? 0, color: '#fbbf24' },
              { emoji: '🏅', label: 'Ranking', value: rank ? `#${rank}` : '-', color: '#75aadb' },
              { emoji: '🎯', label: 'Exactos', value: profile?.exact_scores ?? 0, color: '#10b981' },
              { emoji: '📊', label: 'Precisión', value: accuracy, suffix: '%', color: '#a78bfa' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)',
                borderRadius: '12px', padding: '10px 6px', textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ fontSize: '16px', marginBottom: '2px' }}>{s.emoji}</div>
                <div style={{ fontWeight: 900, fontSize: '1.1rem', color: s.color }}>
                  {mounted ? <AnimatedNumber target={typeof s.value === 'number' ? s.value : s.value as string} suffix={s.suffix} /> : s.value}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px' }}>{s.label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ═══ EN VIVO ═══ */}
      {liveMatches.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 8px #ef4444', animation: 'pulse 1s infinite' }} />
            <h2 style={{ margin: 0, fontSize: '13px', fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '1.5px' }}>En Vivo Ahora</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {liveMatches.map((match: any) => (
              <Link key={match.id} href={`/matches/${match.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #1a0505, #2a0808)',
                  border: '1px solid #ef444455', borderRadius: '14px', padding: '14px 16px',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #ef4444, #f59e0b, #ef4444)', backgroundSize: '200% 100%' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, color: '#f0f0f5', fontSize: '14px' }}>{match.home_team}</span>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 900, fontSize: '22px', color: '#fff' }}>
                        {match.home_score ?? 0} <span style={{ color: '#374151' }}>-</span> {match.away_score ?? 0}
                      </div>
                      <div style={{ color: '#ef4444', fontSize: '10px', fontWeight: 800 }}>
                        {match.status === 'PAUSED' ? 'PAUSA' : match.minute ? `${match.minute}'` : 'EN VIVO'}
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, color: '#f0f0f5', fontSize: '14px', textAlign: 'right' }}>{match.away_team}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ═══ PRÓXIMO PARTIDO + COUNTDOWN ═══ */}
      {nextMatch && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '13px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⏱ Próximo Partido</h2>
            <Link href="/matches" style={{ color: '#75aadb', fontSize: '12px', textDecoration: 'none', fontWeight: 600 }}>Ver todos →</Link>
          </div>
          <Link href={`/matches/${nextMatch.id}`} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, #003087, #0050c8)',
              borderRadius: '16px', padding: '18px', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 20px, rgba(255,255,255,0.04) 20px, rgba(255,255,255,0.04) 40px)' }} />
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 600 }}>{nextMatch.group_name || nextMatch.stage}</span>
                  <Countdown date={nextMatch.match_date} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    {nextMatch.home_team_flag
                      ? <img src={nextMatch.home_team_flag} style={{ width: '48px', height: '34px', objectFit: 'contain' }} alt="" />
                      : <span style={{ fontSize: '32px' }}>🏳️</span>
                    }
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '13px', textAlign: 'center' }}>{nextMatch.home_team}</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 900, fontSize: '20px', color: 'rgba(255,255,255,0.4)' }}>VS</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginTop: '4px' }}>
                      {new Date(nextMatch.match_date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', timeZone: 'America/Argentina/Buenos_Aires' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    {nextMatch.away_team_flag
                      ? <img src={nextMatch.away_team_flag} style={{ width: '48px', height: '34px', objectFit: 'contain' }} alt="" />
                      : <span style={{ fontSize: '32px' }}>🏳️</span>
                    }
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '13px', textAlign: 'center' }}>{nextMatch.away_team}</span>
                  </div>
                </div>
                <Link href={`/matches/${nextMatch.id}`} onClick={e => e.stopPropagation()} style={{ textDecoration: 'none' }}>
                  <div style={{
                    marginTop: '14px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px',
                    padding: '10px', textAlign: 'center', color: '#fff', fontWeight: 700, fontSize: '13px',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}>
                    🎯 Predecir este partido
                  </div>
                </Link>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* ═══ MIS PREDICCIONES ═══ */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '13px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🎯 Últimas Predicciones</h2>
          <Link href="/matches" style={{ color: '#75aadb', fontSize: '12px', textDecoration: 'none', fontWeight: 600 }}>Predecir →</Link>
        </div>
        {recentPredictions.length === 0 ? (
          <div style={{
            background: 'linear-gradient(135deg, #0a1a0a, #121a12)',
            border: '1px solid #10b98133', borderRadius: '14px', padding: '28px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚽</div>
            <p style={{ color: '#94a3b8', margin: '0 0 14px', fontWeight: 600 }}>¡Todavía no predijiste nada!</p>
            <Link href="/matches">
              <button style={{ background: 'linear-gradient(135deg,#003087,#0050c8)', color: '#fff', fontWeight: 700, padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
                ⚽ Empezar a predecir
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentPredictions.map((pred: any) => {
              const match = pred.matches
              const isFinished = match?.status === 'FINISHED'
              const borderColor = pred.is_exact ? '#f59e0b' : pred.is_correct_result ? '#10b981' : isFinished ? '#ef4444' : '#2a2a3e'
              const bgColor = pred.is_exact ? 'rgba(245,158,11,0.06)' : pred.is_correct_result ? 'rgba(16,185,129,0.06)' : 'transparent'
              return (
                <div key={pred.id} style={{
                  background: bgColor || '#12121a', border: `1px solid ${borderColor}`,
                  borderRadius: '12px', padding: '12px 14px',
                  borderLeft: `3px solid ${borderColor}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ color: '#6b7280', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                      {match?.home_team} vs {match?.away_team}
                    </span>
                    {isFinished && (
                      <span style={{
                        fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
                        background: pred.is_exact ? '#f59e0b22' : pred.is_correct_result ? '#10b98122' : '#ef444422',
                        color: pred.is_exact ? '#f59e0b' : pred.is_correct_result ? '#10b981' : '#ef4444',
                      }}>
                        {pred.is_exact ? '🎯 Exacto' : pred.is_correct_result ? '✅ Correcto' : '❌ Error'}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#f0f0f5', fontWeight: 800, fontSize: '18px' }}>
                      {pred.home_score_pred} - {pred.away_score_pred}
                    </span>
                    {isFinished && <span style={{ color: '#6b7280', fontSize: '12px' }}>(real: {match.home_score}-{match.away_score})</span>}
                    {isFinished && pred.points_earned > 0 && (
                      <span style={{ color: '#f59e0b', fontWeight: 800, marginLeft: 'auto', fontSize: '15px' }}>+{pred.points_earned} pts</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ═══ ACCESOS RÁPIDOS ═══ */}
      <div>
        <h2 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Accesos Rápidos</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {[
            { href: '/fixture', emoji: '🗓️', label: 'Fixture', desc: 'Bracket y grupos', grad: 'linear-gradient(135deg,#001a3d,#003087)', border: '#75aadb44' },
            { href: '/predict/bonus', emoji: '🌟', label: 'Bonus', desc: 'Campeón y goleador', grad: 'linear-gradient(135deg,#1a1200,#2a1f00)', border: '#f59e0b33' },
            { href: '/ranking', emoji: '🏅', label: 'Ranking', desc: 'Tabla global', grad: 'linear-gradient(135deg,#001a4d,#003087)', border: '#3b82f633' },
            { href: '/profile', emoji: '🏆', label: 'Logros', desc: 'Mis badges', grad: 'linear-gradient(135deg,#0a1a0a,#0f2e0f)', border: '#10b98133' },
          ].map(a => (
            <Link key={a.href} href={a.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: a.grad, border: `1px solid ${a.border}`,
                borderRadius: '14px', padding: '16px 10px', textAlign: 'center', cursor: 'pointer',
                transition: 'transform 0.15s',
              }}>
                <div style={{ fontSize: '26px', marginBottom: '6px' }}>{a.emoji}</div>
                <div style={{ fontWeight: 700, color: '#f0f0f5', fontSize: '13px' }}>{a.label}</div>
                <div style={{ color: '#6b7280', fontSize: '10px', marginTop: '2px' }}>{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
