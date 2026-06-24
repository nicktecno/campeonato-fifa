import { Tournament, Match, Player } from "./types";
import {
  createGroups,
  generateGroupMatches,
  isGroupStageComplete,
  seedKnockoutFromGroups,
} from "./groups";

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

export function createTournament(
  name: string,
  teamType: "club" | "national"
): Tournament {
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

  tournaments.set(tournament.id, tournament);
  return tournament;
}

export function registerPlayer(
  tournamentId: string,
  data: { name: string; teamId: string; avatar?: string }
): Player | null {
  const tournament = tournaments.get(tournamentId);
  if (!tournament || tournament.status !== "registration") return null;

  const player: Player = {
    id: `player-${generateId()}`,
    name: data.name,
    teamId: data.teamId,
    avatar: data.avatar,
  };

  tournament.players.push(player);
  return player;
}

export function startTournament(tournamentId: string): Tournament | null {
  const tournament = tournaments.get(tournamentId);
  if (!tournament || tournament.status !== "registration") return null;
  if (tournament.players.length < 4) return null;

  const groups = createGroups(tournament.players);
  const groupMatches = generateGroupMatches(groups);

  tournament.groups = groups;
  tournament.matches = groupMatches;
  tournament.status = "group_stage";

  return tournament;
}

export function getTournament(id: string): Tournament | undefined {
  return tournaments.get(id);
}

export function getAllTournaments(): Tournament[] {
  return Array.from(tournaments.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function updateMatchScore(
  tournamentId: string,
  matchId: string,
  score1: number,
  score2: number
): Tournament | null {
  const tournament = tournaments.get(tournamentId);
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

  return tournament;
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

export function updateTournament(
  id: string,
  data: { name?: string; teamType?: "club" | "national" }
): Tournament | null {
  const tournament = tournaments.get(id);
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

  return tournament;
}

export function deleteTournament(id: string): boolean {
  return tournaments.delete(id);
}
