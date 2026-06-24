"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Tournament, Player } from "@/lib/types";
import { PlayerForm, getTakenTeamIdsExcluding } from "@/components/PlayerForm";
import { formatTournamentTitle } from "@/lib/titles";

export default function EditPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;
  const playerId = params.playerId as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/tournaments/${tournamentId}/players/${playerId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Jogador não encontrado");
        return res.json();
      })
      .then((data) => {
        setTournament(data.tournament);
        setPlayer(data.player);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tournamentId, playerId]);

  const handleSubmit = async (data: {
    name: string;
    teamId: string;
    avatar?: string;
  }) => {
    setSaving(true);
    try {
      const res = await fetch(
        `/api/tournaments/${tournamentId}/players/${playerId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Erro ao salvar");
        return;
      }

      router.push(`/tournament/${tournamentId}`);
    } catch {
      alert("Erro de conexão");
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

  if (error || !tournament || !player) {
    return (
      <div className="min-h-screen pitch-gradient flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error ?? "Jogador não encontrado"}</p>
          <Link href={`/tournament/${tournamentId}`} className="text-gold hover:underline">
            ← Voltar ao campeonato
          </Link>
        </div>
      </div>
    );
  }

  if (tournament.status !== "registration") {
    return (
      <div className="min-h-screen pitch-gradient flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <span className="text-5xl">🔒</span>
          <h2 className="text-xl font-bold text-gold mt-4">
            Edição não permitida
          </h2>
          <p className="text-white/60 mt-2">
            O campeonato já foi iniciado. Jogadores não podem mais ser editados.
          </p>
          <Link
            href={`/tournament/${tournamentId}`}
            className="inline-block mt-6 text-gold hover:underline"
          >
            Ver campeonato →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pitch-gradient">
      <div className="absolute inset-0 pitch-lines opacity-20 pointer-events-none" />

      <div className="relative max-w-md mx-auto px-4 py-12">
        <Link
          href={`/tournament/${tournamentId}`}
          className="text-white/50 hover:text-white text-sm mb-6 inline-block"
        >
          ← Voltar
        </Link>

        <header className="text-center mb-8">
          <span className="text-4xl">✏️</span>
          <h1 className="text-2xl font-bold text-gold mt-3">Editar jogador</h1>
          <p className="text-white/60 text-base mt-1">
            {formatTournamentTitle(tournament.name)}
          </p>
        </header>

        <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <PlayerForm
            teamType={tournament.teamType}
            initialName={player.name}
            initialTeamId={player.teamId}
            initialAvatar={player.avatar}
            takenTeamIds={getTakenTeamIdsExcluding(
              tournament.players,
              playerId
            )}
            submitLabel="Salvar alterações"
            loadingLabel="Salvando..."
            onSubmit={handleSubmit}
            loading={saving}
          />
        </div>
      </div>
    </main>
  );
}
