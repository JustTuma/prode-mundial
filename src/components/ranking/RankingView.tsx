'use client'
import { useState } from 'react'
import Link from 'next/link'

type Tab = 'global' | 'weekly'

interface Profile {
  id: string; username: string; avatar_url: string | null
  total_points: number; exact_scores: number; correct_results: number; predictions_made: number
}
interface WeeklyEntry {
  userId: string; username: string; avatar_url: string | null; points: number; exact: number
}

function Avatar({ profile, size = 32, center = false }: { profile: { username: string; avatar_url: string | null }; size?: number; center?: boolean }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #003087, #0050c8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', margin: center ? '0 auto' : undefined,
    }}>
      {profile.avatar_url
        ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ color: 'white', fontWeight: 700, fontSize: size * 0.4 }}>{profile.username?.[0]?.toUpperCase()}</span>
      }
    </div>
  )
}

export default function RankingView({ ranking, weeklyRanking, userId, weekStart }: {
  ranking: Profile[]; weeklyRanking: WeeklyEntry[]; userId?: string; weekStart?: string
}) {
  const [tab, setTab] = useState<Tab>('global')

  const userRank = ranking.findIndex(p => p.id === userId) + 1
  const userProfile = ranking.find(p => p.id === userId)
  const userWeeklyRank = weeklyRanking.findIndex(p => p.userId === userId) + 1

  return (
    <div style={{ paddingBottom: '80px', maxWidth: '700px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #003087, #0050c8)',
        borderRadius: '16px', padding: '20px', marginBottom: '20px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 18px, rgba(255,255,255,0.05) 18px, rgba(255,255,255,0.05) 36px)' }} />
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontWeight: 900, fontSize: '1.4rem', color: '#fff' }}>🏅 Ranking</h1>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
              {ranking.length} participantes
            </p>
          </div>
          {userProfile && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: '1.5rem' }}>
                #{tab === 'global' ? userRank : userWeeklyRank || '-'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>tu posición</div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: '#0a0a0f', borderRadius: '10px', padding: '4px', marginBottom: '20px' }}>
        {([['global','🌍 Global'],['weekly','📅 Esta semana']] as const).map(([v, label]) => (
          <button key={v} onClick={() => setTab(v)} style={{
            flex: 1, padding: '9px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: tab === v ? '#1e1e2e' : 'transparent',
            color: tab === v ? '#f0f0f5' : '#6b7280',
            fontWeight: tab === v ? 700 : 400, fontSize: '14px', transition: 'all 0.2s',
          }}>{label}</button>
        ))}
      </div>

      {/* GLOBAL */}
      {tab === 'global' && (
        <>
          {/* Podio */}
          {ranking.length >= 3 && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'flex-end' }}>
              {[
                { p: ranking[1], color: '#94a3b8', emoji: '🥈', size: 32, pad: '12px 8px' },
                { p: ranking[0], color: '#f59e0b', emoji: '🥇', size: 38, pad: '16px 8px' },
                { p: ranking[2], color: '#cd7f32', emoji: '🥉', size: 28, pad: '10px 8px' },
              ].map(({ p, color, emoji, size, pad }, i) => (
                <Link key={p.id} href={`/profile/${p.username}`} style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}>
                  <div style={{
                    background: '#12121a', border: `1px solid ${color}44`,
                    borderRadius: '12px', padding: pad, textAlign: 'center',
                    boxShadow: i === 1 ? `0 0 16px ${color}22` : 'none',
                  }}>
                    <div style={{ fontSize: i === 1 ? '24px' : '18px', marginBottom: '6px' }}>{emoji}</div>
                    <Avatar profile={p} size={size} center />
                    <div style={{ fontWeight: 700, fontSize: '11px', color: '#f0f0f5', margin: '6px 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 2px' }}>
                      {p.username}
                    </div>
                    <div style={{ color, fontWeight: 900, fontSize: i === 1 ? '1.2rem' : '1rem' }}>{p.total_points}</div>
                    <div style={{ color: '#6b7280', fontSize: '10px' }}>pts</div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Lista completa */}
          <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #1e1e2e', display: 'grid', gridTemplateColumns: '36px 1fr 44px 44px', gap: '8px' }}>
              {['#', 'Jugador', '🎯', '⭐ Pts'].map((h, i) => (
                <span key={i} style={{ color: '#374151', fontSize: '11px', fontWeight: 700, textAlign: i < 2 ? 'left' : 'right' }}>{h}</span>
              ))}
            </div>
            {ranking.map((p, i) => {
              const isUser = p.id === userId
              const rank = i + 1
              const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null
              return (
                <div key={p.id} style={{
                  padding: '10px 16px',
                  display: 'grid', gridTemplateColumns: '36px 1fr 44px 44px',
                  gap: '8px', alignItems: 'center',
                  borderBottom: '1px solid #1e1e2e',
                  background: isUser ? '#3b82f610' : 'transparent',
                  borderLeft: isUser ? '3px solid #3b82f6' : '3px solid transparent',
                }}>
                  <span style={{ fontWeight: 700, color: medal ? '#f59e0b' : '#374151', fontSize: '13px' }}>
                    {medal || `#${rank}`}
                  </span>
                  <Link href={`/profile/${p.username}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <Avatar profile={p} size={30} />
                    <span style={{ fontWeight: isUser ? 700 : 500, color: '#f0f0f5', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.username}{isUser && <span style={{ color: '#3b82f6', fontSize: '10px' }}> (vos)</span>}
                    </span>
                  </Link>
                  <span style={{ color: '#6b7280', fontSize: '12px', textAlign: 'right' }}>{p.exact_scores}</span>
                  <span style={{ color: '#fbbf24', fontWeight: 900, fontSize: '15px', textAlign: 'right' }}>{p.total_points}</span>
                </div>
              )
            })}
          </div>
          <p style={{ color: '#374151', fontSize: '11px', textAlign: 'center', marginTop: '12px' }}>
            🎯 3 pts resultado exacto · ✅ 1 pt resultado correcto
          </p>
        </>
      )}

      {/* SEMANAL */}
      {tab === 'weekly' && (
        <div>
          <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px' }}>
            <div style={{ fontWeight: 700, color: '#f0f0f5', fontSize: '13px', marginBottom: '4px' }}>📅 Ranking semanal</div>
            <div style={{ color: '#6b7280', fontSize: '12px', lineHeight: 1.5 }}>
              Puntos ganados en partidos finalizados desde el {weekStart}. Si no aparecés, ningún partido que predijiste terminó esta semana.
            </div>
          </div>
          {weeklyRanking.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📅</div>
              <p>Todavía no terminaron partidos esta semana</p>
            </div>
          ) : (
            <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #1e1e2e', display: 'grid', gridTemplateColumns: '36px 1fr 44px 44px', gap: '8px' }}>
                {['#', 'Jugador', '🎯', '⭐ Pts'].map((h, i) => (
                  <span key={i} style={{ color: '#374151', fontSize: '11px', fontWeight: 700, textAlign: i < 2 ? 'left' : 'right' }}>{h}</span>
                ))}
              </div>
              {weeklyRanking.map((p, i) => {
                const isUser = p.userId === userId
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
                return (
                  <div key={p.userId} style={{
                    padding: '10px 16px',
                    display: 'grid', gridTemplateColumns: '36px 1fr 44px 44px',
                    gap: '8px', alignItems: 'center',
                    borderBottom: '1px solid #1e1e2e',
                    background: isUser ? '#3b82f610' : 'transparent',
                    borderLeft: isUser ? '3px solid #3b82f6' : '3px solid transparent',
                  }}>
                    <span style={{ fontWeight: 700, color: medal ? '#f59e0b' : '#374151', fontSize: '13px' }}>
                      {medal || `#${i + 1}`}
                    </span>
                    <Link href={`/profile/${p.username}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <Avatar profile={p} size={30} />
                      <span style={{ fontWeight: isUser ? 700 : 500, color: '#f0f0f5', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.username}{isUser && <span style={{ color: '#3b82f6', fontSize: '10px' }}> (vos)</span>}
                      </span>
                    </Link>
                    <span style={{ color: '#6b7280', fontSize: '12px', textAlign: 'right' }}>{p.exact}</span>
                    <span style={{ color: '#fbbf24', fontWeight: 900, fontSize: '15px', textAlign: 'right' }}>{p.points}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
