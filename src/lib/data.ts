import { Team, TeamType } from "./types";
import { NATIONAL_TEAMS } from "./national-teams";

export { NATIONAL_TEAMS };

export const CLUBS: Team[] = [
  {
    id: "real-madrid",
    name: "Real Madrid",
    rating: "85.7",
    flag: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
  },
  {
    id: "barcelona",
    name: "Barcelona",
    rating: "85.0",
    flag: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
  },
  {
    id: "psg",
    name: "PSG",
    rating: "85.0",
    flag: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
  },
  {
    id: "bayern",
    name: "Bayern de Munique",
    rating: "85.0",
    flag: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
  },
  {
    id: "liverpool",
    name: "Liverpool",
    rating: "84.0",
    flag: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
  },
  {
    id: "arsenal",
    name: "Arsenal",
    rating: "84.0",
    flag: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
  },
  {
    id: "man-city",
    name: "Manchester City",
    rating: "84.0",
    flag: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
  },
  {
    id: "juventus",
    name: "Juventus",
    rating: "5 Estrelas",
    flag: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Juventus_FC_-_pictogram_black_%28Italy%2C_2017%29.svg",
  },
  {
    id: "inter",
    name: "Inter de Milão",
    rating: "5 Estrelas",
    flag: "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg",
  },
  {
    id: "chelsea",
    name: "Chelsea",
    rating: "5 Estrelas",
    flag: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
  },
];

export function formatTeamRating(team: Team, detailed = false): string {
  if (!detailed || team.attack === undefined) {
    return team.rating;
  }
  return `${team.rating} · ${team.attack} ATA / ${team.midfield} MEI / ${team.defense} DEF`;
}

export function formatTeamStats(team: Team): string | null {
  if (team.attack === undefined) return null;
  return `${team.attack} ATA · ${team.midfield} MEI · ${team.defense} DEF`;
}

export function getTeams(type: TeamType): Team[] {
  return type === "club" ? CLUBS : NATIONAL_TEAMS;
}

export function getTeam(type: TeamType, teamId: string): Team | undefined {
  return getTeams(type).find((t) => t.id === teamId);
}
