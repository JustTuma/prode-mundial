import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import TeamAvatar from '@/components/ui/TeamAvatar'
import { personColor } from '@/lib/teams'

export const revalidate = 0

const ALL_ACHIEVEMENTS = [
  { id: 'first_pred', emoji: '🎯' }, { id: 'exacto_1', emoji: '🦅' }, { id: 'exacto_5', emoji: '🔮' },
  { id: 'exacto_10', emoji: '🧙' }, { id: 'points_50', emoji: '🔥' }, { id: 'points_100', emoji: '💯' },
  { id: 'points_200', emoji: '🏆' }, { id: 'all_group', emoji: '⚽' }, { id: 'champion_correct', emoji: '🌟' },
]

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()
  const { data: { user: me } } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('profiles').select('*').eq('username', decodeURIComponent(username)).single()
  if (!profile) notFound()
  const isMe = me?.id === profile.id

  const [predsRes, achRes, allPredsRes] = await Promise.all([
    supabase.from('predictions').select('*, matches(*)').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(40),
    supabase.from('user_achievements').select('achievement_id').eq('user_id', profile.id),
    supabase.from('predictions').select('user_id, points_earned, is_exact').gt('points_earned', -1),
  ])

  const predictions = predsRes.data || []
  const earned = new Set((achRes.data || []).map(a => a.achievement_id))

  const totals: Record<string, { points: number; exact: number }> = {}
  for (const p of (allPredsRes.data || [])) {
    if (!totals[p.user_id]) totals[p.user_id] = { points: 0, exact: 0 }
    totals[p.user_id].points += p.points_earned || 0
    if (p.is_exact) totals[p.user_id].exact++
  }
  const sorted = Object.entries(totals).sort((a, b) => b[1].points - a[1].points)
  const rank = sorted.findIndex(([id]) => id === profile.id) + 1
  const points = totals[profile.id]?.points ?? 0
  const exact = totals[profile.id]?.exact ?? 0
  const correct = predictions.filter((p: any) => p.is_correct_result).length

  return (
    <div className="risein" style={{ paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '14px 0 18px' }}>
        <div style={{ width: '84px', height: '84px', borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Anton', fontSize: '34px', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          {profile.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : profile.username?.[0]?.toUpperCase()}
        </div>
        <h1 className="font-display" style={{ fontSize: '24px', color: 'var(--ink)', marginTop: '12px' }}>{profile.full_name || profile.username}</h1>
        <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>@{profile.username}{isMe && ' · vos'}</span>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
        {[{ v: points, l: 'Puntos', c: 'var(--accent)' }, { v: rank ? `#${rank}` : '-', l: 'Posición', c: 'var(--ink)' }, { v: exact, l: 'Exactos', c: 'var(--accent2)' }].map(s => (
          <div key={s.l} className="card" style={{ padding: '14px', borderRadius: '16px', textAlign: 'center' }}>
            <div className="font-display" style={{ fontSize: '26px', color: s.c }}>{s.v}</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Logros */}
      {earned.size > 0 && (
        <>
          <h2 className="font-display" style={{ fontSize: '18px', color: 'var(--ink)', margin: '20px 0 12px' }}>Logros ({earned.size})</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {ALL_ACHIEVEMENTS.filter(a => earned.has(a.id)).map(a => (
              <div key={a.id} style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--accent2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{a.emoji}</div>
            ))}
          </div>
        </>
      )}

      {/* Predicciones */}
      <h2 className="font-display" style={{ fontSize: '18px', color: 'var(--ink)', margin: '20px 0 12px' }}>Pronósticos ({predictions.length})</h2>
      {predictions.length === 0 ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>Todavía no hizo pronósticos</div>
      ) : (
        <div className="card" style={{ padding: '4px 14px' }}>
          {predictions.map((pred: any, i: number) => {
            const m = pred.matches
            const fin = m?.status === 'FINISHED'
            const col = pred.is_exact ? 'var(--pos)' : pred.is_correct_result ? 'var(--accent)' : fin ? 'var(--neg)' : 'var(--muted)'
            return (
              <div key={pred.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 0', borderBottom: i < predictions.length - 1 ? '1px solid var(--line)' : 'none' }}>
                {m && <TeamAvatar name={m.home_team} code={m.home_team_code} flag={m.home_team_flag} size={28} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m?.home_team} vs {m?.away_team}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
                    {pred.home_score_pred}-{pred.away_score_pred}{fin && <span style={{ color: 'var(--muted)', fontWeight: 400 }}> · real {m.home_score}-{m.away_score}</span>}
                  </div>
                </div>
                {fin && <span className="font-display" style={{ fontSize: '15px', color: col }}>{pred.points_earned > 0 ? '+' + pred.points_earned : '0'}</span>}
              </div>
            )
          })}
        </div>
      )}

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Link href="/ranking" style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '13px', textDecoration: 'none' }}>← Volver al ranking</Link>
      </div>
    </div>
  )
}
