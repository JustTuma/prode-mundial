import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerAdmin } from '@supabase/supabase-js'
import { fetchWorldCupMatches, mapAPIMatchToDBMatch, getMockMatches, fetchScorers, mapScorer } from '@/lib/football-api'
import { calculatePoints } from '@/lib/utils'

function getAdminClient() {
  return createServerAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function isAuthorized(req: NextRequest): boolean {
  if (req.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`) return true
  if (req.headers.get('x-vercel-cron') === '1') return true
  return false
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return runSync()
}
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return runSync()
}

async function runSync() {
  const supabase = getAdminClient()
  try {
    const useAPI = !!process.env.FOOTBALL_API_KEY && process.env.FOOTBALL_API_KEY !== 'your_football_data_api_key'
    const rawMatches = useAPI ? await fetchWorldCupMatches() : []
    const matches = useAPI ? rawMatches.map(mapAPIMatchToDBMatch) : getMockMatches()

    const { error: matchError } = await supabase.from('matches').upsert(matches as any, { onConflict: 'id' })
    if (matchError) throw matchError

    // Sincronizar goleadores (no crítico, si falla seguimos)
    let scorersInfo: any = 'skipped'
    if (useAPI) {
      try {
        const scorers = (await fetchScorers()).map(mapScorer)
        if (scorers.length) {
          await supabase.from('scorers').delete().neq('id', -1)
          const { error: scErr } = await supabase.from('scorers').upsert(scorers as any, { onConflict: 'id' })
          scorersInfo = scErr ? `error: ${scErr.message}` : `${scorers.length} cargados`
        } else {
          scorersInfo = 'API devolvió 0'
        }
      } catch (e: any) { scorersInfo = `excepción: ${e.message}` }
    }

    const finishedMatches = matches.filter(m => m.status === 'FINISHED' && m.home_score !== null && m.away_score !== null)
    let scoredCount = 0
    const affectedUsers = new Set<string>()

    // Puntuar contra TODOS los partidos finalizados en la base de datos
    // (no solo los que devuelve la API en esta corrida) -> auto-corrige siempre
    const { data: dbFinished } = await supabase
      .from('matches')
      .select('id, home_score, away_score')
      .eq('status', 'FINISHED')
      .not('home_score', 'is', null)
      .not('away_score', 'is', null)

    for (const match of (dbFinished || [])) {
      const { data: preds } = await supabase.from('predictions').select('*').eq('match_id', match.id)
      if (!preds?.length) continue
      for (const pred of preds) {
        const result = calculatePoints(pred.home_score_pred, pred.away_score_pred, match.home_score!, match.away_score!)
        // Solo actualiza si cambió algo (evita escrituras inútiles)
        if (pred.points_earned !== result.points || pred.is_exact !== result.isExact || pred.is_correct_result !== result.isCorrectResult) {
          await supabase.from('predictions').update({
            points_earned: result.points,
            is_exact: result.isExact,
            is_correct_result: result.isCorrectResult,
            updated_at: new Date().toISOString(),
          }).eq('id', pred.id)
          affectedUsers.add(pred.user_id)
          scoredCount++
        }
      }
    }

    for (const userId of affectedUsers) {
      await supabase.rpc('update_profile_stats', { p_user_id: userId })
      await checkAndAwardAchievements(supabase, userId)
    }

    // Score bonus predictions when final is finished
    const finalMatch = matches.find(m => m.stage === 'FINAL' && m.status === 'FINISHED')
    if (finalMatch && finalMatch.home_score !== null && finalMatch.away_score !== null) {
      const champion = finalMatch.home_score > finalMatch.away_score ? finalMatch.home_team : finalMatch.away_team
      const runnerUp = finalMatch.home_score > finalMatch.away_score ? finalMatch.away_team : finalMatch.home_team

      // Find third place
      const thirdMatch = matches.find(m => m.stage === 'THIRD_PLACE' && m.status === 'FINISHED')
      const thirdPlace = thirdMatch
        ? (thirdMatch.home_score! > thirdMatch.away_score! ? thirdMatch.home_team : thirdMatch.away_team)
        : null

      const { data: bonusPreds } = await supabase.from('bonus_predictions').select('*')
      for (const bp of bonusPreds || []) {
        let pts = 0
        if (bp.champion && bp.champion.toLowerCase() === champion.toLowerCase()) pts += 10
        if (bp.runner_up && bp.runner_up.toLowerCase() === runnerUp.toLowerCase()) pts += 5
        if (thirdPlace && bp.third_place && bp.third_place.toLowerCase() === thirdPlace.toLowerCase()) pts += 3
        await supabase.from('bonus_predictions').update({ points_earned: pts }).eq('id', bp.id)
        if (pts > 0) {
          affectedUsers.add(bp.user_id)
          await supabase.rpc('update_profile_stats', { p_user_id: bp.user_id })
          if (bp.champion === champion) {
            await supabase.from('user_achievements').upsert(
              { user_id: bp.user_id, achievement_id: 'champion_correct' },
              { onConflict: 'user_id,achievement_id', ignoreDuplicates: true }
            )
          }
        }
      }
    }

    if (affectedUsers.size > 0) await supabase.rpc('update_league_standings')

    return NextResponse.json({
      success: true, matchesSynced: matches.length,
      finishedMatches: finishedMatches.length,
      predictionsScored: scoredCount,
      usersUpdated: affectedUsers.size,
      scorers: scorersInfo,
      timestamp: new Date().toISOString(),
    })
  } catch (e: any) {
    console.error('Sync error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
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

  // Racha de 3+ aciertos seguidos (streak_3)
  const { data: streakData } = await supabase
    .from('predictions')
    .select('is_correct_result, matches!inner(match_date, status)')
    .eq('user_id', userId)
    .eq('matches.status', 'FINISHED')
    .limit(60)
  const ordered = (streakData || [])
    .sort((a: any, b: any) => new Date(b.matches.match_date).getTime() - new Date(a.matches.match_date).getTime())
  let streak = 0
  for (const p of ordered) { if (p.is_correct_result) streak++; else break }
  if (streak >= 3) toAward.push('streak_3')

  // Fanático: pronosticó todos los partidos de fase de grupos jugados
  const { count: groupFinished } = await supabase
    .from('matches').select('id', { count: 'exact', head: true })
    .eq('stage', 'GROUP_STAGE').eq('status', 'FINISHED')
  const { data: groupPreds } = await supabase
    .from('predictions').select('match_id, matches!inner(stage, status)')
    .eq('user_id', userId).eq('matches.stage', 'GROUP_STAGE').eq('matches.status', 'FINISHED')
  if (groupFinished && groupFinished > 0 && (groupPreds?.length || 0) >= groupFinished) toAward.push('all_group')

  for (const achievementId of toAward) {
    await supabase.from('user_achievements').upsert(
      { user_id: userId, achievement_id: achievementId },
      { onConflict: 'user_id,achievement_id', ignoreDuplicates: true }
    )
  }
}
