import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/dashboard/DashboardClient'
import { InstallModal } from '@/components/InstallGuide'
import PointsToast from '@/components/dashboard/PointsToast'

export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Weekly window (Monday to Sunday Argentina)
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  monday.setHours(0, 0, 0, 0)

  const [profileRes, matchesRes, predictionsRes, rankRes, liveRes, weeklyRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('matches').select('*').gte('match_date', new Date().toISOString()).order('match_date').limit(3),
    supabase.from('predictions').select('*, matches(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('id').order('total_points', { ascending: false }),
    supabase.from('matches').select('*').in('status', ['IN_PLAY', 'PAUSED', 'LIVE']).limit(3),
    supabase.from('predictions')
      .select('user_id, points_earned, profiles!predictions_user_id_fkey(id, username, avatar_url)')
      .gte('updated_at', monday.toISOString()),
  ])

  const profile = profileRes.data
  const upcomingMatches = matchesRes.data || []
  const recentPredictions = predictionsRes.data || []
  const liveMatches = liveRes.data || []
  const rank = (rankRes.data || []).findIndex(p => p.id === user.id) + 1
  const accuracy = profile?.predictions_made > 0
    ? Math.round((profile.correct_results / profile.predictions_made) * 100) : 0

  // Calcular ganador semanal
  const weeklyMap: Record<string, { id: string; username: string; avatar_url: string | null; points: number }> = {}
  for (const pred of weeklyRes.data || []) {
    const p = pred.profiles as any
    if (!p) continue
    if (!weeklyMap[pred.user_id]) weeklyMap[pred.user_id] = { id: p.id, username: p.username, avatar_url: p.avatar_url, points: 0 }
    weeklyMap[pred.user_id].points += pred.points_earned || 0
  }
  const weeklyWinner = Object.values(weeklyMap).sort((a, b) => b.points - a.points)[0] || null

  return (
    <>
      <InstallModal />
      {user && profile && (
        <PointsToast totalPoints={profile.total_points || 0} userId={user.id} />
      )}
      <DashboardClient
        profile={profile}
        upcomingMatches={upcomingMatches}
        recentPredictions={recentPredictions}
        liveMatches={liveMatches}
        rank={rank}
        accuracy={accuracy}
        weeklyWinner={weeklyWinner}
      />
    </>
  )
}
