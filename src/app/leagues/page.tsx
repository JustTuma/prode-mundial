import { createClient } from '@/lib/supabase/server'
import CreateLeagueForm from '@/components/leagues/CreateLeagueForm'
import JoinLeagueForm from '@/components/leagues/JoinLeagueForm'
import Link from 'next/link'

export default async function LeaguesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: memberships } = await supabase
    .from('league_members')
    .select('*, leagues(*, owner:profiles!leagues_owner_id_fkey(username))')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })

  const myLeagues = (memberships || []).map((m: any) => ({ ...m.leagues, my_points: m.league_points, my_rank: m.league_rank }))

  return (
    <div style={{ paddingBottom: '80px', maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>👥 Ligas Privadas</h1>

      <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginBottom: '32px' }}>
        <CreateLeagueForm />
        <JoinLeagueForm />
      </div>

      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Mis Ligas ({myLeagues.length})</h2>

      {myLeagues.length === 0 ? (
        <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
          <p style={{ color: '#94a3b8', margin: 0 }}>No estás en ninguna liga todavía</p>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '8px 0 0' }}>Creá una o unite con un código de invitación</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {myLeagues.map((league: any) => (
            <Link key={league.id} href={`/leagues/${league.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px',
                padding: '20px', cursor: 'pointer', transition: 'all 0.15s',
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '32px' }}>{league.avatar_emoji || '🏆'}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#f0f0f5', fontSize: '16px' }}>{league.name}</div>
                      <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>
                        Código: <span style={{ fontFamily: 'monospace', color: '#94a3b8', fontWeight: 700 }}>{league.invite_code}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#f59e0b', fontWeight: 900, fontSize: '1.3rem' }}>{league.my_points || 0}</div>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>
                      {league.my_rank ? `#${league.my_rank}` : '-'}
                    </div>
                  </div>
                </div>
                {league.description && (
                  <p style={{ color: '#94a3b8', fontSize: '13px', margin: '12px 0 0' }}>{league.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
