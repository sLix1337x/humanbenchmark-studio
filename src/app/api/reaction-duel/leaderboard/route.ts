import { NextResponse } from "next/server";

import { getLeaderboard } from "@/lib/reaction-duel-data";

export async function GET() {
  const leaderboard = await getLeaderboard(20);

  return NextResponse.json({
    leaderboard,
  });
}
