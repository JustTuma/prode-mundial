import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerAdmin } from '@supabase/supabase-js'
import { fetchWorldCupMatches, mapAPIMatchToDBMatch, getMockMatches } from '@/lib/football-api'
import { calculatePoints } from '@/lib/utils'

function getAdminClient() {
  return createServerAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  // Verify secret header for cron security
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET || 'dev-secret'}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getAdminClient()

  try {
    // Fetch matches - use mock if no API key
    const useAPI = !!process.env.FOOTBALL_API_KEY && process.env.FOOTBALL_API_KEY !== 'your_football_data_api_key'
    const rawMatches = useAPI ? await fetchWorldCupMatches() : []
    const matches = useAPI ? rawMatches.map(mapAPIMatchToDBMatch) : getMockMatches()

    // Upsert all matches
    const { error: matchError } = await supabase
      .from('matches')
      .upsert(matches as any, { onConflict: 'id' })

    if (matchError) throw matchError

    // Score predictions for finished matches
    const finishedMatches = matches.filter(m => m.status === 'FINISHED' && m.home_score !== null && m.away_score !== null)

    let scoredCount = 0
    for (const match of finishedMatches) {
      const { data: preds } = await supabase.from('predictions').select('*').eq('match_id', match.id)
      if (!preds?.length) continue

      for (const pred of preds) {
        const result = calculatePoints(pred.home_score_pred, pred.away_score_pred, match.home_score!, match.away_score!)
        await supabase.from('predictions').update({
          points_earned: result.points,
          is_exact: result.isExact,
          is_correct_result: result.isCorrectResult,
        }).eq('id', pred.id)
        scoredCount++
      }

      // Update profile stats
      const userIds = [...new Set(preds.map(p => p.user_id))]
      for (const userId of userIds) {
        await supabase.rpc('update_profile_stats', { p_user_id: userId })
        await checkAndAwardAchievements(supabase, userId)
      }
    }

    // Update league standings
    await supabase.rpc('update_league_standings')

    return NextResponse.json({
      success: true,
      matchesSynced: matches.length,
      predictionsScored: scoredCount,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to sync matches' })
}

async function checkAndAwardAchievements(supabase: any, userId: string) {
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (!profile) return

  const toAward: string[] = []
  if (profile.predictions_made >= 1) toAward.push('first_pred')
  if (profile.exact_scores >= 1) toAward.push('exacto_1')
  if (profile.exact_scores >= 5) toAward.push('exacto_5')
  if (profile.exact_scores >= 10) toAward.push('exacto_10')
  if (profile.total_points >= 50) toAward.push('points_50')
  if (profile.total_points >= 100) toAward.push('points_100')
  if (profile.total_points >= 200) toAward.push('points_200')

  for (const achievementId of toAward) {
    await supabase.from('user_achievements').upsert({ user_id: userId, achievement_id: achievementId }, { onConflict: 'user_id,achievement_id', ignoreDuplicates: true })
  }
}
