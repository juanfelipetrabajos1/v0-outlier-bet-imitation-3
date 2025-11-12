"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle, Sparkles, TrendingUp } from "lucide-react"
import Link from "next/link"

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

export function RecommendationsSection() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("[v0] Fetching recommendations...")
      const response = await fetch("/api/recommendations?minEdge=8&minConfidence=0.65")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch recommendations")
      }

      setRecommendations(data.recommendations || [])
    } catch (error) {
      console.error("[v0] Error fetching recommendations:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch recommendations")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-accent" />
        <h2 className="text-2xl font-bold">Recommended Props</h2>
        <Badge variant="secondary" className="ml-auto">
          {recommendations.length} plays
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => (
          <Link key={rec.id} href={`/player/${rec.player_id}`}>
            <Card className="h-full hover:border-primary/50 transition-all cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-balance">{rec.player_name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span className="font-semibold">{rec.team_abbreviation}</span>
                      <span>vs</span>
                      <span className="font-semibold">{rec.game_info.opponent_abbreviation}</span>
                    </div>
                  </div>
                  <Badge variant="default" className="flex-shrink-0">
                    <TrendingUp className="h-3 w-3 mr-1" />+{rec.edge_percentage.toFixed(1)}%
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Stat prediction */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {rec.stat_type.replace("_", " ").toUpperCase()}
                    </p>
                    <p className="text-2xl font-bold text-primary">{rec.predicted_mean.toFixed(1)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Market</p>
                    <p className="text-2xl font-bold">{rec.market_line.toFixed(1)}</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-card border rounded text-center">
                    <p className="text-sm font-semibold text-accent">{(rec.probability_over * 100).toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Hit Prob</p>
                  </div>
                  <div className="p-2 bg-card border rounded text-center">
                    <p className="text-sm font-semibold text-primary">{(rec.confidence_score * 100).toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Confidence</p>
                  </div>
                </div>

                {/* Reasoning */}
                <p className="text-sm text-muted-foreground leading-relaxed">{rec.reasoning}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
