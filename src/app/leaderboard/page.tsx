import Link from "next/link";

import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { isStaticDemo } from "@/lib/app-mode";

export default async function LeaderboardPage() {
  if (isStaticDemo) {
    return (
      <main className="page-shell min-h-screen">
        <PageHeader
          eyebrow="Reaction Time"
          title="Leaderboard"
          description="GitHub Pages is serving a static demo right now, so saved rankings and player profiles are disabled here."
          actions={
            <>
              <ButtonLink href="/reaction-duel" size="lg">
                Open game
              </ButtonLink>
              <ButtonLink href="/" variant="secondary" size="lg">
                Back home
              </ButtonLink>
            </>
          }
        />

        <Card>
          <div className="space-y-4 p-1 text-[var(--body)]">
            <p className="text-base leading-7">
              The live leaderboard needs the Node server, database, and API routes that are available in the full app but not on GitHub Pages.
            </p>
            <p className="text-base leading-7">
              You can still play the solo games here, and the leaderboard will work again when you run the full version locally or deploy it to a server platform later.
            </p>
          </div>
        </Card>
      </main>
    );
  }

  const { getLeaderboard } = await import("@/lib/reaction-duel-data");
  const leaderboard = await getLeaderboard(20);

  return (
    <main className="page-shell min-h-screen">
      <PageHeader
        eyebrow="Reaction Time"
        title="Leaderboard"
        description="Ranked by saved average reaction time across solo runs and room matches."
        actions={
          <>
            <ButtonLink href="/reaction-duel" size="lg">
              Open game
            </ButtonLink>
            <ButtonLink href="/" variant="secondary" size="lg">
              Back home
            </ButtonLink>
          </>
        }
      />

      <Card>
        <DataTable
          caption="Reaction Time leaderboard"
          rows={leaderboard}
          rowKey={(entry) => entry.playerName}
          emptyMessage="No saved matches yet. Finish and save a few duels first."
          columns={[
            { key: "rank", header: "Rank", cell: (entry) => `#${entry.rank}` },
            {
              key: "player",
              header: "Player",
              cell: (entry) => (
                <Link
                  href={`/profile/${encodeURIComponent(entry.playerName)}`}
                  className="font-semibold text-[var(--heading)] transition-colors hover:text-[var(--foreground-strong)]"
                >
                  {entry.playerName}
                </Link>
              ),
            },
            {
              key: "average",
              header: "Average",
              cell: (entry) => (entry.averageMs !== null ? `${entry.averageMs} ms` : "--"),
            },
            {
              key: "best",
              header: "Best",
              cell: (entry) => (entry.bestMs !== null ? `${entry.bestMs} ms` : "--"),
            },
            { key: "matches", header: "Matches", cell: (entry) => entry.totalMatches },
            { key: "winRate", header: "Win rate", cell: (entry) => `${entry.winRate}%` },
          ]}
        />
      </Card>
    </main>
  );
}
