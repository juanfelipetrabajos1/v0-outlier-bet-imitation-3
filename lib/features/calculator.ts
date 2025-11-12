import type { PlayerGameStats } from "@/lib/types/database"

interface RollingStats {
  mean: number
  std: number
  trend: number
}

export class FeatureCalculator {
  /**
   * Calculate rolling average for a metric
   */
  static calculateRollingAverage(values: number[], window: number): number {
    const slice = values.slice(0, Math.min(window, values.length))
    if (slice.length === 0) return 0
    return slice.reduce((sum, val) => sum + val, 0) / slice.length
  }

  /**
   * Calculate standard deviation
   */
  static calculateStd(values: number[]): number {
    if (values.length === 0) return 0
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    return Math.sqrt(variance)
  }

  /**
   * Calculate trend using simple linear regression
   */
  static calculateTrend(values: number[]): number {
    if (values.length < 2) return 0

    const n = values.length
    const x = Array.from({ length: n }, (_, i) => i)
    const y = values

    const sumX = x.reduce((sum, val) => sum + val, 0)
    const sumY = y.reduce((sum, val) => sum + val, 0)
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0)
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    return slope
  }

  /**
   * Calculate per-36 minute stats
   */
  static calculatePer36(stat: number, minutes: number): number {
    if (minutes === 0) return 0
    return (stat / minutes) * 36
  }

  /**
   * Calculate usage rate approximation
   */
  static calculateUsageRate(fga: number, fta: number, turnovers: number, minutes: number, teamMinutes = 240): number {
    if (minutes === 0 || teamMinutes === 0) return 0

    const possessions = fga + 0.44 * fta + turnovers
    const teamPossessions = (teamMinutes / 5) * 100 // Approximate team possessions

    return (possessions / minutes) * (teamMinutes / teamPossessions) * 100
  }

  /**
   * Calculate true shooting percentage
   */
  static calculateTrueShootingPct(points: number, fga: number, fta: number): number {
    const tsa = fga + 0.44 * fta
    if (tsa === 0) return 0
    return points / (2 * tsa)
  }

  /**
   * Generate all features from player game stats
   */
  static generatePlayerFeatures(
    playerId: string,
    recentGames: PlayerGameStats[],
  ): {
    ppg_last_5: number
    ppg_last_10: number
    ppg_season: number
    rpg_last_5: number
    rpg_last_10: number
    rpg_season: number
    apg_last_5: number
    apg_last_10: number
    apg_season: number
    points_per_36: number
    rebounds_per_36: number
    assists_per_36: number
    points_std_last_10: number
    minutes_avg_last_10: number
    usage_rate_avg: number
    true_shooting_pct: number
    points_trend_slope: number
  } {
    const points = recentGames.map((g) => g.points)
    const rebounds = recentGames.map((g) => g.rebounds)
    const assists = recentGames.map((g) => g.assists)
    const minutes = recentGames.map((g) => g.minutes_played || 0)

    // Calculate per-36 averages
    const totalMinutes = minutes.reduce((sum, m) => sum + m, 0)
    const totalPoints = points.reduce((sum, p) => sum + p, 0)
    const totalRebounds = rebounds.reduce((sum, r) => sum + r, 0)
    const totalAssists = assists.reduce((sum, a) => sum + a, 0)

    const avgMinutes = minutes.length > 0 ? totalMinutes / minutes.length : 0

    return {
      ppg_last_5: this.calculateRollingAverage(points, 5),
      ppg_last_10: this.calculateRollingAverage(points, 10),
      ppg_season: this.calculateRollingAverage(points, points.length),

      rpg_last_5: this.calculateRollingAverage(rebounds, 5),
      rpg_last_10: this.calculateRollingAverage(rebounds, 10),
      rpg_season: this.calculateRollingAverage(rebounds, rebounds.length),

      apg_last_5: this.calculateRollingAverage(assists, 5),
      apg_last_10: this.calculateRollingAverage(assists, 10),
      apg_season: this.calculateRollingAverage(assists, assists.length),

      points_per_36: this.calculatePer36(totalPoints, totalMinutes),
      rebounds_per_36: this.calculatePer36(totalRebounds, totalMinutes),
      assists_per_36: this.calculatePer36(totalAssists, totalMinutes),

      points_std_last_10: this.calculateStd(points.slice(0, 10)),
      minutes_avg_last_10: this.calculateRollingAverage(minutes, 10),

      usage_rate_avg:
        recentGames.slice(0, 10).reduce((sum, g) => {
          const usage =
            g.usage_rate ||
            this.calculateUsageRate(
              g.field_goals_attempted,
              g.free_throws_attempted,
              g.turnovers,
              g.minutes_played || 0,
            )
          return sum + usage
        }, 0) / Math.min(10, recentGames.length),

      true_shooting_pct:
        recentGames.slice(0, 10).reduce((sum, g) => {
          return (
            sum +
            (g.true_shooting_pct ||
              this.calculateTrueShootingPct(g.points, g.field_goals_attempted, g.free_throws_attempted))
          )
        }, 0) / Math.min(10, recentGames.length),

      points_trend_slope: this.calculateTrend(points.slice(0, 10)),
    }
  }

  /**
   * Adjust prediction based on matchup and pace
   */
  static adjustForMatchup(
    basePrediction: number,
    opponentDefenseRating: number, // Points allowed per game to position
    leagueAverage: number,
    pace: number,
    leaguePace = 100,
  ): number {
    // Opponent adjustment: if they allow more than league average, boost prediction
    const defenseMultiplier = opponentDefenseRating / leagueAverage

    // Pace adjustment: faster pace = more opportunities
    const paceMultiplier = pace / leaguePace

    return basePrediction * defenseMultiplier * paceMultiplier
  }

  /**
   * Adjust for minutes projection
   */
  static adjustForMinutes(basePrediction: number, avgMinutes: number, projectedMinutes: number): number {
    if (avgMinutes === 0) return basePrediction
    return basePrediction * (projectedMinutes / avgMinutes)
  }

  /**
   * Calculate injury impact on team usage
   */
  static calculateInjuryImpact(
    playerUsageRate: number,
    teammateInjuries: Array<{ usage_rate: number }>,
    teamTotalUsage = 100,
  ): number {
    // If key teammates are injured, player's usage should increase
    const injuredUsage = teammateInjuries.reduce((sum, inj) => sum + inj.usage_rate, 0)
    const usageBoost = injuredUsage * 0.3 // Player gets ~30% of injured teammates' usage

    return Math.min(playerUsageRate + usageBoost, 40) // Cap at 40% usage
  }
}
