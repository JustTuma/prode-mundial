import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function LeaguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [leagueRes, membersRes] = await Promise.all([
    supabase.from('leagues').select('*, owner:profiles!leagues_owner_id_fkey(username)').eq('id', id).single(),
    supabase.from('league_members').select('*, profiles(*)').eq('league_id', id).order('league_points', { ascending: false }),
  ])

  if (!leagueRes.data) notFound()

  const league = leagueRes.data as any
  const members: any[] = membersRes.data || []
  const userMember = user ? members.find(m => m.user_id === user.id) : null

  return (
    <div style={{ paddingBottom: '80px', maxWidth: '700px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <span style={{ fontSize: '48px' }}>{league.avatar_emoji}</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{league.name}</h1>
            {league.description && <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '14px' }}>{league.description}</p>}
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>
              {members.length} jugadores · Creada por {league.owner?.username}
            </p>
          </div>
        </div>

        <div style={{ background: '#0a0a0f', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>Código de invitación</div>
            <div style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 900, color: '#f59e0b', letterSpacing: '4px' }}>
              {league.invite_code}
            </div>
          </div>
          <button onClick={() => navigator.clipboard?.writeText(league.invite_code)}
            className="btn-secondary" style={{ fontSize: '13px' }}>
            📋 Copiar
          </button>
        </div>

        {userMember && (
          <div style={{ marginTop: '16px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
            {[
              { label: 'Tu posición', value: userMember.league_rank ? `#${userMember.league_rank}` : '-', color: '#f59e0b' },
              { label: 'Tus puntos', value: userMember.league_points || 0, color: '#3b82f6' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 900, fontSize: '1.5rem', color: s.color }}>{s.value}</div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rankings */}
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>🏅 Tabla de Posiciones</h2>
      <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', overflow: 'hidden' }}>
        {members.map((m, i) => {
          const isUser = m.user_id === user?.id
          const rank = i + 1
          const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null
          const p = m.profiles
          return (
            <div key={m.user_id} style={{
              padding: '14px 16px',
              display: 'grid', gridTemplateColumns: '40px 1fr auto',
              gap: '12px', alignItems: 'center',
              borderBottom: '1px solid #1e1e2e',
              background: isUser ? '#3b82f610' : 'transparent',
              borderLeft: isUser ? '3px solid #3b82f6' : '3px solid transparent',
            }}>
              <span style={{ fontWeight: 700, color: medal ? '#f59e0b' : '#6b7280', fontSize: '14px' }}>
                {medal || `#${rank}`}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '14px', flexShrink: 0,
                }}>
                  {p?.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: isUser ? 700 : 500, color: '#f0f0f5', fontSize: '14px' }}>
                    {p?.username} {isUser && <span style={{ color: '#3b82f6', fontSize: '11px' }}>(vos)</span>}
                  </div>
                  <div style={{ color: '#374151', fontSize: '11px' }}>
                    🎯 {p?.exact_scores || 0} exactos
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#f59e0b', fontWeight: 900, fontSize: '1.2rem' }}>{m.league_points || 0}</div>
                <div style={{ color: '#6b7280', fontSize: '11px' }}>pts</div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <Link href="/leagues">
          <button className="btn-secondary">← Volver a mis ligas</button>
        </Link>
      </div>
    </div>
  )
}
