"use client";

import { TeamType } from "@/lib/types";
import { PlayerForm } from "./PlayerForm";
import Link from "next/link";

interface PlayerRegistrationFormProps {
  teamType: TeamType;
  tournamentName: string;
  tournamentId: string;
  playerId?: string;
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
  tournamentId,
  playerId,
  takenTeamIds = [],
  onSubmit,
  loading,
  success,
}: PlayerRegistrationFormProps) {
  if (success && playerId) {
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
        <Link
          href={`/tournament/${tournamentId}/player/${playerId}/edit`}
          className="inline-block mt-6 text-gold hover:underline text-base"
        >
          Editar meu cadastro →
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <span className="text-5xl">✅</span>
        <h2 className="text-2xl font-bold text-gold mt-4">Cadastro realizado!</h2>
        <p className="text-white/70 mt-2 text-lg">
          Você está inscrito em <strong>{tournamentName}</strong>
        </p>
      </div>
    );
  }

  return (
    <PlayerForm
      teamType={teamType}
      takenTeamIds={takenTeamIds}
      submitLabel="Entrar no Campeonato"
      loadingLabel="Cadastrando..."
      onSubmit={onSubmit}
      loading={loading}
    />
  );
}
