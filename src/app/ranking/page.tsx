import { createClient } from '@/lib/supabase/server'
import RankingView from '@/components/ranking/RankingView'

export const revalidate = 0

export default async function RankingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Start of current week (Monday Argentina time)
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  monday.setHours(0, 0, 0, 0)

  const [rankingRes, weeklyRes] = await Promise.all([
    supabase.from('profiles')
      .select('id, username, avatar_url, total_points, exact_scores, correct_results, predictions_made')
      .order('total_points', { ascending: false })
      .limit(100),
    supabase.from('predictions')
      .select('user_id, points_earned, updated_at, profiles(id, username, avatar_url)')
      .gte('updated_at', monday.toISOString()),
  ])

  // Aggregate weekly points — include all users who had predictions scored this week
  const weeklyMap: Record<string, { userId: string; username: string; avatar_url: string | null; points: number; exact: number }> = {}
  for (const pred of weeklyRes.data || []) {
    const p = pred.profiles as any
    if (!p) continue
    if (!weeklyMap[pred.user_id]) {
      weeklyMap[pred.user_id] = { userId: pred.user_id, username: p.username, avatar_url: p.avatar_url, points: 0, exact: 0 }
    }
    weeklyMap[pred.user_id].points += pred.points_earned || 0
    if (pred.points_earned === 3) weeklyMap[pred.user_id].exact++
  }
  const weeklyRanking = Object.values(weeklyMap).sort((a, b) => b.points - a.points)

  return (
    <RankingView
      ranking={rankingRes.data || []}
      weeklyRanking={weeklyRanking}
      userId={user?.id}
      weekStart={monday.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', timeZone: 'America/Argentina/Buenos_Aires' })}
    />
  )
}
