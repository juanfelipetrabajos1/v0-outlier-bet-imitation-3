-- ============================================
-- FIXED SEED DATA - Simpler approach
-- ============================================

-- Clear existing data (optional)
TRUNCATE TABLE player_predictions, betting_lines, player_features, player_game_stats, injuries, play_by_play, games, players, teams CASCADE;

-- Insert teams
INSERT INTO teams (team_id, name, abbreviation, city, conference, division) VALUES
(1610612765, 'Detroit Pistons', 'DET', 'Detroit', 'Eastern', 'Central'),
(1610612741, 'Chicago Bulls', 'CHI', 'Chicago', 'Eastern', 'Central'),
(1610612744, 'Golden State Warriors', 'GSW', 'Golden State', 'Western', 'Pacific'),
(1610612747, 'Los Angeles Lakers', 'LAL', 'Los Angeles', 'Western', 'Pacific'),
(1610612738, 'Boston Celtics', 'BOS', 'Boston', 'Eastern', 'Atlantic')
ON CONFLICT (team_id) DO NOTHING;

-- Insert players
INSERT INTO players (player_id, name, team_id, position, jersey_number, height_inches, weight_lbs, is_active)
SELECT 
  1630614, 
  'Jalen Duren', 
  (SELECT id FROM teams WHERE abbreviation = 'DET'), 
  'C', 
  0, 
  83, 
  250, 
  true
WHERE NOT EXISTS (SELECT 1 FROM players WHERE player_id = 1630614);

INSERT INTO players (player_id, name, team_id, position, jersey_number, height_inches, weight_lbs, is_active)
SELECT 
  2544, 
  'LeBron James', 
  (SELECT id FROM teams WHERE abbreviation = 'LAL'), 
  'F', 
  23, 
  81, 
  250, 
  true
WHERE NOT EXISTS (SELECT 1 FROM players WHERE player_id = 2544);

INSERT INTO players (player_id, name, team_id, position, jersey_number, height_inches, weight_lbs, is_active)
SELECT 
  201939, 
  'Stephen Curry', 
  (SELECT id FROM teams WHERE abbreviation = 'GSW'), 
  'G', 
  30, 
  75, 
  185, 
  true
WHERE NOT EXISTS (SELECT 1 FROM players WHERE player_id = 201939);

INSERT INTO players (player_id, name, team_id, position, jersey_number, height_inches, weight_lbs, is_active)
SELECT 
  1629029, 
  'Luka Doncic', 
  (SELECT id FROM teams WHERE abbreviation = 'DET'), 
  'G', 
  77, 
  79, 
  230, 
  true
WHERE NOT EXISTS (SELECT 1 FROM players WHERE player_id = 1629029);

INSERT INTO players (player_id, name, team_id, position, jersey_number, height_inches, weight_lbs, is_active)
SELECT 
  203507, 
  'Giannis Antetokounmpo', 
  (SELECT id FROM teams WHERE abbreviation = 'BOS'), 
  'F', 
  34, 
  83, 
  242, 
  true
WHERE NOT EXISTS (SELECT 1 FROM players WHERE player_id = 203507);

-- Insert games for today
INSERT INTO games (game_id, season, game_date, game_time, home_team_id, away_team_id, home_score, away_score, game_status, pace, total_possessions)
SELECT 
  '0022400523', 
  2024, 
  CURRENT_DATE, 
  '19:00:00', 
  (SELECT id FROM teams WHERE abbreviation = 'DET'),
  (SELECT id FROM teams WHERE abbreviation = 'CHI'),
  NULL, 
  NULL, 
  'scheduled', 
  98.5, 
  NULL
WHERE NOT EXISTS (SELECT 1 FROM games WHERE game_id = '0022400523');

INSERT INTO games (game_id, season, game_date, game_time, home_team_id, away_team_id, home_score, away_score, game_status, pace, total_possessions)
SELECT 
  '0022400524', 
  2024, 
  CURRENT_DATE, 
  '20:30:00', 
  (SELECT id FROM teams WHERE abbreviation = 'GSW'),
  (SELECT id FROM teams WHERE abbreviation = 'LAL'),
  NULL, 
  NULL, 
  'scheduled', 
  101.2, 
  NULL
WHERE NOT EXISTS (SELECT 1 FROM games WHERE game_id = '0022400524');

-- Insert betting lines
INSERT INTO betting_lines (game_id, player_id, sportsbook, stat_type, line_value, over_odds, under_odds, line_date, is_current)
SELECT 
  (SELECT id FROM games WHERE game_id = '0022400523'),
  (SELECT id FROM players WHERE player_id = 1630614),
  'DraftKings',
  'points',
  13.5,
  -110,
  -110,
  NOW(),
  true
WHERE NOT EXISTS (
  SELECT 1 FROM betting_lines 
  WHERE game_id = (SELECT id FROM games WHERE game_id = '0022400523')
  AND player_id = (SELECT id FROM players WHERE player_id = 1630614)
  AND stat_type = 'points'
);

INSERT INTO betting_lines (game_id, player_id, sportsbook, stat_type, line_value, over_odds, under_odds, line_date, is_current)
SELECT 
  (SELECT id FROM games WHERE game_id = '0022400523'),
  (SELECT id FROM players WHERE player_id = 1630614),
  'DraftKings',
  'rebounds',
  11.5,
  -115,
  -105,
  NOW(),
  true
WHERE NOT EXISTS (
  SELECT 1 FROM betting_lines 
  WHERE game_id = (SELECT id FROM games WHERE game_id = '0022400523')
  AND player_id = (SELECT id FROM players WHERE player_id = 1630614)
  AND stat_type = 'rebounds'
);

INSERT INTO betting_lines (game_id, player_id, sportsbook, stat_type, line_value, over_odds, under_odds, line_date, is_current)
SELECT 
  (SELECT id FROM games WHERE game_id = '0022400524'),
  (SELECT id FROM players WHERE player_id = 201939),
  'DraftKings',
  'points',
  27.5,
  -110,
  -110,
  NOW(),
  true
WHERE NOT EXISTS (
  SELECT 1 FROM betting_lines 
  WHERE game_id = (SELECT id FROM games WHERE game_id = '0022400524')
  AND player_id = (SELECT id FROM players WHERE player_id = 201939)
  AND stat_type = 'points'
);

INSERT INTO betting_lines (game_id, player_id, sportsbook, stat_type, line_value, over_odds, under_odds, line_date, is_current)
SELECT 
  (SELECT id FROM games WHERE game_id = '0022400524'),
  (SELECT id FROM players WHERE player_id = 201939),
  'DraftKings',
  'three_pointers_made',
  4.5,
  -120,
  100,
  NOW(),
  true
WHERE NOT EXISTS (
  SELECT 1 FROM betting_lines 
  WHERE game_id = (SELECT id FROM games WHERE game_id = '0022400524')
  AND player_id = (SELECT id FROM players WHERE player_id = 201939)
  AND stat_type = 'three_pointers_made'
);

-- Insert predictions
INSERT INTO player_predictions (
  game_id, player_id, stat_type, predicted_mean, predicted_std, predicted_median, 
  percentile_10, percentile_25, percentile_75, percentile_90, 
  probability_over, market_line, implied_probability, edge_percentage, 
  expected_value, model_version, confidence_score, prediction_date
)
SELECT 
  (SELECT id FROM games WHERE game_id = '0022400523'),
  (SELECT id FROM players WHERE player_id = 1630614),
  'points',
  14.2, 3.5, 14.0, 9.5, 11.8, 16.5, 18.3, 0.634, 13.5, 0.523, 21.2, 0.085, 'v1.0.0', 0.78, NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM player_predictions 
  WHERE game_id = (SELECT id FROM games WHERE game_id = '0022400523')
  AND player_id = (SELECT id FROM players WHERE player_id = 1630614)
  AND stat_type = 'points'
);

INSERT INTO player_predictions (
  game_id, player_id, stat_type, predicted_mean, predicted_std, predicted_median, 
  percentile_10, percentile_25, percentile_75, percentile_90, 
  probability_over, market_line, implied_probability, edge_percentage, 
  expected_value, model_version, confidence_score, prediction_date
)
SELECT 
  (SELECT id FROM games WHERE game_id = '0022400523'),
  (SELECT id FROM players WHERE player_id = 1630614),
  'rebounds',
  13.1, 2.8, 13.0, 9.2, 11.0, 15.0, 16.5, 0.713, 11.5, 0.523, 36.3, 0.142, 'v1.0.0', 0.82, NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM player_predictions 
  WHERE game_id = (SELECT id FROM games WHERE game_id = '0022400523')
  AND player_id = (SELECT id FROM players WHERE player_id = 1630614)
  AND stat_type = 'rebounds'
);

INSERT INTO player_predictions (
  game_id, player_id, stat_type, predicted_mean, predicted_std, predicted_median, 
  percentile_10, percentile_25, percentile_75, percentile_90, 
  probability_over, market_line, implied_probability, edge_percentage, 
  expected_value, model_version, confidence_score, prediction_date
)
SELECT 
  (SELECT id FROM games WHERE game_id = '0022400524'),
  (SELECT id FROM players WHERE player_id = 201939),
  'points',
  28.5, 5.2, 28.0, 20.5, 24.5, 32.0, 36.0, 0.556, 27.5, 0.523, 6.3, 0.023, 'v1.0.0', 0.75, NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM player_predictions 
  WHERE game_id = (SELECT id FROM games WHERE game_id = '0022400524')
  AND player_id = (SELECT id FROM players WHERE player_id = 201939)
  AND stat_type = 'points'
);

INSERT INTO player_predictions (
  game_id, player_id, stat_type, predicted_mean, predicted_std, predicted_median, 
  percentile_10, percentile_25, percentile_75, percentile_90, 
  probability_over, market_line, implied_probability, edge_percentage, 
  expected_value, model_version, confidence_score, prediction_date
)
SELECT 
  (SELECT id FROM games WHERE game_id = '0022400524'),
  (SELECT id FROM players WHERE player_id = 201939),
  'three_pointers_made',
  5.2, 1.8, 5.0, 3.0, 4.0, 6.5, 7.5, 0.652, 4.5, 0.545, 19.6, 0.078, 'v1.0.0', 0.71, NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM player_predictions 
  WHERE game_id = (SELECT id FROM games WHERE game_id = '0022400524')
  AND player_id = (SELECT id FROM players WHERE player_id = 201939)
  AND stat_type = 'three_pointers_made'
);

-- Insert player features
INSERT INTO player_features (
  player_id, feature_date, ppg_last_5, ppg_last_10, ppg_season, 
  rpg_last_5, rpg_last_10, rpg_season, apg_last_5, apg_last_10, apg_season,
  points_per_36, rebounds_per_36, assists_per_36, points_std_last_10, 
  minutes_avg_last_10, usage_rate_avg, true_shooting_pct, points_trend_slope
)
SELECT 
  (SELECT id FROM players WHERE player_id = 1630614),
  CURRENT_DATE, 13.2, 12.8, 11.4, 12.6, 11.8, 10.9, 2.4, 2.2, 2.1, 
  14.6, 13.9, 2.6, 2.1, 32.5, 22.5, 0.625, 0.15
WHERE NOT EXISTS (
  SELECT 1 FROM player_features 
  WHERE player_id = (SELECT id FROM players WHERE player_id = 1630614)
  AND feature_date = CURRENT_DATE
);

INSERT INTO player_features (
  player_id, feature_date, ppg_last_5, ppg_last_10, ppg_season, 
  rpg_last_5, rpg_last_10, rpg_season, apg_last_5, apg_last_10, apg_season,
  points_per_36, rebounds_per_36, assists_per_36, points_std_last_10, 
  minutes_avg_last_10, usage_rate_avg, true_shooting_pct, points_trend_slope
)
SELECT 
  (SELECT id FROM players WHERE player_id = 201939),
  CURRENT_DATE, 28.5, 27.2, 26.8, 5.2, 5.0, 4.8, 6.8, 6.5, 6.3, 
  32.1, 5.9, 7.6, 4.5, 34.2, 31.5, 0.680, 0.08
WHERE NOT EXISTS (
  SELECT 1 FROM player_features 
  WHERE player_id = (SELECT id FROM players WHERE player_id = 201939)
  AND feature_date = CURRENT_DATE
);
