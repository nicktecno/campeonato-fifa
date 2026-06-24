import { NextRequest, NextResponse } from "next/server";
import { startTournament } from "@/lib/store";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tournament = await startTournament(id);

  if (!tournament) {
    return NextResponse.json(
      { error: "Mínimo de 4 jogadores cadastrados para iniciar" },
      { status: 400 }
    );
  }

  return NextResponse.json(tournament);
}
