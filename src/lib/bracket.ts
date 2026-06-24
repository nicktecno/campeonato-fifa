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

export function generateKnockoutBracket(players: Player[]): Match[] {
  const shuffled = shuffle(players);
  const bracketSize = nextPowerOfTwo(shuffled.length);
  const totalRounds = Math.log2(bracketSize);
  const matches: Match[] = [];

  const firstRoundCount = bracketSize / 2;
  for (let i = 0; i < firstRoundCount; i++) {
    const p1 = shuffled[i * 2] ?? null;
    const p2 = shuffled[i * 2 + 1] ?? null;
    matches.push({
      id: `ko-r0-m${i}`,
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
        id: `ko-r${round}-m${i}`,
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
            ? `ko-r${round + 1}-m${Math.floor(i / 2)}`
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
    matches[i].nextMatchId = `ko-r${nextRound}-m${nextPos}`;
    matches[i].nextSlot = (i % 2 === 0 ? 1 : 2) as 1 | 2;
  }

  for (let round = 1; round < totalRounds - 1; round++) {
    const matchesInRound = bracketSize / Math.pow(2, round + 1);
    for (let i = 0; i < matchesInRound; i++) {
      const match = matches.find((m) => m.id === `ko-r${round}-m${i}`);
      if (match) {
        match.nextMatchId = `ko-r${round + 1}-m${Math.floor(i / 2)}`;
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
