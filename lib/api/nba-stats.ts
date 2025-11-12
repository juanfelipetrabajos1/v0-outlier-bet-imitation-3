import type { PlayerStats, GameStats, PlayerInfo } from "../types/nba"

const NBA_API_BASE = "https://stats.nba.com/stats"

// Headers requeridos por la API de NBA.com
const NBA_HEADERS = {
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
  Origin: "https://www.nba.com",
  Referer: "https://www.nba.com/",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "x-nba-stats-origin": "stats",
  "x-nba-stats-token": "true",
}

export async function searchPlayers(query: string): Promise<PlayerInfo[]> {
  try {
    const response = await fetch(`${NBA_API_BASE}/commonallplayers?LeagueID=00&Season=2024-25&IsOnlyCurrentSeason=1`, {
      headers: NBA_HEADERS,
    })

    if (!response.ok) {
      throw new Error(`NBA API error: ${response.status}`)
    }

    const data = await response.json()
    const players = data.resultSets[0]

    // Mapear los datos a nuestro formato
    const allPlayers: PlayerInfo[] = players.rowSet.map((row: any) => ({
      id: row[0].toString(),
      firstName: row[1],
      lastName: row[2],
      fullName: `${row[1]} ${row[2]}`,
      teamId: row[7]?.toString() || null,
      teamAbbreviation: row[8] || null,
      isActive: true,
    }))

    // Filtrar por la búsqueda
    if (!query) return allPlayers.slice(0, 10)

    const searchLower = query.toLowerCase()
    return allPlayers
      .filter(
        (p) =>
          p.fullName.toLowerCase().includes(searchLower) || p.teamAbbreviation?.toLowerCase().includes(searchLower),
      )
      .slice(0, 10)
  } catch (error) {
    console.error("[v0] Error searching players:", error)
    return []
  }
}

export async function getPlayerInfo(playerId: string): Promise<PlayerInfo | null> {
  try {
    const response = await fetch(`${NBA_API_BASE}/commonplayerinfo?PlayerID=${playerId}`, { headers: NBA_HEADERS })

    if (!response.ok) {
      throw new Error(`NBA API error: ${response.status}`)
    }

    const data = await response.json()
    const playerData = data.resultSets[0].rowSet[0]

    return {
      id: playerData[0].toString(),
      firstName: playerData[1],
      lastName: playerData[2],
      fullName: `${playerData[1]} ${playerData[2]}`,
      teamId: playerData[16]?.toString() || null,
      teamAbbreviation: playerData[17] || null,
      teamName: playerData[18] || null,
      position: playerData[14] || null,
      height: playerData[10] || null,
      weight: playerData[11] || null,
      jerseyNumber: playerData[13] || null,
      country: playerData[8] || null,
      isActive: true,
    }
  } catch (error) {
    console.error("[v0] Error fetching player info:", error)
    return null
  }
}

export async function getPlayerSeasonStats(playerId: string, season = "2024-25"): Promise<PlayerStats | null> {
  try {
    const response = await fetch(
      `${NBA_API_BASE}/playerdashboardbygeneralsplits?` +
        `MeasureType=Base&PerMode=PerGame&PlayerID=${playerId}&Season=${season}`,
      { headers: NBA_HEADERS },
    )

    if (!response.ok) {
      throw new Error(`NBA API error: ${response.status}`)
    }

    const data = await response.json()
    const stats = data.resultSets[0].rowSet[0]

    if (!stats) return null

    return {
      gamesPlayed: stats[3],
      wins: stats[4],
      losses: stats[5],
      minutes: Number.parseFloat(stats[6]),
      points: Number.parseFloat(stats[23]),
      rebounds: Number.parseFloat(stats[17]),
      assists: Number.parseFloat(stats[18]),
      steals: Number.parseFloat(stats[20]),
      blocks: Number.parseFloat(stats[21]),
      turnovers: Number.parseFloat(stats[19]),
      fieldGoalPct: Number.parseFloat(stats[8]),
      threePtPct: Number.parseFloat(stats[11]),
      freeThrowPct: Number.parseFloat(stats[14]),
      plusMinus: Number.parseFloat(stats[24]),
    }
  } catch (error) {
    console.error("[v0] Error fetching player season stats:", error)
    return null
  }
}

export async function getPlayerGameLog(playerId: string, season = "2024-25"): Promise<GameStats[]> {
  try {
    const response = await fetch(
      `${NBA_API_BASE}/playergamelog?PlayerID=${playerId}&Season=${season}&SeasonType=Regular+Season`,
      { headers: NBA_HEADERS },
    )

    if (!response.ok) {
      throw new Error(`NBA API error: ${response.status}`)
    }

    const data = await response.json()
    const games = data.resultSets[0].rowSet

    return games.map((game: any) => ({
      gameId: game[1],
      gameDate: game[2],
      matchup: game[3],
      result: game[4],
      minutes: Number.parseFloat(game[5]),
      points: Number.parseFloat(game[23]),
      rebounds: Number.parseFloat(game[17]),
      assists: Number.parseFloat(game[18]),
      steals: Number.parseFloat(game[19]),
      blocks: Number.parseFloat(game[20]),
      turnovers: Number.parseFloat(game[21]),
      fieldGoalPct: Number.parseFloat(game[8]),
      threePtPct: Number.parseFloat(game[11]),
      freeThrowPct: Number.parseFloat(game[14]),
      plusMinus: Number.parseFloat(game[24]),
    }))
  } catch (error) {
    console.error("[v0] Error fetching player game log:", error)
    return []
  }
}

export async function getPlayerLastNGames(playerId: string, n = 10): Promise<GameStats[]> {
  const games = await getPlayerGameLog(playerId)
  return games.slice(0, n)
}
