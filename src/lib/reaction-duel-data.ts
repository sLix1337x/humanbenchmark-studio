import { MatchResult } from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";

import { prisma } from "@/lib/prisma";

export type ReactionRound = {
  round: number;
  reactionMs: number | null;
  falseStart: boolean;
};

export type SavedMatchView = {
  id: string;
  roomCode: string;
  createdAt: string;
  opponent: string;
  result: "Win" | "Loss" | "Tie";
  averageMs: number | null;
  bestMs: number | null;
  falseStarts: number;
  rounds: ReactionRound[];
};

export type PlayerSummary = {
  playerName: string;
  totalMatches: number;
  wins: number;
  losses: number;
  ties: number;
  winRate: number;
  averageMs: number | null;
  bestMs: number | null;
  falseStarts: number;
};

export type LeaderboardEntry = PlayerSummary & {
  rank: number;
};

export function normalizePlayerName(value: unknown) {
  const name = String(value ?? "").trim();

  if (name.length < 2) {
    return null;
  }

  return name.slice(0, 24);
}

export function toNameKey(name: string) {
  return name.toLowerCase();
}

export function matchResultToLabel(result: MatchResult): "Win" | "Loss" | "Tie" {
  if (result === MatchResult.WIN) {
    return "Win";
  }

  if (result === MatchResult.LOSS) {
    return "Loss";
  }

  return "Tie";
}

export function labelToMatchResult(value: unknown) {
  if (value === "Win") {
    return MatchResult.WIN;
  }

  if (value === "Loss") {
    return MatchResult.LOSS;
  }

  if (value === "Tie") {
    return MatchResult.TIE;
  }

  return null;
}

export function mapSavedMatch(match: {
  id: string;
  roomCode: string;
  createdAt: Date;
  opponent: string;
  result: MatchResult;
  averageMs: number | null;
  bestMs: number | null;
  falseStarts: number;
  rounds: Array<{
    round: number;
    reactionMs: number | null;
    falseStart: boolean;
  }>;
}): SavedMatchView {
  return {
    id: match.id,
    roomCode: match.roomCode,
    createdAt: match.createdAt.toISOString(),
    opponent: match.opponent,
    result: matchResultToLabel(match.result),
    averageMs: match.averageMs,
    bestMs: match.bestMs,
    falseStarts: match.falseStarts,
    rounds: match.rounds.map((round) => ({
      round: round.round,
      reactionMs: round.reactionMs,
      falseStart: round.falseStart,
    })),
  };
}

export function buildPlayerSummary(playerName: string, history: SavedMatchView[]): PlayerSummary {
  const wins = history.filter((match) => match.result === "Win").length;
  const losses = history.filter((match) => match.result === "Loss").length;
  const ties = history.filter((match) => match.result === "Tie").length;
  const validAverages = history
    .map((match) => match.averageMs)
    .filter((value): value is number => value !== null);
  const validBests = history
    .map((match) => match.bestMs)
    .filter((value): value is number => value !== null);
  const averageMs =
    validAverages.length > 0
      ? Math.round(validAverages.reduce((sum, value) => sum + value, 0) / validAverages.length)
      : null;
  const bestMs = validBests.length > 0 ? Math.min(...validBests) : null;
  const totalMatches = history.length;

  return {
    playerName,
    totalMatches,
    wins,
    losses,
    ties,
    winRate: totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0,
    averageMs,
    bestMs,
    falseStarts: history.reduce((sum, match) => sum + match.falseStarts, 0),
  };
}

export async function getPlayerHistory(playerNameInput: string) {
  noStore();

  const playerName = normalizePlayerName(playerNameInput);

  if (!playerName) {
    return null;
  }

  const player = await prisma.player.findUnique({
    where: {
      nameKey: toNameKey(playerName),
    },
    include: {
      matches: {
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
        include: {
          rounds: {
            orderBy: {
              round: "asc",
            },
          },
        },
      },
    },
  });

  const history = player?.matches.map(mapSavedMatch) ?? [];

  return {
    playerName,
    history,
    summary: buildPlayerSummary(player?.name ?? playerName, history),
  };
}

export async function getLeaderboard(limit = 10) {
  noStore();

  const players = await prisma.player.findMany({
    include: {
      matches: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          rounds: {
            orderBy: {
              round: "asc",
            },
          },
        },
      },
    },
  });

  return players
    .map((player) => {
      const history = player.matches.map(mapSavedMatch);
      return buildPlayerSummary(player.name, history);
    })
    .filter((entry) => entry.totalMatches > 0 && entry.averageMs !== null)
    .sort((left, right) => {
      const averageDiff = (left.averageMs ?? Number.POSITIVE_INFINITY) - (right.averageMs ?? Number.POSITIVE_INFINITY);

      if (averageDiff !== 0) {
        return averageDiff;
      }

      const bestDiff = (left.bestMs ?? Number.POSITIVE_INFINITY) - (right.bestMs ?? Number.POSITIVE_INFINITY);

      if (bestDiff !== 0) {
        return bestDiff;
      }

      return right.wins - left.wins;
    })
    .slice(0, limit)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}
