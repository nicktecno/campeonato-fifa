"use client";

import { useState } from "react";
import { Tournament } from "@/lib/types";
import { KnockoutMatchCard } from "./KnockoutMatchCard";
import {
  getKnockoutRoundLabel,
  getKnockoutTotalRounds,
} from "@/lib/bracket";

interface BracketViewProps {
  tournament: Tournament;
  onUpdate?: () => void;
}

export function BracketView({ tournament, onUpdate }: BracketViewProps) {
  const [editMode, setEditMode] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);

  const knockoutMatches = tournament.matches.filter(
    (m) => m.phase === "knockout"
  );

  const canEdit =
    tournament.status === "knockout" || tournament.status === "finished";

  const handleRegenerate = async () => {
    if (
      !confirm(
        "Regerar a chave pela classificação dos grupos? Os confrontos atuais do mata-mata serão substituídos."
      )
    ) {
      return;
    }

    setRegenerating(true);
    setRegenerateError(null);

    try {
      const res = await fetch(
        `/api/tournaments/${tournament.id}/knockout/regenerate`,
        { method: "POST" }
      );

      if (!res.ok) {
        const data = await res.json();
        setRegenerateError(data.error || "Erro ao regerar chave");
        return;
      }

      onUpdate?.();
    } catch {
      setRegenerateError("Erro de conexão");
    } finally {
      setRegenerating(false);
    }
  };

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
      {canEdit && (
        <div className="px-6 pt-4 pb-2 flex flex-wrap items-center gap-3 border-b border-white/10">
          <button
            type="button"
            onClick={() => setEditMode((v) => !v)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${
                editMode
                  ? "bg-gold text-pitch-dark"
                  : "bg-white/10 text-white/80 hover:bg-white/15"
              }
            `}
          >
            {editMode ? "✓ Concluir edição" : "✏️ Editar chave"}
          </button>

          {editMode && (
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={regenerating}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white/80 hover:bg-white/15 disabled:opacity-50 transition-colors"
            >
              {regenerating ? "Regerando..." : "↺ Regerar pela classificação"}
            </button>
          )}

          {editMode && (
            <p className="text-xs text-white/45 flex-1 min-w-[200px]">
              Altere jogadores em cada posição ou deixe vazio. Placares da
              partida editada são resetados.
            </p>
          )}

          {regenerateError && (
            <p className="text-xs text-red-400">{regenerateError}</p>
          )}
        </div>
      )}

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
                  <KnockoutMatchCard
                    key={match.id}
                    tournament={tournament}
                    match={match}
                    editMode={editMode}
                    onUpdate={() => onUpdate?.()}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {champion && !editMode && (
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
