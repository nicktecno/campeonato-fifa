import { NextRequest, NextResponse } from "next/server";
import { getTournament, deleteTournament, updateTournament } from "@/lib/store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tournament = await getTournament(id);

  if (!tournament) {
    return NextResponse.json(
      { error: "Campeonato não encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json(tournament);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name, teamType } = body;

  if (!name && !teamType) {
    return NextResponse.json(
      { error: "Informe o nome ou tipo de time para editar" },
      { status: 400 }
    );
  }

  const tournament = await updateTournament(id, { name, teamType });

  if (!tournament) {
    return NextResponse.json(
      {
        error:
          "Não foi possível editar. Campeonato não encontrado ou tipo de time só pode ser alterado durante inscrições.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json(tournament);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = await deleteTournament(id);

  if (!deleted) {
    return NextResponse.json(
      { error: "Campeonato não encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
