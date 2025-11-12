// API-Football Basketball API client
// Documentation: https://www.api-football.com/documentation

export interface APIFootballPlayer {
  player: {
    id: number
    name: string
    firstname: string
    lastname: string
    birth: {
      date: string
      country: string
      city: string
    }
    height: string
    weight: string
    injured: boolean
    college: string
    jersey: number
    position: string
    leagues: {
      nba: {
        season: number
        conference: string
        division: string
        games: {
          played: number
          bench: number
          appearances: number
          minutes: number
        }
        stats: {
          points: { total: number; per_game: number }
          rebounds: { total: number; per_game: number }
          assists: { total: number; per_game: number }
          blocks: { total: number; per_game: number }
          steals: { total: number; per_game: number }
          turnovers: { total: number; per_game: number }
          field_goals_made: { total: number; per_game: number }
          field_goals_attempted: { total: number; per_game: number }
          field_goals_percentage: number
          free_throws_made: { total: number; per_game: number }
          free_throws_attempted: { total: number; per_game: number }
          free_throws_percentage: number
          three_points_made: { total: number; per_game: number }
          three_points_attempted: { total: number; per_game: number }
          three_points_percentage: number
        }
      }
    }
    teams: {
      id: number
      name: string
      logo: string
      season: number
    }[]
  }
}

class APIFootballClient {
  private baseUrl = "https://api.api-football.com/v3"
  private apiKey: string | undefined

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.API_FOOTBALL_KEY
  }

  private async fetch<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error("API_FOOTBALL_KEY is not configured")
    }

    const url = new URL(`${this.baseUrl}${endpoint}`)

    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })

    const headers: HeadersInit = {
      "x-apisports-key": this.apiKey,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "application/json",
    }

    console.log("[v0] API-Football request:", endpoint, "params:", params)
    console.log("[v0] API-Football URL:", url.toString())

    try {
      const response = await fetch(url.toString(), {
        headers,
        method: "GET",
      })

      const text = await response.text()
      console.log("[v0] API-Football raw response (first 500 chars):", text.substring(0, 500))

      if (!response.ok) {
        console.error("[v0] API-Football error:", response.status, text.substring(0, 200))
        throw new Error(`API-Football error: ${response.status}`)
      }

      let data
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error("[v0] Failed to parse API response:", parseError)
        throw new Error("Invalid JSON response from API-Football")
      }

      console.log("[v0] API-Football response received")
      return data
    } catch (error) {
      console.error("[v0] Fetch error:", error)
      throw error
    }
  }

  // Search players by name
  async searchPlayers(name: string): Promise<APIFootballPlayer[]> {
    try {
      const response = await this.fetch<{ response: APIFootballPlayer[] }>("/players", {
        search: name,
        league: "12", // NBA league ID
      })

      return response.response || []
    } catch (error) {
      console.error("[v0] Search players error:", error)
      return []
    }
  }

  // Get player by ID with current season stats
  async getPlayer(playerId: number): Promise<APIFootballPlayer | null> {
    try {
      const response = await this.fetch<{ response: APIFootballPlayer[] }>("/players", {
        id: playerId,
        league: "12",
        season: 2024,
      })

      return response.response?.[0] || null
    } catch (error) {
      console.error("[v0] Get player error:", error)
      return null
    }
  }

  // Get player stats for a specific season
  async getPlayerStats(playerId: number, season = 2024): Promise<APIFootballPlayer | null> {
    return this.getPlayer(playerId)
  }
}

export const apiFootballClient = new APIFootballClient()
