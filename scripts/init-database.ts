import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL || process.env.SUPABASE_POSTGRES_URL!)

async function initializeDatabase() {
  try {
    console.log("[v0] Starting database initialization...")

    // Step 1: Create tables
    console.log("[v0] Creating tables...")

    const createTablesSQL = `
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TEAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  abbreviation VARCHAR(3) NOT NULL,
  city VARCHAR(100),
  conference VARCHAR(20),
  division VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. PLAYERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  position VARCHAR(10),
  jersey_number INTEGER,
  height_inches INTEGER,
  weight_lbs INTEGER,
  birth_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. GAMES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id VARCHAR(50) UNIQUE NOT NULL,
  season INTEGER NOT NULL,
  game_date DATE NOT NULL,
  game_time TIME,
  home_team_id UUID REFERENCES teams(id) NOT NULL,
  away_team_id UUID REFERENCES teams(id) NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  game_status VARCHAR(20) DEFAULT 'scheduled',
  venue VARCHAR(200),
  attendance INTEGER,
  pace DECIMAL(5,2),
  total_possessions INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. PLAYER_GAME_STATS (BOXSCORES)
-- ============================================
CREATE TABLE IF NOT EXISTS player_game_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) NOT NULL,
  game_id UUID REFERENCES games(id) NOT NULL,
  team_id UUID REFERENCES teams(id) NOT NULL,
  is_starter BOOLEAN DEFAULT false,
  minutes_played DECIMAL(5,2),
  points INTEGER DEFAULT 0,
  rebounds INTEGER DEFAULT 0,
  offensive_rebounds INTEGER DEFAULT 0,
  defensive_rebounds INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  steals INTEGER DEFAULT 0,
  blocks INTEGER DEFAULT 0,
  turnovers INTEGER DEFAULT 0,
  personal_fouls INTEGER DEFAULT 0,
  field_goals_made INTEGER DEFAULT 0,
  field_goals_attempted INTEGER DEFAULT 0,
  three_pointers_made INTEGER DEFAULT 0,
  three_pointers_attempted INTEGER DEFAULT 0,
  free_throws_made INTEGER DEFAULT 0,
  free_throws_attempted INTEGER DEFAULT 0,
  plus_minus INTEGER,
  usage_rate DECIMAL(5,2),
  true_shooting_pct DECIMAL(5,4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, game_id)
);

-- ============================================
-- 5. PLAY_BY_PLAY DATA
-- ============================================
CREATE TABLE IF NOT EXISTS play_by_play (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) NOT NULL,
  play_id VARCHAR(50) UNIQUE NOT NULL,
  period INTEGER NOT NULL,
  time_remaining VARCHAR(10),
  seconds_remaining INTEGER,
  event_type VARCHAR(50),
  description TEXT,
  player_id UUID REFERENCES players(id),
  team_id UUID REFERENCES teams(id),
  home_score INTEGER,
  away_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. INJURIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS injuries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) NOT NULL,
  injury_type VARCHAR(100),
  injury_status VARCHAR(50) NOT NULL,
  reported_date DATE NOT NULL,
  expected_return_date DATE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. BETTING LINES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS betting_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) NOT NULL,
  player_id UUID REFERENCES players(id) NOT NULL,
  sportsbook VARCHAR(100) NOT NULL,
  stat_type VARCHAR(50) NOT NULL,
  line_value DECIMAL(5,2) NOT NULL,
  over_odds DECIMAL(6,2),
  under_odds DECIMAL(6,2),
  line_date TIMESTAMPTZ NOT NULL,
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. PLAYER PREDICTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS player_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) NOT NULL,
  player_id UUID REFERENCES players(id) NOT NULL,
  stat_type VARCHAR(50) NOT NULL,
  predicted_mean DECIMAL(6,2) NOT NULL,
  predicted_std DECIMAL(6,2),
  predicted_median DECIMAL(6,2),
  percentile_10 DECIMAL(6,2),
  percentile_25 DECIMAL(6,2),
  percentile_75 DECIMAL(6,2),
  percentile_90 DECIMAL(6,2),
  probability_over DECIMAL(5,4),
  market_line DECIMAL(5,2),
  implied_probability DECIMAL(5,4),
  edge_percentage DECIMAL(6,2),
  expected_value DECIMAL(8,4),
  model_version VARCHAR(50),
  confidence_score DECIMAL(5,4),
  prediction_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, player_id, stat_type, prediction_date)
);

-- ============================================
-- 9. FEATURE STORE (Pre-computed features)
-- ============================================
CREATE TABLE IF NOT EXISTS player_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) NOT NULL,
  game_id UUID REFERENCES games(id),
  feature_date DATE NOT NULL,
  ppg_last_5 DECIMAL(5,2),
  ppg_last_10 DECIMAL(5,2),
  ppg_season DECIMAL(5,2),
  rpg_last_5 DECIMAL(5,2),
  rpg_last_10 DECIMAL(5,2),
  rpg_season DECIMAL(5,2),
  apg_last_5 DECIMAL(5,2),
  apg_last_10 DECIMAL(5,2),
  apg_season DECIMAL(5,2),
  points_per_36 DECIMAL(5,2),
  rebounds_per_36 DECIMAL(5,2),
  assists_per_36 DECIMAL(5,2),
  points_std_last_10 DECIMAL(5,2),
  minutes_avg_last_10 DECIMAL(5,2),
  usage_rate_avg DECIMAL(5,2),
  true_shooting_pct DECIMAL(5,4),
  points_trend_slope DECIMAL(6,4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. MODEL PERFORMANCE TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS model_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_version VARCHAR(50) NOT NULL,
  stat_type VARCHAR(50) NOT NULL,
  evaluation_date DATE NOT NULL,
  mae DECIMAL(6,4),
  rmse DECIMAL(6,4),
  brier_score DECIMAL(6,4),
  hit_rate DECIMAL(5,4),
  roi DECIMAL(8,4),
  sample_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
CREATE INDEX IF NOT EXISTS idx_games_date ON games(game_date);
CREATE INDEX IF NOT EXISTS idx_games_season ON games(season);
CREATE INDEX IF NOT EXISTS idx_games_home_team ON games(home_team_id);
CREATE INDEX IF NOT EXISTS idx_games_away_team ON games(away_team_id);
CREATE INDEX IF NOT EXISTS idx_pgs_player ON player_game_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_pgs_game ON player_game_stats(game_id);
CREATE INDEX IF NOT EXISTS idx_pgs_player_game ON player_game_stats(player_id, game_id);
CREATE INDEX IF NOT EXISTS idx_betting_lines_game ON betting_lines(game_id);
CREATE INDEX IF NOT EXISTS idx_betting_lines_player ON betting_lines(player_id);
CREATE INDEX IF NOT EXISTS idx_betting_lines_current ON betting_lines(is_current) WHERE is_current = true;
CREATE INDEX IF NOT EXISTS idx_predictions_game ON player_predictions(game_id);
CREATE INDEX IF NOT EXISTS idx_predictions_player ON player_predictions(player_id);
CREATE INDEX IF NOT EXISTS idx_predictions_date ON player_predictions(prediction_date);
CREATE INDEX IF NOT EXISTS idx_features_player ON player_features(player_id);
CREATE INDEX IF NOT EXISTS idx_features_date ON player_features(feature_date);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_by_play ENABLE ROW LEVEL SECURITY;
ALTER TABLE injuries ENABLE ROW LEVEL SECURITY;
ALTER TABLE betting_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_performance ENABLE ROW LEVEL SECURITY;

-- Public read access policies
DROP POLICY IF EXISTS "Allow public read on teams" ON teams;
DROP POLICY IF EXISTS "Allow public read on players" ON players;
DROP POLICY IF EXISTS "Allow public read on games" ON games;
DROP POLICY IF EXISTS "Allow public read on player_game_stats" ON player_game_stats;
DROP POLICY IF EXISTS "Allow public read on play_by_play" ON play_by_play;
DROP POLICY IF EXISTS "Allow public read on injuries" ON injuries;
DROP POLICY IF EXISTS "Allow public read on betting_lines" ON betting_lines;
DROP POLICY IF EXISTS "Allow public read on player_predictions" ON player_predictions;
DROP POLICY IF EXISTS "Allow public read on player_features" ON player_features;
DROP POLICY IF EXISTS "Allow public read on model_performance" ON model_performance;

-- Service role policies
DROP POLICY IF EXISTS "Service role all on teams" ON teams;
DROP POLICY IF EXISTS "Service role all on players" ON players;
DROP POLICY IF EXISTS "Service role all on games" ON games;
DROP POLICY IF EXISTS "Service role all on player_game_stats" ON player_game_stats;
DROP POLICY IF EXISTS "Service role all on play_by_play" ON play_by_play;
DROP POLICY IF EXISTS "Service role all on injuries" ON injuries;
DROP POLICY IF EXISTS "Service role all on betting_lines" ON betting_lines;
DROP POLICY IF EXISTS "Service role all on player_predictions" ON player_predictions;
DROP POLICY IF EXISTS "Service role all on player_features" ON player_features;
DROP POLICY IF EXISTS "Service role all on model_performance" ON model_performance;

CREATE POLICY "Allow public read on teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public read on players" ON players FOR SELECT USING (true);
CREATE POLICY "Allow public read on games" ON games FOR SELECT USING (true);
CREATE POLICY "Allow public read on player_game_stats" ON player_game_stats FOR SELECT USING (true);
CREATE POLICY "Allow public read on play_by_play" ON play_by_play FOR SELECT USING (true);
CREATE POLICY "Allow public read on injuries" ON injuries FOR SELECT USING (true);
CREATE POLICY "Allow public read on betting_lines" ON betting_lines FOR SELECT USING (true);
CREATE POLICY "Allow public read on player_predictions" ON player_predictions FOR SELECT USING (true);
CREATE POLICY "Allow public read on player_features" ON player_features FOR SELECT USING (true);
CREATE POLICY "Allow public read on model_performance" ON model_performance FOR SELECT USING (true);

CREATE POLICY "Service role all on teams" ON teams FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role all on players" ON players FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role all on games" ON games FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role all on player_game_stats" ON player_game_stats FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role all on play_by_play" ON play_by_play FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role all on injuries" ON injuries FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role all on betting_lines" ON betting_lines FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role all on player_predictions" ON player_predictions FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role all on player_features" ON player_features FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role all on model_performance" ON model_performance FOR ALL USING (auth.jwt()->>'role' = 'service_role');
    `

    await sql(createTablesSQL)
    console.log("[v0] ✓ Tables created successfully")

    // Step 2: Seed sample data
    console.log("[v0] Seeding sample data...")

    const seedDataSQL = `
    -- Insert sample teams
    INSERT INTO teams (team_id, name, abbreviation, city, conference, division) VALUES
    (1610612765, 'Detroit Pistons', 'DET', 'Detroit', 'Eastern', 'Central'),
    (1610612741, 'Chicago Bulls', 'CHI', 'Chicago', 'Eastern', 'Central'),
    (1610612744, 'Golden State Warriors', 'GSW', 'Golden State', 'Western', 'Pacific'),
    (1610612747, 'Los Angeles Lakers', 'LAL', 'Los Angeles', 'Western', 'Pacific'),
    (1610612738, 'Boston Celtics', 'BOS', 'Boston', 'Eastern', 'Atlantic')
    ON CONFLICT (team_id) DO NOTHING;

    -- Get team UUIDs for foreign keys
    DO $$
    DECLARE
      det_id UUID;
      chi_id UUID;
      gsw_id UUID;
      lal_id UUID;
      bos_id UUID;
      game1_id UUID;
      game2_id UUID;
      jalen_id UUID;
      lebron_id UUID;
      steph_id UUID;
    BEGIN
      SELECT id INTO det_id FROM teams WHERE abbreviation = 'DET';
      SELECT id INTO chi_id FROM teams WHERE abbreviation = 'CHI';
      SELECT id INTO gsw_id FROM teams WHERE abbreviation = 'GSW';
      SELECT id INTO lal_id FROM teams WHERE abbreviation = 'LAL';
      SELECT id INTO bos_id FROM teams WHERE abbreviation = 'BOS';

      -- Insert sample players
      INSERT INTO players (player_id, name, team_id, position, jersey_number, height_inches, weight_lbs, is_active)
      VALUES
        (1630614, 'Jalen Duren', det_id, 'C', 0, 83, 250, true),
        (2544, 'LeBron James', lal_id, 'F', 23, 81, 250, true),
        (201939, 'Stephen Curry', gsw_id, 'G', 30, 75, 185, true),
        (1629029, 'Luka Doncic', det_id, 'G', 77, 79, 230, true),
        (203507, 'Giannis Antetokounmpo', bos_id, 'F', 34, 83, 242, true)
      ON CONFLICT (player_id) DO NOTHING;

      -- Get player UUIDs
      SELECT id INTO jalen_id FROM players WHERE player_id = 1630614;
      SELECT id INTO lebron_id FROM players WHERE player_id = 2544;
      SELECT id INTO steph_id FROM players WHERE player_id = 201939;

      -- Insert sample games
      INSERT INTO games (game_id, season, game_date, game_time, home_team_id, away_team_id, game_status, pace, total_possessions)
      VALUES
        ('0022400523', 2024, CURRENT_DATE + INTERVAL '1 day', '19:00:00', det_id, chi_id, 'scheduled', 98.5, NULL),
        ('0022400524', 2024, CURRENT_DATE + INTERVAL '1 day', '20:30:00', gsw_id, lal_id, 'scheduled', 101.2, NULL)
      ON CONFLICT (game_id) DO NOTHING;

      SELECT id INTO game1_id FROM games WHERE game_id = '0022400523';
      SELECT id INTO game2_id FROM games WHERE game_id = '0022400524';

      -- Insert betting lines for upcoming games
      INSERT INTO betting_lines (game_id, player_id, sportsbook, stat_type, line_value, over_odds, under_odds, line_date, is_current)
      VALUES
        (game1_id, jalen_id, 'DraftKings', 'points', 13.5, -110, -110, NOW(), true),
        (game1_id, jalen_id, 'DraftKings', 'rebounds', 11.5, -115, -105, NOW(), true),
        (game1_id, jalen_id, 'FanDuel', 'points', 13.5, -108, -112, NOW(), true),
        (game1_id, jalen_id, 'FanDuel', 'rebounds', 12.0, -110, -110, NOW(), true),
        (game2_id, steph_id, 'DraftKings', 'points', 27.5, -110, -110, NOW(), true),
        (game2_id, steph_id, 'DraftKings', 'three_pointers_made', 4.5, -120, +100, NOW(), true);

      -- Insert sample predictions
      INSERT INTO player_predictions (game_id, player_id, stat_type, predicted_mean, predicted_std, predicted_median, percentile_10, percentile_25, percentile_75, percentile_90, probability_over, market_line, implied_probability, edge_percentage, expected_value, model_version, confidence_score)
      VALUES
        (game1_id, jalen_id, 'points', 14.2, 3.5, 14.0, 9.5, 11.8, 16.5, 18.3, 0.634, 13.5, 0.523, 21.2, 0.085, 'v1.0.0', 0.78),
        (game1_id, jalen_id, 'rebounds', 13.1, 2.8, 13.0, 9.2, 11.0, 15.0, 16.5, 0.713, 11.5, 0.523, 36.3, 0.142, 'v1.0.0', 0.82),
        (game2_id, steph_id, 'points', 28.5, 5.2, 28.0, 20.5, 24.5, 32.0, 36.0, 0.556, 27.5, 0.523, 6.3, 0.023, 'v1.0.0', 0.75),
        (game2_id, steph_id, 'three_pointers_made', 5.2, 1.8, 5.0, 3.0, 4.0, 6.5, 7.5, 0.652, 4.5, 0.545, 19.6, 0.078, 'v1.0.0', 0.71);

      -- Insert player features
      INSERT INTO player_features (player_id, feature_date, ppg_last_5, ppg_last_10, ppg_season, rpg_last_5, rpg_last_10, rpg_season, apg_last_5, apg_last_10, apg_season, points_per_36, rebounds_per_36, assists_per_36, points_std_last_10, minutes_avg_last_10, usage_rate_avg, true_shooting_pct, points_trend_slope)
      VALUES
        (jalen_id, CURRENT_DATE, 13.2, 12.8, 11.4, 12.6, 11.8, 10.9, 2.4, 2.2, 2.1, 14.6, 13.9, 2.6, 2.1, 32.5, 22.5, 0.625, 0.15),
        (steph_id, CURRENT_DATE, 28.5, 27.2, 26.8, 5.2, 5.0, 4.8, 6.8, 6.5, 6.3, 32.1, 5.9, 7.6, 4.5, 34.2, 31.5, 0.680, 0.08);
    END $$;
    `

    await sql(seedDataSQL)
    console.log("[v0] ✓ Sample data seeded successfully")

    console.log("[v0] ✅ Database initialization completed!")
    console.log("[v0] Your database now has all tables, indexes, RLS policies, and sample data ready to use.")
  } catch (error) {
    console.error("[v0] ❌ Database initialization failed:", error)
    process.exit(1)
  }
}

initializeDatabase()
