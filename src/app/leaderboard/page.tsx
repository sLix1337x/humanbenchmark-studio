import Link from "next/link";

import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { getLeaderboard } from "@/lib/reaction-duel-data";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
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
