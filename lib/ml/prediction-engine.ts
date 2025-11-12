import { FeatureCalculator } from "@/lib/features/calculator"

export interface PredictionInput {
  player_id: string
  stat_type: "points" | "rebounds" | "assists" | "steals" | "blocks" | "three_pointers_made"

  // Historical features
  ppg_last_5: number
  ppg_last_10: number
  ppg_season: number
  rpg_last_5: number
  rpg_last_10: number
  apg_last_5: number

  // Per minute stats
  stat_per_36: number
  minutes_avg: number
  projected_minutes: number

  // Consistency
  stat_std: number

  // Advanced
  usage_rate: number
  true_shooting_pct: number
  trend_slope: number

  // Matchup
  opponent_defense_rating: number
  league_average_defense: number
  game_pace: number

  // Situational
  is_home: boolean
  days_rest: number
  is_back_to_back: boolean
}

export interface PredictionOutput {
  predicted_mean: number
  predicted_std: number
  predicted_median: number
  percentile_10: number
  percentile_25: number
  percentile_75: number
  percentile_90: number
  confidence_score: number
}

export class PredictionEngine {
  /**
   * Simple baseline model using weighted averages
   * In production, this would be replaced with XGBoost/LightGBM/Neural Network
   */
  static predictBaseline(input: PredictionInput): PredictionOutput {
    const { stat_type, stat_per_36, minutes_avg, projected_minutes, stat_std } = input

    // Weight recent games more heavily
    let baseStat: number

    switch (stat_type) {
      case "points":
        baseStat = input.ppg_last_5 * 0.5 + input.ppg_last_10 * 0.3 + input.ppg_season * 0.2
        break
      case "rebounds":
        baseStat = input.rpg_last_5 * 0.5 + input.rpg_last_10 * 0.3 + input.rpg_season * 0.2
        break
      case "assists":
        baseStat = input.apg_last_5 * 0.5 + input.apg_last_10 * 0.3 + input.apg_season * 0.2
        break
      default:
        baseStat = input.ppg_last_10 // Fallback
    }

    // Adjust for projected minutes
    const minuteAdjusted = FeatureCalculator.adjustForMinutes(baseStat, minutes_avg, projected_minutes)

    // Adjust for matchup
    const matchupAdjusted = FeatureCalculator.adjustForMatchup(
      minuteAdjusted,
      input.opponent_defense_rating,
      input.league_average_defense,
      input.game_pace,
    )

    // Adjust for rest and home/away
    let situationalMultiplier = 1.0
    if (input.is_home) situationalMultiplier *= 1.05 // 5% boost at home
    if (input.is_back_to_back) situationalMultiplier *= 0.95 // 5% penalty on B2B

    const predicted_mean = matchupAdjusted * situationalMultiplier

    // Use recent standard deviation for uncertainty
    const predicted_std = stat_std * 1.1 // Add 10% uncertainty buffer

    // Calculate percentiles assuming normal distribution
    const percentile_10 = predicted_mean - 1.28 * predicted_std
    const percentile_25 = predicted_mean - 0.675 * predicted_std
    const percentile_75 = predicted_mean + 0.675 * predicted_std
    const percentile_90 = predicted_mean + 1.28 * predicted_std

    // Confidence based on consistency and sample size
    const consistencyScore = Math.max(0, 1 - stat_std / Math.max(baseStat, 1))
    const confidence_score = consistencyScore * 0.8 // Base confidence at 80% max

    return {
      predicted_mean: Math.max(0, predicted_mean),
      predicted_std,
      predicted_median: predicted_mean,
      percentile_10: Math.max(0, percentile_10),
      percentile_25: Math.max(0, percentile_25),
      percentile_75: Math.max(0, percentile_75),
      percentile_90: Math.max(0, percentile_90),
      confidence_score,
    }
  }

  /**
   * Calculate probability of exceeding a line
   * Assumes normal distribution
   */
  static calculateProbabilityOver(mean: number, std: number, line: number): number {
    if (std === 0) return mean > line ? 1.0 : 0.0

    // Z-score
    const z = (line - mean) / std

    // CDF approximation using error function
    const probability_under = this.normalCDF(z)
    return 1 - probability_under
  }

  /**
   * Normal CDF approximation
   */
  private static normalCDF(x: number): number {
    // Abramowitz and Stegun approximation
    const t = 1 / (1 + 0.2316419 * Math.abs(x))
    const d = 0.3989423 * Math.exp((-x * x) / 2)
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))

    return x > 0 ? 1 - p : p
  }

  /**
   * Calculate market edge
   */
  static calculateEdge(
    probabilityOver: number,
    odds: number, // American odds (e.g., -110)
  ): {
    implied_probability: number
    edge_percentage: number
    expected_value: number
  } {
    // Convert American odds to implied probability
    let implied_probability: number
    if (odds < 0) {
      implied_probability = -odds / (-odds + 100)
    } else {
      implied_probability = 100 / (odds + 100)
    }

    // Add vig (typical 4-5% on each side)
    const vig_adjusted_probability = implied_probability * 1.045

    // Calculate edge
    const edge_percentage = ((probabilityOver - vig_adjusted_probability) / vig_adjusted_probability) * 100

    // Calculate expected value
    const payout = odds < 0 ? 100 / -odds : odds / 100
    const expected_value = probabilityOver * payout - (1 - probabilityOver)

    return {
      implied_probability: vig_adjusted_probability,
      edge_percentage,
      expected_value,
    }
  }

  /**
   * Generate complete prediction with market analysis
   */
  static generatePrediction(input: PredictionInput, marketLine: number, marketOdds = -110) {
    // Get baseline prediction
    const prediction = this.predictBaseline(input)

    // Calculate probability of exceeding line
    const probability_over = this.calculateProbabilityOver(
      prediction.predicted_mean,
      prediction.predicted_std,
      marketLine,
    )

    // Calculate edge
    const edge = this.calculateEdge(probability_over, marketOdds)

    return {
      ...prediction,
      probability_over,
      market_line: marketLine,
      ...edge,
      model_version: "v1.0.0-baseline",
    }
  }
}
