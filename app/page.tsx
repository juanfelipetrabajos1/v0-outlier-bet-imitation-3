"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { PredictionCard } from "@/components/prediction-card"
import { Spinner } from "@/components/ui/spinner"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Target, BarChart3, AlertCircle } from "lucide-react"
import type { PredictionWithDetails } from "@/lib/types/database"
import Link from "next/link"
import { RecommendationsSection } from "@/components/recommendations-section"

export default function HomePage() {
  const [predictions, setPredictions] = useState<PredictionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [minEdge, setMinEdge] = useState("5")

  useEffect(() => {
    fetchPredictions()
  }, [minEdge])

  const fetchPredictions = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("[v0] Fetching predictions with minEdge:", minEdge)
      const response = await fetch(`/api/predictions?minEdge=${minEdge}`)
      const data = await response.json()

      console.log("[v0] Received data:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch predictions")
      }

      setPredictions(data.predictions || [])
    } catch (error) {
      console.error("[v0] Error fetching predictions:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch predictions")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    // Search is handled by the header component
    // This is just for filtering the current predictions list
    if (!query) {
      fetchPredictions()
    }
  }

  const displayedPredictions = predictions

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <DashboardHeader onSearchChange={handleSearch} onEdgeFilterChange={setMinEdge} />

        <div className="mt-8">
          <RecommendationsSection />
        </div>

        {!loading && !error && displayedPredictions.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{displayedPredictions.length}</p>
                    <p className="text-sm text-muted-foreground">Active Props</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {(
                        displayedPredictions.reduce((sum, p) => sum + (p.edge_percentage || 0), 0) /
                        (displayedPredictions.length || 1)
                      ).toFixed(1)}
                      %
                    </p>
                    <p className="text-sm text-muted-foreground">Avg Edge</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {displayedPredictions.filter((p) => (p.confidence_score || 0) > 0.75).length}
                    </p>
                    <p className="text-sm text-muted-foreground">High Confidence</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground mb-2">Error loading predictions</p>
                <p className="text-muted-foreground mb-4">{error}</p>
                <button
                  onClick={fetchPredictions}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : displayedPredictions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {predictions.length === 0
                  ? "No predictions found. Try adjusting your filters or run the seed script to add sample data."
                  : "No predictions match your current filters."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedPredictions.map((prediction) => (
                <Link key={prediction.id} href={`/player/${prediction.player_id}`}>
                  <PredictionCard prediction={prediction} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
