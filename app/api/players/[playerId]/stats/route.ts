import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: Promise<{ playerId: string }> }) {
  const { playerId } = await params
  const supabase = await getSupabaseServerClient()

  try {
    // Get player info
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select(`
        *,
        team:teams (*)
      `)
      .eq("id", playerId)
      .single()

    if (playerError) throw playerError

    // Get recent game stats
    const { data: recentStats, error: statsError } = await supabase
      .from("player_game_stats")
      .select(`
        *,
        game:games!inner (
          game_date,
          home_team:home_team_id (abbreviation),
          away_team:away_team_id (abbreviation)
        )
      `)
      .eq("player_id", playerId)
      .order("game.game_date", { ascending: false })
      .limit(20)

    if (statsError) throw statsError

    // Get current features
    const { data: features, error: featuresError } = await supabase
      .from("player_features")
      .select("*")
      .eq("player_id", playerId)
      .order("feature_date", { ascending: false })
      .limit(1)
      .single()

    if (featuresError && featuresError.code !== "PGRST116") {
      console.error("[v0] Features error:", featuresError)
    }

    // Get active injuries
    const { data: injuries } = await supabase
      .from("injuries")
      .select("*")
      .eq("player_id", playerId)
      .eq("is_active", true)

    return NextResponse.json({
      player,
      recent_stats: recentStats,
      features: features || null,
      injuries: injuries || [],
    })
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json({ error: "Failed to fetch player stats" }, { status: 500 })
  }
}
