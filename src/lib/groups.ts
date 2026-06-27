import { Group, Match, Player, GroupStanding } from "./types";
import { generateKnockoutBracket } from "./bracket";

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const GROUP_NAMES = ["A", "B", "C", "D", "E", "F", "G", "H"];

export function createGroups(players: Player[]): Group[] {
  const shuffled = shuffle(players);
  const groupCount = Math.max(2, Math.ceil(shuffled.length / 4));
  const groups: Group[] = [];

  for (let i = 0; i < groupCount; i++) {
    groups.push({
      id: `group-${GROUP_NAMES[i].toLowerCase()}`,
      name: `Grupo ${GROUP_NAMES[i]}`,
      playerIds: [],
    });
  }

  shuffled.forEach((player, index) => {
    groups[index % groupCount].playerIds.push(player.id);
  });

  return groups.filter((g) => g.playerIds.length > 0);
}

export function generateGroupMatches(groups: Group[]): Match[] {
  const matches: Match[] = [];

  for (const group of groups) {
    const players = group.playerIds;
    let position = 0;

    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        matches.push({
          id: `${group.id}-m${position}`,
          phase: "group",
          groupId: group.id,
          round: 0,
          position,
          player1Id: players[i],
          player2Id: players[j],
          score1: null,
          score2: null,
          winnerId: null,
          nextMatchId: null,
          nextSlot: null,
        });
        position++;
      }
    }
  }

  return matches;
}

export function calculateStandings(
  group: Group,
  matches: Match[]
): GroupStanding[] {
  const standings: Map<string, GroupStanding> = new Map();

  for (const playerId of group.playerIds) {
    standings.set(playerId, {
      playerId,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  }

  const groupMatches = matches.filter(
    (m) => m.groupId === group.id && m.score1 !== null && m.score2 !== null
  );

  for (const match of groupMatches) {
    if (!match.player1Id || !match.player2Id) continue;

    const s1 = standings.get(match.player1Id)!;
    const s2 = standings.get(match.player2Id)!;

    s1.played++;
    s2.played++;
    s1.goalsFor += match.score1!;
    s1.goalsAgainst += match.score2!;
    s2.goalsFor += match.score2!;
    s2.goalsAgainst += match.score1!;

    if (match.score1! > match.score2!) {
      s1.wins++;
      s1.points += 3;
      s2.losses++;
    } else if (match.score2! > match.score1!) {
      s2.wins++;
      s2.points += 3;
      s1.losses++;
    } else {
      s1.draws++;
      s2.draws++;
      s1.points += 1;
      s2.points += 1;
    }
  }

  return Array.from(standings.values())
    .map((s) => ({
      ...s,
      goalDifference: s.goalsFor - s.goalsAgainst,
    }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference)
        return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
}

export function isGroupStageComplete(
  groups: Group[],
  matches: Match[]
): boolean {
  const groupMatches = matches.filter((m) => m.phase === "group");
  return (
    groupMatches.length > 0 &&
    groupMatches.every((m) => m.score1 !== null && m.score2 !== null)
  );
}

export function calculateGlobalStandings(
  groups: Group[],
  matches: Match[]
): GroupStanding[] {
  const all = groups.flatMap((group) => calculateStandings(group, matches));
  return all.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference)
      return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
}

export function getQualifiedPlayers(
  groups: Group[],
  matches: Match[]
): Player[] {
  const standings = calculateGlobalStandings(groups, matches);
  return standings.map(({ playerId }) => ({ id: playerId }) as Player);
}

export function seedKnockoutFromGroups(
  groups: Group[],
  matches: Match[],
  allPlayers: Player[]
): { playerIds: string[]; matches: Match[] } {
  const globalStandings = calculateGlobalStandings(groups, matches);

  const orderedPlayers = globalStandings
    .map((s) => allPlayers.find((p) => p.id === s.playerId))
    .filter((p): p is Player => !!p);

  const knockoutMatches = generateKnockoutBracket(orderedPlayers, {
    seeded: true,
  });

  return {
    playerIds: orderedPlayers.map((p) => p.id),
    matches: knockoutMatches,
  };
}
