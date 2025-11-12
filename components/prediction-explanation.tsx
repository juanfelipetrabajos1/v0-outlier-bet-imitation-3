import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Target, Activity, Users } from "lucide-react"
import type { PlayerPrediction } from "@/lib/types/database"

interface PredictionExplanationProps {
  prediction: PlayerPrediction
}

export function PredictionExplanation({ prediction }: PredictionExplanationProps) {
  const reasons = []

  // Generate explanation reasons based on prediction data
  if (prediction.edge_percentage && prediction.edge_percentage > 10) {
    reasons.push({
      icon: TrendingUp,
      title: "Strong Statistical Edge",
      description: `Our model projects ${prediction.edge_percentage.toFixed(1)}% higher probability than market odds suggest.`,
    })
  }

  if (prediction.confidence_score && prediction.confidence_score > 0.75) {
    reasons.push({
      icon: Target,
      title: "High Confidence",
      description: `Model confidence is ${(prediction.confidence_score * 100).toFixed(0)}% based on consistent recent performance.`,
    })
  }

  if (prediction.predicted_mean > (prediction.market_line || 0)) {
    reasons.push({
      icon: Activity,
      title: "Favorable Matchup",
      description: `Recent form and matchup dynamics favor exceeding the market line.`,
    })
  }

  reasons.push({
    icon: Users,
    title: "Data-Driven Analysis",
    description: `Prediction based on 20+ game sample with advanced statistical modeling.`,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Why This Prediction?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reasons.map((reason, idx) => {
          const Icon = reason.icon
          return (
            <div key={idx} className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{reason.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{reason.description}</p>
              </div>
            </div>
          )
        })}

        <div className="pt-4 border-t">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Model: {prediction.model_version || "v1.0.0"}</Badge>
            <span className="text-xs text-muted-foreground">
              Updated: {new Date(prediction.prediction_date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
