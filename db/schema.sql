-- Execute no SQL Editor do Neon após criar o projeto

CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  team_type TEXT NOT NULL CHECK (team_type IN ('club', 'national')),
  status TEXT NOT NULL DEFAULT 'registration'
    CHECK (status IN ('registration', 'group_stage', 'knockout', 'finished')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  team_id TEXT NOT NULL,
  avatar TEXT
);

CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  player_ids JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (phase IN ('group', 'knockout')),
  group_id TEXT,
  round INT NOT NULL,
  position INT NOT NULL,
  player1_id TEXT,
  player2_id TEXT,
  score1 INT,
  score2 INT,
  winner_id TEXT,
  next_match_id TEXT,
  next_slot INT CHECK (next_slot IN (1, 2))
);

CREATE INDEX IF NOT EXISTS idx_players_tournament ON players(tournament_id);
CREATE INDEX IF NOT EXISTS idx_groups_tournament ON groups(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches(tournament_id);
