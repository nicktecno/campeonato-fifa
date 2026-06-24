"use client";

import { Tournament } from "@/lib/types";
import { MatchCard } from "./MatchCard";
import {
  getKnockoutRoundLabel,
  getKnockoutTotalRounds,
} from "@/lib/bracket";

interface BracketViewProps {
  tournament: Tournament;
}

export function BracketView({ tournament }: BracketViewProps) {
  const knockoutMatches = tournament.matches.filter(
    (m) => m.phase === "knockout"
  );

  if (knockoutMatches.length === 0) {
    return (
      <div className="text-center py-12 text-white/50">
        Mata-mata será gerado após a fase de grupos
      </div>
    );
  }

  const qualifiedCount = knockoutMatches.filter(
    (m) => m.round === 0
  ).length * 2;
  const totalRounds = getKnockoutTotalRounds(qualifiedCount);
  const rounds = Array.from({ length: totalRounds }, (_, i) => i);

  const matchesByRound = rounds.map((round) =>
    knockoutMatches
      .filter((m) => m.round === round)
      .sort((a, b) => a.position - b.position)
  );

  const maxMatchesInRound = Math.max(
    ...matchesByRound.map((m) => m.length),
    1
  );

  const finalMatch = knockoutMatches.find(
    (m) => m.round === totalRounds - 1
  );
  const champion = tournament.players.find(
    (p) => p.id === finalMatch?.winnerId
  );

  return (
    <div className="relative overflow-x-auto pb-8">
      <div className="absolute inset-0 pitch-gradient pitch-lines opacity-30 rounded-2xl pointer-events-none" />

      <div className="relative flex gap-8 min-w-max p-6">
        {rounds.map((round) => {
          const matches = matchesByRound[round];
          const gap =
            maxMatchesInRound > 1 ? Math.pow(2, round) * 80 - 80 : 0;

          return (
            <div key={round} className="flex flex-col">
              <h3 className="text-center text-gold font-bold text-sm mb-4 uppercase tracking-wider">
                {getKnockoutRoundLabel(round, totalRounds)}
              </h3>
              <div
                className="flex flex-col justify-around flex-1"
                style={{ gap: `${Math.max(gap, 16)}px` }}
              >
                {matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    players={tournament.players}
                    teamType={tournament.teamType}
                    tournamentId={tournament.id}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {champion && (
          <div className="flex flex-col justify-center items-center min-w-[200px]">
            <div className="text-gold text-4xl mb-2">🏆</div>
            <h3 className="text-gold font-bold text-lg uppercase tracking-wider mb-2">
              Campeão
            </h3>
            <div className="text-center bg-gold/10 border border-gold/40 rounded-xl p-4">
              <p className="text-xl font-bold text-gold">{champion.name}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
