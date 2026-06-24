import { Tournament, Match, Player } from "./types";
import {
  createGroups,
  generateGroupMatches,
  isGroupStageComplete,
  seedKnockoutFromGroups,
} from "./groups";
import { isDbEnabled } from "./db";
import {
  dbGetTournament,
  dbGetAllTournaments,
  dbSaveTournament,
  dbDeleteTournament,
} from "./repository";

const globalForStore = globalThis as unknown as {
  tournaments: Map<string, Tournament> | undefined;
};

const tournaments =
  globalForStore.tournaments ?? new Map<string, Tournament>();

if (process.env.NODE_ENV !== "production") {
  globalForStore.tournaments = tournaments;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function memoryGet(id: string): Tournament | undefined {
  return tournaments.get(id);
}

function memorySave(t: Tournament): void {
  tournaments.set(t.id, t);
}

function advanceToKnockout(tournament: Tournament): void {
  const { matches: knockoutMatches } = seedKnockoutFromGroups(
    tournament.groups,
    tournament.matches,
    tournament.players
  );
  tournament.matches = [...tournament.matches, ...knockoutMatches];
  tournament.status = "knockout";
}

function propagateWinner(
  tournament: Tournament,
  match: Match,
  winnerId: string | null
): void {
  if (!match.nextMatchId || !match.nextSlot) return;

  const nextMatch = tournament.matches.find((m) => m.id === match.nextMatchId);
  if (!nextMatch) return;

  if (match.nextSlot === 1) {
    nextMatch.player1Id = winnerId;
  } else {
    nextMatch.player2Id = winnerId;
  }

  nextMatch.score1 = null;
  nextMatch.score2 = null;
  nextMatch.winnerId = null;

  if (nextMatch.nextMatchId) {
    propagateWinner(tournament, nextMatch, null);
  }
}

async function persist(t: Tournament): Promise<void> {
  if (isDbEnabled()) {
    await dbSaveTournament(t);
  } else {
    memorySave(t);
  }
}

async function load(id: string): Promise<Tournament | undefined> {
  if (isDbEnabled()) {
    const t = await dbGetTournament(id);
    return t ?? undefined;
  }
  return memoryGet(id);
}

export async function createTournament(
  name: string,
  teamType: "club" | "national"
): Promise<Tournament> {
  const tournament: Tournament = {
    id: generateId(),
    name,
    teamType,
    status: "registration",
    players: [],
    groups: [],
    matches: [],
    createdAt: new Date().toISOString(),
  };

  await persist(tournament);
  return tournament;
}

export async function registerPlayer(
  tournamentId: string,
  data: { name: string; teamId: string; avatar?: string }
): Promise<Player | { error: string }> {
  const tournament = await load(tournamentId);
  if (!tournament || tournament.status !== "registration") {
    return { error: "Campeonato fechado ou não encontrado" };
  }

  if (tournament.players.some((p) => p.teamId === data.teamId)) {
    return { error: "Este time já foi escolhido por outro jogador" };
  }

  const player: Player = {
    id: `player-${generateId()}`,
    name: data.name,
    teamId: data.teamId,
    avatar: data.avatar,
  };

  tournament.players.push(player);
  await persist(tournament);
  return player;
}

export async function updatePlayer(
  tournamentId: string,
  playerId: string,
  data: { name?: string; teamId?: string; avatar?: string }
): Promise<Player | { error: string }> {
  const tournament = await load(tournamentId);
  if (!tournament || tournament.status !== "registration") {
    return { error: "Campeonato fechado ou não encontrado" };
  }

  const player = tournament.players.find((p) => p.id === playerId);
  if (!player) {
    return { error: "Jogador não encontrado" };
  }

  if (data.name !== undefined) {
    const trimmed = data.name.trim();
    if (!trimmed) return { error: "Nome é obrigatório" };
    player.name = trimmed;
  }

  if (data.teamId !== undefined) {
    if (
      data.teamId !== player.teamId &&
      tournament.players.some(
        (p) => p.id !== playerId && p.teamId === data.teamId
      )
    ) {
      return { error: "Este time já foi escolhido por outro jogador" };
    }
    player.teamId = data.teamId;
  }

  if (data.avatar !== undefined) {
    player.avatar = data.avatar || undefined;
  }

  await persist(tournament);
  return player;
}

export async function getTakenTeamIds(
  tournamentId: string
): Promise<string[]> {
  const tournament = await load(tournamentId);
  if (!tournament) return [];
  return tournament.players.map((p) => p.teamId);
}

export async function startTournament(
  tournamentId: string
): Promise<Tournament | null> {
  const tournament = await load(tournamentId);
  if (!tournament || tournament.status !== "registration") return null;
  if (tournament.players.length < 4) return null;

  const groups = createGroups(tournament.players);
  const groupMatches = generateGroupMatches(groups);

  tournament.groups = groups;
  tournament.matches = groupMatches;
  tournament.status = "group_stage";

  await persist(tournament);
  return tournament;
}

export async function getTournament(
  id: string
): Promise<Tournament | undefined> {
  return load(id);
}

export async function getAllTournaments(): Promise<Tournament[]> {
  if (isDbEnabled()) {
    return dbGetAllTournaments();
  }
  return Array.from(tournaments.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function updateMatchScore(
  tournamentId: string,
  matchId: string,
  score1: number,
  score2: number
): Promise<Tournament | null> {
  const tournament = await load(tournamentId);
  if (!tournament) return null;

  const match = tournament.matches.find((m) => m.id === matchId);
  if (!match) return null;

  match.score1 = score1;
  match.score2 = score2;

  if (match.phase === "group") {
    if (score1 > score2) match.winnerId = match.player1Id;
    else if (score2 > score1) match.winnerId = match.player2Id;
    else match.winnerId = null;

    if (
      tournament.status === "group_stage" &&
      isGroupStageComplete(tournament.groups, tournament.matches)
    ) {
      advanceToKnockout(tournament);
    }
  } else {
    if (score1 === score2) {
      match.winnerId = null;
      propagateWinner(tournament, match, null);
    } else {
      const winnerId = score1 > score2 ? match.player1Id : match.player2Id;
      match.winnerId = winnerId;
      propagateWinner(tournament, match, winnerId);

      const finalMatch = tournament.matches
        .filter((m) => m.phase === "knockout")
        .sort((a, b) => b.round - a.round)[0];
      if (finalMatch?.winnerId) {
        tournament.status = "finished";
      }
    }
  }

  await persist(tournament);
  return tournament;
}

export async function updateTournament(
  id: string,
  data: { name?: string; teamType?: "club" | "national" }
): Promise<Tournament | null> {
  const tournament = await load(id);
  if (!tournament) return null;

  if (data.name !== undefined) {
    const trimmed = data.name.trim();
    if (!trimmed) return null;
    tournament.name = trimmed;
  }

  if (data.teamType !== undefined) {
    if (tournament.status !== "registration") return null;
    tournament.teamType = data.teamType;
  }

  await persist(tournament);
  return tournament;
}

export async function deleteTournament(id: string): Promise<boolean> {
  if (isDbEnabled()) {
    return dbDeleteTournament(id);
  }
  return tournaments.delete(id);
}
