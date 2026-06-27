/**
 * Recupera campeonato com grupos/partidas perdidos no banco.
 * Uso: npx tsx scripts/recover-tournament.ts <tournamentId>
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { dbGetTournament, dbSaveTournament } from "../src/lib/repository";
import {
  createGroups,
  generateGroupMatches,
  seedKnockoutFromGroups,
} from "../src/lib/groups";
import type { Match, Tournament } from "../src/lib/types";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    console.error("Missing .env.local with DATABASE_URL");
    process.exit(1);
  }
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function applyByeIfNeeded(tournament: Tournament, match: Match): void {
  const hasP1 = !!match.player1Id;
  const hasP2 = !!match.player2Id;

  if (hasP1 && !hasP2) {
    match.winnerId = match.player1Id;
    propagateWinner(tournament, match, match.player1Id);
  } else if (!hasP1 && hasP2) {
    match.winnerId = match.player2Id;
    propagateWinner(tournament, match, match.player2Id);
  }
}

function propagateWinner(
  tournament: Tournament,
  match: Match,
  winnerId: string | null
): void {
  if (!match.nextMatchId || !match.nextSlot) return;
  const nextMatch = tournament.matches.find((m) => m.id === match.nextMatchId);
  if (!nextMatch) return;
  if (match.nextSlot === 1) nextMatch.player1Id = winnerId;
  else nextMatch.player2Id = winnerId;
  nextMatch.score1 = null;
  nextMatch.score2 = null;
  nextMatch.winnerId = null;
  if (nextMatch.nextMatchId) propagateWinner(tournament, nextMatch, null);
}

async function main() {
  const tournamentId = process.argv[2] ?? "oiy7opair";
  loadEnv();

  const tournament = await dbGetTournament(tournamentId);
  if (!tournament) {
    console.error("Tournament not found:", tournamentId);
    process.exit(1);
  }

  console.log(
    `Recovering "${tournament.name}" (${tournament.players.length} players, status=${tournament.status})`
  );

  const sortedPlayers = [...tournament.players].sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR")
  );

  tournament.groups = createGroups(sortedPlayers, tournament.id);
  const groupMatches = generateGroupMatches(tournament.groups);

  for (const m of groupMatches) {
    m.score1 = 0;
    m.score2 = 0;
    m.winnerId = null;
  }

  tournament.matches = groupMatches;

  if (
    tournament.status === "knockout" ||
    tournament.status === "finished"
  ) {
    const { matches: knockoutMatches } = seedKnockoutFromGroups(
      tournament.groups,
      tournament.matches,
      tournament.players,
      tournament.id
    );
    tournament.matches = [...tournament.matches, ...knockoutMatches];
    tournament.status = "knockout";

    for (const match of knockoutMatches) {
      if (match.round === 0) applyByeIfNeeded(tournament, match);
    }
  }

  await dbSaveTournament(tournament);

  const groupCount = tournament.groups.length;
  const matchCount = tournament.matches.length;
  const koCount = tournament.matches.filter((m) => m.phase === "knockout").length;

  console.log(
    `Done: ${groupCount} groups, ${matchCount} matches (${koCount} knockout)`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
