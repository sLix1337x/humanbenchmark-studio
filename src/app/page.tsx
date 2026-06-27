import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { isStaticDemo } from "@/lib/app-mode";

const games = [
  {
    title: "Reaction Time",
    description: "A reaction test you can play instantly solo or in a private 1v1 duel room.",
    href: "/reaction-duel",
    status: "Live",
    imageSrc: "/images/Reaction-Duel.webp",
  },
  {
    title: "Aim Trainer",
    description: "Fast flicks, click precision, and duel scoring are planned next.",
    href: "",
    status: "Coming Soon",
    imageSrc: "/images/Aim-Trainer.webp",
  },
  {
    title: "Sequence Memory",
    description: "Memorize the growing pattern of glowing tiles and repeat it without making a mistake.",
    href: "/sequence-memory",
    status: "Live",
    imageSrc: "/images/Sequence%20Memory.webp",
  },
  {
    title: "Number Memory",
    description: "Short-term memory rounds with a competitive multiplayer twist.",
    href: "",
    status: "Coming Soon",
    imageSrc: "/images/Number%20Memory.webp",
  },
  {
    title: "Typing Sprint",
    description: "Race another player through short typing benchmarks and accuracy rounds.",
    href: "",
    status: "Coming Soon",
    imageSrc: "/images/Typing%20Sprint.webp",
  },
  {
    title: "Visual Memory",
    description: "Track more tiles each round and compare score progression over time.",
    href: "",
    status: "Coming Soon",
    imageSrc: "/images/Visual%20Memory.webp",
  },
];

export default function Home() {
  return (
    <main className="page-shell flex min-h-screen flex-col">
      <div className="section-frame flex items-center justify-between px-1 py-4 text-sm text-[var(--body)]">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-3 font-semibold uppercase tracking-[0.18em] text-[var(--heading)]">
            <Image
              src="/images/Humanbenchmark-Studio-Logo.webp"
              alt="Humanbenchmark Studio logo"
              width={34}
              height={34}
              className="h-[34px] w-[34px] rounded-md object-cover"
            />
            Humanbenchmark Studio
          </span>
          <Link href="/leaderboard" className="transition-colors hover:text-[var(--foreground-strong)]">
            Leaderboard
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/reaction-duel" className="transition-colors hover:text-[var(--foreground-strong)]">
            Reaction Time
          </Link>
          <Link href="/sequence-memory" className="transition-colors hover:text-[var(--foreground-strong)]">
            Sequence Memory
          </Link>
        </div>
      </div>

      <section className="section-frame py-8">
        <div className="overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--panel)]">
          <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
            {isStaticDemo ? (
              <p className="mb-5 rounded-full border border-[var(--border-strong)] bg-[var(--panel-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--body-subtle)]">
                GitHub Pages demo: solo play is live, while duel rooms and saved history stay in the full app.
              </p>
            ) : null}
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--body-subtle)]">
              Multiplayer Benchmark Lab
            </p>
            <Image
              src="/images/Humanbenchmark-Studio-Logo.webp"
              alt="Humanbenchmark Studio logo"
              width={112}
              height={112}
              priority
              className="mb-8 mt-6 h-24 w-24 rounded-2xl object-cover"
            />
            <h1 className="text-5xl font-medium tracking-[-0.05em] text-[var(--heading)] sm:text-6xl">
              Humanbenchmark Studio
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--body)] sm:text-lg">
              Measure your speed and memory with benchmark games built for both solo practice and
              private duels.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/reaction-duel" size="lg">
                Open Reaction Time
              </ButtonLink>
              <ButtonLink href="/leaderboard" variant="secondary" size="lg">
                {isStaticDemo ? "Demo Leaderboard" : "View Leaderboard"}
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="section-frame py-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium tracking-[-0.03em] text-[var(--heading)]">Games</h2>
          <p className="text-sm text-[var(--body)]">More multiplayer tests are on the way.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => {
            const content = (
              <Card className="group h-full" interactive>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <Image
                      src={game.imageSrc}
                      alt={`${game.title} icon`}
                      width={48}
                      height={48}
                      className="h-12 w-12 shrink-0 rounded-md object-cover"
                    />
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--heading)]">
                      {game.title}
                    </div>
                  </div>
                  <Badge tone={game.status === "Live" ? "success" : "neutral"}>
                    {game.status}
                  </Badge>
                </div>
                <CardDescription className="mt-4">{game.description}</CardDescription>
                <p className="mt-6 text-sm font-semibold text-[var(--accent-secondary)]">
                  {game.status === "Live" ? "Play now" : "Coming soon"}
                </p>
              </Card>
            );

            if (!game.href) {
              return <div key={game.title}>{content}</div>;
            }

            return (
              <Link key={game.title} href={game.href} className="block">
                {content}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 py-8 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--body-subtle)]">
            Live Now
          </p>
          <CardTitle className="mt-3 text-2xl">Reaction Time</CardTitle>
          <CardDescription className="mt-3">
            Practice instantly in solo mode or open a private room and race another player head to head.
          </CardDescription>
        </Card>

        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--body-subtle)]">
            Up Next
          </p>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-[var(--body)]">
            <li>Aim Trainer duels</li>
            <li>Number memory battles</li>
            <li>Quick matchmaking and rematch flow</li>
            <li>Richer profiles and global rankings</li>
          </ul>
        </Card>
      </section>
    </main>
  );
}
