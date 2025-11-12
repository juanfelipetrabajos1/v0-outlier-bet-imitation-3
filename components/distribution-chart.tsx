"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts"

interface DistributionChartProps {
  mean: number
  std: number
  marketLine: number
  title?: string
}

export function DistributionChart({ mean, std, marketLine, title }: DistributionChartProps) {
  // Generate normal distribution data points
  const generateDistribution = () => {
    const points = []
    const range = 4 * std // 4 standard deviations
    const step = range / 50

    for (let i = 0; i <= 50; i++) {
      const x = mean - 2 * std + i * step
      // Normal distribution PDF
      const y = (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / std, 2))

      points.push({
        value: x,
        probability: y,
        isOver: x > marketLine,
      })
    }

    return points
  }

  const data = generateDistribution()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title || "Probability Distribution"}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorUnder" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOver" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="value"
              className="text-xs"
              tick={{ fill: "currentColor" }}
              tickFormatter={(value) => value.toFixed(0)}
            />
            <YAxis className="text-xs" tick={{ fill: "currentColor" }} hide />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
              formatter={(value: number) => [value.toFixed(4), "Density"]}
              labelFormatter={(value) => `Value: ${Number(value).toFixed(1)}`}
            />
            <ReferenceLine
              x={marketLine}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{ value: "Line", position: "top", fill: "hsl(var(--primary))" }}
            />
            <Area
              type="monotone"
              dataKey="probability"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#colorOver)"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span>Mean: {mean.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-muted-foreground" />
            <span>Line: {marketLine.toFixed(1)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
