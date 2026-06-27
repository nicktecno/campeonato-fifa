-- Permite que jogadores eliminados e ativos tenham o mesmo team_id no banco
-- (a unicidade é garantida só entre jogadores ativos na aplicação).
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_tournament_id_team_id_key;
