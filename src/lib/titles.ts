const CHURRASQUINHO = "churrasquinho";

export function hasChurrasquinho(text: string): boolean {
  return text.toLowerCase().includes(CHURRASQUINHO);
}

/** Título do app: FIFA só aparece junto com Churrasquinho */
export const APP_TITLE = "Campeonato Churrasquinho FIFA";

/** Nome padrão ao criar um campeonato */
export const DEFAULT_TOURNAMENT_NAME = "Campeonato Churrasquinho";

/** Exibe o nome do campeonato, acrescentando FIFA se tiver churrasquinho no nome */
export function formatTournamentTitle(name: string): string {
  if (!name.trim()) return DEFAULT_TOURNAMENT_NAME;
  if (hasChurrasquinho(name) && !name.toLowerCase().includes("fifa")) {
    return `${name} FIFA`;
  }
  return name;
}
