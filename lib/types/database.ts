export interface Team {
  id: string
  team_id: number
  name: string
  abbreviation: string
  city: string | null
  conference: string | null
  division: string | null
  created_at: string
  updated_at: string
}

export interface Player {
  id: string
  player_id: number
  name: string
  team_id: string | null
  position: string | null
  jersey_number: number | null
  height_inches: number | null
  weight_lbs: number | null
  birth_date: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Game {
  id: string
  game_id: string
  season: number
  game_date: string
  game_time: string | null
  home_team_id: string
  away_team_id: string
  home_score: number | null
  away_score: number | null
  game_status: string
  venue: string | null
  attendance: number | null
  pace: number | null
  total_possessions: number | null
  created_at: string
  updated_at: string
}

export interface PlayerGameStats {
  id: string
  player_id: string
  game_id: string
  team_id: string
  is_starter: boolean
  minutes_played: number | null
  points: number
  rebounds: number
  offensive_rebounds: number
  defensive_rebounds: number
  assists: number
  steals: number
  blocks: number
  turnovers: number
  personal_fouls: number
  field_goals_made: number
  field_goals_attempted: number
  three_pointers_made: number
  three_pointers_attempted: number
  free_throws_made: number
  free_throws_attempted: number
  plus_minus: number | null
  usage_rate: number | null
  true_shooting_pct: number | null
  created_at: string
  updated_at: string
}

export interface BettingLine {
  id: string
  game_id: string
  player_id: string
  sportsbook: string
  stat_type: string
  line_value: number
  over_odds: number | null
  under_odds: number | null
  line_date: string
  is_current: boolean
  created_at: string
  updated_at: string
}

export interface PlayerPrediction {
  id: string
  game_id: string
  player_id: string
  stat_type: string
  predicted_mean: number
  predicted_std: number | null
  predicted_median: number | null
  percentile_10: number | null
  percentile_25: number | null
  percentile_75: number | null
  percentile_90: number | null
  probability_over: number | null
  market_line: number | null
  implied_probability: number | null
  edge_percentage: number | null
  expected_value: number | null
  model_version: string | null
  confidence_score: number | null
  prediction_date: string
  created_at: string
}

export interface PlayerFeatures {
  id: string
  player_id: string
  game_id: string | null
  feature_date: string
  ppg_last_5: number | null
  ppg_last_10: number | null
  ppg_season: number | null
  rpg_last_5: number | null
  rpg_last_10: number | null
  rpg_season: number | null
  apg_last_5: number | null
  apg_last_10: number | null
  apg_season: number | null
  points_per_36: number | null
  rebounds_per_36: number | null
  assists_per_36: number | null
  points_std_last_10: number | null
  minutes_avg_last_10: number | null
  home_ppg: number | null
  away_ppg: number | null
  vs_opponent_ppg: number | null
  usage_rate_avg: number | null
  true_shooting_pct: number | null
  points_trend_slope: number | null
  created_at: string
  updated_at: string
}

export interface Injury {
  id: string
  player_id: string
  injury_type: string | null
  injury_status: string
  reported_date: string
  expected_return_date: string | null
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Joined types for API responses
export interface PlayerWithPrediction extends Player {
  predictions: PlayerPrediction[]
  features: PlayerFeatures | null
  team: Team | null
  injuries: Injury[]
}

export interface GameWithTeams extends Game {
  home_team: Team
  away_team: Team
}

export interface PredictionWithDetails extends PlayerPrediction {
  player: Player
  game: GameWithTeams
  betting_lines: BettingLine[]
}
