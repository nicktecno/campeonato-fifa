"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tournament, TeamType, TournamentStatus } from "@/lib/types";
import { formatTournamentTitle } from "@/lib/titles";

interface TournamentListProps {
  refreshKey?: number;
  onChanged?: () => void;
}

const statusLabels: Record<TournamentStatus, string> = {
  registration: "Inscrições",
  group_stage: "Fase de Grupos",
  knockout: "Mata-Mata",
  finished: "Finalizado",
};

export function TournamentList({ refreshKey, onChanged }: TournamentListProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editTeamType, setEditTeamType] = useState<TeamType>("club");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTournaments = () => {
    setLoading(true);
    fetch("/api/tournaments")
      .then((res) => res.json())
      .then(setTournaments)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTournaments();
  }, [refreshKey]);

  const startEdit = (tournament: Tournament) => {
    setEditingId(tournament.id);
    setEditName(tournament.name);
    setEditTeamType(tournament.teamType);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleSave = async (id: string) => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/tournaments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, teamType: editTeamType }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Erro ao salvar");
        return;
      }

      setEditingId(null);
      fetchTournaments();
      onChanged?.();
    } catch {
      alert("Erro de conexão");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tournament: Tournament) => {
    const confirmed = window.confirm(
      `Apagar "${tournament.name}"? Esta ação não pode ser desfeita.`
    );
    if (!confirmed) return;

    setDeletingId(tournament.id);
    try {
      const res = await fetch(`/api/tournaments/${tournament.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Erro ao apagar");
        return;
      }

      if (editingId === tournament.id) cancelEdit();
      fetchTournaments();
      onChanged?.();
    } catch {
      alert("Erro de conexão");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-white/40 text-sm">
        Carregando campeonatos...
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed border-white/15 rounded-xl">
        <span className="text-3xl">🏆</span>
        <p className="text-white/50 mt-2 text-sm">Nenhum campeonato criado ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tournaments.map((tournament) => {
        const isEditing = editingId === tournament.id;
        const canEditTeamType = tournament.status === "registration";

        return (
          <div
            key={tournament.id}
            className="bg-black/30 border border-white/10 rounded-xl p-4"
          >
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gold"
                  autoFocus
                />
                {canEditTeamType && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditTeamType("club")}
                      className={`p-2 rounded-lg text-sm border transition-colors ${
                        editTeamType === "club"
                          ? "border-gold bg-gold/10 text-gold"
                          : "border-white/10 text-white/60"
                      }`}
                    >
                      🏟️ Clubes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditTeamType("national")}
                      className={`p-2 rounded-lg text-sm border transition-colors ${
                        editTeamType === "national"
                          ? "border-gold bg-gold/10 text-gold"
                          : "border-white/10 text-white/60"
                      }`}
                    >
                      🌍 Seleções
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(tournament.id)}
                    disabled={saving || !editName.trim()}
                    className="flex-1 bg-gold text-pitch-dark font-medium py-2 rounded-lg text-sm disabled:opacity-40"
                  >
                    {saving ? "Salvando..." : "Salvar"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white border border-white/10"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <Link
                  href={`/tournament/${tournament.id}`}
                  className="flex-1 min-w-0 group"
                >
                  <p className="font-medium text-white group-hover:text-gold transition-colors truncate">
                    {formatTournamentTitle(tournament.name)}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {tournament.teamType === "club" ? "🏟️ Clubes" : "🌍 Seleções"}{" "}
                    · {tournament.players.length} jogador(es) ·{" "}
                    {statusLabels[tournament.status]}
                  </p>
                </Link>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(tournament)}
                    title="Editar"
                    className="p-2 rounded-lg text-white/40 hover:text-gold hover:bg-white/5 transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(tournament)}
                    disabled={deletingId === tournament.id}
                    title="Apagar"
                    className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40"
                  >
                    {deletingId === tournament.id ? "..." : "🗑️"}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
