import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { FeatureCalculator } from "@/lib/features/calculator"
import { PredictionEngine, type PredictionInput } from "@/lib/ml/prediction-engine"

export async function POST(request: Request) {
  const body = await request.json()
  const { player_id, game_id, stat_type } = body

  const supabase = await getSupabaseServerClient()

  try {
    // 1. Get player's recent game stats
    const { data: recentStats, error: statsError } = await supabase
      .from("player_game_stats")
      .select(`
        *,
        game:games!inner (
          game_date,
          home_team_id,
          away_team_id
        )
      `)
      .eq("player_id", player_id)
      .order("game.game_date", { ascending: false })
      .limit(20)

    if (statsError) throw statsError
    if (!recentStats || recentStats.length === 0) {
      return NextResponse.json({ error: "No recent stats found" }, { status: 404 })
    }

    // 2. Get current game details
    const { data: game, error: gameError } = await supabase.from("games").select("*").eq("id", game_id).single()

    if (gameError) throw gameError

    // 3. Get player info
    const { data: player, error: playerError } = await supabase.from("players").select("*").eq("id", player_id).single()

    if (playerError) throw playerError

    // 4. Generate features
    const features = FeatureCalculator.generatePlayerFeatures(player_id, recentStats)

    // 5. Get betting line
    const { data: bettingLine } = await supabase
      .from("betting_lines")
      .select("*")
      .eq("player_id", player_id)
      .eq("game_id", game_id)
      .eq("stat_type", stat_type)
      .eq("is_current", true)
      .order("line_date", { ascending: false })
      .limit(1)
      .single()

    const marketLine = bettingLine?.line_value || features.ppg_season
    const marketOdds = bettingLine?.over_odds || -110

    // 6. Prepare prediction input
    const predictionInput: PredictionInput = {
      player_id,
      stat_type,

      ppg_last_5: features.ppg_last_5,
      ppg_last_10: features.ppg_last_10,
      ppg_season: features.ppg_season,
      rpg_last_5: features.rpg_last_5,
      rpg_last_10: features.rpg_last_10,
      apg_last_5: features.apg_last_5,

      stat_per_36:
        stat_type === "points"
          ? features.points_per_36
          : stat_type === "rebounds"
            ? features.rebounds_per_36
            : features.assists_per_36,
      minutes_avg: features.minutes_avg_last_10,
      projected_minutes: features.minutes_avg_last_10, // Use avg as baseline

      stat_std: features.points_std_last_10,

      usage_rate: features.usage_rate_avg,
      true_shooting_pct: features.true_shooting_pct,
      trend_slope: features.points_trend_slope,

      opponent_defense_rating: 25, // Default league average
      league_average_defense: 25,
      game_pace: game.pace || 100,

      is_home: game.home_team_id === player.team_id,
      days_rest: 1,
      is_back_to_back: false,
    }

    // 7. Generate prediction
    const prediction = PredictionEngine.generatePrediction(predictionInput, marketLine, marketOdds)

    // 8. Save prediction to database
    const { data: savedPrediction, error: saveError } = await supabase
      .from("player_predictions")
      .insert({
        game_id,
        player_id,
        stat_type,
        ...prediction,
      })
      .select()
      .single()

    if (saveError) {
      console.error("[v0] Error saving prediction:", saveError)
    }

    return NextResponse.json({
      prediction: savedPrediction || prediction,
      features,
      input: predictionInput,
    })
  } catch (error) {
    console.error("[v0] Prediction generation error:", error)
    return NextResponse.json({ error: "Failed to generate prediction" }, { status: 500 })
  }
}
