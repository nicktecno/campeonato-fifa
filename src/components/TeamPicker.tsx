"use client";

import { useMemo, useState } from "react";
import { Team } from "@/lib/types";
import { formatTeamStats } from "@/lib/data";
import { TeamFlag } from "./TeamFlag";

interface TeamPickerProps {
  teams: Team[];
  value: string;
  onChange: (teamId: string) => void;
  takenTeamIds?: string[];
}

export function TeamPicker({
  teams,
  value,
  onChange,
  takenTeamIds = [],
}: TeamPickerProps) {
  const [search, setSearch] = useState("");
  const takenSet = new Set(takenTeamIds);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.rating.includes(q) ||
        t.id.toLowerCase().includes(q)
    );
  }, [teams, search]);

  return (
    <div className="space-y-3">
      {teams.length > 12 && (
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar seleção..."
          className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2.5 text-base text-white focus:outline-none focus:border-gold transition-colors"
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="col-span-2 text-center text-white/40 py-6 text-sm">
            Nenhum time encontrado
          </p>
        ) : (
          filtered.map((team) => {
            const selected = value === team.id;
            const taken = takenSet.has(team.id);

            return (
              <button
                key={team.id}
                type="button"
                disabled={taken}
                onClick={() => !taken && onChange(team.id)}
                className={`
                  flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all
                  ${
                    taken
                      ? "border-white/5 bg-black/10 opacity-40 cursor-not-allowed"
                      : selected
                        ? "border-gold bg-gold/10 shadow-md shadow-gold/10"
                        : "border-white/10 bg-black/20 hover:border-white/30"
                  }
                `}
              >
                <TeamFlag team={team} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{team.name}</p>
                  <p className="text-sm text-gold font-medium">{team.rating}</p>
                  {formatTeamStats(team) && (
                    <p className="text-[11px] text-white/45 mt-0.5 leading-tight">
                      {formatTeamStats(team)}
                    </p>
                  )}
                  {taken && (
                    <p className="text-xs text-red-400/80 mt-0.5">Já escolhido</p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
