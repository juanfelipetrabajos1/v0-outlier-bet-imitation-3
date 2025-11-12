import { apiFootballClient } from "@/lib/api/api-football"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { playerId: string } }) {
  try {
    const { playerId } = params

    console.log("[v0] Fetching player data for ID:", playerId)

    const playerId_num = Number.parseInt(playerId)

    if (Number.isNaN(playerId_num)) {
      return NextResponse.json({ error: "Invalid player ID" }, { status: 400 })
    }

    const playerInfo = await apiFootballClient.getPlayer(playerId_num)

    if (!playerInfo) {
      console.error("[v0] Player not found")
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    console.log("[v0] Player data fetched:", playerInfo.player.firstname, playerInfo.player.lastname)

    // Transform API-Football player data
    const transformedPlayer = {
      id: playerInfo.player.id.toString(),
      fullName: playerInfo.player.name,
      firstName: playerInfo.player.firstname,
      lastName: playerInfo.player.lastname,
      position: playerInfo.player.position,
      teamAbbreviation: playerInfo.teams?.[0]?.abbreviation || null,
      teamName: playerInfo.teams?.[0]?.name || null,
      height: playerInfo.player.height || null,
      weight: playerInfo.player.weight || null,
      jerseyNumber: playerInfo.player.jersey || null,
      country: playerInfo.player.birth?.country || null,
      college: playerInfo.player.college || null,
    }

    // Transform season stats from API-Football
    const nbaStats = playerInfo.player.leagues?.nba
    const transformedSeasonAverages = nbaStats
      ? {
          points: nbaStats.stats.points.per_game,
          rebounds: nbaStats.stats.rebounds.per_game,
          assists: nbaStats.stats.assists.per_game,
          steals: nbaStats.stats.steals.per_game,
          blocks: nbaStats.stats.blocks.per_game,
          fieldGoalPct: nbaStats.stats.field_goals_percentage,
          threePtPct: nbaStats.stats.three_points_percentage,
          freeThrowPct: nbaStats.stats.free_throws_percentage,
          gamesPlayed: nbaStats.games.played,
        }
      : null

    return NextResponse.json({
      player: transformedPlayer,
      seasonAverages: transformedSeasonAverages,
      recentGames: [],
      source: "api-football",
    })
  } catch (error) {
    console.error("[v0] Error loading player data:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch player data",
      },
      { status: 500 },
    )
  }
}
