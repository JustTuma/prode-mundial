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

function isAuthorized(req: NextRequest): boolean {
  // Vercel cron jobs send this header automatically
  if (req.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`) return true
  // Vercel internal cron header
  if (req.headers.get('x-vercel-cron') === '1') return true
  return false
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return runSync()
}

// Vercel crons call GET
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return runSync()
}

async function runSync() {
  const supabase = getAdminClient()

  try {
    const useAPI = !!process.env.FOOTBALL_API_KEY &&
      process.env.FOOTBALL_API_KEY !== 'your_football_data_api_key'

    const rawMatches = useAPI ? await fetchWorldCupMatches() : []
    const matches = useAPI ? rawMatches.map(mapAPIMatchToDBMatch) : getMockMatches()

    const { error: matchError } = await supabase
      .from('matches')
      .upsert(matches as any, { onConflict: 'id' })

    if (matchError) throw matchError

    // Puntuar predicciones de partidos terminados
    const finishedMatches = matches.filter(
      m => m.status === 'FINISHED' && m.home_score !== null && m.away_score !== null
    )

    let scoredCount = 0
    const affectedUsers = new Set<string>()

    for (const match of finishedMatches) {
      const { data: preds } = await supabase
        .from('predictions')
        .select('*')
        .eq('match_id', match.id)

      if (!preds?.length) continue

      for (const pred of preds) {
        const result = calculatePoints(
          pred.home_score_pred, pred.away_score_pred,
          match.home_score!, match.away_score!
        )
        await supabase.from('predictions').update({
          points_earned: result.points,
          is_exact: result.isExact,
          is_correct_result: result.isCorrectResult,
        }).eq('id', pred.id)
        affectedUsers.add(pred.user_id)
        scoredCount++
      }
    }

    // Actualizar stats y logros de todos los usuarios afectados
    for (const userId of affectedUsers) {
      await supabase.rpc('update_profile_stats', { p_user_id: userId })
      await checkAndAwardAchievements(supabase, userId)
    }

    // Actualizar standings de ligas
    if (affectedUsers.size > 0) {
      await supabase.rpc('update_league_standings')
    }

    return NextResponse.json({
      success: true,
      matchesSynced: matches.length,
      finishedMatches: finishedMatches.length,
      predictionsScored: scoredCount,
      usersUpdated: affectedUsers.size,
      timestamp: new Date().toISOString(),
    })
  } catch (e: any) {
    console.error('Sync error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

async function checkAndAwardAchievements(supabase: any, userId: string) {
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', userId).single()
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
    await supabase.from('user_achievements').upsert(
      { user_id: userId, achievement_id: achievementId },
      { onConflict: 'user_id,achievement_id', ignoreDuplicates: true }
    )
  }
}
