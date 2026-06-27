"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";

import { io, type Socket } from "socket.io-client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { isStaticDemo } from "@/lib/app-mode";

type SoloPhase = "idle" | "waiting" | "ready" | "result" | "tooSoon";
type Mode = "solo" | "duel";

type PlayerSnapshot = {
  id: string;
  name: string;
  isHost: boolean;
  ready: boolean;
};

type ScoreboardEntry = {
  id: string;
  name: string;
  stats: {
    averageMs: number | null;
    bestMs: number | null;
    falseStarts: number;
  };
};

type RoundEntry = {
  playerId: string;
  playerName: string;
  reactionMs: number | null;
  falseStart: boolean;
};

type CompletedRound = {
  round: number;
  results: RoundEntry[];
};

type RoomSnapshot = {
  code: string;
  phase: "lobby" | "waiting" | "ready" | "roundResult" | "complete";
  currentRound: number;
  totalRounds: number;
  hostId: string;
  winnerId: string | null;
  message: string;
  players: PlayerSnapshot[];
  rounds: CompletedRound[];
  submittedPlayerIds: string[];
  scoreboard: ScoreboardEntry[];
};

type Attempt = {
  id: string;
  reactionMs: number | null;
  tooSoon: boolean;
};

type AckResponse = {
  ok: boolean;
  error?: string;
  room?: RoomSnapshot;
  playerId?: string;
};

const SOLO_REACTION_GOAL = 5;
const WAIT_MIN_MS = 1800;
const WAIT_RANGE_MS = 2200;

function formatReaction(value: number | null) {
  return value !== null ? `${value} ms` : "--";
}

function getSocket() {
  return io({
    autoConnect: false,
  });
}

export function ReactionDuelClient() {
  const [mode, setMode] = useState<Mode>("solo");
  const [phase, setPhase] = useState<SoloPhase>("idle");
  const [lastReactionMs, setLastReactionMs] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [playerName, setPlayerName] = useState("Player One");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [socketStatus, setSocketStatus] = useState(isStaticDemo ? "Demo mode" : "Connecting...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<"create" | "join" | "ready" | "start" | "leave" | "save" | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const readyFrameRef = useRef<number | null>(null);

  const clearReadyFrame = useCallback(() => {
    if (readyFrameRef.current !== null) {
      cancelAnimationFrame(readyFrameRef.current);
      readyFrameRef.current = null;
    }
  }, []);

  const syncStartTimestamp = useCallback(() => {
    clearReadyFrame();

    // Seed immediately, then resync on the next frame so the timer stays closer
    // to the moment the green state is actually visible on screen.
    startedAtRef.current = performance.now();
    readyFrameRef.current = requestAnimationFrame(() => {
      startedAtRef.current = performance.now();
      readyFrameRef.current = null;
    });
  }, [clearReadyFrame]);

  useEffect(() => {
    if (isStaticDemo) {
      setSocketStatus("GitHub Pages demo");

      return () => {
        clearReadyFrame();
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }

    const socket = getSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketStatus("Connected");
      setPlayerId(socket.id ?? null);
    });

    socket.on("disconnect", () => {
      setSocketStatus("Disconnected");
      setPlayerId(null);
    });

    socket.on("connect_error", () => {
      setSocketStatus("Connection error");
    });

    socket.on("reaction:room-updated", (nextRoom: RoomSnapshot) => {
      setRoom(nextRoom);
      setErrorMessage(null);
    });

    socket.connect();

    return () => {
      clearReadyFrame();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      socket.disconnect();
      socketRef.current = null;
    };
  }, [clearReadyFrame]);

  useLayoutEffect(() => {
    if (mode === "solo" && phase === "ready") {
      syncStartTimestamp();
      return;
    }

    if (mode === "solo") {
      clearReadyFrame();
      startedAtRef.current = null;
    }
  }, [clearReadyFrame, mode, phase, syncStartTimestamp]);

  useLayoutEffect(() => {
    if (mode === "duel" && room?.phase === "ready") {
      syncStartTimestamp();
      return;
    }

    if (mode === "duel") {
      clearReadyFrame();
      startedAtRef.current = null;
    }
  }, [clearReadyFrame, mode, room?.currentRound, room?.phase, syncStartTimestamp]);

  const validAttempts = useMemo(
    () => attempts.filter((attempt): attempt is Attempt & { reactionMs: number } => attempt.reactionMs !== null),
    [attempts],
  );
  const soloCompletedReactions = Math.min(validAttempts.length, SOLO_REACTION_GOAL);
  const soloRunComplete = soloCompletedReactions >= SOLO_REACTION_GOAL;
  const averageMs = useMemo(() => {
    if (validAttempts.length === 0) {
      return null;
    }

    return Math.round(
      validAttempts.reduce((sum, attempt) => sum + attempt.reactionMs, 0) / validAttempts.length,
    );
  }, [validAttempts]);
  const bestMs = useMemo(() => {
    if (validAttempts.length === 0) {
      return null;
    }

    return Math.min(...validAttempts.map((attempt) => attempt.reactionMs));
  }, [validAttempts]);
  const falseStarts = useMemo(
    () => attempts.filter((attempt) => attempt.tooSoon).length,
    [attempts],
  );
  const currentPlayer = useMemo(
    () => room?.players.find((entry) => entry.id === playerId) ?? null,
    [playerId, room],
  );
  const opponent = useMemo(
    () => room?.players.find((entry) => entry.id !== playerId) ?? null,
    [playerId, room],
  );
  const alreadySubmitted = useMemo(
    () => (playerId ? room?.submittedPlayerIds.includes(playerId) ?? false : false),
    [playerId, room],
  );
  const duelScore = useMemo(
    () => room?.scoreboard.find((entry) => entry.id === playerId)?.stats ?? null,
    [playerId, room],
  );
  const duelAttempts = useMemo(() => {
    if (!room || !playerId) {
      return [];
    }

    return room.rounds
      .map((round) => ({
        round: round.round,
        result: round.results.find((entry) => entry.playerId === playerId) ?? null,
      }))
      .filter((entry): entry is { round: number; result: RoundEntry } => entry.result !== null)
      .map((entry) => ({
        id: `round-${entry.round}`,
        reactionMs: entry.result.reactionMs,
        tooSoon: entry.result.falseStart,
      }))
      .reverse();
  }, [playerId, room]);

  function clearPendingTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function scheduleReadyState() {
    clearPendingTimer();
    clearReadyFrame();
    startedAtRef.current = null;
    setLastReactionMs(null);
    setErrorMessage(null);
    setPhase("waiting");

    const delay = WAIT_MIN_MS + Math.floor(Math.random() * WAIT_RANGE_MS);

    timerRef.current = setTimeout(() => {
      setPhase("ready");
      timerRef.current = null;
    }, delay);
  }

  function recordSoloAttempt(reactionMs: number | null, tooSoon: boolean) {
    setAttempts((current) => [
      {
        id: crypto.randomUUID(),
        reactionMs,
        tooSoon,
      },
      ...current,
    ]);
  }

  async function emitWithAck(event: string, payload: object) {
    return new Promise<AckResponse>((resolve) => {
      const socket = socketRef.current;

      if (!socket || !socket.connected) {
        resolve({
          ok: false,
          error: "Realtime connection is not ready yet. Please wait a moment and try again.",
        });
        return;
      }

      socket.emit(event, payload, (response: AckResponse) => {
        resolve(response);
      });
    });
  }

  async function withBusyAction<T>(
    action: "create" | "join" | "ready" | "start" | "leave" | "save",
    task: () => Promise<T>,
  ) {
    setBusyAction(action);

    try {
      return await task();
    } finally {
      setBusyAction((current) => (current === action ? null : current));
    }
  }

  function handleSoloFieldClick() {
    if ((phase === "idle" || phase === "result" || phase === "tooSoon") && !soloRunComplete) {
      scheduleReadyState();
      return;
    }

    if (phase === "waiting") {
      clearPendingTimer();
      clearReadyFrame();
      startedAtRef.current = null;
      setLastReactionMs(null);
      recordSoloAttempt(null, true);
      setPhase("tooSoon");
      return;
    }

    if (phase === "ready" && startedAtRef.current !== null) {
      const reactionMs = Math.round(performance.now() - startedAtRef.current);
      startedAtRef.current = null;
      setLastReactionMs(reactionMs);
      recordSoloAttempt(reactionMs, false);
      setPhase("result");
    }
  }

  function resetSoloRun() {
    clearPendingTimer();
    clearReadyFrame();
    startedAtRef.current = null;
    setAttempts([]);
    setLastReactionMs(null);
    setPhase("idle");
    setErrorMessage(null);
    setSaveNotice(null);
  }

  async function handleSaveSoloScore() {
    if (isStaticDemo) {
      setErrorMessage("Score saving is disabled on the GitHub Pages demo.");
      return;
    }

    const trimmedName = playerName.trim().slice(0, 24);

    if (trimmedName.length < 2) {
      setErrorMessage("Enter at least 2 characters to save your score.");
      return;
    }

    if (!soloRunComplete || averageMs === null) {
      setErrorMessage("Complete all 5 reactions before saving.");
      return;
    }

    const roomCode = `SOLO-${Date.now().toString(36).toUpperCase()}`;
    const rounds = validAttempts.slice(0, SOLO_REACTION_GOAL).map((attempt, index) => ({
      round: index + 1,
      reactionMs: attempt.reactionMs,
      falseStart: false,
    }));

    const response = await withBusyAction("save", async () => {
      const result = await fetch("/api/reaction-duel/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomCode,
          playerName: trimmedName,
          opponent: "Solo mode",
          result: "Tie",
          averageMs,
          bestMs,
          falseStarts,
          createdAt: new Date().toISOString(),
          rounds,
        }),
      });

      return (await result.json()) as { error?: string; saved?: boolean };
    });

    if (!response.saved) {
      setErrorMessage(response.error ?? "Could not save your score.");
      return;
    }

    setErrorMessage(null);
    setSaveNotice("Score saved. You can compare it on the leaderboard and profile pages.");
  }

  async function handleCreateRoom() {
    const trimmedName = playerName.trim().slice(0, 24);

    if (trimmedName.length < 2) {
      setErrorMessage("Enter at least 2 characters for your name.");
      return;
    }

    const response = await withBusyAction("create", () =>
      emitWithAck("reaction:create-room", {
        name: trimmedName,
      }),
    );

    if (!response.ok || !response.room) {
      setErrorMessage(response.error ?? "Unable to create room.");
      return;
    }

    setRoom(response.room);
    setRoomCodeInput(response.room.code);
    setPlayerId(response.playerId ?? socketRef.current?.id ?? null);
    setErrorMessage(null);
  }

  async function handleJoinRoom() {
    const trimmedName = playerName.trim().slice(0, 24);

    if (trimmedName.length < 2) {
      setErrorMessage("Enter at least 2 characters for your name.");
      return;
    }

    if (!roomCodeInput.trim()) {
      setErrorMessage("Enter a room code to join.");
      return;
    }

    const response = await withBusyAction("join", () =>
      emitWithAck("reaction:join-room", {
        name: trimmedName,
        roomCode: roomCodeInput.trim().toUpperCase(),
      }),
    );

    if (!response.ok || !response.room) {
      setErrorMessage(response.error ?? "Unable to join room.");
      return;
    }

    setRoom(response.room);
    setRoomCodeInput(response.room.code);
    setPlayerId(response.playerId ?? socketRef.current?.id ?? null);
    setErrorMessage(null);
  }

  async function handleToggleReady() {
    if (!room || !currentPlayer) {
      return;
    }

    const response = await withBusyAction("ready", () =>
      emitWithAck("reaction:toggle-ready", {
        roomCode: room.code,
        ready: !currentPlayer.ready,
      }),
    );

    if (!response.ok) {
      setErrorMessage(response.error ?? "Could not update ready state.");
    }
  }

  async function handleStartRound() {
    if (!room) {
      return;
    }

    const response = await withBusyAction("start", () =>
      emitWithAck("reaction:start-round", {
        roomCode: room.code,
      }),
    );

    if (!response.ok) {
      setErrorMessage(response.error ?? "Could not start the round.");
    }
  }

  async function handleLeaveRoom() {
    if (!room) {
      return;
    }

    await withBusyAction("leave", () =>
      emitWithAck("reaction:leave-room", {
        roomCode: room.code,
        name: playerName.trim().slice(0, 24),
      }),
    );

    setRoom(null);
    setRoomCodeInput("");
    setErrorMessage(null);
    startedAtRef.current = null;
  }

  async function submitDuelClick(payload: { reactionMs?: number; falseStart?: boolean }) {
    if (!room) {
      return;
    }

    const response = await emitWithAck("reaction:submit-click", {
      roomCode: room.code,
      ...payload,
    });

    if (!response.ok) {
      setErrorMessage(response.error ?? "Could not submit the click.");
    }
  }

  async function handleDuelFieldClick() {
    if (!room || alreadySubmitted) {
      return;
    }

    if (room.phase === "waiting") {
      clearReadyFrame();
      startedAtRef.current = null;
      await submitDuelClick({ falseStart: true });
      return;
    }

    if (room.phase === "ready" && startedAtRef.current !== null) {
      const reactionMs = Math.round(performance.now() - startedAtRef.current);
      startedAtRef.current = null;
      await submitDuelClick({ reactionMs });
    }
  }

  async function handleFieldPress() {
    if (mode === "duel") {
      await handleDuelFieldClick();
      return;
    }

    handleSoloFieldClick();
  }

  function handleModeChange(nextMode: Mode) {
    if (nextMode === mode) {
      return;
    }

    if (nextMode === "duel" && isStaticDemo) {
      setErrorMessage("Duel rooms are disabled on the GitHub Pages demo. Use the full app locally for multiplayer.");
      return;
    }

    clearPendingTimer();
    clearReadyFrame();
    startedAtRef.current = null;
    setErrorMessage(null);
    setSaveNotice(null);
    setMode(nextMode);
  }

  function handleFieldClick(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail !== 0) {
      return;
    }

    void handleFieldPress();
  }

  const duelPhase = room?.phase ?? "lobby";
  const activePhase = mode === "duel" ? duelPhase : phase;
  const fieldTheme =
    activePhase === "waiting"
      ? "border-[#b61f2d] bg-[#b61f2d]"
      : activePhase === "ready"
        ? "border-[#1ea24b] bg-[#1ea24b]"
        : "border-[#2f78b7] bg-[#2f78b7]";
  const headline = mode === "duel"
    ? duelPhase === "waiting"
      ? "Wait for green"
      : duelPhase === "ready"
        ? "Click!"
        : duelPhase === "complete"
          ? room?.winnerId === playerId
            ? "You win"
            : room?.winnerId === null
              ? "Tie"
              : "You lose"
          : room?.message ?? "Reaction Time Duel"
    : phase === "waiting"
      ? "Wait for green"
      : phase === "ready"
        ? "Click!"
        : phase === "tooSoon"
          ? "Too soon!"
          : soloRunComplete && averageMs !== null
            ? `${averageMs} ms`
            : phase === "result" && lastReactionMs !== null
            ? `${lastReactionMs} ms`
            : "Reaction Time Test";
  const subline = mode === "duel"
    ? duelPhase === "waiting"
      ? "Wait for the field to turn green on both screens."
      : duelPhase === "ready"
        ? alreadySubmitted
          ? "Your click is locked in."
          : "Click as soon as you see green."
        : duelPhase === "complete"
          ? "Use the controls below for another duel."
          : room?.message ?? "Create or join a room to begin."
    : phase === "waiting"
      ? "Wait for the color to change."
      : phase === "ready"
        ? "Click as soon as you see green."
        : phase === "tooSoon"
          ? "Click to try again."
          : soloRunComplete && averageMs !== null
            ? `Average of ${SOLO_REACTION_GOAL} reactions. Save your score or try again.`
          : phase === "result"
            ? `Reaction ${soloCompletedReactions} of ${SOLO_REACTION_GOAL} recorded. Click anywhere to continue.`
            : `Complete ${SOLO_REACTION_GOAL} reactions to get your average.`;
  const canClickField =
    mode === "duel"
      ? duelPhase === "waiting" || (duelPhase === "ready" && !alreadySubmitted)
      : !soloRunComplete;
  const recentAttempts = mode === "duel" ? duelAttempts : attempts;
  const statsBest = mode === "duel" ? duelScore?.bestMs ?? null : bestMs;
  const statsAverage = mode === "duel" ? duelScore?.averageMs ?? null : averageMs;
  const statsFalseStarts = mode === "duel" ? duelScore?.falseStarts ?? 0 : falseStarts;
  const canStartDuel =
    room !== null &&
    currentPlayer?.isHost === true &&
    room.players.length === 2 &&
    (room.phase === "lobby" || room.phase === "roundResult");

  return (
    <div className="space-y-1">
      <nav className="flex items-center justify-between gap-2 border-b border-[var(--border-strong)] py-1">
        <div className="flex items-center gap-2">
          <ButtonLink
            href="/"
            variant="secondary"
            size="md"
            className="min-h-7 rounded-md border-[var(--border-strong)] bg-transparent px-2.5 py-0.5 text-[11px] font-semibold text-[var(--body)] hover:border-[var(--accent-soft)] hover:bg-[var(--panel-soft)] hover:text-[var(--foreground-strong)]"
          >
            Home
          </ButtonLink>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--panel-soft)] p-0.5">
          <Button
            onClick={() => handleModeChange("solo")}
            variant="secondary"
            size="md"
            className={`min-h-6 rounded-md border-0 px-2.5 py-0 text-[11px] font-semibold shadow-none ${
              mode === "solo"
                ? "bg-[var(--accent)] text-[var(--foreground-strong)] hover:bg-[var(--accent-soft)]"
                : "bg-transparent text-[var(--body-subtle)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground-strong)]"
            }`}
          >
            Solo
          </Button>
          <Button
            onClick={() => handleModeChange("duel")}
            variant="secondary"
            size="md"
            className={`min-h-6 rounded-md border-0 px-2.5 py-0 text-[11px] font-semibold shadow-none ${
              mode === "duel"
                ? "bg-[var(--accent)] text-[var(--foreground-strong)] hover:bg-[var(--accent-soft)]"
                : "bg-transparent text-[var(--body-subtle)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground-strong)]"
            }`}
          >
            Duel
          </Button>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--body-subtle)]">
            {mode === "duel" ? socketStatus : `${soloCompletedReactions}/${SOLO_REACTION_GOAL}`}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="md"
            className="min-h-7 rounded-md border-[var(--border-strong)] bg-transparent px-2.5 py-0.5 text-[11px] font-semibold text-[var(--body)] shadow-none hover:border-[var(--accent-soft)] hover:bg-[var(--panel-soft)] hover:text-[var(--foreground-strong)]"
            onClick={() => setErrorMessage("Login is not available yet.")}
          >
            Login
          </Button>
        </div>
      </nav>

      {errorMessage ? (
        <Card inset className="p-4">
          <p className="text-sm text-[var(--danger)]">{errorMessage}</p>
        </Card>
      ) : null}

      <section
        className={`relative left-1/2 min-h-[62vh] w-screen -translate-x-1/2 border-y text-white transition ${fieldTheme}`}
        aria-live="polite"
      >
        <button
          type="button"
          onPointerDown={() => {
            void handleFieldPress();
          }}
          onClick={handleFieldClick}
          disabled={!canClickField}
          className={`flex min-h-[62vh] w-full touch-manipulation select-none flex-col items-center justify-center px-6 py-12 text-center ${canClickField ? "cursor-pointer" : "cursor-default"}`}
        >
          <p className="text-4xl tracking-[0.35em] text-white/80 sm:text-5xl">...</p>
          <h2 className="mt-8 text-4xl font-semibold sm:text-6xl">{headline}</h2>
          <p className="mt-4 text-base text-white/85 sm:text-lg">{subline}</p>
        </button>

        {mode === "solo" && soloRunComplete ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-6 pb-12">
            <div className="pointer-events-auto flex w-full max-w-xl flex-col items-center gap-4 text-center">
              <div className="w-full max-w-sm">
                <label className="mb-2 block text-sm font-medium text-white/90" htmlFor="solo-player-name">
                  Player name
                </label>
                <input
                  id="solo-player-name"
                  value={playerName}
                  onChange={(event) => {
                    setPlayerName(event.target.value);
                    setSaveNotice(null);
                  }}
                  placeholder="Name for leaderboard and history"
                  maxLength={24}
                  className="w-full rounded-xl border border-white/20 bg-[#0d0b08]/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/45 focus:border-[var(--accent-secondary)]/70 focus-visible:ring-2 focus-visible:ring-[var(--accent-secondary)]/30"
                />
              </div>
              {isStaticDemo ? (
                <p className="text-sm text-white/90">
                  GitHub Pages demo mode does not support saved scores, history, or profiles yet.
                </p>
              ) : saveNotice ? (
                <p className="text-sm text-white/90">{saveNotice}</p>
              ) : null}
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  onClick={handleSaveSoloScore}
                  loading={busyAction === "save"}
                  disabled={isStaticDemo || saveNotice !== null}
                  size="lg"
                  className="border-[var(--accent-secondary)] bg-[var(--accent-secondary)] text-[var(--foreground-strong)] hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)]"
                >
                  {isStaticDemo ? "Save unavailable" : saveNotice ? "Saved" : "Save score"}
                </Button>
                <Button variant="secondary" onClick={resetSoloRun} size="lg" className="border-white/25 bg-black/20 text-white hover:border-white/40 hover:bg-black/30">
                  Try again
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {mode === "duel" ? (
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <Card inset className="p-5">
            <label className="mb-2 block text-sm font-medium text-[var(--heading)]" htmlFor="player-name">
              Player name
            </label>
            <input
              id="player-name"
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              placeholder="Your display name"
              maxLength={24}
              className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--panel-soft)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--body-subtle)] focus:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30"
            />
          </Card>
          <Card inset className="p-5">
            <p className="mb-2 text-sm font-medium text-[var(--heading)]">Room actions</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleCreateRoom} loading={busyAction === "create"} size="lg">
                Create room
              </Button>
              <input
                value={roomCodeInput}
                onChange={(event) => setRoomCodeInput(event.target.value.toUpperCase())}
                placeholder="CODE"
                maxLength={6}
                className="w-[128px] rounded-xl border border-[var(--border-strong)] bg-[var(--panel-soft)] px-4 py-3 text-center text-sm tracking-[0.25em] text-[var(--foreground)] outline-none transition placeholder:text-[var(--body-subtle)] focus:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30"
              />
              <Button
                variant="secondary"
                onClick={handleJoinRoom}
                loading={busyAction === "join"}
                size="lg"
              >
                Join
              </Button>
            </div>
          </Card>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <Card inset className="p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--body-subtle)]">Best</p>
          <p className="mt-3 text-3xl font-medium tracking-[-0.03em] text-[var(--heading)]">{formatReaction(statsBest)}</p>
        </Card>
        <Card inset className="p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--body-subtle)]">Average</p>
          <p className="mt-3 text-3xl font-medium tracking-[-0.03em] text-[var(--heading)]">{formatReaction(statsAverage)}</p>
        </Card>
        <Card inset className="p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--body-subtle)]">False Starts</p>
          <p className="mt-3 text-3xl font-medium tracking-[-0.03em] text-[var(--heading)]">{statsFalseStarts}</p>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--body-subtle)]">
            {mode === "duel" ? "Duel Mode" : "Solo Mode"}
          </p>
          <p className="mt-3 text-base leading-7 text-[var(--body)]">
            {mode === "duel"
              ? "Reaction time is measured on the client with performance.now() using pointer-down input and a paint-synced ready timestamp, while the server still controls room state and validates each round."
              : isStaticDemo
                ? `Complete ${SOLO_REACTION_GOAL} valid reactions to get your final average. This GitHub Pages demo keeps the solo test playable, but score saving and multiplayer stay in the full app.`
                : `Complete ${SOLO_REACTION_GOAL} valid reactions to get your final average. False starts do not count toward the five, and you can save the finished run under a player name.`}
          </p>
          {mode === "duel" && room ? (
            <div className="mt-4 flex flex-wrap gap-3">
              <Badge tone="info">Room {room.code}</Badge>
              <Badge tone="neutral">
                {room.players.map((entry) => entry.name).join(" vs ") || "Waiting for players"}
              </Badge>
            </div>
          ) : null}
        </Card>

        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--body-subtle)]">
            {mode === "duel" ? "Current Duel" : "Current Run"}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {mode === "duel" && room ? (
              <>
                <span className="rounded-lg border border-[var(--border-strong)] bg-[var(--panel-soft)] px-3 py-2 text-sm text-[var(--foreground)]">
                  Round {room.phase === "complete" ? room.totalRounds : room.currentRound} / {room.totalRounds}
                </span>
                <span className="rounded-lg border border-[var(--border-strong)] bg-[var(--panel-soft)] px-3 py-2 text-sm text-[var(--foreground)]">
                  Opponent: {opponent?.name ?? "Waiting..."}
                </span>
                <span className="rounded-lg border border-[var(--border-strong)] bg-[var(--panel-soft)] px-3 py-2 text-sm text-[var(--foreground)]">
                  {currentPlayer?.isHost ? "You are host" : "You are guest"}
                </span>
              </>
            ) : recentAttempts.length === 0 ? (
              <p className="text-sm leading-6 text-[var(--body)]">
                {mode === "duel"
                  ? "Create or join a room, then start the duel."
                  : "No attempts yet. Start the test above."}
              </p>
            ) : (
              recentAttempts.slice(0, 12).map((attempt) => (
                <span
                  key={attempt.id}
                  className={`rounded-md border px-3 py-2 text-sm ${
                    attempt.tooSoon
                      ? "border-[var(--warning-border)] bg-[var(--warning-soft)] text-[var(--warning)]"
                      : "border-[var(--border-strong)] bg-[var(--panel-soft)] text-[var(--foreground)]"
                  }`}
                >
                  {attempt.tooSoon ? "Too soon" : `${attempt.reactionMs} ms`}
                </span>
              ))
            )}
          </div>
          {mode === "duel" ? (
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                onClick={handleToggleReady}
                disabled={!currentPlayer || room?.phase !== "lobby"}
                loading={busyAction === "ready"}
                size="lg"
              >
                {currentPlayer?.ready ? "Unready" : "Ready"}
              </Button>
              <Button
                variant="secondary"
                onClick={handleStartRound}
                disabled={!canStartDuel}
                loading={busyAction === "start"}
                size="lg"
              >
                {room?.phase === "roundResult" ? "Next round" : "Start duel"}
              </Button>
              <Button
                variant="secondary"
                onClick={handleLeaveRoom}
                disabled={!room}
                loading={busyAction === "leave"}
                size="lg"
              >
                Leave room
              </Button>
            </div>
          ) : null}
        </Card>
      </section>
    </div>
  );
}
