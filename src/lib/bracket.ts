import { Match, Player } from "./types";

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

export function generateKnockoutBracket(
  players: Player[],
  options: { seeded?: boolean; tournamentId: string }
): Match[] {
  const ordered = options.seeded ? players : shuffle(players);
  const bracketSize = nextPowerOfTwo(ordered.length);
  const totalRounds = Math.log2(bracketSize);
  const matches: Match[] = [];
  const firstRoundCount = bracketSize / 2;
  const used = new Set<number>();
  const prefix = `${options.tournamentId}-`;

  for (let i = 0; i < firstRoundCount; i++) {
    let p1: Player | null = null;
    let p2: Player | null = null;

    if (options?.seeded) {
      const top = i;
      const bottom = ordered.length - 1 - i;

      if (top > bottom || used.has(top)) {
        p1 = null;
        p2 = null;
      } else if (top === bottom) {
        p1 = ordered[top] ?? null;
        p2 = null;
        used.add(top);
      } else {
        p1 = ordered[top] ?? null;
        p2 = ordered[bottom] ?? null;
        used.add(top);
        used.add(bottom);
      }
    } else {
      p1 = ordered[i * 2] ?? null;
      p2 = ordered[i * 2 + 1] ?? null;
    }

    matches.push({
      id: `${prefix}ko-r0-m${i}`,
      phase: "knockout",
      round: 0,
      position: i,
      player1Id: p1?.id ?? null,
      player2Id: p2?.id ?? null,
      score1: null,
      score2: null,
      winnerId: null,
      nextMatchId: null,
      nextSlot: null,
    });
  }

  for (let round = 1; round < totalRounds; round++) {
    const matchesInRound = bracketSize / Math.pow(2, round + 1);
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        id: `${prefix}ko-r${round}-m${i}`,
        phase: "knockout",
        round,
        position: i,
        player1Id: null,
        player2Id: null,
        score1: null,
        score2: null,
        winnerId: null,
        nextMatchId:
          round < totalRounds - 1
            ? `${prefix}ko-r${round + 1}-m${Math.floor(i / 2)}`
            : null,
        nextSlot:
          round < totalRounds - 1
            ? ((i % 2 === 0 ? 1 : 2) as 1 | 2)
            : null,
      });
    }
  }

  for (let i = 0; i < firstRoundCount; i++) {
    const nextRound = 1;
    const nextPos = Math.floor(i / 2);
    matches[i].nextMatchId = `${prefix}ko-r${nextRound}-m${nextPos}`;
    matches[i].nextSlot = (i % 2 === 0 ? 1 : 2) as 1 | 2;
  }

  for (let round = 1; round < totalRounds - 1; round++) {
    const matchesInRound = bracketSize / Math.pow(2, round + 1);
    for (let i = 0; i < matchesInRound; i++) {
      const match = matches.find((m) => m.id === `${prefix}ko-r${round}-m${i}`);
      if (match) {
        match.nextMatchId = `${prefix}ko-r${round + 1}-m${Math.floor(i / 2)}`;
        match.nextSlot = (i % 2 === 0 ? 1 : 2) as 1 | 2;
      }
    }
  }

  return matches;
}

export function getKnockoutRoundLabel(
  round: number,
  totalRounds: number
): string {
  const remaining = totalRounds - round;
  if (remaining === 1) return "Final";
  if (remaining === 2) return "Semifinal";
  if (remaining === 3) return "Quartas";
  if (remaining === 4) return "Oitavas";
  return `Rodada ${round + 1}`;
}

export function getKnockoutTotalRounds(playerCount: number): number {
  return Math.log2(nextPowerOfTwo(playerCount));
}
