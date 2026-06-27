import { ButtonLink } from "@/components/ui/button-link";
import { PageHeader } from "@/components/ui/page-header";

export default function ProfileNotFound() {
  return (
    <main className="page-shell flex min-h-screen max-w-3xl flex-col items-center justify-center text-center">
      <PageHeader
        eyebrow="Player profile"
        title="No saved stats yet"
        description="This player name does not have any saved Reaction Time history yet."
        className="w-full justify-center text-center"
      />
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/reaction-duel" size="lg">
          Open game
        </ButtonLink>
        <ButtonLink href="/leaderboard" variant="secondary" size="lg">
          View leaderboard
        </ButtonLink>
      </div>
    </main>
  );
}
