"use client";

import { useState, useEffect } from "react";
import { TeamType, Player } from "@/lib/types";
import { getTeams } from "@/lib/data";
import { TeamPicker } from "./TeamPicker";
import { AvatarUpload } from "./AvatarUpload";

interface PlayerFormProps {
  teamType: TeamType;
  takenTeamIds?: string[];
  teamPickerHint?: string;
  initialName?: string;
  initialTeamId?: string;
  initialAvatar?: string;
  submitLabel: string;
  loadingLabel: string;
  onSubmit: (data: {
    name: string;
    teamId: string;
    avatar?: string;
  }) => void;
  loading?: boolean;
}

export function PlayerForm({
  teamType,
  takenTeamIds = [],
  teamPickerHint = "Cada time só pode ser usado uma vez neste campeonato.",
  initialName = "",
  initialTeamId = "",
  initialAvatar,
  submitLabel,
  loadingLabel,
  onSubmit,
  loading,
}: PlayerFormProps) {
  const [name, setName] = useState(initialName);
  const [teamId, setTeamId] = useState(initialTeamId);
  const [avatar, setAvatar] = useState<string | undefined>(initialAvatar);

  const teams = getTeams(teamType);

  useEffect(() => {
    if (teamId && takenTeamIds.includes(teamId)) {
      setTeamId("");
    }
  }, [takenTeamIds, teamId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !teamId) return;
    onSubmit({ name: name.trim(), teamId, avatar });
  };

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AvatarUpload value={avatar} onChange={setAvatar} fallback={initials} />
      <p className="text-center text-sm text-white/50">Avatar (opcional)</p>

      <div>
        <label className="block text-base font-medium text-white/80 mb-2">
          Nome
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3.5 text-lg text-white focus:outline-none focus:border-gold transition-colors"
          placeholder="Digite seu nome"
        />
      </div>

      <div>
        <label className="block text-base font-medium text-white/80 mb-2">
          Time
        </label>
        <p className="text-sm text-white/50 mb-3">{teamPickerHint}</p>
        <TeamPicker
          teams={teams}
          value={teamId}
          onChange={setTeamId}
          takenTeamIds={takenTeamIds}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !name.trim() || !teamId}
        className="w-full bg-gold hover:bg-amber-400 disabled:opacity-40 text-pitch-dark font-bold py-4 rounded-xl text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        {loading ? loadingLabel : submitLabel}
      </button>
    </form>
  );
}

export function getTakenTeamIdsExcluding(
  players: Player[],
  excludePlayerId: string
): string[] {
  return players
    .filter((p) => p.id !== excludePlayerId)
    .map((p) => p.teamId);
}