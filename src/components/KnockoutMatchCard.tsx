"use client";

import { Match, Player, Team, Tournament } from "@/lib/types";
import { getTeams } from "@/lib/data";
import { PlayerAvatar } from "./MatchCard";
import { MatchSlotAssign } from "./MatchSlotAssign";
import { KnockoutSlotEditor } from "./KnockoutSlotEditor";
import { TeamFlag } from "./TeamFlag";

interface KnockoutMatchCardProps {
  tournament: Tournament;
  match: Match;
  editMode?: boolean;
  onUpdate: () => void;
}

export function KnockoutMatchCard({
  tournament,
  match,
  editMode = false,
  onUpdate,
}: KnockoutMatchCardProps) {
  const teams = getTeams(tournament.teamType);
  const player1 = tournament.players.find((p) => p.id === match.player1Id) ?? null;
  const player2 = tournament.players.find((p) => p.id === match.player2Id) ?? null;
  const team1 = player1 ? teams.find((t) => t.id === player1.teamId) : null;
  const team2 = player2 ? teams.find((t) => t.id === player2.teamId) : null;

  const isBye = !player1 || !player2;
  const isPlayed = match.score1 !== null && match.score2 !== null;
  const isClickable =
    !editMode &&
    player1 &&
    player2 &&
    tournament.status !== "finished";

  const content = (
    <div
      className={`
        relative rounded-lg border transition-all duration-200 p-4 min-w-[260px]
        ${editMode ? "border-gold/40 bg-gold/5" : ""}
        ${isPlayed ? "border-gold/60 bg-gold/5" : "border-white/20 bg-black/30"}
        ${isClickable ? "hover:border-gold hover:shadow-lg hover:shadow-gold/10 cursor-pointer" : ""}
        ${isBye && !isPlayed && !editMode ? "border-dashed" : ""}
      `}
    >
      <KnockoutPlayerSlot
        tournament={tournament}
        match={match}
        slot={1}
        player={player1}
        team={team1}
        score={match.score1}
        isWinner={match.winnerId === match.player1Id}
        editMode={editMode}
        onUpdated={onUpdate}
      />

      <div className="flex items-center gap-2 my-2">
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-xs text-white/40 font-bold">VS</span>
        <div className="flex-1 h-px bg-white/20" />
      </div>

      <KnockoutPlayerSlot
        tournament={tournament}
        match={match}
        slot={2}
        player={player2}
        team={team2}
        score={match.score2}
        isWinner={match.winnerId === match.player2Id}
        editMode={editMode}
        onUpdated={onUpdate}
      />

      {isBye && !isPlayed && !editMode && (
        <div className="absolute -top-2 -right-2 bg-amber-500 text-pitch-dark text-[10px] font-bold px-2 py-0.5 rounded-full">
          BYE
        </div>
      )}
    </div>
  );

  if (!isClickable) return content;

  return (
    <a href={`/tournament/${tournament.id}/match/${match.id}`}>{content}</a>
  );
}

function KnockoutPlayerSlot({
  tournament,
  match,
  slot,
  player,
  team,
  score,
  isWinner,
  editMode,
  onUpdated,
}: {
  tournament: Tournament;
  match: Match;
  slot: 1 | 2;
  player: Player | null;
  team?: Team | null;
  score: number | null;
  isWinner: boolean;
  editMode: boolean;
  onUpdated: () => void;
}) {
  const playerId = slot === 1 ? match.player1Id : match.player2Id;
  const canAssign = !player && tournament.status === "knockout" && !editMode;
  const canEditSlot =
    editMode &&
    (tournament.status === "knockout" || tournament.status === "finished");

  return (
    <div
      className={`flex items-start gap-2 ${isWinner && !editMode ? "text-gold" : "text-white/90"}`}
    >
      {!editMode && (
        <PlayerAvatar player={player} team={team ?? undefined} size="sm" />
      )}
      <div className="flex-1 min-w-0">
        {canEditSlot ? (
          <KnockoutSlotEditor
            tournament={tournament}
            match={match}
            slot={slot}
            currentPlayerId={playerId}
            onUpdated={onUpdated}
          />
        ) : player ? (
          <>
            <p className="truncate font-medium text-sm">{player.name}</p>
            {team && (
              <p className="text-xs text-white/50 truncate flex items-center gap-1">
                <TeamFlag team={team} size="xs" />
                {team.name}
              </p>
            )}
          </>
        ) : canAssign ? (
          <MatchSlotAssign
            tournament={tournament}
            match={match}
            slot={slot}
            onAssigned={onUpdated}
          />
        ) : (
          <p className="text-sm text-white/40">Aguardando...</p>
        )}
      </div>
      {score !== null && !editMode && (
        <span
          className={`font-bold tabular-nums text-base ${isWinner ? "text-gold" : ""}`}
        >
          {score}
        </span>
      )}
    </div>
  );
}
