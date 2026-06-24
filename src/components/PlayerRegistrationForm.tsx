"use client";

import { useState, useEffect } from "react";
import { TeamType } from "@/lib/types";
import { getTeams } from "@/lib/data";
import { TeamPicker } from "./TeamPicker";
import Image from "next/image";

interface PlayerRegistrationFormProps {
  teamType: TeamType;
  tournamentName: string;
  takenTeamIds?: string[];
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
  takenTeamIds = [],
  onSubmit,
  loading,
  success,
}: PlayerRegistrationFormProps) {
  const [name, setName] = useState("");
  const [teamId, setTeamId] = useState("");
  const [avatar, setAvatar] = useState<string | undefined>();

  const teams = getTeams(teamType);

  useEffect(() => {
    if (teamId && takenTeamIds.includes(teamId)) {
      setTeamId("");
    }
  }, [takenTeamIds, teamId]);

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
        <h2 className="text-2xl font-bold text-gold mt-4">Cadastro realizado!</h2>
        <p className="text-white/70 mt-2 text-lg">
          Você está inscrito em <strong>{tournamentName}</strong>
        </p>
        <p className="text-white/50 text-base mt-4">
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
      <p className="text-center text-sm text-white/50">Avatar (opcional)</p>

      <div>
        <label className="block text-base font-medium text-white/80 mb-2">
          Seu nome
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
          Escolha seu time
        </label>
        <p className="text-sm text-white/50 mb-3">
          Cada time só pode ser usado uma vez neste campeonato.
        </p>
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
        {loading ? "Cadastrando..." : "Entrar no Campeonato"}
      </button>
    </form>
  );
}
