import { notFound } from "next/navigation"
import { PlayerHeader } from "@/components/player-header"
import { PlayerStatsChart } from "@/components/player-stats-chart"
import { DistributionChart } from "@/components/distribution-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDecimal } from "@/lib/utils/stats"

interface PlayerPageProps {
  params: Promise<{
    playerId: string
  }>
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { playerId } = await params

  console.log("[v0] Loading player page for ID:", playerId)

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/players/${playerId}`,
      { cache: "no-store" }, // Disable cache to always get fresh NBA data
    )

    if (!response.ok) {
      console.error("[v0] Failed to fetch player data")
      notFound()
    }

    const data = await response.json()
    const { player, seasonAverages, recentGames } = data

    console.log("[v0] Player data loaded:", player.fullName)

    const last5Games = recentGames.slice(0, 5)
    const last10Games = recentGames.slice(0, 10)

    const calculateAvg = (games: any[], stat: string) => {
      if (!games.length) return 0
      return games.reduce((sum: number, game: any) => sum + (game[stat] || 0), 0) / games.length
    }

    const calculateStd = (games: any[], stat: string) => {
      if (!games.length) return 0
      const avg = calculateAvg(games, stat)
      const variance =
        games.reduce((sum: number, game: any) => sum + Math.pow((game[stat] || 0) - avg, 2), 0) / games.length
      return Math.sqrt(variance)
    }

    const features = {
      ppg_season: seasonAverages?.points || 0,
      rpg_season: seasonAverages?.rebounds || 0,
      apg_season: seasonAverages?.assists || 0,
      spg_season: seasonAverages?.steals || 0,
      bpg_season: seasonAverages?.blocks || 0,
      minutes_avg_last_10: calculateAvg(last10Games, "minutes"),
      ppg_last_5: calculateAvg(last5Games, "points"),
      ppg_last_10: calculateAvg(last10Games, "points"),
      rpg_last_10: calculateAvg(last10Games, "rebounds"),
      apg_last_10: calculateAvg(last10Games, "assists"),
      points_std_last_10: calculateStd(last10Games, "points"),
      fg_pct: seasonAverages?.fieldGoalPct || 0,
      three_pt_pct: seasonAverages?.threePtPct || 0,
      ft_pct: seasonAverages?.freeThrowPct || 0,
      games_played: seasonAverages?.gamesPlayed || 0,
    }

    const transformedStats = recentGames.map((game: any) => ({
      game_id: game.gameId,
      player_id: playerId,
      minutes: game.minutes,
      points: game.points,
      rebounds: game.rebounds,
      assists: game.assists,
      steals: game.steals,
      blocks: game.blocks,
      turnovers: game.turnovers,
      game: {
        game_date: game.gameDate,
        game_id: game.gameId,
      },
    }))

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <PlayerHeader player={player} injuries={[]} />

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Stats Charts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Statistical Charts */}
              {transformedStats && transformedStats.length > 0 && (
                <>
                  <PlayerStatsChart stats={transformedStats} statType="points" title="Points - Last 10 Games" />
                  <PlayerStatsChart stats={transformedStats} statType="rebounds" title="Rebounds - Last 10 Games" />
                  <PlayerStatsChart stats={transformedStats} statType="assists" title="Assists - Last 10 Games" />
                </>
              )}

              {/* Distribution for next game */}
              <DistributionChart
                mean={features.ppg_last_10}
                std={features.points_std_last_10 || 3}
                marketLine={features.ppg_season}
                title="POINTS Distribution - Next Game"
              />
            </div>

            {/* Right Column - Features & Analysis */}
            <div className="space-y-6">
              {/* Season Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Season Averages (2024-25)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Points</span>
                    <span className="text-lg font-semibold">{formatDecimal(features.ppg_season, 1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rebounds</span>
                    <span className="text-lg font-semibold">{formatDecimal(features.rpg_season, 1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Assists</span>
                    <span className="text-lg font-semibold">{formatDecimal(features.apg_season, 1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Steals</span>
                    <span className="text-lg font-semibold">{formatDecimal(features.spg_season, 1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Blocks</span>
                    <span className="text-lg font-semibold">{formatDecimal(features.bpg_season, 1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">FG%</span>
                    <span className="text-lg font-semibold">{formatDecimal(features.fg_pct * 100, 1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">3P%</span>
                    <span className="text-lg font-semibold">{formatDecimal(features.three_pt_pct * 100, 1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Games Played</span>
                    <span className="text-lg font-semibold">{features.games_played}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Form</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Last 5 Games</span>
                      <span className="font-semibold">{formatDecimal(features.ppg_last_5, 1)} PPG</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${Math.min((features.ppg_last_5 / (features.ppg_season || 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Last 10 Games</span>
                      <span className="font-semibold">{formatDecimal(features.ppg_last_10, 1)} PPG</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${Math.min((features.ppg_last_10 / (features.ppg_season || 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Minutes (L10)</span>
                      <span className="font-semibold">{formatDecimal(features.minutes_avg_last_10, 1)} MPG</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Consistency Score */}
              <Card>
                <CardHeader>
                  <CardTitle>Consistency Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Standard Deviation</span>
                      <span className="font-semibold">{formatDecimal(features.points_std_last_10, 1)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {features.points_std_last_10 < 3
                        ? "Highly consistent performance"
                        : features.points_std_last_10 < 5
                          ? "Moderately consistent"
                          : "Variable performance"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Games List */}
              <Card>
                <CardHeader>
                  <CardTitle>Last {Math.min(5, recentGames.length)} Games</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentGames.slice(0, 5).map((game: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="text-sm font-medium">{new Date(game.gameDate).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">{game.matchup}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{game.points} PTS</p>
                        <p className="text-xs text-muted-foreground">
                          {game.rebounds} REB · {game.assists} AST
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("[v0] Error loading player page:", error)
    notFound()
  }
}
