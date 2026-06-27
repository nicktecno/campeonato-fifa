import { Match, Player, Tournament } from "./types";
import { getDb } from "./db";

function rowToPlayer(row: {
  id: string;
  name: string;
  team_id: string;
  avatar: string | null;
}): Player {
  return {
    id: row.id,
    name: row.name,
    teamId: row.team_id,
    avatar: row.avatar ?? undefined,
  };
}

function rowToMatch(row: {
  id: string;
  phase: string;
  group_id: string | null;
  round: number;
  position: number;
  player1_id: string | null;
  player2_id: string | null;
  score1: number | null;
  score2: number | null;
  winner_id: string | null;
  next_match_id: string | null;
  next_slot: number | null;
}): Match {
  return {
    id: row.id,
    phase: row.phase as Match["phase"],
    groupId: row.group_id ?? undefined,
    round: row.round,
    position: row.position,
    player1Id: row.player1_id,
    player2Id: row.player2_id,
    score1: row.score1,
    score2: row.score2,
    winnerId: row.winner_id,
    nextMatchId: row.next_match_id,
    nextSlot: row.next_slot as 1 | 2 | null,
  };
}

export async function dbGetTournament(id: string): Promise<Tournament | null> {
  const sql = getDb();
  if (!sql) return null;

  const rows = await sql`
    SELECT id, name, team_type, status, created_at
    FROM tournaments WHERE id = ${id}
  `;
  if (!rows.length) return null;

  const t = rows[0];
  const players = await sql`
    SELECT id, name, team_id, avatar FROM players
    WHERE tournament_id = ${id} ORDER BY id
  `;
  const groups = await sql`
    SELECT id, name, player_ids FROM groups
    WHERE tournament_id = ${id} ORDER BY id
  `;
  const matches = await sql`
    SELECT id, phase, group_id, round, position,
           player1_id, player2_id, score1, score2,
           winner_id, next_match_id, next_slot
    FROM matches WHERE tournament_id = ${id}
    ORDER BY phase, round, position
  `;

  return {
    id: t.id,
    name: t.name,
    teamType: t.team_type as Tournament["teamType"],
    status: t.status as Tournament["status"],
    createdAt: new Date(t.created_at).toISOString(),
    players: (players as Parameters<typeof rowToPlayer>[0][]).map(rowToPlayer),
    groups: (groups as { id: string; name: string; player_ids: string[] }[]).map(
      (g) => ({
        id: g.id,
        name: g.name,
        playerIds: g.player_ids as string[],
      })
    ),
    matches: (matches as Parameters<typeof rowToMatch>[0][]).map(rowToMatch),
  };
}

export async function dbListTournamentIds(): Promise<string[]> {
  const sql = getDb();
  if (!sql) return [];

  const rows = await sql`
    SELECT id FROM tournaments ORDER BY created_at DESC
  `;
  return rows.map((row) => row.id as string);
}

export async function dbGetAllTournaments(): Promise<Tournament[]> {
  const sql = getDb();
  if (!sql) return [];

  const rows = await sql`
    SELECT id FROM tournaments ORDER BY created_at DESC
  `;

  const tournaments: Tournament[] = [];
  for (const row of rows) {
    const t = await dbGetTournament(row.id);
    if (t) tournaments.push(t);
  }
  return tournaments;
}

export async function dbUpdatePlayer(
  tournamentId: string,
  playerId: string,
  updates: {
    name?: string;
    teamId?: string;
    avatar?: string | null;
  }
): Promise<boolean> {
  const sql = getDb();
  if (!sql) return false;

  const rows = await sql`
    SELECT id FROM players
    WHERE id = ${playerId} AND tournament_id = ${tournamentId}
  `;
  if (!rows.length) return false;

  if (updates.name !== undefined) {
    await sql`
      UPDATE players SET name = ${updates.name}
      WHERE id = ${playerId} AND tournament_id = ${tournamentId}
    `;
  }
  if (updates.teamId !== undefined) {
    await sql`
      UPDATE players SET team_id = ${updates.teamId}
      WHERE id = ${playerId} AND tournament_id = ${tournamentId}
    `;
  }
  if (updates.avatar !== undefined) {
    await sql`
      UPDATE players SET avatar = ${updates.avatar}
      WHERE id = ${playerId} AND tournament_id = ${tournamentId}
    `;
  }

  return true;
}

export async function dbSaveTournament(tournament: Tournament): Promise<void> {
  const sql = getDb();
  if (!sql) return;

  const statements = [
    sql`
      INSERT INTO tournaments (id, name, team_type, status, created_at)
      VALUES (
        ${tournament.id},
        ${tournament.name},
        ${tournament.teamType},
        ${tournament.status},
        ${tournament.createdAt}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        team_type = EXCLUDED.team_type,
        status = EXCLUDED.status
    `,
    sql`DELETE FROM matches WHERE tournament_id = ${tournament.id}`,
    sql`DELETE FROM groups WHERE tournament_id = ${tournament.id}`,
    sql`DELETE FROM players WHERE tournament_id = ${tournament.id}`,
  ];

  for (const player of tournament.players) {
    statements.push(
      sql`
        INSERT INTO players (id, tournament_id, name, team_id, avatar)
        VALUES (
          ${player.id},
          ${tournament.id},
          ${player.name},
          ${player.teamId},
          ${player.avatar ?? null}
        )
      `
    );
  }

  for (const group of tournament.groups) {
    statements.push(
      sql`
        INSERT INTO groups (id, tournament_id, name, player_ids)
        VALUES (
          ${group.id},
          ${tournament.id},
          ${group.name},
          ${JSON.stringify(group.playerIds)}::jsonb
        )
      `
    );
  }

  for (const match of tournament.matches) {
    statements.push(
      sql`
        INSERT INTO matches (
          id, tournament_id, phase, group_id, round, position,
          player1_id, player2_id, score1, score2,
          winner_id, next_match_id, next_slot
        ) VALUES (
          ${match.id},
          ${tournament.id},
          ${match.phase},
          ${match.groupId ?? null},
          ${match.round},
          ${match.position},
          ${match.player1Id},
          ${match.player2Id},
          ${match.score1},
          ${match.score2},
          ${match.winnerId},
          ${match.nextMatchId},
          ${match.nextSlot}
        )
      `
    );
  }

  await sql.transaction(statements);
}

export async function dbDeleteTournament(id: string): Promise<boolean> {
  const sql = getDb();
  if (!sql) return false;

  const result = await sql`
    DELETE FROM tournaments WHERE id = ${id} RETURNING id
  `;
  return result.length > 0;
}
