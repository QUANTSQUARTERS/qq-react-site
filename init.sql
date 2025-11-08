-- Create leagues table
CREATE TABLE IF NOT EXISTS leagues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    logo_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    league_id INTEGER REFERENCES leagues(id),
    country VARCHAR(100),
    logo_url VARCHAR(255),
    founded_year INTEGER,
    stadium VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    home_team_id INTEGER REFERENCES teams(id),
    away_team_id INTEGER REFERENCES teams(id),
    league_id INTEGER REFERENCES leagues(id),
    match_date TIMESTAMP WITH TIME ZONE,
    home_score INTEGER,
    away_score INTEGER,
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    team_id INTEGER REFERENCES teams(id),
    position VARCHAR(50),
    nationality VARCHAR(100),
    date_of_birth DATE,
    jersey_number INTEGER,
    photo_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create team_statistics table
CREATE TABLE IF NOT EXISTS team_statistics (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id),
    league_id INTEGER REFERENCES leagues(id),
    season VARCHAR(20),
    matches_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample leagues
INSERT INTO leagues (id, name, country, logo_url) VALUES
(1, 'Premier League', 'England', '/images/leagues/premier-league.png'),
(2, 'La Liga', 'Spain', '/images/leagues/la-liga.png'),
(3, 'Serie A', 'Italy', '/images/leagues/serie-a.png'),
(4, 'Bundesliga', 'Germany', '/images/leagues/bundesliga.png'),
(5, 'Ligue 1', 'France', '/images/leagues/ligue-1.png');

-- Insert sample teams
INSERT INTO teams (id, name, league_id, country, logo_url, founded_year, stadium, description) VALUES
(1, 'Manchester United', 1, 'England', '/images/teams/manchester-united.png', 1878, 'Old Trafford', 'One of the most successful clubs in English football history, with a rich tradition and global fanbase.'),
(2, 'Liverpool', 1, 'England', '/images/teams/liverpool.png', 1892, 'Anfield', 'A historic club known for its passionate supporters and attacking style of play.'),
(3, 'Manchester City', 1, 'England', '/images/teams/manchester-city.png', 1880, 'Etihad Stadium', 'Modern powerhouse with state-of-the-art facilities and recent domestic dominance.'),
(4, 'Real Madrid', 2, 'Spain', '/images/teams/real-madrid.png', 1902, 'Santiago Bernabéu', 'The most successful club in European competition history with 14 Champions League titles.'),
(5, 'Barcelona', 2, 'Spain', '/images/teams/barcelona.png', 1899, 'Camp Nou', 'Famous for its tiki-taka style and producing some of the world''s greatest players.'),
(6, 'AC Milan', 3, 'Italy', '/images/teams/ac-milan.png', 1899, 'San Siro', 'One of Italy''s most successful clubs with a rich European history.'),
(7, 'Juventus', 3, 'Italy', '/images/teams/juventus.png', 1897, 'Allianz Stadium', 'Record-holding Serie A champions with a storied legacy in Italian football.'),
(8, 'Bayern Munich', 4, 'Germany', '/images/teams/bayern-munich.png', 1900, 'Allianz Arena', 'The dominant force in German football with consistent Champions League success.'),
(9, 'Paris Saint-Germain', 5, 'France', '/images/teams/psg.png', 1970, 'Parc des Princes', 'French giants with significant investment and star-studded squads.');

-- Insert sample matches
INSERT INTO matches (id, home_team_id, away_team_id, league_id, match_date, home_score, away_score, status) VALUES
(1, 1, 2, 1, '2024-01-15 15:00:00+00', 2, 1, 'finished'),
(2, 3, 1, 1, '2024-01-20 17:30:00+00', 3, 2, 'finished'),
(3, 4, 5, 2, '2024-01-18 20:00:00+00', 1, 1, 'finished'),
(4, 6, 7, 3, '2024-01-22 18:00:00+00', 2, 0, 'finished'),
(5, 8, 9, 4, '2024-01-25 19:30:00+00', 4, 1, 'finished');

-- Insert sample team statistics
INSERT INTO team_statistics (team_id, league_id, season, matches_played, wins, draws, losses, goals_for, goals_against, points) VALUES
(1, 1, '2023-24', 20, 12, 5, 3, 35, 20, 41),
(2, 1, '2023-24', 20, 11, 6, 3, 38, 22, 39),
(3, 1, '2023-24', 20, 14, 4, 2, 42, 18, 46),
(4, 2, '2023-24', 20, 15, 3, 2, 45, 15, 48),
(5, 2, '2023-24', 20, 13, 5, 2, 40, 19, 44),
(6, 3, '2023-24', 20, 10, 7, 3, 32, 21, 37),
(7, 3, '2023-24', 20, 12, 5, 3, 36, 23, 41),
(8, 4, '2023-24', 20, 16, 2, 2, 48, 16, 50),
(9, 5, '2023-24', 20, 14, 4, 2, 44, 20, 46);
