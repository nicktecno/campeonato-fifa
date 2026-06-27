"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Tournament } from "@/lib/types";
import { TournamentLobby } from "@/components/TournamentLobby";
import { GroupStageView } from "@/components/GroupStageView";
import { BracketView } from "@/components/BracketView";
import { TournamentPlayersPanel } from "@/components/TournamentPlayersPanel";
import Link from "next/link";
import { formatTournamentTitle } from "@/lib/titles";

export default function TournamentPage() {
  const params = useParams();
  const id = params.id as string;
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"groups" | "knockout">("groups");

  const fetchTournament = useCallback(() => {
    fetch(`/api/tournaments/${id}`)
      .then((res) => {
        if (res.status === 404) throw new Error("Campeonato não encontrado");
        if (!res.ok) throw new Error("Erro ao carregar campeonato");
        return res.json();
      })
      .then((data: Tournament) => {
        setTournament(data);
        if (data.status === "knockout" || data.status === "finished") {
          setActiveTab("knockout");
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchTournament();
    const interval = setInterval(() => {
      if (tournament?.status === "registration") {
        fetchTournament();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchTournament, tournament?.status]);

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await fetch(`/api/tournaments/${id}/start`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Erro ao iniciar");
        return;
      }
      const data = await res.json();
      setTournament(data);
      setActiveTab("groups");
    } catch {
      alert("Erro de conexão");
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pitch-gradient flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl animate-bounce inline-block">⚽</span>
          <p className="text-white/60 mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen pitch-gradient flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <Link href="/" className="text-gold hover:underline">
            ← Criar novo campeonato
          </Link>
        </div>
      </div>
    );
  }

  const statusLabel = {
    registration: "Inscrições abertas",
    group_stage: "Fase de Grupos",
    knockout: "Mata-Mata",
    finished: "Finalizado",
  }[tournament.status];

  return (
    <main className="min-h-screen pitch-gradient">
      <div className="absolute inset-0 pitch-lines opacity-15 pointer-events-none" />

      <div className="relative max-w-full mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <Link
              href="/"
              className="text-white/50 hover:text-white text-sm mb-2 inline-block transition-colors"
            >
              ← Novo Campeonato
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gold">
              {formatTournamentTitle(tournament.name)}
            </h1>
            <p className="text-white/50 text-sm mt-1">
              {tournament.players.length} jogadores ·{" "}
              {tournament.teamType === "club" ? "🏟️ Clubes" : "🌍 Seleções"} ·{" "}
              <span className="text-gold/70">{statusLabel}</span>
            </p>
          </div>
        </header>

        {tournament.status === "registration" && (
          <div className="max-w-2xl mx-auto bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <TournamentLobby
              tournament={tournament}
              onStart={handleStart}
              onRefresh={fetchTournament}
              starting={starting}
            />
          </div>
        )}

        {(tournament.status === "group_stage" ||
          tournament.status === "knockout" ||
          tournament.status === "finished") && (
          <>
            <TournamentPlayersPanel tournament={tournament} />

            <div className="flex gap-2 mb-6">
              <TabButton
                active={activeTab === "groups"}
                onClick={() => setActiveTab("groups")}
                label="Fase de Grupos"
              />
              <TabButton
                active={activeTab === "knockout"}
                onClick={() => setActiveTab("knockout")}
                label="Mata-Mata"
                disabled={tournament.status === "group_stage"}
              />
            </div>

            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              {activeTab === "groups" ? (
                <GroupStageView tournament={tournament} />
              ) : (
                <BracketView
                  tournament={tournament}
                  onUpdate={fetchTournament}
                />
              )}
            </div>

            {tournament.status !== "finished" && (
              <p className="text-center text-xs text-white/40 mt-4">
                Clique em um confronto para registrar o placar · Posições vazias
                podem receber um jogador da lista
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  label,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-5 py-2 rounded-full text-sm font-medium transition-all
        ${
          active
            ? "bg-gold text-pitch-dark"
            : disabled
              ? "bg-white/5 text-white/20 cursor-not-allowed"
              : "bg-white/10 text-white/60 hover:bg-white/15"
        }
      `}
    >
      {label}
    </button>
  );
}
