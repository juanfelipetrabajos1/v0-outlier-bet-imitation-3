"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import type { PlayerGameStats } from "@/lib/types/database"

interface PlayerStatsChartProps {
  stats: PlayerGameStats[]
  statType: "points" | "rebounds" | "assists"
  title?: string
}

export function PlayerStatsChart({ stats, statType, title }: PlayerStatsChartProps) {
  const data = stats
    .slice(0, 10)
    .reverse()
    .map((stat, index) => ({
      game: `G${index + 1}`,
      value: stat[statType] || 0,
      average: stats.slice(0, 10).reduce((sum, s) => sum + (s[statType] || 0), 0) / Math.min(10, stats.length),
    }))

  const average = data[0]?.average || 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {title || `Last 10 Games - ${statType.charAt(0).toUpperCase() + statType.slice(1)}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="game" className="text-xs" tick={{ fill: "currentColor" }} />
            <YAxis className="text-xs" tick={{ fill: "currentColor" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
            />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Line dataKey="average" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} strokeDasharray="5 5" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            10-Game Average: <span className="font-semibold text-foreground">{average.toFixed(1)}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
