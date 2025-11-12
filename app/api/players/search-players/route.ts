import { NextResponse } from "next/server"
import { apiFootballClient } from "@/lib/api/api-football"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q") || ""

  console.log("[v0] Searching players with query:", query)

  if (!query || query.length < 2) {
    return NextResponse.json({ players: [] })
  }

  try {
    const players = await apiFootballClient.searchPlayers(query)

    console.log("[v0] Found players from API-Football:", players.length)

    // Transform API-Football format to match frontend expectations
    const transformedPlayers = players.map((player) => ({
      id: player.player.id.toString(),
      fullName: player.player.name,
      firstName: player.player.firstname,
      lastName: player.player.lastname,
      position: player.player.position || null,
      teamAbbreviation: player.teams?.[0]?.abbreviation || null,
      teamName: player.teams?.[0]?.name || null,
      team: player.teams?.[0]
        ? {
            abbreviation: player.teams[0].abbreviation || "",
            name: player.teams[0].name,
          }
        : null,
      height: player.player.height || null,
      weight: player.player.weight || null,
      jersey: player.player.jersey || null,
      college: player.player.college || null,
    }))

    console.log("[v0] Search results:", transformedPlayers.length)

    return NextResponse.json({
      players: transformedPlayers,
      source: "api-football",
    })
  } catch (error) {
    console.error("[v0] Search error:", error)
    return NextResponse.json({
      players: [],
      error: error instanceof Error ? error.message : "Search failed",
    })
  }
}
