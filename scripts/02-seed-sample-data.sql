-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

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
  INSERT INTO games (game_id, season, game_date, game_time, home_team_id, away_team_id, home_score, away_score, game_status, pace, total_possessions)
  VALUES
    ('0022400523', 2024, CURRENT_DATE + INTERVAL '1 day', '19:00:00', det_id, chi_id, NULL, NULL, 'scheduled', 98.5, NULL),
    ('0022400524', 2024, CURRENT_DATE + INTERVAL '1 day', '20:30:00', gsw_id, lal_id, NULL, NULL, 'scheduled', 101.2, NULL)
  ON CONFLICT (game_id) DO NOTHING
  RETURNING id INTO game1_id;

  SELECT id INTO game1_id FROM games WHERE game_id = '0022400523';
  SELECT id INTO game2_id FROM games WHERE game_id = '0022400524';

  -- Insert historical stats for Jalen Duren (last 5 games)
  INSERT INTO player_game_stats (player_id, game_id, team_id, is_starter, minutes_played, points, rebounds, offensive_rebounds, defensive_rebounds, assists, steals, blocks, turnovers, field_goals_made, field_goals_attempted, usage_rate, plus_minus)
  SELECT 
    jalen_id,
    uuid_generate_v4(),
    det_id,
    true,
    32.5,
    CASE 
      WHEN i = 1 THEN 14
      WHEN i = 2 THEN 16
      WHEN i = 3 THEN 11
      WHEN i = 4 THEN 13
      ELSE 12
    END,
    CASE 
      WHEN i = 1 THEN 14
      WHEN i = 2 THEN 16
      WHEN i = 3 THEN 10
      WHEN i = 4 THEN 12
      ELSE 11
    END,
    5, 9, 2, 1, 2, 1, 6, 10, 22.5, 3
  FROM generate_series(1, 5) i;

  -- Insert betting lines for upcoming game
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
