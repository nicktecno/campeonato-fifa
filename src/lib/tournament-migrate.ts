import { Tournament } from "./types";

/** IDs de grupo/partida eram globais (group-a, ko-r0-m0) — prefixa com tournamentId. */
export function migrateTournamentIds(tournament: Tournament): boolean {
  const prefix = `${tournament.id}-`;
  const needsGroupMigrate = tournament.groups.some((g) => !g.id.startsWith(prefix));
  const needsMatchMigrate = tournament.matches.some((m) => !m.id.startsWith(prefix));

  if (!needsGroupMigrate && !needsMatchMigrate) return false;

  const groupMap = new Map<string, string>();
  for (const g of tournament.groups) {
    if (!g.id.startsWith(prefix)) {
      groupMap.set(g.id, `${prefix}${g.id}`);
    }
  }
  for (const g of tournament.groups) {
    if (groupMap.has(g.id)) g.id = groupMap.get(g.id)!;
  }

  const matchMap = new Map<string, string>();
  for (const m of tournament.matches) {
    if (!m.id.startsWith(prefix)) {
      matchMap.set(m.id, `${prefix}${m.id}`);
    }
  }

  for (const m of tournament.matches) {
    if (m.groupId && groupMap.has(m.groupId)) {
      m.groupId = groupMap.get(m.groupId)!;
    }
    if (matchMap.has(m.id)) m.id = matchMap.get(m.id)!;
    if (m.nextMatchId && matchMap.has(m.nextMatchId)) {
      m.nextMatchId = matchMap.get(m.nextMatchId)!;
    }
  }

  return true;
}
