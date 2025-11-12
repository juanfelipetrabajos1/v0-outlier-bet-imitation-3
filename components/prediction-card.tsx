import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Target, ArrowRight } from "lucide-react"
import { formatDecimal, formatPercentage, getEdgeColor } from "@/lib/utils/stats"
import type { PredictionWithDetails } from "@/lib/types/database"

interface PredictionCardProps {
  prediction: PredictionWithDetails
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const { player, game, stat_type, predicted_mean, probability_over, market_line, edge_percentage, confidence_score } =
    prediction

  const isPositiveEdge = (edge_percentage || 0) > 0
  const edgeColor = getEdgeColor(edge_percentage || 0)

  return (
    <Card className="group hover:border-primary/50 transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-balance">{player.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span>{player.team?.abbreviation}</span>
              <span>vs</span>
              <span>
                {game.home_team_id === player.team_id ? game.away_team.abbreviation : game.home_team.abbreviation}
              </span>
            </div>
          </div>

          {edge_percentage && edge_percentage > 5 && (
            <Badge variant={isPositiveEdge ? "default" : "destructive"} className="ml-2">
              {isPositiveEdge ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {formatDecimal(edge_percentage, 1)}% Edge
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Prediction */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{stat_type.replace("_", " ").toUpperCase()}</p>
            <p className="text-3xl font-bold text-primary">{formatDecimal(predicted_mean, 1)}</p>
          </div>

          <ArrowRight className="h-6 w-6 text-muted-foreground" />

          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Market Line</p>
            <p className="text-3xl font-bold">{formatDecimal(market_line, 1)}</p>
          </div>
        </div>

        {/* Probability & Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-card border rounded-lg">
            <Target className="h-4 w-4 mx-auto mb-1 text-accent" />
            <p className="text-2xl font-bold text-accent">{formatPercentage(probability_over, 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">Hit Prob</p>
          </div>

          <div className="text-center p-3 bg-card border rounded-lg">
            <p className={`text-2xl font-bold ${edgeColor}`}>
              {edge_percentage && edge_percentage > 0 ? "+" : ""}
              {formatDecimal(edge_percentage, 1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Edge</p>
          </div>

          <div className="text-center p-3 bg-card border rounded-lg">
            <p className="text-2xl font-bold text-primary">{formatPercentage(confidence_score, 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">Confidence</p>
          </div>
        </div>

        {/* Range */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Projected Range</span>
            <span className="font-medium">
              {formatDecimal(prediction.percentile_25, 1)} - {formatDecimal(prediction.percentile_75, 1)}
            </span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-gradient-to-r from-primary/30 via-primary to-primary/30 rounded-full"
              style={{
                left: "25%",
                width: "50%",
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
