export interface PlayerInfo {
  id: string
  firstName: string
  lastName: string
  fullName: string
  teamId: string | null
  teamAbbreviation: string | null
  teamName?: string | null
  position?: string | null
  height?: string | null
  weight?: string | null
  jerseyNumber?: string | null
  country?: string | null
  isActive: boolean
}

export interface PlayerStats {
  gamesPlayed: number
  wins: number
  losses: number
  minutes: number
  points: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  turnovers: number
  fieldGoalPct: number
  threePtPct: number
  freeThrowPct: number
  plusMinus: number
}

export interface GameStats {
  gameId: string
  gameDate: string
  matchup: string
  result: string
  minutes: number
  points: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  turnovers: number
  fieldGoalPct: number
  threePtPct: number
  freeThrowPct: number
  plusMinus: number
}
