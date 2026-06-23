export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  country: string
  total_points: number
  exact_scores: number
  correct_results: number
  predictions_made: number
  created_at: string
}

export interface Match {
  id: number
  external_id: number
  home_team: string
  away_team: string
  home_team_code: string
  away_team_code: string
  home_team_flag: string | null
  away_team_flag: string | null
  home_score: number | null
  away_score: number | null
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'IN_PLAY' | 'PAUSED'
  stage: string
  group_name: string | null
  match_date: string
  venue: string | null
  city: string | null
  minute?: number | null
}

export interface Prediction {
  id: string
  user_id: string
  match_id: number
  home_score_pred: number
  away_score_pred: number
  points_earned: number
  is_exact: boolean
  is_correct_result: boolean
  created_at: string
}

export interface BonusPrediction {
  id: string
  user_id: string
  champion: string | null
  top_scorer: string | null
  runner_up: string | null
  third_place: string | null
  points_earned: number
}

export interface League {
  id: string
  name: string
  description: string | null
  invite_code: string
  owner_id: string
  avatar_emoji: string
  is_public: boolean
  max_members: number
  created_at: string
  member_count?: number
}

export interface LeagueMember {
  league_id: string
  user_id: string
  joined_at: string
  league_points: number
  league_rank: number | null
  profiles?: Profile
}

export interface MatchComment {
  id: string
  match_id: number
  user_id: string
  content: string
  created_at: string
  profiles?: Profile
}

export interface Achievement {
  id: string
  name: string
  description: string
  emoji: string
  condition_type: string
}

export interface UserAchievement {
  user_id: string
  achievement_id: string
  earned_at: string
  achievements?: Achievement
}
