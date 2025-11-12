import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Feature {
  name: string
  value: number
  weight: number
  description: string
}

interface FeatureBreakdownProps {
  features: Feature[]
}

export function FeatureBreakdown({ features }: FeatureBreakdownProps) {
  const sortedFeatures = [...features].sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Feature Importance
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm max-w-xs">Shows which factors most influenced this prediction</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedFeatures.map((feature, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">{feature.name}</span>
              <span className="text-sm font-semibold">{feature.value.toFixed(1)}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.abs(feature.weight) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
