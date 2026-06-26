'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import TeamAvatar from '@/components/ui/TeamAvatar'
import { personColor } from '@/lib/teams'

interface Props {
  profile: any
  nextMatch: any
  nextPredicted?: boolean
  liveMatches: any[]
  rank: number
  myPoints: number
  myExact: number
  myStreak?: number
  pointsToLeader: number
  top4: { pos: number; username: string; avatar_url: string | null; points: number; isYou: boolean }[]
  wallPosts: any[]
  weeklyWinner: { id: string; username: string; avatar_url: string | null; points: number } | null
  userId: string
}

function useCountdown(dateStr: string | null) {
  const [cd, setCd] = useState('')
  useEffect(() => {
    if (!dateStr) return
    const tick = () => {
      const ms = new Date(dateStr).getTime() - Date.now()
      if (ms <= 0) { setCd('¡En juego!'); return }
      const d = Math.floor(ms / 86400000), h = Math.floor(ms / 3600000) % 24
      const m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60
      const p = (n: number) => String(n).padStart(2, '0')
      setCd((d > 0 ? d + 'd ' : '') + p(h) + 'h ' + p(m) + 'm ' + p(s) + 's')
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [dateStr])
  return cd
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'ahora'
  if (m < 60) return `hace ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

export default function DashboardClient({ profile, nextMatch, nextPredicted, liveMatches, rank, myPoints, myExact, myStreak, pointsToLeader, top4, wallPosts, weeklyWinner, userId }: Props) {
  const cd = useCountdown(nextMatch?.match_date)
  const progress = rank === 1 ? 100 : Math.max(8, Math.min(95, Math.round((myPoints / (myPoints + pointsToLeader || 1)) * 100)))

  return (
    <div className="risein">
      {/* HERO */}
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', padding: '20px', background: 'var(--grad)', boxShadow: 'var(--shadow)', color: '#fff', marginTop: '4px' }}>
        <div style={{ position: 'absolute', right: '-34px', top: '-34px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,.13)' }} />
        <div style={{ position: 'absolute', right: '38px', bottom: '-54px', width: '96px', height: '96px', borderRadius: '50%', background: 'rgba(255,255,255,.09)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, opacity: .92 }}>Hola, {profile?.username} · tu posición</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginTop: '4px' }}>
            <div className="font-display" style={{ fontSize: '58px', lineHeight: .85 }}>#{rank || '-'}</div>
            <div style={{ paddingBottom: '8px' }}>
              <div className="font-display" style={{ fontSize: '28px', lineHeight: 1 }}>
                {myPoints}<span style={{ fontSize: '14px', opacity: .85, fontFamily: 'Archivo', fontWeight: 700 }}> pts</span>
              </div>
              <div style={{ fontSize: '12px', opacity: .92, marginTop: '2px' }}>
                {rank === 1 ? '¡Vas primero! 🏆' : pointsToLeader > 0 ? `a ${pointsToLeader} del 1°` : 'subí al podio'}
              </div>
            </div>
          </div>
          <div style={{ marginTop: '16px', height: '9px', borderRadius: '999px', background: 'rgba(255,255,255,.25)', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent2)', borderRadius: '999px', transition: 'width .6s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '9px', fontSize: '11px', fontWeight: 700, opacity: .92 }}>
            <span>{myStreak && myStreak >= 2 ? `🔥 Racha de ${myStreak}` : `🎯 ${myExact} exactos`}</span>
            <span>{profile?.predictions_made || 0} pronósticos</span>
          </div>
        </div>
      </div>

      {/* EN VIVO */}
      {liveMatches.length > 0 && (
        <div style={{ marginTop: '14px' }}>
          {liveMatches.map((m: any) => (
            <Link key={m.id} href={`/matches/${m.id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '14px 16px', marginBottom: '8px', borderColor: 'var(--neg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', background: 'var(--neg)', borderRadius: '50%' }} className="animate-pulse" />
                    <span style={{ color: 'var(--neg)', fontWeight: 800, fontSize: '11px' }}>EN VIVO{m.minute ? ` ${m.minute}'` : ''}</span>
                  </div>
                  <span className="font-display" style={{ fontSize: '20px', color: 'var(--ink)' }}>{m.home_team} {m.home_score ?? 0}-{m.away_score ?? 0} {m.away_team}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* PRÓXIMO PARTIDO */}
      {nextMatch && (
        <div className="card" style={{ marginTop: '14px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.7px' }}>Próximo partido</span>
            <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 700 }}>
              {new Date(nextMatch.match_date).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' })}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginTop: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '96px' }}>
              <TeamAvatar name={nextMatch.home_team} code={nextMatch.home_team_code} flag={nextMatch.home_team_flag} size={52} />
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--ink)', textAlign: 'center' }}>{nextMatch.home_team}</span>
            </div>
            <span className="font-display" style={{ fontSize: '20px', color: 'var(--muted)' }}>VS</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '96px' }}>
              <TeamAvatar name={nextMatch.away_team} code={nextMatch.away_team_code} flag={nextMatch.away_team_flag} size={52} />
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--ink)', textAlign: 'center' }}>{nextMatch.away_team}</span>
            </div>
          </div>
          <div className="font-display" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'var(--surface2)', borderRadius: '14px', padding: '11px', fontSize: '21px', color: 'var(--ink)', letterSpacing: '1px' }}>{cd}</div>
          <Link href={`/matches/${nextMatch.id}`} style={{ textDecoration: 'none' }}>
            <button className="btn-accent" style={{ marginTop: "12px", background: nextPredicted ? "var(--pos)" : "var(--accent)" }}>{nextPredicted ? "✓ Pronóstico cargado · editar" : "Cargar mi pronóstico"}</button>
          </Link>
        </div>
      )}

      {/* ACCESO: Hub Mundial */}
      <Link href="/mundial" style={{ textDecoration: 'none' }}>
        <div style={{ marginTop: '14px', borderRadius: '18px', padding: '16px 18px', background: 'linear-gradient(135deg,#003087,#0050c8)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg,transparent 0,transparent 18px,rgba(255,255,255,.05) 18px,rgba(255,255,255,.05) 36px)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>🌎</span>
              <span className="font-display" style={{ fontSize: '18px', color: '#fff' }}>Mundial</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,.65)', fontSize: '12px', marginTop: '2px' }}>Goleadores · hoy juegan · sedes · simulador</div>
          </div>
          <span style={{ position: 'relative', color: '#fff', fontSize: '20px' }}>›</span>
        </div>
      </Link>

      {/* ACCESOS: Fixture / Bracket */}
      <div style={{ marginTop: '14px', display: 'flex', gap: '12px' }}>
        <Link href="/fixture" style={{ flex: 1, textDecoration: 'none' }}>
          <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M3 14.5h18M9 4v16" /></svg>
            <span className="font-display" style={{ fontSize: '15px', color: 'var(--ink)' }}>Fixture</span>
            <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Grupos y posiciones</span>
          </div>
        </Link>
        <Link href="/fixture?tab=bracket" style={{ flex: 1, textDecoration: 'none' }}>
          <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h5v6h4M4 11h5M4 13h5v6h4M13 11h4v2h0M17 11V7M17 13v4" /></svg>
            <span className="font-display" style={{ fontSize: '15px', color: 'var(--ink)' }}>Bracket</span>
            <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Camino a la final</span>
          </div>
        </Link>
      </div>

      {/* PREMIO SEMANAL */}
      <div className="card" style={{ marginTop: '14px', padding: '14px 16px', background: 'var(--grad)', border: 'none', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🍔</span>
              <span style={{ fontWeight: 800, fontSize: '14px' }}>Premio semanal</span>
            </div>
            <p style={{ fontSize: '12px', opacity: .9, margin: '2px 0 0' }}>El que más puntos sume gana una hamburguesa</p>
          </div>
          {weeklyWinner && weeklyWinner.points > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', opacity: .85 }}>va ganando</div>
              <div style={{ fontWeight: 800, fontSize: '13px' }}>{weeklyWinner.username} · {weeklyWinner.points} pts</div>
            </div>
          )}
        </div>
      </div>

      {/* TOP DE TUS AMIGOS */}
      <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="font-display" style={{ fontSize: '19px', color: 'var(--ink)' }}>Top de tus amigos</span>
        <Link href="/ranking" style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '13px', textDecoration: 'none' }}>Ver ranking</Link>
      </div>
      <div className="card" style={{ marginTop: '10px', padding: '2px 14px' }}>
        {top4.map((item, i) => (
          <Link key={item.username + i} href={`/profile/${item.username}`} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 2px', borderBottom: i < top4.length - 1 ? '1px solid var(--line)' : 'none' }}>
              <span className="font-display" style={{ width: '16px', fontSize: '15px', color: 'var(--muted)' }}>{item.pos}</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: personColor(item.username), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Anton', fontSize: '13px', overflow: 'hidden' }}>
                {item.avatar_url ? <img src={item.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : item.username?.[0]?.toUpperCase()}
              </div>
              <span style={{ flex: 1, fontSize: '13px', fontWeight: item.isYou ? 900 : 600, color: 'var(--ink)' }}>{item.username}{item.isYou && ' (vos)'}</span>
              <span className="font-display" style={{ fontSize: '16px', color: 'var(--ink)', minWidth: '34px', textAlign: 'right' }}>{item.points}</span>
            </div>
          </Link>
        ))}
        {top4.length === 0 && <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>Todavía sin jugadores</div>}
      </div>

      {/* ACTIVIDAD */}
      <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="font-display" style={{ fontSize: '19px', color: 'var(--ink)' }}>Actividad</span>
        <Link href="/social" style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '13px', textDecoration: 'none' }}>Ver todo</Link>
      </div>
      <div className="card" style={{ marginTop: '6px', padding: '2px 14px' }}>
        {wallPosts.length === 0 ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
            Sin actividad todavía · <Link href="/social" style={{ color: 'var(--accent)' }}>escribí algo</Link>
          </div>
        ) : wallPosts.map((post: any, i: number) => {
          const p = post.profiles
          return (
            <div key={post.id} style={{ display: 'flex', gap: '12px', padding: '13px 0', borderBottom: i < wallPosts.length - 1 ? '1px solid var(--line)' : 'none' }}>
              <div style={{ flexShrink: 0, width: '38px', height: '38px', borderRadius: '50%', background: personColor(p?.username), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Anton', fontSize: '15px', overflow: 'hidden' }}>
                {p?.avatar_url ? <img src={p.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : p?.username?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', color: 'var(--ink)', lineHeight: 1.4 }}><b style={{ fontWeight: 800 }}>{p?.username}</b> {post.content}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '3px' }}>{timeAgo(post.created_at)}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
