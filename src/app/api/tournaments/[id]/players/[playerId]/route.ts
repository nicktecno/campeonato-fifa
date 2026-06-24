import { NextRequest, NextResponse } from "next/server";
import { getTournament, updatePlayer } from "@/lib/store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; playerId: string }> }
) {
  const { id, playerId } = await params;
  const tournament = getTournament(id);

  if (!tournament) {
    return NextResponse.json(
      { error: "Campeonato não encontrado" },
      { status: 404 }
    );
  }

  const player = tournament.players.find((p) => p.id === playerId);
  if (!player) {
    return NextResponse.json(
      { error: "Jogador não encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({ tournament, player });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; playerId: string }> }
) {
  const { id, playerId } = await params;
  const body = await request.json();
  const { name, teamId, avatar } = body;

  if (!name && !teamId && avatar === undefined) {
    return NextResponse.json(
      { error: "Informe dados para atualizar" },
      { status: 400 }
    );
  }

  const result = updatePlayer(id, playerId, { name, teamId, avatar });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
