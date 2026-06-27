"use client";

import Link from "next/link";
import { Tournament } from "@/lib/types";
import { getTeams } from "@/lib/data";
import { isPlayerEliminated } from "@/lib/player-status";
import { PlayerAvatar } from "./MatchCard";
import { TeamFlag } from "./TeamFlag";

interface TournamentPlayersPanelProps {
  tournament: Tournament;
}

export function TournamentPlayersPanel({
  tournament,
}: TournamentPlayersPanelProps) {
  const teams = getTeams(tournament.teamType);
  const isActive = tournament.status !== "registration";

  return (
    <div className="bg-black/30 border border-white/10 rounded-2xl overflow-hidden mb-6">
      <div className="bg-gold/10 border-b border-gold/20 px-4 py-3 flex items-center justify-between gap-2">
        <h3 className="font-bold text-gold text-sm uppercase tracking-wider">
          Jogadores
        </h3>
        {isActive && (
          <span className="text-[10px] text-white/40">
            Editar time: disponíveis ou de eliminados
          </span>
        )}
      </div>
      <div className="p-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {tournament.players.map((player) => {
          const team = teams.find((t) => t.id === player.teamId);
          const eliminated = isActive && isPlayerEliminated(tournament, player.id);

          return (
            <div
              key={player.id}
              className={`flex items-center gap-2 rounded-xl border p-2.5 ${
                eliminated
                  ? "border-white/5 bg-black/10 opacity-70"
                  : "border-white/10 bg-black/20"
              }`}
            >
              <PlayerAvatar player={player} team={team} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{player.name}</p>
                {team && (
                  <p className="text-[10px] text-white/45 flex items-center gap-1 truncate">
                    <TeamFlag team={team} size="xs" />
                    {team.name}
                  </p>
                )}
                {eliminated && (
                  <p className="text-[10px] text-red-400/70">Eliminado</p>
                )}
              </div>
              <Link
                href={`/tournament/${tournament.id}/player/${player.id}/edit`}
                title="Editar jogador"
                className="p-1.5 rounded-lg text-white/40 hover:text-gold hover:bg-white/5 transition-colors shrink-0 text-sm"
              >
                ✏️
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
