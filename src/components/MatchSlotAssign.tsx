"use client";

import { useState } from "react";
import { Match, Tournament } from "@/lib/types";
import { getTeams } from "@/lib/data";

interface MatchSlotAssignProps {
  tournament: Tournament;
  match: Match;
  slot: 1 | 2;
  onAssigned: () => void;
  className?: string;
}

export function MatchSlotAssign({
  tournament,
  match,
  slot,
  onAssigned,
  className = "",
}: MatchSlotAssignProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const otherId = slot === 1 ? match.player2Id : match.player1Id;
  const eligiblePlayers = tournament.players.filter((p) => p.id !== otherId);
  const teams = getTeams(tournament.teamType);

  const handleAssign = async (playerId: string) => {
    if (!playerId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/tournaments/${tournament.id}/matches/${match.id}/assign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slot, playerId }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao atribuir jogador");
        return;
      }

      onAssigned();
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <select
        disabled={loading}
        defaultValue=""
        onChange={(e) => {
          handleAssign(e.target.value);
          e.target.value = "";
        }}
        className="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
      >
        <option value="" disabled>
          {loading ? "Atribuindo..." : "Atribuir jogador da lista..."}
        </option>
        {eligiblePlayers.map((player) => {
          const team = teams.find((t) => t.id === player.teamId);
          return (
            <option key={player.id} value={player.id}>
              {player.name}
              {team ? ` · ${team.name}` : ""}
            </option>
          );
        })}
      </select>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
