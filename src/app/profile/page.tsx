import { createClient } from '@/lib/supabase/server'
import ProfileView from '@/components/profile/ProfileView'

export const revalidate = 0

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [profileRes, achievementsRes, predsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id),
    supabase.from('predictions').select('points_earned, is_exact, user_id').gt('points_earned', -1),
  ])

  const profile = profileRes.data
  const earnedIds = (achievementsRes.data || []).map(a => a.achievement_id)

  // Real points + rank from predictions
  const totals: Record<string, { points: number; exact: number }> = {}
  for (const p of (predsRes.data || [])) {
    if (!totals[p.user_id]) totals[p.user_id] = { points: 0, exact: 0 }
    totals[p.user_id].points += p.points_earned || 0
    if (p.is_exact) totals[p.user_id].exact++
  }
  const sorted = Object.entries(totals).sort((a, b) => b[1].points - a[1].points)
  const rank = sorted.findIndex(([id]) => id === user.id) + 1
  const myPoints = totals[user.id]?.points ?? 0
  const myExact = totals[user.id]?.exact ?? 0

  // Récords: racha actual + mejor racha + % de acierto
  const { data: myFinished } = await supabase
    .from('predictions')
    .select('is_correct_result, points_earned, matches!inner(match_date, status)')
    .eq('user_id', user.id).eq('matches.status', 'FINISHED')
  const ordered = (myFinished || []).sort((a: any, b: any) =>
    new Date(a.matches.match_date).getTime() - new Date(b.matches.match_date).getTime())
  let bestStreak = 0, run = 0, currentStreak = 0
  for (const p of ordered) {
    if (p.is_correct_result) { run++; bestStreak = Math.max(bestStreak, run) }
    else run = 0
  }
  for (let i = ordered.length - 1; i >= 0; i--) {
    if ((ordered[i] as any).is_correct_result) currentStreak++; else break
  }
  const played = ordered.length
  const correct = ordered.filter((p: any) => p.is_correct_result).length
  const accuracy = played > 0 ? Math.round(correct / played * 100) : 0
  const records = { currentStreak, bestStreak, accuracy, played }

  return (
    <ProfileView
      profile={profile}
      rank={rank}
      myPoints={myPoints}
      myExact={myExact}
      earnedIds={earnedIds}
      records={records}
    />
  )
}
