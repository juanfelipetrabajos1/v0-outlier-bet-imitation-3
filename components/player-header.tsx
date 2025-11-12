import { ArrowLeft, Activity, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PlayerHeaderProps {
  player: {
    id: string
    fullName?: string
    name?: string
    firstName?: string
    lastName?: string
    position?: string | null
    height?: string | null
    weight?: string | null
    jerseyNumber?: string | null
    teamName?: string | null
    teamAbbreviation?: string | null
    team?: {
      id: string
      name: string
      abbreviation: string
      city?: string
    } | null
  }
  injuries?: Array<{
    is_active: boolean
    injury_status: string
    injury_type: string
  }>
}

export function PlayerHeader({ player, injuries = [] }: PlayerHeaderProps) {
  const activeInjury = injuries.find((i) => i.is_active)

  const displayName = player.fullName || player.name || `${player.firstName || ""} ${player.lastName || ""}`.trim()
  const teamName = player.team?.name || player.teamName
  const teamAbbreviation = player.team?.abbreviation || player.teamAbbreviation

  return (
    <div className="space-y-4">
      <Link href="/">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-6">
          {/* Player Avatar Placeholder */}
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <span className="text-3xl font-bold text-primary">
              {displayName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>

          <div>
            <h1 className="text-4xl font-bold text-balance">{displayName}</h1>
            <div className="flex items-center gap-3 mt-2">
              {teamName && (
                <Badge variant="secondary" className="text-base">
                  {teamName}
                </Badge>
              )}
              {player.position && (
                <Badge variant="outline" className="text-base">
                  {player.position}
                </Badge>
              )}
              {player.jerseyNumber && <span className="text-muted-foreground">#{player.jerseyNumber}</span>}
            </div>

            {(player.height || player.weight) && (
              <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                {player.height && <span>{player.height}</span>}
                {player.weight && <span>{player.weight} lbs</span>}
              </div>
            )}

            {activeInjury && (
              <div className="mt-3 flex items-center gap-2">
                <Activity className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive font-medium">
                  {activeInjury.injury_status}: {activeInjury.injury_type}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Real-Time NBA.com Data</span>
          </div>
        </div>
      </div>
    </div>
  )
}
