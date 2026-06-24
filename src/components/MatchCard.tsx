import { Player, Match, Team } from "@/lib/types";
import { getTeams } from "@/lib/data";
import { TeamFlag } from "./TeamFlag";
import Image from "next/image";

interface PlayerAvatarProps {
  player: Player | null;
  team?: Team;
  size?: "sm" | "md" | "lg";
}

export function PlayerAvatar({ player, team, size = "md" }: PlayerAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-20 h-20 text-xl",
  };

  if (!player) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/40`}
      >
        ?
      </div>
    );
  }

  if (player.avatar) {
    return (
      <Image
        src={player.avatar}
        alt={player.name}
        width={size === "lg" ? 80 : size === "md" ? 40 : 32}
        height={size === "lg" ? 80 : size === "md" ? 40 : 32}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gold/50`}
        unoptimized
      />
    );
  }

  const initials = player.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-gold/80 to-amber-600 flex items-center justify-center font-bold text-pitch-dark border-2 border-gold/50`}
      title={team?.name}
    >
      {initials}
    </div>
  );
}

interface MatchCardProps {
  match: Match;
  players: Player[];
  teamType: "club" | "national";
  tournamentId: string;
  compact?: boolean;
}

export function MatchCard({
  match,
  players,
  teamType,
  tournamentId,
  compact = false,
}: MatchCardProps) {
  const teams = getTeams(teamType);
  const player1 = players.find((p) => p.id === match.player1Id) ?? null;
  const player2 = players.find((p) => p.id === match.player2Id) ?? null;
  const team1 = player1 ? teams.find((t) => t.id === player1.teamId) : null;
  const team2 = player2 ? teams.find((t) => t.id === player2.teamId) : null;

  const isBye = !player1 || !player2;
  const isPlayed = match.score1 !== null && match.score2 !== null;
  const isClickable = player1 && player2;

  const content = (
    <div
      className={`
        relative rounded-lg border transition-all duration-200
        ${isPlayed ? "border-gold/60 bg-gold/5" : "border-white/20 bg-black/30"}
        ${isClickable ? "hover:border-gold hover:shadow-lg hover:shadow-gold/10 cursor-pointer" : "opacity-60"}
        ${compact ? "p-3 min-w-[200px]" : "p-4 min-w-[260px]"}
      `}
    >
      <PlayerRow
        player={player1}
        team={team1}
        score={match.score1}
        isWinner={match.winnerId === match.player1Id}
        compact={compact}
      />
      <div className="flex items-center gap-2 my-1">
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-xs text-white/40 font-bold">VS</span>
        <div className="flex-1 h-px bg-white/20" />
      </div>
      <PlayerRow
        player={player2}
        team={team2}
        score={match.score2}
        isWinner={match.winnerId === match.player2Id}
        compact={compact}
      />
      {isBye && (
        <div className="absolute -top-2 -right-2 bg-amber-500 text-pitch-dark text-[10px] font-bold px-2 py-0.5 rounded-full">
          BYE
        </div>
      )}
    </div>
  );

  if (!isClickable) return content;

  return (
    <a href={`/tournament/${tournamentId}/match/${match.id}`}>{content}</a>
  );
}

function PlayerRow({
  player,
  team,
  score,
  isWinner,
  compact,
}: {
  player: Player | null;
  team?: Team | null;
  score: number | null;
  isWinner: boolean;
  compact: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 ${isWinner ? "text-gold" : "text-white/90"}`}
    >
      <PlayerAvatar player={player} team={team ?? undefined} size="sm" />
      <div className="flex-1 min-w-0">
        <p className={`truncate font-medium ${compact ? "text-sm" : "text-base"}`}>
          {player?.name ?? "Aguardando..."}
        </p>
        {team && (
          <p className="text-xs text-white/50 truncate flex items-center gap-1">
            <TeamFlag team={team} size="xs" />
            {team.name}
          </p>
        )}
      </div>
      {score !== null && (
        <span
          className={`font-bold tabular-nums ${compact ? "text-base" : "text-lg"} ${isWinner ? "text-gold" : ""}`}
        >
          {score}
        </span>
      )}
    </div>
  );
}
