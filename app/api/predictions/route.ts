import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const gameDate = searchParams.get("date") || new Date().toISOString().split("T")[0]
  const minEdge = Number.parseFloat(searchParams.get("minEdge") || "0")

  console.log("[v0] Fetching predictions for date:", gameDate, "with minEdge:", minEdge)

  const supabase = await getSupabaseServerClient()

  try {
    const { data: predictions, error: predError } = await supabase
      .from("player_predictions")
      .select("*")
      .gte("edge_percentage", minEdge)
      .order("edge_percentage", { ascending: false })
      .limit(50)

    if (predError) {
      console.error("[v0] Error fetching predictions:", predError)
      return NextResponse.json({ error: predError.message, predictions: [] }, { status: 500 })
    }

    console.log("[v0] Found predictions:", predictions?.length || 0)

    if (!predictions || predictions.length === 0) {
      return NextResponse.json({ predictions: [], count: 0 })
    }

    const playerIds = [...new Set(predictions.map((p) => p.player_id))]
    const gameIds = [...new Set(predictions.map((p) => p.game_id))]

    const [{ data: players }, { data: games }, { data: bettingLines }] = await Promise.all([
      supabase.from("players").select("*, team:teams(*)").in("id", playerIds),
      supabase
        .from("games")
        .select(
          "*, home_team:teams!games_home_team_id_fkey(id, name, abbreviation), away_team:teams!games_away_team_id_fkey(id, name, abbreviation)",
        )
        .in("id", gameIds)
        .gte("game_date", gameDate)
        .lte("game_date", gameDate),
      supabase.from("betting_lines").select("*").in("player_id", playerIds).eq("is_current", true),
    ])

    console.log("[v0] Fetched related data - players:", players?.length, "games:", games?.length)

    const enrichedPredictions = predictions
      .map((pred) => {
        const player = players?.find((p) => p.id === pred.player_id)
        const game = games?.find((g) => g.id === pred.game_id)
        const lines = bettingLines?.filter(
          (line) => line.player_id === pred.player_id && line.stat_type === pred.stat_type,
        )

        // Only include predictions with valid games for the selected date
        if (!game) return null

        return {
          ...pred,
          player,
          game,
          betting_lines: lines || [],
        }
      })
      .filter(Boolean)

    console.log("[v0] Enriched predictions:", enrichedPredictions.length)

    return NextResponse.json({
      predictions: enrichedPredictions,
      count: enrichedPredictions.length,
    })
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json({ error: "Failed to fetch predictions", predictions: [] }, { status: 500 })
  }
}
