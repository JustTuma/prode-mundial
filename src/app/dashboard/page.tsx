import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import DashboardClient from '@/components/dashboard/DashboardClient'
import { InstallModal } from '@/components/InstallGuide'
import PointsToast from '@/components/dashboard/PointsToast'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [profileRes, matchesRes, predictionsRes, rankRes, liveRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('matches').select('*').gte('match_date', new Date().toISOString()).order('match_date').limit(3),
    supabase.from('predictions').select('*, matches(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('id').order('total_points', { ascending: false }),
    supabase.from('matches').select('*').in('status', ['IN_PLAY', 'PAUSED', 'LIVE']).limit(3),
  ])

  const profile = profileRes.data
  const upcomingMatches = matchesRes.data || []
  const recentPredictions = predictionsRes.data || []
  const liveMatches = liveRes.data || []
  const rank = (rankRes.data || []).findIndex(p => p.id === user.id) + 1
  const accuracy = profile?.predictions_made > 0
    ? Math.round((profile.correct_results / profile.predictions_made) * 100) : 0

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
      />
    </>
  )
}
