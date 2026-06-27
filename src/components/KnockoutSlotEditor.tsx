"use client";

import { useState } from "react";
import { Match, Tournament } from "@/lib/types";
import { getTeams } from "@/lib/data";

interface KnockoutSlotEditorProps {
  tournament: Tournament;
  match: Match;
  slot: 1 | 2;
  currentPlayerId: string | null;
  onUpdated: () => void;
}

export function KnockoutSlotEditor({
  tournament,
  match,
  slot,
  currentPlayerId,
  onUpdated,
}: KnockoutSlotEditorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const otherId = slot === 1 ? match.player2Id : match.player1Id;
  const teams = getTeams(tournament.teamType);

  const handleChange = async (playerId: string | null) => {
    if (playerId === currentPlayerId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/tournaments/${tournament.id}/matches/${match.id}/bracket`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slot, playerId }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao atualizar chave");
        return;
      }

      onUpdated();
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1">
      <select
        disabled={loading}
        value={currentPlayerId ?? ""}
        onChange={(e) => {
          const value = e.target.value;
          handleChange(value === "" ? null : value);
        }}
        className="w-full bg-black/50 border border-gold/30 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
      >
        <option value="">— Vazio —</option>
        {tournament.players
          .filter((p) => p.id !== otherId)
          .map((player) => {
            const team = teams.find((t) => t.id === player.teamId);
            return (
              <option key={player.id} value={player.id}>
                {player.name}
                {team ? ` · ${team.name}` : ""}
              </option>
            );
          })}
      </select>
      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  );
}
