import { NextRequest, NextResponse } from "next/server";
import { setKnockoutMatchSlot } from "@/lib/store";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; matchId: string }> }
) {
  const { id, matchId } = await params;
  const body = await request.json();
  const { slot, playerId } = body;

  if (slot !== 1 && slot !== 2) {
    return NextResponse.json({ error: "Posição inválida" }, { status: 400 });
  }

  if (
    playerId !== null &&
    (typeof playerId !== "string" || !playerId)
  ) {
    return NextResponse.json({ error: "Jogador inválido" }, { status: 400 });
  }

  const result = await setKnockoutMatchSlot(id, matchId, slot, playerId);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
