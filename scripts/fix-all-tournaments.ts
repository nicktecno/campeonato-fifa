/**
 * Migra IDs e repara todos os campeonatos no Neon.
 * Uso: npx tsx scripts/fix-all-tournaments.ts
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { getAllTournaments } from "../src/lib/store";

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

async function main() {
  loadEnv();
  const tournaments = await getAllTournaments();
  for (const t of tournaments) {
    console.log(
      `${t.name} (${t.id}): ${t.players.length} jogadores, ${t.groups.length} grupos, ${t.matches.length} partidas, status=${t.status}`
    );
  }
  console.log(`Fixed ${tournaments.length} tournament(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
