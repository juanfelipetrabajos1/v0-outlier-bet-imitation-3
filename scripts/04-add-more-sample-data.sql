-- Add more diverse sample data for better testing

-- Add more teams
INSERT INTO teams (id, name, abbreviation, conference, division) VALUES
  ('dd5f5e6d-0f77-4d29-b7b8-61e1a98d1e1e', 'Los Angeles Lakers', 'LAL', 'West', 'Pacific'),
  ('ee6f6e7d-1f88-4d39-b8b8-72e2a09d2e2e', 'Golden State Warriors', 'GSW', 'West', 'Pacific'),
  ('ff7f7e8d-2f99-4d49-b9b8-83e3a10d3e3e', 'Brooklyn Nets', 'BKN', 'East', 'Atlantic'),
  ('aa8f8e9d-3f00-4d59-b0b8-94e4a21d4e4e', 'Miami Heat', 'MIA', 'East', 'Southeast')
ON CONFLICT (id) DO NOTHING;

-- Add more players
INSERT INTO players (id, name, team_id, position, jersey_number, height, weight, birth_date, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'LeBron James', 'dd5f5e6d-0f77-4d29-b7b8-61e1a98d1e1e', 'F', '23', '6-9', 250, '1984-12-30', true),
  ('22222222-2222-2222-2222-222222222222', 'Stephen Curry', 'ee6f6e7d-1f88-4d39-b8b8-72e2a09d2e2e', 'G', '30', '6-2', 185, '1988-03-14', true),
  ('33333333-3333-3333-3333-333333333333', 'Kevin Durant', 'ff7f7e8d-2f99-4d49-b9b8-83e3a10d3e3e', 'F', '7', '6-10', 240, '1988-09-29', true),
  ('44444444-4444-4444-4444-444444444444', 'Jimmy Butler', 'aa8f8e9d-3f00-4d59-b0b8-94e4a21d4e4e', 'G-F', '22', '6-7', 230, '1989-09-14', true)
ON CONFLICT (id) DO NOTHING;

-- Add games for today and tomorrow
INSERT INTO games (id, game_date, season, home_team_id, away_team_id, status) VALUES
  ('game-today-1', CURRENT_DATE, '2024-25', 'dd5f5e6d-0f77-4d29-b7b8-61e1a98d1e1e', 'ee6f6e7d-1f88-4d39-b8b8-72e2a09d2e2e', 'scheduled'),
  ('game-today-2', CURRENT_DATE, '2024-25', 'ff7f7e8d-2f99-4d49-b9b8-83e3a10d3e3e', 'aa8f8e9d-3f00-4d59-b0b8-94e4a21d4e4e', 'scheduled'),
  ('game-tomorrow-1', CURRENT_DATE + INTERVAL '1 day', '2024-25', 'b6f54a4f-d8f1-4c76-abc3-6f4e3aaa9c77', 'dd5f5e6d-0f77-4d29-b7b8-61e1a98d1e1e', 'scheduled')
ON CONFLICT (id) DO NOTHING;

-- Add predictions for new players
INSERT INTO player_predictions (
  id, game_id, player_id, stat_type, 
  predicted_mean, predicted_std, predicted_median,
  percentile_10, percentile_25, percentile_75, percentile_90,
  probability_over, market_line, implied_probability, 
  edge_percentage, expected_value, confidence_score
) VALUES
  -- LeBron James predictions
  (gen_random_uuid(), 'game-today-1', '11111111-1111-1111-1111-111111111111', 'points', 
   25.8, 4.2, 26, 19.5, 23, 28.5, 31.2, 0.62, 24.5, 0.52, 19.2, 0.098, 0.78),
  
  (gen_random_uuid(), 'game-today-1', '11111111-1111-1111-1111-111111111111', 'assists', 
   8.3, 2.1, 8, 5.5, 7, 9.5, 11, 0.68, 7.5, 0.54, 25.9, 0.135, 0.82),

  -- Stephen Curry predictions  
  (gen_random_uuid(), 'game-today-1', '22222222-2222-2222-2222-222222222222', 'points', 
   29.2, 5.1, 29, 22, 26, 32, 35.5, 0.71, 27.5, 0.53, 34.0, 0.178, 0.85),
   
  (gen_random_uuid(), 'game-today-1', '22222222-2222-2222-2222-222222222222', 'three_pointers_made', 
   5.4, 1.8, 5, 3, 4.5, 6.5, 7.5, 0.67, 4.5, 0.52, 28.8, 0.148, 0.79),

  -- Kevin Durant predictions
  (gen_random_uuid(), 'game-today-2', '33333333-3333-3333-3333-333333333333', 'points', 
   27.5, 4.5, 27.5, 21, 24.5, 30, 33, 0.58, 28.5, 0.51, 13.7, 0.069, 0.72),

  -- Jimmy Butler predictions
  (gen_random_uuid(), 'game-today-2', '44444444-4444-4444-4444-444444444444', 'points', 
   23.1, 3.8, 23, 17.5, 21, 25.5, 28, 0.73, 21.5, 0.54, 35.2, 0.186, 0.83)
ON CONFLICT DO NOTHING;

-- Add historical stats for these players
INSERT INTO player_game_stats (
  id, game_id, player_id, team_id, opponent_id,
  minutes_played, points, rebounds, assists, steals, blocks,
  turnovers, field_goals_made, field_goals_attempted,
  three_pointers_made, three_pointers_attempted,
  free_throws_made, free_throws_attempted, plus_minus
) 
SELECT 
  gen_random_uuid(),
  'game-past-' || generate_series,
  '11111111-1111-1111-1111-111111111111',
  'dd5f5e6d-0f77-4d29-b7b8-61e1a98d1e1e',
  'ee6f6e7d-1f88-4d39-b8b8-72e2a09d2e2e',
  35 + (random() * 5)::int,
  23 + (random() * 10)::int,
  7 + (random() * 5)::int,
  7 + (random() * 5)::int,
  1 + (random() * 2)::int,
  1,
  3 + (random() * 2)::int,
  9 + (random() * 5)::int,
  18 + (random() * 5)::int,
  1 + (random() * 3)::int,
  5 + (random() * 3)::int,
  4 + (random() * 4)::int,
  5 + (random() * 4)::int,
  (random() * 20 - 10)::int
FROM generate_series(1, 15);

-- Add features for new players
INSERT INTO player_features (
  id, player_id, feature_date,
  ppg_season, rpg_season, apg_season, spg_season, bpg_season,
  ppg_last_5, ppg_last_10, ppg_last_20,
  rpg_last_5, rpg_last_10, apg_last_5, apg_last_10,
  minutes_avg_season, minutes_avg_last_10,
  usage_rate_avg, true_shooting_pct,
  points_std_last_10, points_trend_slope
) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', CURRENT_DATE,
   25.4, 7.2, 8.1, 1.3, 0.6,
   26.8, 25.9, 25.2,
   7.5, 7.3, 8.5, 8.2,
   35.8, 36.2,
   29.5, 0.585,
   4.2, 0.15),
   
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', CURRENT_DATE,
   28.7, 5.1, 6.4, 1.5, 0.4,
   30.2, 29.4, 28.9,
   5.3, 5.2, 6.8, 6.5,
   34.2, 34.5,
   31.2, 0.642,
   5.8, 0.22),
   
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', CURRENT_DATE,
   27.8, 6.7, 5.2, 0.9, 1.2,
   27.2, 27.5, 27.7,
   6.5, 6.6, 5.0, 5.1,
   36.5, 36.8,
   28.8, 0.618,
   4.5, -0.08),
   
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', CURRENT_DATE,
   22.5, 5.8, 5.1, 1.8, 0.3,
   24.2, 23.4, 22.8,
   6.2, 5.9, 5.5, 5.2,
   33.8, 34.1,
   26.7, 0.571,
   3.9, 0.18);
