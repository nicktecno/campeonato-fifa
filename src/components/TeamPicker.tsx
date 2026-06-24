"use client";

import { Team } from "@/lib/types";
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
  const takenSet = new Set(takenTeamIds);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
      {teams.map((team) => {
        const selected = value === team.id;
        const taken = takenSet.has(team.id);

        return (
          <button
            key={team.id}
            type="button"
            disabled={taken}
            onClick={() => !taken && onChange(team.id)}
            className={`
              flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all
              ${
                taken
                  ? "border-white/5 bg-black/10 opacity-40 cursor-not-allowed"
                  : selected
                    ? "border-gold bg-gold/10 shadow-md shadow-gold/10"
                    : "border-white/10 bg-black/20 hover:border-white/30"
              }
            `}
          >
            <TeamFlag team={team} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold truncate">{team.name}</p>
              <p className="text-sm text-gold/70">{team.rating}</p>
              {taken && (
                <p className="text-sm text-red-400/80 mt-0.5">Já escolhido</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
