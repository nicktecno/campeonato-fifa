import { Team, TeamType } from "./types";

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

export const NATIONAL_TEAMS: Team[] = [
  {
    id: "france",
    name: "França",
    rating: "85,0",
    attack: 86,
    midfield: 86,
    defense: 83,
    flag: "https://flagcdn.com/w80/fr.png",
  },
  {
    id: "england",
    name: "Inglaterra",
    rating: "85,0",
    attack: 87,
    midfield: 85,
    defense: 83,
    flag: "https://flagcdn.com/w80/gb-eng.png",
  },
  {
    id: "spain",
    name: "Espanha",
    rating: "84,6",
    attack: 85,
    midfield: 86,
    defense: 83,
    flag: "https://flagcdn.com/w80/es.png",
  },
  {
    id: "portugal",
    name: "Portugal",
    rating: "84,3",
    attack: 87,
    midfield: 84,
    defense: 82,
    flag: "https://flagcdn.com/w80/pt.png",
  },
  {
    id: "germany",
    name: "Alemanha",
    rating: "84,0",
    attack: 84,
    midfield: 84,
    defense: 84,
    flag: "https://flagcdn.com/w80/de.png",
  },
  {
    id: "brazil",
    name: "Brasil",
    rating: "83,3",
    attack: 86,
    midfield: 81,
    defense: 83,
    flag: "https://flagcdn.com/w80/br.png",
  },
  {
    id: "italy",
    name: "Itália",
    rating: "82,6",
    attack: 81,
    midfield: 84,
    defense: 83,
    flag: "https://flagcdn.com/w80/it.png",
  },
  {
    id: "netherlands",
    name: "Holanda",
    rating: "82,6",
    attack: 82,
    midfield: 83,
    defense: 83,
    flag: "https://flagcdn.com/w80/nl.png",
  },
  {
    id: "argentina",
    name: "Argentina",
    rating: "82,3",
    attack: 86,
    midfield: 82,
    defense: 79,
    flag: "https://flagcdn.com/w80/ar.png",
  },
  {
    id: "usa",
    name: "Estados Unidos",
    rating: "82,3",
    attack: 86,
    midfield: 81,
    defense: 80,
    flag: "https://flagcdn.com/w80/us.png",
  },
  {
    id: "belgium",
    name: "Bélgica",
    rating: "81,3",
    attack: 83,
    midfield: 81,
    defense: 80,
    flag: "https://flagcdn.com/w80/be.png",
  },
  {
    id: "croatia",
    name: "Croácia",
    rating: "81,0",
    attack: 79,
    midfield: 83,
    defense: 81,
    flag: "https://flagcdn.com/w80/hr.png",
  },
  {
    id: "denmark",
    name: "Dinamarca",
    rating: "80,6",
    attack: 79,
    midfield: 82,
    defense: 81,
    flag: "https://flagcdn.com/w80/dk.png",
  },
  {
    id: "uruguay",
    name: "Uruguai",
    rating: "80,3",
    attack: 83,
    midfield: 78,
    defense: 80,
    flag: "https://flagcdn.com/w80/uy.png",
  },
  {
    id: "sweden",
    name: "Suécia",
    rating: "79,0",
    attack: 79,
    midfield: 78,
    defense: 80,
    flag: "https://flagcdn.com/w80/se.png",
  },
];

export function getTeams(type: TeamType): Team[] {
  return type === "club" ? CLUBS : NATIONAL_TEAMS;
}

export function getTeam(type: TeamType, teamId: string): Team | undefined {
  return getTeams(type).find((t) => t.id === teamId);
}
