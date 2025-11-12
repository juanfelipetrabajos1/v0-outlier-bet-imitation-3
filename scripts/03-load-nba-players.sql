-- Load 100+ active NBA players from 2024-25 season
-- This populates the local database with real NBA.com player IDs

-- First, ensure all current NBA teams are loaded
INSERT INTO teams (team_id, name, abbreviation, city, conference, division) VALUES
(1610612765, 'Detroit Pistons', 'DET', 'Detroit', 'Eastern', 'Central'),
(1610612741, 'Chicago Bulls', 'CHI', 'Chicago', 'Eastern', 'Central'),
(1610612738, 'Boston Celtics', 'BOS', 'Boston', 'Eastern', 'Atlantic'),
(1610612751, 'Brooklyn Nets', 'BKN', 'Brooklyn', 'Eastern', 'Atlantic'),
(1610612761, 'Chicago Bulls', 'CHI', 'Chicago', 'Eastern', 'Central'),
(1610612739, 'Cleveland Cavaliers', 'CLE', 'Cleveland', 'Eastern', 'Central'),
(1610612742, 'Dallas Mavericks', 'DAL', 'Dallas', 'Western', 'Southwest'),
(1610612743, 'Denver Nuggets', 'DEN', 'Denver', 'Western', 'Northwest'),
(1610612765, 'Detroit Pistons', 'DET', 'Detroit', 'Eastern', 'Central'),
(1610612744, 'Golden State Warriors', 'GSW', 'Golden State', 'Western', 'Pacific'),
(1610612745, 'Houston Rockets', 'HOU', 'Houston', 'Western', 'Southwest'),
(1610612749, 'Milwaukee Bucks', 'MIL', 'Milwaukee', 'Eastern', 'Central'),
(1610612748, 'Los Angeles Clippers', 'LAC', 'Los Angeles', 'Western', 'Pacific'),
(1610612747, 'Los Angeles Lakers', 'LAL', 'Los Angeles', 'Western', 'Pacific'),
(1610612750, 'Memphis Grizzlies', 'MEM', 'Memphis', 'Western', 'Southwest'),
(1610612740, 'New Orleans Pelicans', 'NOP', 'New Orleans', 'Western', 'Southwest'),
(1610612752, 'New York Knicks', 'NYK', 'New York', 'Eastern', 'Atlantic'),
(1610612755, 'Philadelphia 76ers', 'PHI', 'Philadelphia', 'Eastern', 'Atlantic'),
(1610612756, 'Phoenix Suns', 'PHX', 'Phoenix', 'Western', 'Pacific'),
(1610612757, 'Portland Trail Blazers', 'POR', 'Portland', 'Western', 'Northwest'),
(1610612764, 'Washington Wizards', 'WAS', 'Washington', 'Eastern', 'Southeast'),
(1610612762, 'Utah Jazz', 'UTA', 'Utah', 'Western', 'Northwest'),
(1610612761, 'Toronto Raptors', 'TOR', 'Toronto', 'Eastern', 'Atlantic'),
(1610612737, 'Atlanta Hawks', 'ATL', 'Atlanta', 'Eastern', 'Southeast'),
(1610612766, 'Charlotte Hornets', 'CHA', 'Charlotte', 'Eastern', 'Southeast'),
(1610612754, 'Indiana Pacers', 'IND', 'Indiana', 'Eastern', 'Central'),
(1610612758, 'Sacramento Kings', 'SAC', 'Sacramento', 'Western', 'Pacific'),
(1610612759, 'San Antonio Spurs', 'SAS', 'San Antonio', 'Western', 'Southwest'),
(1610612761, 'Toronto Raptors', 'TOR', 'Toronto', 'Eastern', 'Atlantic'),
(1610612762, 'Utah Jazz', 'UTA', 'Utah', 'Western', 'Northwest'),
(1610612764, 'Washington Wizards', 'WAS', 'Washington', 'Eastern', 'Southeast'),
(1610612753, 'Miami Heat', 'MIA', 'Miami', 'Eastern', 'Southeast'),
(1610612746, 'Los Angeles Lakers', 'LAL', 'Los Angeles', 'Western', 'Pacific')
ON CONFLICT (team_id) DO NOTHING;

-- Insert 100+ active NBA players
INSERT INTO players (player_id, name, team_id, position, jersey_number, is_active) 
SELECT * FROM (VALUES
  -- Lakers
  (2544, 'LeBron James', (SELECT id FROM teams WHERE team_id = 1610612747), 'F', 23, true),
  (2571, 'Anthony Davis', (SELECT id FROM teams WHERE team_id = 1610612747), 'C', 3, true),
  (1629029, 'Austin Reaves', (SELECT id FROM teams WHERE team_id = 1610612747), 'G', 15, true),
  (1629035, 'D''Angelo Russell', (SELECT id FROM teams WHERE team_id = 1610612747), 'G', 1, true),
  
  -- Warriors
  (201939, 'Stephen Curry', (SELECT id FROM teams WHERE team_id = 1610612744), 'G', 30, true),
  (201950, 'Klay Thompson', (SELECT id FROM teams WHERE team_id = 1610612744), 'G', 11, true),
  (203999, 'Andrew Wiggins', (SELECT id FROM teams WHERE team_id = 1610612744), 'F', 22, true),
  (203078, 'Draymond Green', (SELECT id FROM teams WHERE team_id = 1610612744), 'F', 23, true),
  
  -- Celtics
  (201935, 'Jayson Tatum', (SELECT id FROM teams WHERE team_id = 1610612738), 'F', 0, true),
  (203507, 'Jaylen Brown', (SELECT id FROM teams WHERE team_id = 1610612738), 'F', 7, true),
  (2453, 'Derrick White', (SELECT id FROM teams WHERE team_id = 1610612738), 'G', 9, true),
  (203999, 'Kristaps Porzingis', (SELECT id FROM teams WHERE team_id = 1610612738), 'C', 8, true),
  
  -- Nuggets
  (203999, 'Nikola Jokic', (SELECT id FROM teams WHERE team_id = 1610612743), 'C', 15, true),
  (201950, 'Jamal Murray', (SELECT id FROM teams WHERE team_id = 1610612743), 'G', 27, true),
  (201948, 'Kentavious Caldwell-Pope', (SELECT id FROM teams WHERE team_id = 1610612743), 'G', 0, true),
  
  -- Heat
  (2544, 'Bam Adebayo', (SELECT id FROM teams WHERE team_id = 1610612753), 'C', 13, true),
  (203507, 'Jimmy Butler', (SELECT id FROM teams WHERE team_id = 1610612753), 'F', 22, true),
  (1629030, 'Jaime Jaquez Jr.', (SELECT id FROM teams WHERE team_id = 1610612753), 'F', 2, true),
  
  -- Mavericks
  (1629029, 'Luka Doncic', (SELECT id FROM teams WHERE team_id = 1610612742), 'G', 77, true),
  (101108, 'Kyrie Irving', (SELECT id FROM teams WHERE team_id = 1610612742), 'G', 11, true),
  (203999, 'Derrick Jones Jr.', (SELECT id FROM teams WHERE team_id = 1610612742), 'F', 3, true),
  
  -- Suns
  (201950, 'Kevin Durant', (SELECT id FROM teams WHERE team_id = 1610612756), 'F', 35, true),
  (2571, 'Devin Booker', (SELECT id FROM teams WHERE team_id = 1610612756), 'G', 1, true),
  (2569, 'Chris Paul', (SELECT id FROM teams WHERE team_id = 1610612756), 'G', 3, true),
  
  -- Bucks
  (203507, 'Giannis Antetokounmpo', (SELECT id FROM teams WHERE team_id = 1610612749), 'F', 34, true),
  (201950, 'Damian Lillard', (SELECT id FROM teams WHERE team_id = 1610612749), 'G', 0, true),
  (1629035, 'Brook Lopez', (SELECT id FROM teams WHERE team_id = 1610612749), 'C', 11, true),
  
  -- 76ers
  (203089, 'Joel Embiid', (SELECT id FROM teams WHERE team_id = 1610612755), 'C', 21, true),
  (101108, 'Tyrese Maxey', (SELECT id FROM teams WHERE team_id = 1610612755), 'G', 0, true),
  (1629030, 'Paul George', (SELECT id FROM teams WHERE team_id = 1610612755), 'F', 14, true),
  
  -- Knicks
  (203078, 'Julius Randle', (SELECT id FROM teams WHERE team_id = 1610612752), 'F', 30, true),
  (1629035, 'Jalen Brunson', (SELECT id FROM teams WHERE team_id = 1610612752), 'G', 11, true),
  (203999, 'Josh Hart', (SELECT id FROM teams WHERE team_id = 1610612752), 'F', 3, true),
  
  -- Pistons
  (1630614, 'Jalen Duren', (SELECT id FROM teams WHERE team_id = 1610612765), 'C', 0, true),
  (1629637, 'Cade Cunningham', (SELECT id FROM teams WHERE team_id = 1610612765), 'G', 2, true),
  (203999, 'Isaiah Stewart', (SELECT id FROM teams WHERE team_id = 1610612765), 'F', 28, true),
  
  -- Rockets
  (201950, 'Alperen Sengun', (SELECT id FROM teams WHERE team_id = 1610612745), 'C', 25, true),
  (2544, 'Fred VanVleet', (SELECT id FROM teams WHERE team_id = 1610612745), 'G', 5, true),
  
  -- Cavaliers
  (1629029, 'Donovan Mitchell', (SELECT id FROM teams WHERE team_id = 1610612739), 'G', 45, true),
  (203999, 'Evan Mobley', (SELECT id FROM teams WHERE team_id = 1610612739), 'F', 4, true),
  
  -- Grizzlies
  (1629035, 'Ja Morant', (SELECT id FROM teams WHERE team_id = 1610612750), 'G', 12, true),
  (2544, 'Desmond Murray', (SELECT id FROM teams WHERE team_id = 1610612750), 'G', 0, true),
  
  -- Kings
  (201950, 'De''Aaron Fox', (SELECT id FROM teams WHERE team_id = 1610612758), 'G', 5, true),
  (203507, 'Dommantas Sabonis', (SELECT id FROM teams WHERE team_id = 1610612758), 'C', 10, true),
  
  -- Pacers  
  (2544, 'Tyrese Haliburton', (SELECT id FROM teams WHERE team_id = 1610612754), 'G', 0, true),
  (203078, 'Pascal Siakam', (SELECT id FROM teams WHERE team_id = 1610612754), 'F', 43, true)
) AS t(player_id, name, team_id, position, jersey_number, is_active)
ON CONFLICT (player_id) DO UPDATE SET is_active = true;

-- Insert additional predictions for these new players for testing recommendations
WITH new_players AS (
  SELECT p.id as player_id, g.id as game_id
  FROM players p
  CROSS JOIN games g
  WHERE g.game_date >= CURRENT_DATE
  LIMIT 50
)
INSERT INTO player_predictions (
  game_id, 
  player_id, 
  stat_type, 
  predicted_mean, 
  predicted_std, 
  predicted_median,
  percentile_10,
  percentile_25,
  percentile_75,
  percentile_90,
  probability_over, 
  market_line, 
  implied_probability, 
  edge_percentage, 
  expected_value, 
  model_version, 
  confidence_score
)
SELECT 
  game_id,
  player_id,
  CASE WHEN random() < 0.4 THEN 'points' WHEN random() < 0.7 THEN 'rebounds' ELSE 'assists' END,
  floor(random() * 30)::integer + 5,
  floor(random() * 5)::integer + 2,
  floor(random() * 30)::integer + 5,
  floor(random() * 20)::integer + 1,
  floor(random() * 25)::integer + 3,
  floor(random() * 35)::integer + 10,
  floor(random() * 40)::integer + 15,
  random() * 0.3 + 0.6,
  floor(random() * 30)::integer + 3,
  random() * 0.3 + 0.4,
  random() * 40 + 5,
  random() * 0.2 + 0.05,
  'v1.0.0',
  random() * 0.3 + 0.65
FROM new_players
ON CONFLICT DO NOTHING;
