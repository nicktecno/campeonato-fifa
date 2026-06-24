import { NextRequest, NextResponse } from "next/server";
import { createTournament, getAllTournaments } from "@/lib/store";

export async function GET() {
  const tournaments = getAllTournaments();
  return NextResponse.json(tournaments);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, teamType } = body;

  if (!name || !teamType) {
    return NextResponse.json(
      { error: "Nome e tipo de time são obrigatórios" },
      { status: 400 }
    );
  }

  const tournament = createTournament(name, teamType);
  return NextResponse.json(tournament, { status: 201 });
}
