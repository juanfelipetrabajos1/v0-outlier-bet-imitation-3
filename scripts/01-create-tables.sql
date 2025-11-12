-- ============================================
-- OUTLIER.BET REPLICA - DATABASE SCHEMA
-- ============================================

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
  -- Pace and tempo metrics
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
  
  -- Basic stats
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
  
  -- Shooting stats
  field_goals_made INTEGER DEFAULT 0,
  field_goals_attempted INTEGER DEFAULT 0,
  three_pointers_made INTEGER DEFAULT 0,
  three_pointers_attempted INTEGER DEFAULT 0,
  free_throws_made INTEGER DEFAULT 0,
  free_throws_attempted INTEGER DEFAULT 0,
  
  -- Advanced stats
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
  
  -- Line details
  stat_type VARCHAR(50) NOT NULL, -- 'points', 'rebounds', 'assists', etc.
  line_value DECIMAL(5,2) NOT NULL,
  over_odds DECIMAL(6,2),
  under_odds DECIMAL(6,2),
  
  -- Metadata
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
  
  -- Model predictions
  predicted_mean DECIMAL(6,2) NOT NULL,
  predicted_std DECIMAL(6,2),
  predicted_median DECIMAL(6,2),
  
  -- Percentiles
  percentile_10 DECIMAL(6,2),
  percentile_25 DECIMAL(6,2),
  percentile_75 DECIMAL(6,2),
  percentile_90 DECIMAL(6,2),
  
  -- Probability for specific line
  probability_over DECIMAL(5,4),
  market_line DECIMAL(5,2),
  
  -- Edge calculation
  implied_probability DECIMAL(5,4),
  edge_percentage DECIMAL(6,2),
  expected_value DECIMAL(8,4),
  
  -- Model metadata
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
  
  -- Rolling averages
  ppg_last_5 DECIMAL(5,2),
  ppg_last_10 DECIMAL(5,2),
  ppg_season DECIMAL(5,2),
  rpg_last_5 DECIMAL(5,2),
  rpg_last_10 DECIMAL(5,2),
  rpg_season DECIMAL(5,2),
  apg_last_5 DECIMAL(5,2),
  apg_last_10 DECIMAL(5,2),
  apg_season DECIMAL(5,2),
  
  -- Per minute stats
  points_per_36 DECIMAL(5,2),
  rebounds_per_36 DECIMAL(5,2),
  assists_per_36 DECIMAL(5,2),
  
  -- Consistency metrics
  points_std_last_10 DECIMAL(5,2),
  minutes_avg_last_10 DECIMAL(5,2),
  
  -- Situational
  home_ppg DECIMAL(5,2),
  away_ppg DECIMAL(5,2),
  vs_opponent_ppg DECIMAL(5,2),
  
  -- Usage and advanced
  usage_rate_avg DECIMAL(5,2),
  true_shooting_pct DECIMAL(5,4),
  
  -- Trend
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
  
  -- Performance metrics
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

-- Players
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_players_name ON players(name);

-- Games
CREATE INDEX idx_games_date ON games(game_date);
CREATE INDEX idx_games_season ON games(season);
CREATE INDEX idx_games_home_team ON games(home_team_id);
CREATE INDEX idx_games_away_team ON games(away_team_id);

-- Player Game Stats
CREATE INDEX idx_pgs_player ON player_game_stats(player_id);
CREATE INDEX idx_pgs_game ON player_game_stats(game_id);
CREATE INDEX idx_pgs_player_game ON player_game_stats(player_id, game_id);

-- Betting Lines
CREATE INDEX idx_betting_lines_game ON betting_lines(game_id);
CREATE INDEX idx_betting_lines_player ON betting_lines(player_id);
CREATE INDEX idx_betting_lines_current ON betting_lines(is_current) WHERE is_current = true;

-- Predictions
CREATE INDEX idx_predictions_game ON player_predictions(game_id);
CREATE INDEX idx_predictions_player ON player_predictions(player_id);
CREATE INDEX idx_predictions_date ON player_predictions(prediction_date);

-- Features
CREATE INDEX idx_features_player ON player_features(player_id);
CREATE INDEX idx_features_date ON player_features(feature_date);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
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

-- Public read access policies (all users can read)
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

-- Service role can do everything (for backend operations)
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
