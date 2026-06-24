import { NextRequest, NextResponse } from "next/server";
import { registerPlayer } from "@/lib/store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name, teamId, avatar } = body;

  if (!name || !teamId) {
    return NextResponse.json(
      { error: "Nome e time são obrigatórios" },
      { status: 400 }
    );
  }

  const result = await registerPlayer(id, { name, teamId, avatar });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}
