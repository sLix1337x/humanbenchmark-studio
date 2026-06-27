"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";

const GRID_SIZE = 9;
const FLASH_MS = 420;
const STEP_MS = 620;
const CLICK_FEEDBACK_MS = 220;
const NEXT_ROUND_DELAY_MS = 850;

type Phase = "idle" | "showing" | "input" | "gameOver";
type FeedbackTone = "correct" | "wrong" | null;

function randomTile() {
  return Math.floor(Math.random() * GRID_SIZE);
}

function getTilePosition(tile: number) {
  return {
    row: Math.floor(tile / 3),
    column: tile % 3,
  };
}

function pickNextTile(current: number[]) {
  if (current.length === 0) {
    return randomTile();
  }

  const lastTile = current[current.length - 1];
  const previousTile = current.length > 1 ? current[current.length - 2] : null;
  const lastPosition = getTilePosition(lastTile);

  const weightedCandidates = Array.from({ length: GRID_SIZE }, (_, tile) => tile)
    .filter((tile) => tile !== lastTile && tile !== previousTile)
    .flatMap((tile) => {
      const position = getTilePosition(tile);
      const distance =
        Math.abs(position.row - lastPosition.row) + Math.abs(position.column - lastPosition.column);
      const changesAxis =
        position.row !== lastPosition.row && position.column !== lastPosition.column;

      // Higher weights make wider, less repetitive jumps show up more often.
      const weight = Math.max(1, distance) + (changesAxis ? 1 : 0);

      return Array.from({ length: weight }, () => tile);
    });

  if (weightedCandidates.length === 0) {
    return randomTile();
  }

  return weightedCandidates[Math.floor(Math.random() * weightedCandidates.length)];
}

function buildNextSequence(current: number[]) {
  return [...current, pickNextTile(current)];
}

export function SequenceMemoryClient() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [sequence, setSequence] = useState<number[]>([]);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [feedbackTile, setFeedbackTile] = useState<number | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<FeedbackTone>(null);
  const [inputIndex, setInputIndex] = useState(0);
  const [completedLevel, setCompletedLevel] = useState(0);
  const [bestLevel, setBestLevel] = useState(0);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const timeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  function clearPlaybackTimers() {
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current = [];
  }

  function clearTileFeedback() {
    setFeedbackTile(null);
    setFeedbackTone(null);
  }

  function flashTileFeedback(tileIndex: number, tone: Exclude<FeedbackTone, null>) {
    setFeedbackTile(tileIndex);
    setFeedbackTone(tone);

    timeoutsRef.current.push(
      setTimeout(() => {
        clearTileFeedback();
      }, CLICK_FEEDBACK_MS),
    );
  }

  function queuePlayback(nextSequence: number[]) {
    clearPlaybackTimers();
    clearTileFeedback();
    setPhase("showing");
    setActiveTile(null);
    setInputIndex(0);

    nextSequence.forEach((tile, index) => {
      const showAt = index * STEP_MS;
      const hideAt = showAt + FLASH_MS;

      timeoutsRef.current.push(
        setTimeout(() => {
          setActiveTile(tile);
        }, showAt),
      );

      timeoutsRef.current.push(
        setTimeout(() => {
          setActiveTile(null);
        }, hideAt),
      );
    });

    timeoutsRef.current.push(
      setTimeout(() => {
        setActiveTile(null);
        setPhase("input");
        setInputIndex(0);
      }, nextSequence.length * STEP_MS),
    );
  }

  function startFreshGame() {
    const nextSequence = [randomTile()];

    clearPlaybackTimers();
    clearTileFeedback();
    setSaveNotice(null);
    setSequence(nextSequence);
    setCompletedLevel(0);
    queuePlayback(nextSequence);
  }

  function handleTilePress(tileIndex: number) {
    if (phase !== "input") {
      return;
    }

    const expectedTile = sequence[inputIndex];
    const isCorrect = tileIndex === expectedTile;

    flashTileFeedback(tileIndex, isCorrect ? "correct" : "wrong");

    if (!isCorrect) {
      clearPlaybackTimers();
      setActiveTile(null);

      timeoutsRef.current.push(
        setTimeout(() => {
          setPhase("gameOver");
          setBestLevel((current) => Math.max(current, completedLevel));
        }, CLICK_FEEDBACK_MS),
      );
      return;
    }

    if (inputIndex === sequence.length - 1) {
      const solvedLevel = sequence.length;
      const nextSequence = buildNextSequence(sequence);

      timeoutsRef.current.push(
        setTimeout(() => {
          setCompletedLevel(solvedLevel);
          setBestLevel((current) => Math.max(current, solvedLevel));
          setSequence(nextSequence);
          queuePlayback(nextSequence);
        }, NEXT_ROUND_DELAY_MS),
      );
      return;
    }

    setInputIndex((current) => current + 1);
  }

  function resetToIdle() {
    clearPlaybackTimers();
    clearTileFeedback();
    setPhase("idle");
    setSequence([]);
    setActiveTile(null);
    setInputIndex(0);
    setCompletedLevel(0);
    setSaveNotice(null);
  }

  function handleSaveScore() {
    setSaveNotice("Sequence Memory score saving will be added next.");
  }

  useEffect(() => {
    return () => {
      clearPlaybackTimers();
    };
  }, []);

  const visibleLevel =
    phase === "gameOver" ? completedLevel : sequence.length > 0 ? sequence.length : 1;
  const boardInteractive = phase === "input";
  const topStatus =
    phase === "idle"
      ? "Ready"
      : phase === "showing"
        ? "Watch the pattern"
        : phase === "input"
          ? `Step ${inputIndex + 1} of ${sequence.length}`
          : "Run finished";

  return (
    <div className="space-y-4">
      <nav className="flex items-center justify-between gap-2 border-b border-[var(--border-strong)] py-1">
        <ButtonLink
          href="/"
          variant="secondary"
          size="md"
          className="min-h-7 rounded-md border-[var(--border-strong)] bg-transparent px-2.5 py-0.5 text-[11px] font-semibold text-[var(--body)] shadow-none hover:border-[var(--accent-soft)] hover:bg-[var(--panel-soft)] hover:text-[var(--foreground-strong)]"
        >
          Home
        </ButtonLink>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--body-subtle)]">
          Best {bestLevel}
        </span>
        <Button
          type="button"
          variant="secondary"
          size="md"
          className="min-h-7 rounded-md border-[var(--border-strong)] bg-transparent px-2.5 py-0.5 text-[11px] font-semibold text-[var(--body)] shadow-none hover:border-[var(--accent-soft)] hover:bg-[var(--panel-soft)] hover:text-[var(--foreground-strong)]"
          onClick={resetToIdle}
        >
          Reset
        </Button>
      </nav>

      <section className="relative left-1/2 w-screen -translate-x-1/2 border-y border-[var(--border-strong)] bg-[#2f78b7] px-6 py-8 text-white">
        <div className="mx-auto flex min-h-[66vh] max-w-4xl flex-col items-center justify-center text-center">
          {phase === "gameOver" ? (
            <>
              <div className="grid grid-cols-2 gap-2 text-white/90">
                <div className="h-9 w-9 rounded-md bg-white/85" />
                <div className="h-9 w-9 rounded-md bg-white/85" />
                <div className="h-9 w-9 rounded-md bg-white/85" />
                <div className="h-9 w-9 rounded-md border-4 border-white/85 bg-transparent" />
              </div>
              <p className="mt-10 text-2xl font-medium text-white/90 sm:text-3xl">Sequence Memory</p>
              <h1 className="mt-3 text-6xl font-light tracking-tight text-white sm:text-8xl">
                Level {completedLevel}
              </h1>
              <p className="mt-6 text-base text-white/85">Save your score to see how you compare.</p>
              {saveNotice ? <p className="mt-3 text-sm text-white/80">{saveNotice}</p> : null}
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button
                  onClick={handleSaveScore}
                  size="lg"
                  className="border-[var(--accent-secondary)] bg-[var(--accent-secondary)] px-6 text-[var(--foreground-strong)] hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)]"
                >
                  Save score
                </Button>
                <Button
                  variant="secondary"
                  onClick={startFreshGame}
                  size="lg"
                  className="border-white/25 bg-black/20 text-white hover:border-white/40 hover:bg-black/30"
                >
                  Try again
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">{topStatus}</p>
              <p className="mt-7 text-3xl font-medium text-white/85 sm:text-4xl">Level: {visibleLevel}</p>
              <div className="mt-8 w-full max-w-[280px] sm:max-w-[320px]">
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: GRID_SIZE }, (_, tileIndex) => {
                    const isPlaybackTile = activeTile === tileIndex;
                    const isFeedbackTile = feedbackTile === tileIndex;
                    const isCorrectFeedback = isFeedbackTile && feedbackTone === "correct";
                    const isWrongFeedback = isFeedbackTile && feedbackTone === "wrong";

                    return (
                      <button
                        key={tileIndex}
                        type="button"
                        disabled={!boardInteractive}
                        onClick={() => handleTilePress(tileIndex)}
                        className={`aspect-square rounded-md border transition ${
                          isPlaybackTile
                            ? "border-blue-100 bg-blue-200 shadow-[0_0_0_1px_rgba(255,255,255,0.22),0_0_32px_rgba(186,230,253,0.55)]"
                            : isCorrectFeedback
                              ? "border-emerald-100 bg-emerald-300/95 shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_0_22px_rgba(74,222,128,0.38)]"
                              : isWrongFeedback
                                ? "border-red-200 bg-red-400/95 shadow-[0_0_0_1px_rgba(255,255,255,0.16),0_0_20px_rgba(248,113,113,0.38)]"
                                : "border-[#2a6ba3] bg-[#2865a0] hover:border-blue-200/60"
                        } ${boardInteractive ? "cursor-pointer" : "cursor-default"}`}
                        aria-label={`Sequence tile ${tileIndex + 1}`}
                      />
                    );
                  })}
                </div>
              </div>
              {phase === "idle" ? (
                <>
                  <p className="mt-8 max-w-xl text-base text-white/85">
                    Memorize the sequence of buttons that light up, then press them in order.
                  </p>
                  <div className="mt-8">
                    <Button
                      onClick={startFreshGame}
                      size="lg"
                      className="border-[var(--accent-secondary)] bg-[var(--accent-secondary)] px-6 text-[var(--foreground-strong)] hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)]"
                    >
                      Start
                    </Button>
                  </div>
                </>
              ) : phase === "showing" ? (
                <p className="mt-8 text-base text-white/85">Memorize the pattern, then repeat it.</p>
              ) : (
                <p className="mt-8 text-base text-white/85">Click the glowing tiles in the correct order.</p>
              )}
            </>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card inset className="p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--body-subtle)]">Current Level</p>
          <p className="mt-3 text-3xl font-medium tracking-[-0.03em] text-[var(--heading)]">{visibleLevel}</p>
        </Card>
        <Card inset className="p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--body-subtle)]">Best Level</p>
          <p className="mt-3 text-3xl font-medium tracking-[-0.03em] text-[var(--heading)]">{bestLevel}</p>
        </Card>
        <Card inset className="p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--body-subtle)]">Rules</p>
          <p className="mt-3 text-sm leading-6 text-[var(--body)]">
            Memorize the sequence, repeat it in order, and make one mistake only when you want the run to end.
          </p>
        </Card>
      </section>
    </div>
  );
}
