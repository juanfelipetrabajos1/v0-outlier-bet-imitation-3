import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

interface Recommendation {
  id: string
  player_id: string
  player_name: string
  team_abbreviation: string
  stat_type: string
  predicted_mean: number
  market_line: number
  edge_percentage: number
  probability_over: number
  confidence_score: number
  reasoning: string
  game_info: {
    opponent_abbreviation: string
    game_date: string
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const minEdge = Number.parseFloat(searchParams.get("minEdge") || "8")
  const minConfidence = Number.parseFloat(searchParams.get("minConfidence") || "0.65")

  console.log("[v0] Fetching recommendations with minEdge:", minEdge, "minConfidence:", minConfidence)

  const supabase = await createServerClient()

  try {
    const { data: predictions, error: predError } = await supabase
      .from("player_predictions")
      .select("*")
      .gte("edge_percentage", minEdge)
      .gte("confidence_score", minConfidence)
      .order("edge_percentage", { ascending: false })
      .limit(20)

    if (predError) {
      console.error("[v0] Error fetching predictions:", predError)
      return NextResponse.json({ recommendations: [] }, { status: 500 })
    }

    if (!predictions || predictions.length === 0) {
      console.log("[v0] No recommendations found")
      return NextResponse.json({ recommendations: [] })
    }

    const playerIds = [...new Set(predictions.map((p) => p.player_id))]
    const gameIds = [...new Set(predictions.map((p) => p.game_id))]

    const [{ data: players }, { data: games }] = await Promise.all([
      supabase.from("players").select("*, team:teams(*)").in("id", playerIds),
      supabase
        .from("games")
        .select(
          "*, home_team:teams!games_home_team_id_fkey(id, name, abbreviation), away_team:teams!games_away_team_id_fkey(id, name, abbreviation)",
        )
        .in("id", gameIds),
    ])

    const recommendations: Recommendation[] = predictions
      .slice(0, 5)
      .map((pred) => {
        const player = players?.find((p) => p.id === pred.player_id)
        const game = games?.find((g) => g.id === pred.game_id)

        if (!player || !game) return null

        const opponent = game.home_team_id === player.team_id ? game.away_team : game.home_team

        // Generate reasoning based on metrics
        const edgeValue = (pred.edge_percentage || 0).toFixed(1)
        const confidence = ((pred.confidence_score || 0) * 100).toFixed(0)
        const hitProb = ((pred.probability_over || 0) * 100).toFixed(0)
        const diff = (pred.predicted_mean - (pred.market_line || 0)).toFixed(1)

        const reasoning =
          `${player.name} is projected at ${pred.predicted_mean.toFixed(1)} ${pred.stat_type.replace("_", " ")} ` +
          `vs a ${pred.market_line?.toFixed(1)} market line. ` +
          `Our model shows ${confidence}% confidence with a ${edgeValue}% edge. ` +
          `Hit probability: ${hitProb}%.`

        return {
          id: pred.id,
          player_id: pred.player_id,
          player_name: player.name,
          team_abbreviation: player.team?.abbreviation || "N/A",
          stat_type: pred.stat_type,
          predicted_mean: pred.predicted_mean,
          market_line: pred.market_line || 0,
          edge_percentage: pred.edge_percentage || 0,
          probability_over: pred.probability_over || 0,
          confidence_score: pred.confidence_score || 0,
          reasoning,
          game_info: {
            opponent_abbreviation: opponent.abbreviation,
            game_date: game.game_date,
          },
        }
      })
      .filter(Boolean) as Recommendation[]

    console.log("[v0] Generated recommendations:", recommendations.length)
    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json({ recommendations: [], error: "Failed to fetch recommendations" }, { status: 500 })
  }
}
