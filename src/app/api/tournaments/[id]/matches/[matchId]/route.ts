import { NextRequest, NextResponse } from "next/server";
import { getTournament, updateMatchScore } from "@/lib/store";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; matchId: string }> }
) {
  const { id, matchId } = await params;
  const tournament = await getTournament(id);

  if (!tournament) {
    return NextResponse.json(
      { error: "Campeonato não encontrado" },
      { status: 404 }
    );
  }

  const body = await request.json();
  const { score1, score2 } = body;

  if (typeof score1 !== "number" || typeof score2 !== "number") {
    return NextResponse.json(
      { error: "Placares inválidos" },
      { status: 400 }
    );
  }

  const match = tournament.matches.find((m) => m.id === matchId);
  if (match?.phase === "knockout" && score1 === score2) {
    return NextResponse.json(
      { error: "Empate não é permitido no mata-mata" },
      { status: 400 }
    );
  }

  const updated = await updateMatchScore(id, matchId, score1, score2);

  if (!updated) {
    return NextResponse.json(
      { error: "Partida não encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json(updated);
}
