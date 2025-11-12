-- Add more teams from different divisions
INSERT INTO teams (name, abbreviation, city, conference, division) VALUES
  ('Los Angeles Lakers', 'LAL', 'Los Angeles', 'Western', 'Pacific'),
  ('Boston Celtics', 'BOS', 'Boston', 'Eastern', 'Atlantic'),
  ('Milwaukee Bucks', 'MIL', 'Milwaukee', 'Eastern', 'Central'),
  ('Phoenix Suns', 'PHX', 'Phoenix', 'Western', 'Pacific'),
  ('Brooklyn Nets', 'BKN', 'Brooklyn', 'Eastern', 'Atlantic'),
  ('Denver Nuggets', 'DEN', 'Denver', 'Western', 'Northwest'),
  ('Philadelphia 76ers', 'PHI', 'Philadelphia', 'Eastern', 'Atlantic'),
  ('Dallas Mavericks', 'DAL', 'Dallas', 'Western', 'Southwest')
ON CONFLICT (abbreviation) DO NOTHING;

-- Get team IDs for reference
DO $$
DECLARE
  lakers_id UUID;
  celtics_id UUID;
  bucks_id UUID;
  suns_id UUID;
  nets_id UUID;
  nuggets_id UUID;
  sixers_id UUID;
  mavs_id UUID;
  pistons_id UUID;
  heat_id UUID;
  warriors_id UUID;
BEGIN
  -- Get team IDs
  SELECT id INTO lakers_id FROM teams WHERE abbreviation = 'LAL';
  SELECT id INTO celtics_id FROM teams WHERE abbreviation = 'BOS';
  SELECT id INTO bucks_id FROM teams WHERE abbreviation = 'MIL';
  SELECT id INTO suns_id FROM teams WHERE abbreviation = 'PHX';
  SELECT id INTO nets_id FROM teams WHERE abbreviation = 'BKN';
  SELECT id INTO nuggets_id FROM teams WHERE abbreviation = 'DEN';
  SELECT id INTO sixers_id FROM teams WHERE abbreviation = 'PHI';
  SELECT id INTO mavs_id FROM teams WHERE abbreviation = 'DAL';
  SELECT id INTO pistons_id FROM teams WHERE abbreviation = 'DET';
  SELECT id INTO heat_id FROM teams WHERE abbreviation = 'MIA';
  SELECT id INTO warriors_id FROM teams WHERE abbreviation = 'GSW';

  -- Add more star players from different teams
  INSERT INTO players (name, team_id, position, jersey_number, height_inches, weight_lbs) VALUES
    ('LeBron James', lakers_id, 'SF', '23', 81, 250),
    ('Anthony Davis', lakers_id, 'PF', '3', 82, 253),
    ('Jayson Tatum', celtics_id, 'SF', '0', 80, 210),
    ('Jaylen Brown', celtics_id, 'SG', '7', 78, 223),
    ('Giannis Antetokounmpo', bucks_id, 'PF', '34', 83, 242),
    ('Damian Lillard', bucks_id, 'PG', '0', 74, 195),
    ('Kevin Durant', suns_id, 'SF', '35', 82, 240),
    ('Devin Booker', suns_id, 'SG', '1', 77, 206),
    ('Mikal Bridges', nets_id, 'SF', '1', 79, 210),
    ('Nikola Jokic', nuggets_id, 'C', '15', 83, 284),
    ('Jamal Murray', nuggets_id, 'PG', '27', 76, 215),
    ('Joel Embiid', sixers_id, 'C', '21', 84, 280),
    ('Tyrese Maxey', sixers_id, 'PG', '0', 74, 200),
    ('Luka Doncic', mavs_id, 'PG', '77', 79, 230),
    ('Kyrie Irving', mavs_id, 'PG', '2', 74, 195)
  ON CONFLICT (name) DO NOTHING;

  -- Add sample games for today and tomorrow
  INSERT INTO games (home_team_id, away_team_id, game_date, season, status) VALUES
    (lakers_id, celtics_id, CURRENT_DATE, 2024, 'scheduled'),
    (bucks_id, suns_id, CURRENT_DATE, 2024, 'scheduled'),
    (nets_id, nuggets_id, CURRENT_DATE, 2024, 'scheduled'),
    (sixers_id, mavs_id, CURRENT_DATE, 2024, 'scheduled'),
    (heat_id, warriors_id, CURRENT_DATE, 2024, 'scheduled'),
    (pistons_id, lakers_id, CURRENT_DATE + INTERVAL '1 day', 2024, 'scheduled')
  ON CONFLICT DO NOTHING;

END $$;
