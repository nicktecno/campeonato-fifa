"use client";

import { Team } from "@/lib/types";
import { TeamFlag } from "./TeamFlag";

interface TeamPickerProps {
  teams: Team[];
  value: string;
  onChange: (teamId: string) => void;
}

export function TeamPicker({ teams, value, onChange }: TeamPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1">
      {teams.map((team) => {
        const selected = value === team.id;
        return (
          <button
            key={team.id}
            type="button"
            onClick={() => onChange(team.id)}
            className={`
              flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all
              ${
                selected
                  ? "border-gold bg-gold/10 shadow-md shadow-gold/10"
                  : "border-white/10 bg-black/20 hover:border-white/30"
              }
            `}
          >
            <TeamFlag team={team} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{team.name}</p>
              <p className="text-[10px] text-gold/70">{team.rating}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
