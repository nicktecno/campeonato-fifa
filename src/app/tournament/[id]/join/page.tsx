"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Tournament } from "@/lib/types";
import { PlayerRegistrationForm } from "@/components/PlayerRegistrationForm";
import Link from "next/link";
import { formatTournamentTitle } from "@/lib/titles";

export default function JoinPage() {
  const params = useParams();
  const id = params.id as string;
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/tournaments/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Campeonato não encontrado");
        return res.json();
      })
      .then(setTournament)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data: {
    name: string;
    teamId: string;
    avatar?: string;
  }) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tournaments/${id}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Erro ao cadastrar");
        return;
      }

      setSuccess(true);
    } catch {
      alert("Erro de conexão");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pitch-gradient flex items-center justify-center">
        <span className="text-5xl animate-bounce">⚽</span>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen pitch-gradient flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (tournament.status !== "registration") {
    return (
      <div className="min-h-screen pitch-gradient flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <span className="text-5xl">🔒</span>
          <h2 className="text-xl font-bold text-gold mt-4">
            Inscrições encerradas
          </h2>
          <p className="text-white/60 mt-2">
            O campeonato <strong>{formatTournamentTitle(tournament.name)}</strong> já foi iniciado.
          </p>
          <Link
            href={`/tournament/${id}`}
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
        <header className="text-center mb-8">
          <span className="text-4xl">⚽</span>
          <h1 className="text-2xl font-bold text-gold mt-3">
            {formatTournamentTitle(tournament.name)}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {tournament.teamType === "club" ? "🏟️ Clubes" : "🌍 Seleções"} ·{" "}
            {tournament.players.length} inscrito(s)
          </p>
        </header>

        <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <PlayerRegistrationForm
            teamType={tournament.teamType}
            tournamentName={tournament.name}
            onSubmit={handleSubmit}
            loading={submitting}
            success={success}
          />
        </div>

        <p className="text-center text-xs text-white/30 mt-6">
          <Link href={`/tournament/${id}`} className="hover:text-white/50">
            Ver campeonato
          </Link>
        </p>
      </div>
    </main>
  );
}
