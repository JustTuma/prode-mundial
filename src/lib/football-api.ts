// football-data.org API integration for FIFA World Cup 2026
const API_KEY = process.env.FOOTBALL_API_KEY || ''
const BASE_URL = 'https://api.football-data.org/v4'
const COMPETITION_CODE = 'WC' // FIFA World Cup

export interface APIMatch {
  id: number
  utcDate: string
  status: string
  stage: string
  group: string | null
  homeTeam: { id: number; name: string; shortName: string; tla: string; crest: string }
  awayTeam: { id: number; name: string; shortName: string; tla: string; crest: string }
  score: {
    fullTime: { home: number | null; away: number | null }
    halfTime: { home: number | null; away: number | null }
  }
  venue: string | null
  referees: Array<{ name: string }>
  minute?: number | null
}

async function fetchFromAPI(endpoint: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'X-Auth-Token': API_KEY },
    next: { revalidate: 60 }, // cache for 1 min
  })
  if (!res.ok) throw new Error(`Football API error: ${res.status}`)
  return res.json()
}

export async function fetchWorldCupMatches(): Promise<APIMatch[]> {
  try {
    const data = await fetchFromAPI(`/competitions/${COMPETITION_CODE}/matches?season=2026`)
    return data.matches || []
  } catch (e) {
    console.error('Failed to fetch matches:', e)
    return []
  }
}

export async function fetchLiveMatches(): Promise<APIMatch[]> {
  try {
    const data = await fetchFromAPI(`/competitions/${COMPETITION_CODE}/matches?status=LIVE`)
    return data.matches || []
  } catch (e) {
    console.error('Failed to fetch live matches:', e)
    return []
  }
}

export function mapAPIMatchToDBMatch(m: APIMatch) {
  return {
    id: m.id,
    external_id: m.id,
    home_team: m.homeTeam.name || 'Por definir',
    away_team: m.awayTeam.name || 'Por definir',
    home_team_code: m.homeTeam.tla || 'TBD',
    away_team_code: m.awayTeam.tla || 'TBD',
    home_team_flag: m.homeTeam.crest || null,
    away_team_flag: m.awayTeam.crest || null,
    home_score: m.score.fullTime.home,
    away_score: m.score.fullTime.away,
    status: m.status,
    stage: m.stage,
    group_name: m.group,
    match_date: m.utcDate,
    venue: m.venue,
    city: null,
  }
}

// Mock data for development / when API key is not set
export function getMockMatches() {
  const now = new Date()
  const teams = [
    { name: 'Argentina', code: 'ARG' },
    { name: 'Brasil', code: 'BRA' },
    { name: 'Francia', code: 'FRA' },
    { name: 'España', code: 'ESP' },
    { name: 'Alemania', code: 'GER' },
    { name: 'Inglaterra', code: 'ENG' },
    { name: 'Portugal', code: 'POR' },
    { name: 'Uruguay', code: 'URU' },
    { name: 'México', code: 'MEX' },
    { name: 'Colombia', code: 'COL' },
    { name: 'Países Bajos', code: 'NED' },
    { name: 'Italia', code: 'ITA' },
  ]

  const matches: Array<{
    id: number; external_id: number; home_team: string; away_team: string;
    home_team_code: string; away_team_code: string; home_score: number | null;
    away_score: number | null; status: string; stage: string; group_name: string | null;
    match_date: string; venue: string; city: string | null;
    home_team_flag: string | null; away_team_flag: string | null;
  }> = []
  let id = 1

  // Group stage matches
  const groupPairs = [
    [0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11],
    [0, 2], [1, 3], [4, 6], [5, 7], [8, 10], [9, 11],
    [0, 3], [1, 2], [4, 7], [5, 6], [8, 11], [9, 10],
  ]

  groupPairs.forEach(([h, a], i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - 10 + i)
    const isPast = date < now
    matches.push({
      id,
      external_id: id,
      home_team: teams[h].name,
      away_team: teams[a].name,
      home_team_code: teams[h].code,
      away_team_code: teams[a].code,
      home_team_flag: null,
      away_team_flag: null,
      home_score: isPast ? Math.floor(Math.random() * 4) : null,
      away_score: isPast ? Math.floor(Math.random() * 4) : null,
      status: isPast ? 'FINISHED' : 'SCHEDULED',
      stage: 'GROUP_STAGE',
      group_name: `Grupo ${String.fromCharCode(65 + Math.floor(i / 3))}`,
      match_date: date.toISOString(),
      venue: 'MetLife Stadium',
      city: 'Nueva York' as string | null,
    })
    id++
  })

  // Knockout matches
  const stages = ['ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL']
  stages.forEach((stage, si) => {
    const count = [4, 2, 2, 1][si]
    for (let i = 0; i < count; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() + 5 + si * 5 + i)
      matches.push({
        id,
        external_id: id,
        home_team: 'Por definir',
        away_team: 'Por definir',
        home_team_code: 'TBD',
        away_team_code: 'TBD',
        home_team_flag: null,
        away_team_flag: null,
        home_score: null,
        away_score: null,
        status: 'SCHEDULED',
        stage,
        group_name: null as string | null,
        match_date: date.toISOString(),
        venue: 'SoFi Stadium',
        city: 'Los Ángeles' as string | null,
      })
      id++
    }
  })

  return matches
}
