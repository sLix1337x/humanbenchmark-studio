import { notFound } from "next/navigation";

import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { getPlayerHistory } from "@/lib/reaction-duel-data";

export const dynamic = "force-dynamic";

type ProfilePageProps = {
  params: Promise<{
    playerName: string;
  }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = await params;
  const data = await getPlayerHistory(decodeURIComponent(resolvedParams.playerName));

  if (!data) {
    notFound();
  }

  const { history, playerName, summary } = data;

  return (
    <main className="page-shell min-h-screen">
      <PageHeader
        eyebrow="Player profile"
        title={playerName}
        description="Saved stats and full Reaction Time history for this player name."
        actions={
          <>
            <ButtonLink href="/leaderboard" size="lg">
              View leaderboard
            </ButtonLink>
            <ButtonLink href="/reaction-duel" variant="secondary" size="lg">
              Back to game
            </ButtonLink>
          </>
        }
      />

      <section className="grid gap-6 md:grid-cols-4">
        <StatCard label="Matches" value={summary.totalMatches} />
        <StatCard label="Win rate" value={`${summary.winRate}%`} />
        <StatCard
          label="Average"
          value={summary.averageMs !== null ? `${summary.averageMs} ms` : "--"}
        />
        <StatCard label="Best" value={summary.bestMs !== null ? `${summary.bestMs} ms` : "--"} />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card as="article">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--body-subtle)]">
            Record
          </p>
          <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--body)]">
            <p>Wins: {summary.wins}</p>
            <p>Losses: {summary.losses}</p>
            <p>Ties: {summary.ties}</p>
            <p>False starts: {summary.falseStarts}</p>
          </div>
        </Card>

        <Card as="article">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--body-subtle)]">
            Recent matches
          </p>
          <div className="mt-4 space-y-4">
            {history.length === 0 ? (
              <CardDescription>
                No saved matches yet for this player name.
              </CardDescription>
            ) : (
              history.map((match) => (
                <div
                  key={match.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-lg font-medium tracking-[-0.03em] text-[var(--heading)]">
                      {match.result} vs {match.opponent}
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--body-subtle)]">
                      Room {match.roomCode}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-[var(--body)]">
                    {new Date(match.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-3 text-sm text-[var(--body)]">
                    Avg {match.averageMs ?? "--"} ms · Best {match.bestMs ?? "--"} ms · False
                    starts {match.falseStarts}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--body)]">
                    {match.rounds.map((round) => (
                      <span
                        key={`${match.id}-${round.round}`}
                        className="rounded-lg border border-[var(--border-strong)] bg-[var(--panel)] px-3 py-1"
                      >
                        R{round.round}: {round.falseStart ? "foul" : `${round.reactionMs} ms`}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>
    </main>
  );
}
