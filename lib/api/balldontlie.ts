// BallDontLie API client for real-time NBA data
// Free tier: 5 req/min, no API key required

const BASE_URL = "https://api.balldontlie.io/v1"

export interface BallDontLiePlayer {
  id: number
  first_name: string
  last_name: string
  position: string
  height: string
  weight: string
  jersey_number: string
  college: string
  country: string
  draft_year: number
  draft_round: number
  draft_number: number
  team: {
    id: number
    conference: string
    division: string
    city: string
    name: string
    full_name: string
    abbreviation: string
  }
}

export interface PlayerSeasonAverages {
  player_id: number
  season: number
  games_played: number
  min: string
  fgm: number
  fga: number
  fg3m: number
  fg3a: number
  ftm: number
  fta: number
  oreb: number
  dreb: number
  reb: number
  ast: number
  stl: number
  blk: number
  turnover: number
  pf: number
  pts: number
  fg_pct: number
  fg3_pct: number
  ft_pct: number
}

export interface GameStats {
  id: number
  date: string
  season: number
  pts: number
  reb: number
  ast: number
  stl: number
  blk: number
  turnover: number
  min: string
  fgm: number
  fga: number
  fg3m: number
  fg3a: number
  ftm: number
  fta: number
  player: {
    id: number
    first_name: string
    last_name: string
  }
  team: {
    id: number
    abbreviation: string
    city: string
    name: string
  }
  game: {
    id: number
    date: string
    home_team_score: number
    visitor_team_score: number
  }
}

class BallDontLieAPI {
  private baseUrl = BASE_URL
  private apiKey: string | undefined

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.BALLDONTLIE_API_KEY
  }

  private async fetch<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`)

    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (this.apiKey) {
      headers["Authorization"] = this.apiKey
    }

    const response = await fetch(url.toString(), { headers })

    if (!response.ok) {
      throw new Error(`BallDontLie API error: ${response.statusText}`)
    }

    return response.json()
  }

  // Search players by name
  async searchPlayers(query: string): Promise<BallDontLiePlayer[]> {
    const response = await this.fetch<{ data: BallDontLiePlayer[] }>("/players", {
      search: query,
      per_page: 10,
    })
    return response.data
  }

  // Get player by ID
  async getPlayer(playerId: number): Promise<BallDontLiePlayer> {
    return this.fetch<BallDontLiePlayer>(`/players/${playerId}`)
  }

  // Get season averages for a player
  async getSeasonAverages(playerId: number, season = 2024): Promise<PlayerSeasonAverages | null> {
    const response = await this.fetch<{ data: PlayerSeasonAverages[] }>("/season_averages", {
      player_ids: [playerId],
      season,
    })
    return response.data[0] || null
  }

  // Get player game stats
  async getPlayerGameStats(
    playerId: number,
    params: {
      seasons?: number[]
      start_date?: string
      end_date?: string
      per_page?: number
    } = {},
  ): Promise<GameStats[]> {
    const response = await this.fetch<{ data: GameStats[] }>("/stats", {
      player_ids: [playerId],
      per_page: params.per_page || 20,
      ...params,
    })
    return response.data
  }

  // Get all players (paginated)
  async getAllPlayers(
    page = 1,
    perPage = 25,
  ): Promise<{
    data: BallDontLiePlayer[]
    meta: { total_pages: number; current_page: number; total_count: number }
  }> {
    return this.fetch<any>("/players", {
      page,
      per_page: perPage,
    })
  }
}

export const ballDontLieAPI = new BallDontLieAPI()
