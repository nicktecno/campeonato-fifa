"use client";

import { useState } from "react";
import { Tournament } from "@/lib/types";
import { getTeams } from "@/lib/data";
import { PlayerAvatar } from "./MatchCard";
import { TeamFlag } from "./TeamFlag";
import Link from "next/link";

interface TournamentLobbyProps {
  tournament: Tournament;
  onStart: () => void;
  onRefresh: () => void;
  starting?: boolean;
}

export function TournamentLobby({
  tournament,
  onStart,
  onRefresh,
  starting,
}: TournamentLobbyProps) {
  const [copied, setCopied] = useState(false);
  const joinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/tournament/${tournament.id}/join`
      : `/tournament/${tournament.id}/join`;

  const teams = getTeams(tournament.teamType);
  const canStart = tournament.players.length >= 4;

  const copyLink = async () => {
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gold/10 border border-gold/30 rounded-xl p-4">
        <p className="text-sm text-gold/80 font-medium mb-2">
          Link de cadastro para jogadores
        </p>
        <div className="flex gap-2">
          <input
            readOnly
            value={joinUrl}
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 truncate"
          />
          <button
            onClick={copyLink}
            className="bg-gold/20 hover:bg-gold/30 border border-gold/40 text-gold px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>
        <Link
          href={`/tournament/${tournament.id}/join`}
          className="inline-block mt-3 text-sm text-gold hover:underline"
        >
          Ou cadastre-se aqui →
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">
          Jogadores inscritos ({tournament.players.length})
        </h2>
        <button
          onClick={onRefresh}
          className="text-sm text-white/50 hover:text-white transition-colors"
        >
          Atualizar
        </button>
      </div>

      {tournament.players.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-white/20 rounded-xl">
          <span className="text-4xl">👥</span>
          <p className="text-white/50 mt-3">Nenhum jogador cadastrado ainda</p>
          <p className="text-white/30 text-sm mt-1">
            Compartilhe o link acima
          </p>
        </div>
      ) : (
        <div className="grid gap-2 max-h-[40vh] overflow-y-auto">
          {tournament.players.map((player, i) => {
            const team = teams.find((t) => t.id === player.teamId);
            return (
              <div
                key={player.id}
                className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-xl p-3"
              >
                <span className="text-white/30 text-sm w-6 text-center">
                  {i + 1}
                </span>
                <PlayerAvatar player={player} team={team} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{player.name}</p>
                  {team && (
                    <p className="text-xs text-white/50 flex items-center gap-1">
                      <TeamFlag team={team} size="xs" />
                      {team.name}
                    </p>
                  )}
                </div>
                <Link
                  href={`/tournament/${tournament.id}/player/${player.id}/edit`}
                  title="Editar jogador"
                  className="p-2 rounded-lg text-white/40 hover:text-gold hover:bg-white/5 transition-colors shrink-0"
                >
                  ✏️
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <div className="border-t border-white/10 pt-6">
        {!canStart && (
          <p className="text-amber-400/80 text-sm text-center mb-4">
            Mínimo de 4 jogadores para iniciar ({tournament.players.length}/4)
          </p>
        )}
        <button
          onClick={onStart}
          disabled={!canStart || starting}
          className="w-full bg-gold hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-pitch-dark font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-lg"
        >
          {starting ? "Iniciando..." : "⚽ Iniciar Campeonato"}
        </button>
        <p className="text-xs text-white/40 text-center mt-2">
          Gera fase de grupos + mata-mata automaticamente
        </p>
      </div>
    </div>
  );
}
