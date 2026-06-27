import { Tournament } from "./types";

/** Jogador eliminado no mata-mata (perdeu uma partida) ou não é o campeão após o fim. */
export function isPlayerEliminated(
  tournament: Tournament,
  playerId: string
): boolean {
  if (tournament.status === "registration" || tournament.status === "group_stage") {
    return false;
  }

  if (tournament.status === "finished") {
    const finalMatch = tournament.matches
      .filter((m) => m.phase === "knockout")
      .sort((a, b) => b.round - a.round)[0];
    return finalMatch?.winnerId !== playerId;
  }

  const knockoutMatches = tournament.matches.filter(
    (m) =>
      m.phase === "knockout" &&
      (m.player1Id === playerId || m.player2Id === playerId)
  );

  return knockoutMatches.some(
    (m) => m.winnerId && m.winnerId !== playerId
  );
}

/** Times em uso por jogadores ainda ativos no campeonato. */
export function getTakenTeamIds(
  tournament: Tournament,
  excludePlayerId?: string
): string[] {
  return tournament.players
    .filter((p) => {
      if (p.id === excludePlayerId) return false;
      if (tournament.status === "registration") return true;
      return !isPlayerEliminated(tournament, p.id);
    })
    .map((p) => p.teamId);
}
