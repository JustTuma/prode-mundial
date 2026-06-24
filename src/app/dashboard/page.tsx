import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/dashboard/DashboardClient'
import { InstallModal } from '@/components/InstallGuide'
import PointsToast from '@/components/dashboard/PointsToast'

export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  monday.setHours(0, 0, 0, 0)

  const [profileRes, upcomingRes, predsRes, rankRes, liveRes, wallRes, weeklyRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('matches').select('*').gte('match_date', new Date().toISOString()).order('match_date').limit(1),
    supabase.from('predictions').select('points_earned, is_exact, is_correct_result, user_id').gt('points_earned', -1),
    supabase.from('profiles').select('id, username, avatar_url, total_points').order('total_points', { ascending: false }).limit(50),
    supabase.from('matches').select('*').in('status', ['IN_PLAY', 'PAUSED', 'LIVE']).limit(2),
    supabase.from('wall_posts').select('*, profiles!wall_posts_user_id_fkey(username, avatar_url)').order('created_at', { ascending: false }).limit(3),
    supabase.from('predictions').select('user_id, points_earned, profiles!predictions_user_id_fkey(id, username, avatar_url)').gte('updated_at', monday.toISOString()),
  ])

  const profile = profileRes.data
  const nextMatch = (upcomingRes.data || [])[0] || null
  const liveMatches = liveRes.data || []
  const wallPosts = wallRes.data || []

  // Real points from predictions
  const totals: Record<string, { points: number; exact: number }> = {}
  for (const p of (predsRes.data || [])) {
    if (!totals[p.user_id]) totals[p.user_id] = { points: 0, exact: 0 }
    totals[p.user_id].points += p.points_earned || 0
    if (p.is_exact) totals[p.user_id].exact++
  }

  const ranking = (rankRes.data || [])
    .map(p => ({ ...p, real_points: totals[p.id]?.points ?? 0, exact: totals[p.id]?.exact ?? 0 }))
    .sort((a, b) => b.real_points - a.real_points)

  const rank = ranking.findIndex(p => p.id === user.id) + 1
  const myPoints = totals[user.id]?.points ?? 0
  const myExact = totals[user.id]?.exact ?? 0
  const leader = ranking[0]
  const pointsToLeader = leader && rank > 1 ? leader.real_points - myPoints : 0
  const top4 = ranking.slice(0, 4).map((p, i) => ({
    pos: i + 1, username: p.username, avatar_url: p.avatar_url,
    points: p.real_points, isYou: p.id === user.id,
  }))

  // Weekly winner
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
      {profile && <PointsToast totalPoints={myPoints} userId={user.id} />}
      <DashboardClient
        profile={profile}
        nextMatch={nextMatch}
        liveMatches={liveMatches}
        rank={rank}
        myPoints={myPoints}
        myExact={myExact}
        pointsToLeader={pointsToLeader}
        top4={top4}
        wallPosts={wallPosts}
        weeklyWinner={weeklyWinner}
        userId={user.id}
      />
    </>
  )
}
