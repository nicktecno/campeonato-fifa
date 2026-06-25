"use client";

import { useState } from "react";
import { TeamType } from "@/lib/types";
import { getTeams, formatTeamStats } from "@/lib/data";
import { TeamFlag } from "./TeamFlag";
import { DEFAULT_TOURNAMENT_NAME } from "@/lib/titles";

interface CreateTournamentFormProps {
  onSubmit: (data: { name: string; teamType: TeamType }) => void;
  loading?: boolean;
}

export function CreateTournamentForm({
  onSubmit,
  loading,
}: CreateTournamentFormProps) {
  const [name, setName] = useState(DEFAULT_TOURNAMENT_NAME);
  const [teamType, setTeamType] = useState<TeamType>("club");
  const teams = getTeams(teamType);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-base font-medium text-white/80 mb-2">
          Nome do Campeonato
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3.5 text-lg text-white focus:outline-none focus:border-gold transition-colors"
          placeholder="Campeonato Churrasquinho 2026"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-3">
          Tipo de Time
        </label>
        <div className="grid grid-cols-2 gap-3">
          <TeamTypeButton
            active={teamType === "club"}
            onClick={() => setTeamType("club")}
            icon="🏟️"
            label="Clubes"
            subtitle="EA FC 26 - Seleções"
          />
          <TeamTypeButton
            active={teamType === "national"}
            onClick={() => setTeamType("national")}
            icon="🌍"
            label="Seleções"
            subtitle="EA FC 26 - Seleções"
          />
        </div>
      </div>

      <div className="bg-black/20 rounded-xl p-4 border border-white/10">
        <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">
          {teamType === "club" ? "Melhores Clubes" : "Melhores Seleções"} (EA FC
          26)
        </p>
        <div className="flex flex-wrap gap-2">
          {teams.map((team) => (
            <span
              key={team.id}
              className="inline-flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 rounded-full pl-1.5 pr-3 py-1"
            >
              <TeamFlag team={team} size="xs" />
              {team.name}{" "}
              <span className="text-gold/70">· {team.rating}</span>
              {formatTeamStats(team) && (
                <span className="text-white/35 hidden sm:inline">
                  {" "}
                  ({formatTeamStats(team)})
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      <p className="text-sm text-white/50 text-center">
        Após criar, compartilhe o link para os jogadores se cadastrarem.
      </p>

      <button
        onClick={() => onSubmit({ name, teamType })}
        disabled={loading || !name.trim()}
        className="w-full bg-gold hover:bg-amber-400 disabled:opacity-60 text-pitch-dark font-bold py-4 rounded-xl text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        {loading ? "Criando..." : "Criar Campeonato"}
      </button>
    </div>
  );
}

function TeamTypeButton({
  active,
  onClick,
  icon,
  label,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  subtitle: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        p-4 rounded-xl border-2 text-left transition-all
        ${
          active
            ? "border-gold bg-gold/10 shadow-lg shadow-gold/10"
            : "border-white/20 bg-black/20 hover:border-white/40"
        }
      `}
    >
      <span className="text-2xl">{icon}</span>
      <p className="font-bold mt-1">{label}</p>
      <p className="text-xs text-white/50">{subtitle}</p>
    </button>
  );
}
