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

export const NATIONAL_TEAMS: Team[] = [
  {
    id: "france",
    name: "França",
    rating: "86.0",
    flag: "https://flagcdn.com/w80/fr.png",
  },
  {
    id: "spain",
    name: "Espanha",
    rating: "85.0",
    flag: "https://flagcdn.com/w80/es.png",
  },
  {
    id: "england",
    name: "Inglaterra",
    rating: "84.0",
    flag: "https://flagcdn.com/w80/gb-eng.png",
  },
  {
    id: "argentina",
    name: "Argentina",
    rating: "83.0",
    flag: "https://flagcdn.com/w80/ar.png",
  },
  {
    id: "brazil",
    name: "Brasil",
    rating: "83.0",
    flag: "https://flagcdn.com/w80/br.png",
  },
  {
    id: "portugal",
    name: "Portugal",
    rating: "83.0",
    flag: "https://flagcdn.com/w80/pt.png",
  },
  {
    id: "germany",
    name: "Alemanha",
    rating: "83.0",
    flag: "https://flagcdn.com/w80/de.png",
  },
  {
    id: "netherlands",
    name: "Holanda",
    rating: "82.0",
    flag: "https://flagcdn.com/w80/nl.png",
  },
  {
    id: "italy",
    name: "Itália",
    rating: "82.0",
    flag: "https://flagcdn.com/w80/it.png",
  },
  {
    id: "belgium",
    name: "Bélgica",
    rating: "81.0",
    flag: "https://flagcdn.com/w80/be.png",
  },
  {
    id: "usa",
    name: "Estados Unidos",
    rating: "GER 242",
    flag: "https://flagcdn.com/w80/us.png",
  },
  {
    id: "croatia",
    name: "Croácia",
    rating: "GER 240",
    flag: "https://flagcdn.com/w80/hr.png",
  },
  {
    id: "denmark",
    name: "Dinamarca",
    rating: "GER 239",
    flag: "https://flagcdn.com/w80/dk.png",
  },
  {
    id: "uruguay",
    name: "Uruguai",
    rating: "GER 238",
    flag: "https://flagcdn.com/w80/uy.png",
  },
  {
    id: "sweden",
    name: "Suécia",
    rating: "GER 236",
    flag: "https://flagcdn.com/w80/se.png",
  },
];

export function getTeams(type: TeamType): Team[] {
  return type === "club" ? CLUBS : NATIONAL_TEAMS;
}

export function getTeam(type: TeamType, teamId: string): Team | undefined {
  return getTeams(type).find((t) => t.id === teamId);
}
