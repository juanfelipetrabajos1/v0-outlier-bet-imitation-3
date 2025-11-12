"use client"

import { Search, Filter, Calendar, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface DashboardHeaderProps {
  onSearchChange?: (value: string) => void
  onDateChange?: (value: string) => void
  onEdgeFilterChange?: (value: string) => void
}

interface Player {
  id: string
  fullName?: string
  name?: string
  firstName?: string
  lastName?: string
  position?: string | null
  teamAbbreviation?: string | null
  teamName?: string | null
  team?: {
    abbreviation: string
    name: string
  } | null
}

export function DashboardHeader({ onSearchChange, onDateChange, onEdgeFilterChange }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Player[]>([])
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchPlayers(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delayTimer)
  }, [searchQuery])

  const searchPlayers = async (query: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/players/search-players?q=${encodeURIComponent(query)}`)

      if (!response.ok) {
        throw new Error("Search failed")
      }

      const data = await response.json()
      console.log("[v0] Search results:", data.players?.length || 0)
      setSearchResults(data.players || [])
      setShowResults(true)
    } catch (error) {
      console.error("[v0] Error searching players:", error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onSearchChange?.(value)
  }

  const handlePlayerSelect = (player: Player) => {
    const displayName = player.fullName || player.name || `${player.firstName || ""} ${player.lastName || ""}`.trim()
    console.log("[v0] Selected player:", displayName, "ID:", player.id)
    setSearchQuery(displayName)
    setShowResults(false)
    onSearchChange?.(displayName)
    window.location.href = `/player/${player.id}`
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-balance">NBA Player Props</h1>
        <p className="text-muted-foreground mt-2">AI-powered predictions with real-time NBA.com statistical analysis</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search NBA players... (e.g., LeBron, Curry, Durant)"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
          />
          {showResults && searchResults.length > 0 && (
            <Card className="absolute top-full mt-2 w-full z-50 max-h-96 overflow-auto">
              <CardContent className="p-0">
                {searchResults.map((player) => {
                  const displayName =
                    player.fullName || player.name || `${player.firstName || ""} ${player.lastName || ""}`.trim()
                  const teamAbbr = player.teamAbbreviation || player.team?.abbreviation || "Free Agent"

                  return (
                    <button
                      key={player.id}
                      className="w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-center gap-3 border-b last:border-b-0"
                      onClick={() => handlePlayerSelect(player)}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{displayName}</p>
                        <p className="text-sm text-muted-foreground">
                          {player.position || "N/A"} · {teamAbbr}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </CardContent>
            </Card>
          )}
          {loading && searchQuery.length >= 2 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          )}
        </div>

        <Select onValueChange={onDateChange}>
          <SelectTrigger className="w-full md:w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Today" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="tomorrow">Tomorrow</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={onEdgeFilterChange} defaultValue="5">
          <SelectTrigger className="w-full md:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Min Edge" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">All Predictions</SelectItem>
            <SelectItem value="5">5%+ Edge</SelectItem>
            <SelectItem value="10">10%+ Edge</SelectItem>
            <SelectItem value="15">15%+ Edge</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
