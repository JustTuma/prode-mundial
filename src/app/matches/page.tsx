import { createClient } from '@/lib/supabase/server'
import { getStageLabel, formatDate } from '@/lib/utils'
import Link from 'next/link'
import type { Match, Prediction } from '@/lib/types'
import MatchesView from '@/components/matches/MatchesView'

export const revalidate = 60

export default async function MatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [matchesRes, predictionsRes] = await Promise.all([
    supabase.from('matches').select('*').order('match_date'),
    user ? supabase.from('predictions').select('*').eq('user_id', user.id) : { data: [] },
  ])

  const matches: Match[] = matchesRes.data || []
  const predictions: Prediction[] = predictionsRes.data || []

  return <MatchesView matches={matches} predictions={predictions} user={user} />
}
