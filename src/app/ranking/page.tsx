import { createClient } from '@/lib/supabase/server'
import RankingView from '@/components/ranking/RankingView'

export const revalidate = 0

export default async function RankingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Weekly start (Monday)
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  monday.setHours(0, 0, 0, 0)

  // Get all profiles + their actual points calculated from predictions
  const [profilesRes, predsRes, weeklyRes] = await Promise.all([
    supabase.from('profiles')
      .select('id, username, avatar_url, predictions_made'),
    // All scored predictions to calculate real totals
    supabase.from('predictions')
      .select('user_id, points_earned, is_exact, is_correct_result')
      .gt('points_earned', -1),
    // Weekly predictions
    supabase.from('predictions')
      .select('user_id, points_earned, updated_at, profiles!predictions_user_id_fkey(id, username, avatar_url)')
      .gte('updated_at', monday.toISOString()),
  ])

  const profiles = profilesRes.data || []
  const allPreds = predsRes.data || []

  // Calculate real totals per user from predictions
  const totals: Record<string, { points: number; exact: number; correct: number }> = {}
  for (const p of allPreds) {
    if (!totals[p.user_id]) totals[p.user_id] = { points: 0, exact: 0, correct: 0 }
    totals[p.user_id].points += p.points_earned || 0
    if (p.is_exact) totals[p.user_id].exact++
    if (p.is_correct_result) totals[p.user_id].correct++
  }

  // Build ranking sorted by real points
  const ranking = profiles
    .map(p => ({
      ...p,
      total_points: totals[p.id]?.points ?? 0,
      exact_scores: totals[p.id]?.exact ?? 0,
      correct_results: totals[p.id]?.correct ?? 0,
    }))
    .sort((a, b) => b.total_points - a.total_points)

  // Weekly ranking
  const weeklyMap: Record<string, { userId: string; username: string; avatar_url: string | null; points: number; exact: number }> = {}
  for (const pred of weeklyRes.data || []) {
    const p = pred.profiles as any
    if (!p) continue
    if (!weeklyMap[pred.user_id]) weeklyMap[pred.user_id] = { userId: pred.user_id, username: p.username, avatar_url: p.avatar_url, points: 0, exact: 0 }
    weeklyMap[pred.user_id].points += pred.points_earned || 0
    if (pred.points_earned === 3) weeklyMap[pred.user_id].exact++
  }
  const weeklyRanking = Object.values(weeklyMap).sort((a, b) => b.points - a.points)

  return (
    <RankingView
      ranking={ranking}
      weeklyRanking={weeklyRanking}
      userId={user?.id}
      weekStart={monday.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', timeZone: 'America/Argentina/Buenos_Aires' })}
    />
  )
}
