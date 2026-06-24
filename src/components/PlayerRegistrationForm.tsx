"use client";

import { useState } from "react";
import { TeamType } from "@/lib/types";
import { getTeams } from "@/lib/data";
import { TeamPicker } from "./TeamPicker";
import Image from "next/image";

interface PlayerRegistrationFormProps {
  teamType: TeamType;
  tournamentName: string;
  onSubmit: (data: {
    name: string;
    teamId: string;
    avatar?: string;
  }) => void;
  loading?: boolean;
  success?: boolean;
}

export function PlayerRegistrationForm({
  teamType,
  tournamentName,
  onSubmit,
  loading,
  success,
}: PlayerRegistrationFormProps) {
  const [name, setName] = useState("");
  const [teamId, setTeamId] = useState("");
  const [avatar, setAvatar] = useState<string | undefined>();

  const teams = getTeams(teamType);

  const handleAvatarUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setAvatar(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !teamId) return;
    onSubmit({ name: name.trim(), teamId, avatar });
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <span className="text-5xl">✅</span>
        <h2 className="text-xl font-bold text-gold mt-4">Cadastro realizado!</h2>
        <p className="text-white/60 mt-2">
          Você está inscrito em <strong>{tournamentName}</strong>
        </p>
        <p className="text-white/40 text-sm mt-4">
          Aguarde o organizador iniciar o campeonato.
        </p>
      </div>
    );
  }

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
      <div className="flex justify-center">
        <label className="relative cursor-pointer group">
          {avatar ? (
            <Image
              src={avatar}
              alt="Avatar"
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover border-4 border-gold/50"
              unoptimized
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold/80 to-amber-600 flex items-center justify-center font-bold text-2xl text-pitch-dark border-4 border-dashed border-gold/30 group-hover:border-gold transition-colors">
              {initials}
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAvatarUpload(file);
            }}
          />
          <span className="absolute -bottom-1 -right-1 bg-pitch-mid text-sm rounded-full w-8 h-8 flex items-center justify-center border border-white/20">
            📷
          </span>
        </label>
      </div>
      <p className="text-center text-xs text-white/40">Avatar (opcional)</p>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Seu nome
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors"
          placeholder="Digite seu nome"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Escolha seu time
        </label>
        <TeamPicker teams={teams} value={teamId} onChange={setTeamId} />
      </div>

      <button
        type="submit"
        disabled={loading || !name.trim() || !teamId}
        className="w-full bg-gold hover:bg-amber-400 disabled:opacity-40 text-pitch-dark font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        {loading ? "Cadastrando..." : "Entrar no Campeonato"}
      </button>
    </form>
  );
}
