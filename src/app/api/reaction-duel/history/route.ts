import { type NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  getPlayerHistory,
  labelToMatchResult,
  mapSavedMatch,
  normalizePlayerName,
  toNameKey,
} from "@/lib/reaction-duel-data";

type SaveMatchRequest = {
  roomCode?: unknown;
  playerName?: unknown;
  opponent?: unknown;
  result?: unknown;
  averageMs?: unknown;
  bestMs?: unknown;
  falseStarts?: unknown;
  createdAt?: unknown;
  rounds?: unknown;
};

function parseOptionalMs(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return Math.round(parsed);
}

function parseFalseStarts(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : 0;
}

function parseCreatedAt(value: unknown) {
  const date = new Date(String(value ?? ""));
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function parseRounds(value: unknown) {
  if (!Array.isArray(value)) {
    return null;
  }

  const rounds = value
    .map((round, index) => {
      const candidate = round as {
        round?: unknown;
        reactionMs?: unknown;
        falseStart?: unknown;
      };
      const roundNumber = Number(candidate.round ?? index + 1);

      if (!Number.isFinite(roundNumber) || roundNumber < 1) {
        return null;
      }

      return {
        round: Math.round(roundNumber),
        reactionMs: parseOptionalMs(candidate.reactionMs),
        falseStart: Boolean(candidate.falseStart),
      };
    })
    .filter((entry): entry is { round: number; reactionMs: number | null; falseStart: boolean } => entry !== null);

  return rounds.length > 0 ? rounds : null;
}

export async function GET(request: NextRequest) {
  const playerName = normalizePlayerName(request.nextUrl.searchParams.get("playerName"));

  if (!playerName) {
    return NextResponse.json({ error: "A valid player name is required." }, { status: 400 });
  }

  const data = await getPlayerHistory(playerName);

  return NextResponse.json({
    history: data?.history ?? [],
    summary: data?.summary ?? null,
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as SaveMatchRequest;
  const playerName = normalizePlayerName(body.playerName);
  const opponent = normalizePlayerName(body.opponent) ?? "Unknown opponent";
  const roomCode = String(body.roomCode ?? "").trim().toUpperCase().slice(0, 12);
  const result = labelToMatchResult(body.result);
  const rounds = parseRounds(body.rounds);

  if (!playerName || roomCode.length < 4 || !result || !rounds) {
    return NextResponse.json({ error: "The match payload is invalid." }, { status: 400 });
  }

  const player = await prisma.player.upsert({
    where: {
      nameKey: toNameKey(playerName),
    },
    update: {
      name: playerName,
    },
    create: {
      name: playerName,
      nameKey: toNameKey(playerName),
    },
  });

  const existing = await prisma.savedMatch.findUnique({
    where: {
      playerId_roomCode: {
        playerId: player.id,
        roomCode,
      },
    },
    include: {
      rounds: {
        orderBy: {
          round: "asc",
        },
      },
    },
  });

  if (existing) {
    return NextResponse.json({
      saved: true,
      duplicate: true,
      match: mapSavedMatch(existing),
    });
  }

  const match = await prisma.savedMatch.create({
    data: {
      roomCode,
      opponent,
      result,
      averageMs: parseOptionalMs(body.averageMs),
      bestMs: parseOptionalMs(body.bestMs),
      falseStarts: parseFalseStarts(body.falseStarts),
      createdAt: parseCreatedAt(body.createdAt),
      playerId: player.id,
      rounds: {
        create: rounds.map((round) => ({
          round: round.round,
          reactionMs: round.reactionMs,
          falseStart: round.falseStart,
        })),
      },
    },
    include: {
      rounds: {
        orderBy: {
          round: "asc",
        },
      },
    },
  });

  return NextResponse.json({
    saved: true,
    duplicate: false,
    match: mapSavedMatch(match),
  });
}
