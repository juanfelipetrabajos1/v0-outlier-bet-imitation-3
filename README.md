# Outlier.bet NBA Prediction Platform

AI-powered NBA player prop predictions with real-time statistical analysis and edge calculation.

## Features

- 🏀 **Real-Time NBA Data**: Integration with official NBA.com Stats API for live player stats
- 📊 **Advanced Analytics**: Rolling averages, trends, consistency analysis
- 🎯 **Prediction Engine**: ML-based predictions with probability distributions
- 💎 **Edge Calculation**: Compare AI predictions vs market lines
- 📈 **Visual Analytics**: Interactive charts and graphs
- 🔍 **Player Search**: Search any NBA player and view detailed stats

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: Supabase (PostgreSQL)
- **UI**: TailwindCSS v4 + shadcn/ui
- **Charts**: Recharts
- **API**: NBA.com Stats API (official, free, no API key required)

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables (copy `.env.local.example` to `.env.local`)

4. Run database migrations:
   - Execute the SQL scripts in the `scripts/` folder in your Supabase SQL editor
   - Start with `01-create-tables.sql`
   - Then run `03-seed-data-fixed.sql` for sample data

5. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## NBA.com Stats API

The app uses the official NBA.com Stats API for real-time data:

- **Completely Free**: No API key required
- **No Rate Limits**: Public API from NBA.com
- **Official Data**: Direct from the NBA's official statistics database
- **Endpoints Used**:
  - `commonallplayers` - All active players
  - `commonplayerinfo` - Player details
  - `playerdashboardbygeneralsplits` - Season stats
  - `playergamelog` - Game-by-game performance

No configuration needed - the API works out of the box!

**Important**: The NBA.com API requires specific headers to work properly. These are already configured in `lib/api/nba-stats.ts`.

## Features Implementation

### Data Ingestion
- Player stats, game logs, season averages
- Team information and matchups
- Historical performance data
- Real-time updates from NBA.com

### Feature Engineering
- Rolling windows (5, 10, 20 games)
- Per-36 minute statistics
- Opponent adjustments
- Usage rates and efficiency metrics
- Trend analysis
- Consistency scoring (standard deviation)

### Prediction Models
- Baseline: Weighted regression with recent form
- Distribution modeling (Normal approximation)
- Probability calculations for over/under lines
- Confidence scoring
- Edge calculation vs market lines

### Analytics Dashboard
- Player search with autocomplete (searches all active NBA players)
- Recent performance charts (last 10-15 games)
- Distribution visualizations
- Edge and value calculations
- Consistency analysis
- Season averages and shooting percentages

## Database Schema

Main tables:
- `players`: Player profiles and info
- `teams`: NBA team data
- `games`: Game schedules and results
- `player_game_stats`: Per-game statistics
- `player_predictions`: AI predictions
- `betting_lines`: Market lines and odds
- `player_features`: Pre-computed features
- `injuries`: Injury reports

## Development Roadmap

- [x] Integrate official NBA.com Stats API
- [x] Real-time player search across all active players
- [x] Historical game logs and season averages
- [ ] Add more ML models (XGBoost, LightGBM)
- [ ] Implement live game tracking during games
- [ ] Add betting line integration from multiple sportsbooks
- [ ] Matchup analysis (opponent defense stats)
- [ ] Expand to more sports leagues
- [ ] Add user accounts and betting tracking
- [ ] Implement advanced feature engineering pipeline
- [ ] Backtest system with historical accuracy tracking

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License

## How to Use

### Searching Players
1. Type any NBA player name in the search bar (e.g., "LeBron", "Curry", "Durant")
2. Select from the dropdown results (fetched live from NBA.com)
3. View comprehensive stats and analysis

### Understanding Predictions
- **Hit Prob**: Probability the player exceeds the market line
- **Edge**: Advantage over market implied probability (higher = better value)
- **Confidence**: Model certainty in the prediction
- **Projected Range**: Expected stat range for the game

### Filtering Results
- **Min Edge**: Show only predictions with minimum edge percentage
- **Date**: Filter by game date (today, tomorrow, this week)
