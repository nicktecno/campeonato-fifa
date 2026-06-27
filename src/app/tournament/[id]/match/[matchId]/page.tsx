"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tournament, Match, Player, Team } from "@/lib/types";
import { getTeams, formatTeamStats } from "@/lib/data";
import { PlayerAvatar } from "@/components/MatchCard";
import { TeamFlag } from "@/components/TeamFlag";
import { getKnockoutRoundLabel, getKnockoutTotalRounds } from "@/lib/bracket";
import { MatchSlotAssign } from "@/components/MatchSlotAssign";
import Link from "next/link";
import Image from "next/image";

export default function MatchPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;
  const matchId = params.matchId as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/tournaments/${tournamentId}`)
      .then((res) => res.json())
      .then((data: Tournament) => {
        setTournament(data);
        const m = data.matches.find((m) => m.id === matchId);
        if (m) {
          setMatch(m);
          setScore1(m.score1 ?? 0);
          setScore2(m.score2 ?? 0);
        }
      })
      .finally(() => setLoading(false));
  }, [tournamentId, matchId]);

  const isKnockout = match?.phase === "knockout";
  const isDraw = score1 === score2;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/tournaments/${tournamentId}/matches/${matchId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score1, score2 }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Erro ao salvar");
        return;
      }

      router.push(`/tournament/${tournamentId}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pitch-gradient flex items-center justify-center">
        <span className="text-5xl animate-bounce">⚽</span>
      </div>
    );
  }

  if (!tournament || !match) {
    return (
      <div className="min-h-screen pitch-gradient flex items-center justify-center">
        <p className="text-red-400">Partida não encontrada</p>
      </div>
    );
  }

  const teams = getTeams(tournament.teamType);
  const player1 = tournament.players.find((p) => p.id === match.player1Id);
  const player2 = tournament.players.find((p) => p.id === match.player2Id);
  const team1 = player1 ? teams.find((t) => t.id === player1.teamId) : null;
  const team2 = player2 ? teams.find((t) => t.id === player2.teamId) : null;

  const group = match.groupId
    ? tournament.groups.find((g) => g.id === match.groupId)
    : null;

  let roundLabel = group?.name ?? "Partida";
  if (isKnockout) {
    const koMatches = tournament.matches.filter((m) => m.phase === "knockout");
    const firstRoundCount = koMatches.filter((m) => m.round === 0).length * 2;
    const totalRounds = getKnockoutTotalRounds(firstRoundCount);
    roundLabel = getKnockoutRoundLabel(match.round, totalRounds);
  }

  const canSave = player1 && player2 && (isKnockout ? !isDraw : true);
  const canAssign =
    isKnockout && tournament.status === "knockout" && (!player1 || !player2);

  const refreshTournament = () => {
    fetch(`/api/tournaments/${tournamentId}`)
      .then((res) => res.json())
      .then((data: Tournament) => {
        setTournament(data);
        const m = data.matches.find((m) => m.id === matchId);
        if (m) {
          setMatch(m);
          setScore1(m.score1 ?? 0);
          setScore2(m.score2 ?? 0);
        }
      });
  };

  return (
    <main className="min-h-screen pitch-gradient relative overflow-hidden">
      <FieldBackground />

      <div className="relative max-w-3xl mx-auto px-4 py-8">
        <Link
          href={`/tournament/${tournamentId}`}
          className="text-white/50 hover:text-white text-sm mb-6 inline-block transition-colors"
        >
          ← Voltar
        </Link>

        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest text-gold/70 font-bold">
            {roundLabel}
            {match.phase === "group" && " · Fase de Grupos"}
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">
            Registrar Placar
          </h1>
        </div>

        <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-10">
          {canAssign ? (
            <div className="space-y-6">
              <p className="text-center text-white/60 text-sm">
                Esta posição na chave está vazia. Atribua um jogador da lista —
                se ficar sozinho, ele classifica automaticamente.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {!player1 && (
                  <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">
                      Jogador 1
                    </p>
                    <MatchSlotAssign
                      tournament={tournament}
                      match={match}
                      slot={1}
                      onAssigned={refreshTournament}
                    />
                  </div>
                )}
                {!player2 && (
                  <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">
                      Jogador 2
                    </p>
                    <MatchSlotAssign
                      tournament={tournament}
                      match={match}
                      slot={2}
                      onAssigned={refreshTournament}
                    />
                  </div>
                )}
              </div>
              {player1 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-white/50 mb-1">Já na chave:</p>
                  <p className="font-medium text-gold">{player1.name}</p>
                </div>
              )}
              {player2 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-white/50 mb-1">Já na chave:</p>
                  <p className="font-medium text-gold">{player2.name}</p>
                </div>
              )}
            </div>
          ) : (
            <>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-8">
            <PlayerScoreCard
              player={player1}
              team={team1}
              score={score1}
              onScoreChange={setScore1}
              side="left"
            />

            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl font-black text-white/30">×</span>
            </div>

            <PlayerScoreCard
              player={player2}
              team={team2}
              score={score2}
              onScoreChange={setScore2}
              side="right"
            />
          </div>

          {isKnockout && isDraw && (
            <p className="text-center text-amber-400 text-sm mt-6">
              Empate não é permitido no mata-mata
            </p>
          )}

          {error && (
            <p className="text-center text-red-400 text-sm mt-4">{error}</p>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !canSave}
            className="w-full mt-8 bg-gold hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-pitch-dark font-bold py-4 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] text-lg"
          >
            {saving ? "Salvando..." : "Confirmar Placar"}
          </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function PlayerScoreCard({
  player,
  team,
  score,
  onScoreChange,
  side,
}: {
  player?: Player;
  team?: Team | null;
  score: number;
  onScoreChange: (s: number) => void;
  side: "left" | "right";
}) {
  if (!player) {
    return (
      <div className="text-center opacity-40">
        <p>Aguardando adversário</p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center gap-4 ${side === "right" ? "md:items-end" : "md:items-start"}`}
    >
      <div className="flex flex-col items-center gap-3">
        {player.avatar ? (
          <Image
            src={player.avatar}
            alt={player.name}
            width={80}
            height={80}
            className="w-20 h-20 rounded-full object-cover border-4 border-gold/60 shadow-lg shadow-gold/20"
            unoptimized
          />
        ) : (
          <PlayerAvatar player={player} size="lg" />
        )}
        <div className="text-center">
          <p className="font-bold text-lg">{player.name}</p>
          {team && (
            <p className="text-sm text-white/50 flex flex-col items-center justify-center gap-0.5">
              <span className="flex items-center gap-1.5">
                <TeamFlag team={team} size="sm" />
                {team.name}{" "}
                <span className="text-gold/60">· {team.rating}</span>
              </span>
              {formatTeamStats(team) && (
                <span className="text-xs text-white/40">
                  {formatTeamStats(team)}
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onScoreChange(Math.max(0, score - 1))}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xl font-bold transition-colors"
        >
          −
        </button>
        <input
          type="number"
          min={0}
          max={99}
          value={score}
          onChange={(e) =>
            onScoreChange(Math.max(0, parseInt(e.target.value) || 0))
          }
          className="w-16 h-16 text-center text-3xl font-black bg-black/40 border-2 border-gold/40 rounded-xl text-gold focus:outline-none focus:border-gold"
        />
        <button
          onClick={() => onScoreChange(score + 1)}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xl font-bold transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

function FieldBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 pitch-lines opacity-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-2 border-white/5 rounded-full" />
      <div className="absolute top-1/2 left-0 w-32 h-64 border-r-2 border-y-2 border-white/5 -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-32 h-64 border-l-2 border-y-2 border-white/5 -translate-y-1/2" />
    </div>
  );
}
