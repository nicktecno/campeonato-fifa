"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateTournamentForm } from "@/components/CreateTournamentForm";
import { TournamentList } from "@/components/TournamentList";
import { TeamType } from "@/lib/types";
import { APP_TITLE } from "@/lib/titles";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [listKey, setListKey] = useState(0);
  const [showCreate, setShowCreate] = useState(false);

  const handleSubmit = async (data: { name: string; teamType: TeamType }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Erro ao criar campeonato");
        return;
      }

      const tournament = await res.json();
      setListKey((k) => k + 1);
      router.push(`/tournament/${tournament.id}`);
    } catch {
      alert("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pitch-gradient">
      <div className="absolute inset-0 pitch-lines opacity-20 pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 py-12">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl">⚽</span>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-gold tracking-tight">
                {APP_TITLE}
              </h1>
              <p className="text-white/60 text-base">Fase de Grupos + Mata-Mata</p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          <section className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Meus Campeonatos</h2>
              <button
                onClick={() => setShowCreate((v) => !v)}
                className="text-base bg-gold/20 hover:bg-gold/30 text-gold border border-gold/30 px-4 py-2 rounded-lg transition-colors"
              >
                {showCreate ? "Fechar" : "+ Novo"}
              </button>
            </div>
            <TournamentList
              refreshKey={listKey}
              onChanged={() => setListKey((k) => k + 1)}
            />
          </section>

          {showCreate && (
            <section className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-4">
                Criar Campeonato
              </h2>
              <CreateTournamentForm onSubmit={handleSubmit} loading={loading} />
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
