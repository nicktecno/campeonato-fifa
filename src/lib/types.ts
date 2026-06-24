export type TeamType = "club" | "national";
export type TournamentStatus =
  | "registration"
  | "group_stage"
  | "knockout"
  | "finished";
export type MatchPhase = "group" | "knockout";

export interface Team {
  id: string;
  name: string;
  rating: string;
  flag: string;
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  avatar?: string;
}

export interface GroupStanding {
  playerId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface Group {
  id: string;
  name: string;
  playerIds: string[];
}

export interface Match {
  id: string;
  phase: MatchPhase;
  groupId?: string;
  round: number;
  position: number;
  player1Id: string | null;
  player2Id: string | null;
  score1: number | null;
  score2: number | null;
  winnerId: string | null;
  nextMatchId: string | null;
  nextSlot: 1 | 2 | null;
}

export interface Tournament {
  id: string;
  name: string;
  teamType: TeamType;
  status: TournamentStatus;
  players: Player[];
  groups: Group[];
  matches: Match[];
  createdAt: string;
}
