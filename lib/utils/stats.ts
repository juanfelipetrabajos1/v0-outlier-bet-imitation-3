/**
 * Format percentage for display
 */
export function formatPercentage(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined) return "N/A"
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Format decimal number
 */
export function formatDecimal(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined) return "N/A"
  return value.toFixed(decimals)
}

/**
 * Format odds (American)
 */
export function formatOdds(odds: number | null | undefined): string {
  if (odds === null || odds === undefined) return "N/A"
  return odds > 0 ? `+${odds}` : `${odds}`
}

/**
 * Get confidence color class
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return "text-green-500"
  if (confidence >= 0.6) return "text-yellow-500"
  return "text-red-500"
}

/**
 * Get edge color class
 */
export function getEdgeColor(edge: number): string {
  if (edge >= 15) return "text-green-500"
  if (edge >= 5) return "text-yellow-500"
  if (edge >= 0) return "text-muted-foreground"
  return "text-red-500"
}

/**
 * Calculate hit rate from historical predictions
 */
export function calculateHitRate(predictions: Array<{ probability_over: number; actual_result: boolean }>): number {
  if (predictions.length === 0) return 0

  const hits = predictions.filter(
    (p) => (p.probability_over > 0.5 && p.actual_result) || (p.probability_over <= 0.5 && !p.actual_result),
  ).length

  return hits / predictions.length
}
