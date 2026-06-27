import { createServer } from "node:http";

import next from "next";
import { Server } from "socket.io";

const dev = process.argv.includes("--dev");
const hostname = process.env.HOSTNAME ?? "0.0.0.0";
const port = Number(process.env.PORT ?? 3000);
const TOTAL_ROUNDS = 5;
const rooms = new Map();

function generateRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let index = 0; index < 5; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}

function findOpenCode() {
  let code = generateRoomCode();

  while (rooms.has(code)) {
    code = generateRoomCode();
  }

  return code;
}

function clearRoomTimer(room) {
  if (room.timer) {
    clearTimeout(room.timer);
    room.timer = null;
  }
}

function sanitizeName(value) {
  const trimmed = String(value ?? "").trim();
  return trimmed.length > 0 ? trimmed.slice(0, 24) : "Player";
}

function getPlayerStats(room, playerId) {
  const rounds = room.rounds
    .map((round) => round.results.find((result) => result.playerId === playerId))
    .filter(Boolean);

  const validResults = rounds.filter((result) => result.reactionMs !== null);
  const averageMs =
    validResults.length > 0
      ? Math.round(
          validResults.reduce((sum, result) => sum + result.reactionMs, 0) /
            validResults.length,
        )
      : null;
  const bestMs =
    validResults.length > 0
      ? Math.min(...validResults.map((result) => result.reactionMs))
      : null;
  const falseStarts = rounds.filter((result) => result.falseStart).length;

  return {
    averageMs,
    bestMs,
    falseStarts,
  };
}

function sortScoreboard(room) {
  return room.players
    .map((player) => ({
      ...player,
      stats: getPlayerStats(room, player.id),
    }))
    .sort((left, right) => {
      const leftAverage = left.stats.averageMs ?? Number.POSITIVE_INFINITY;
      const rightAverage = right.stats.averageMs ?? Number.POSITIVE_INFINITY;

      if (leftAverage !== rightAverage) {
        return leftAverage - rightAverage;
      }

      const leftBest = left.stats.bestMs ?? Number.POSITIVE_INFINITY;
      const rightBest = right.stats.bestMs ?? Number.POSITIVE_INFINITY;

      if (leftBest !== rightBest) {
        return leftBest - rightBest;
      }

      return left.stats.falseStarts - right.stats.falseStarts;
    });
}

function createSnapshot(room) {
  return {
    code: room.code,
    phase: room.phase,
    currentRound: room.currentRound,
    totalRounds: TOTAL_ROUNDS,
    hostId: room.hostId,
    winnerId: room.winnerId,
    message: room.message,
    players: room.players.map((player) => ({
      id: player.id,
      name: player.name,
      isHost: player.id === room.hostId,
      ready: player.ready,
    })),
    rounds: room.rounds,
    submittedPlayerIds: Object.keys(room.pendingResults),
    scoreboard: sortScoreboard(room),
    createdAt: room.createdAt,
    completedAt: room.completedAt,
  };
}

function emitRoom(io, room) {
  io.to(room.code).emit("reaction:room-updated", createSnapshot(room));
}

function deleteRoomIfEmpty(roomCode) {
  const room = rooms.get(roomCode);

  if (!room) {
    return;
  }

  if (room.players.length === 0) {
    clearRoomTimer(room);
    rooms.delete(roomCode);
  }
}

function markRoomComplete(io, room, message) {
  room.phase = "complete";
  room.completedAt = new Date().toISOString();
  room.message = message;

  const [winner] = sortScoreboard(room);
  room.winnerId = winner?.id ?? null;
  emitRoom(io, room);
}

function finishRound(io, room) {
  const roundResults = Object.values(room.pendingResults);

  room.rounds.push({
    round: room.currentRound,
    results: roundResults,
  });
  room.pendingResults = {};

  if (room.rounds.length >= TOTAL_ROUNDS) {
    markRoomComplete(io, room, "Match complete. Leave or create a new room to duel again.");
    return;
  }

  room.phase = "roundResult";
  room.currentRound = room.rounds.length + 1;
  room.message = `Round ${room.rounds.length} complete. Host can start round ${room.currentRound}.`;
  emitRoom(io, room);
}

function scheduleRound(io, room) {
  clearRoomTimer(room);
  room.phase = "waiting";
  room.message = `Round ${room.currentRound}: wait for the signal.`;
  emitRoom(io, room);

  const delay = 1800 + Math.floor(Math.random() * 2200);
  room.timer = setTimeout(() => {
    room.phase = "ready";
    room.message = `Round ${room.currentRound}: click now.`;
    room.timer = null;
    emitRoom(io, room);
  }, delay);
}

function buildAck(callback, payload) {
  if (typeof callback === "function") {
    callback(payload);
  }
}

function findRoomOrAck(roomCode, callback) {
  const room = rooms.get(String(roomCode ?? "").trim().toUpperCase());

  if (!room) {
    buildAck(callback, { ok: false, error: "Room not found." });
    return null;
  }

  return room;
}

function ensureHost(room, socket, callback) {
  if (room.hostId !== socket.id) {
    buildAck(callback, { ok: false, error: "Only the host can do that." });
    return false;
  }

  return true;
}

function ensurePlayer(room, socket, callback) {
  const player = room.players.find((entry) => entry.id === socket.id);

  if (!player) {
    buildAck(callback, { ok: false, error: "You are not in this room." });
    return null;
  }

  return player;
}

function createRoom(socket, io, payload, callback) {
  const code = findOpenCode();
  const player = {
    id: socket.id,
    name: sanitizeName(payload?.name),
    ready: false,
  };

  const room = {
    code,
    hostId: socket.id,
    winnerId: null,
    phase: "lobby",
    currentRound: 1,
    message: "Room created. Share the code and wait for your opponent.",
    players: [player],
    rounds: [],
    pendingResults: {},
    createdAt: new Date().toISOString(),
    completedAt: null,
    timer: null,
  };

  rooms.set(code, room);
  socket.join(code);
  buildAck(callback, {
    ok: true,
    room: createSnapshot(room),
    playerId: socket.id,
  });
}

function joinRoom(socket, io, payload, callback) {
  const room = findRoomOrAck(payload?.roomCode, callback);

  if (!room) {
    return;
  }

  if (room.players.length >= 2) {
    buildAck(callback, { ok: false, error: "This room already has two players." });
    return;
  }

  if (room.phase === "complete") {
    buildAck(callback, { ok: false, error: "This room is already complete." });
    return;
  }

  const player = {
    id: socket.id,
    name: sanitizeName(payload?.name),
    ready: false,
  };

  room.players.push(player);
  room.message = "Both players are here. Get ready for round 1.";
  socket.join(room.code);
  emitRoom(io, room);
  buildAck(callback, {
    ok: true,
    room: createSnapshot(room),
    playerId: socket.id,
  });
}

function toggleReady(socket, io, payload, callback) {
  const room = findRoomOrAck(payload?.roomCode, callback);

  if (!room) {
    return;
  }

  if (room.phase !== "lobby") {
    buildAck(callback, { ok: false, error: "Ready toggles are only available before round 1." });
    return;
  }

  const player = ensurePlayer(room, socket, callback);

  if (!player) {
    return;
  }

  player.ready = Boolean(payload?.ready);
  room.message = room.players.length < 2
    ? "Waiting for another player to join."
    : room.players.every((entry) => entry.ready)
      ? "Both players ready. Host can start round 1."
      : "Waiting for both players to get ready.";

  emitRoom(io, room);
  buildAck(callback, { ok: true });
}

function startRound(socket, io, payload, callback) {
  const room = findRoomOrAck(payload?.roomCode, callback);

  if (!room) {
    return;
  }

  if (!ensureHost(room, socket, callback)) {
    return;
  }

  if (room.players.length !== 2) {
    buildAck(callback, { ok: false, error: "You need two players to start." });
    return;
  }

  if (room.phase === "lobby" && !room.players.every((player) => player.ready)) {
    buildAck(callback, { ok: false, error: "Both players need to be ready first." });
    return;
  }

  if (room.phase === "waiting" || room.phase === "ready") {
    buildAck(callback, { ok: false, error: "A round is already in progress." });
    return;
  }

  if (room.phase === "complete") {
    buildAck(callback, { ok: false, error: "This match is already complete." });
    return;
  }

  room.pendingResults = {};
  scheduleRound(io, room);
  buildAck(callback, { ok: true });
}

function submitClick(socket, io, payload, callback) {
  const room = findRoomOrAck(payload?.roomCode, callback);

  if (!room) {
    return;
  }

  const player = ensurePlayer(room, socket, callback);

  if (!player) {
    return;
  }

  if (room.phase !== "waiting" && room.phase !== "ready") {
    buildAck(callback, { ok: false, error: "No active round to submit." });
    return;
  }

  if (room.pendingResults[player.id]) {
    buildAck(callback, { ok: false, error: "You already submitted this round." });
    return;
  }

  let reactionMs = null;
  let falseStart = false;

  if (room.phase === "waiting" || payload?.falseStart) {
    falseStart = true;
  } else {
    const value = Number(payload?.reactionMs);

    if (!Number.isFinite(value) || value < 1) {
      buildAck(callback, { ok: false, error: "Reaction time is invalid." });
      return;
    }

    reactionMs = Math.round(Math.min(value, 5000));
  }

  room.pendingResults[player.id] = {
    playerId: player.id,
    playerName: player.name,
    reactionMs,
    falseStart,
  };

  if (Object.keys(room.pendingResults).length === room.players.length) {
    finishRound(io, room);
  } else {
    room.message = `${player.name} locked in. Waiting for the other player.`;
    emitRoom(io, room);
  }

  buildAck(callback, { ok: true });
}

function leaveRoom(socket, io, payload, callback) {
  const room = findRoomOrAck(payload?.roomCode, callback);

  if (!room) {
    return;
  }

  clearRoomTimer(room);
  room.players = room.players.filter((player) => player.id !== socket.id);
  socket.leave(room.code);

  if (room.players.length === 0) {
    rooms.delete(room.code);
  } else {
    if (room.hostId === socket.id) {
      room.hostId = room.players[0].id;
    }

    if (room.phase !== "complete") {
      room.message =
        room.rounds.length > 0
          ? `${sanitizeName(payload?.name) || "A player"} left. Match awarded by forfeit.`
          : "A player left the room. Waiting for a new opponent.";

      if (room.rounds.length > 0) {
        room.completedAt = new Date().toISOString();
        room.phase = "complete";
        room.winnerId = room.players[0]?.id ?? null;
      } else {
        room.phase = "lobby";
        room.players.forEach((player) => {
          player.ready = false;
        });
      }
    }

    emitRoom(io, room);
  }

  buildAck(callback, { ok: true });
}

function handleDisconnect(socket, io) {
  for (const room of rooms.values()) {
    if (!room.players.some((player) => player.id === socket.id)) {
      continue;
    }

    clearRoomTimer(room);
    room.players = room.players.filter((player) => player.id !== socket.id);

    if (room.players.length === 0) {
      rooms.delete(room.code);
      continue;
    }

    if (room.hostId === socket.id) {
      room.hostId = room.players[0].id;
    }

    if (room.phase !== "complete" && room.rounds.length > 0) {
      room.phase = "complete";
      room.completedAt = new Date().toISOString();
      room.winnerId = room.players[0]?.id ?? null;
      room.message = "Opponent disconnected. Match awarded by forfeit.";
    } else {
      room.phase = "lobby";
      room.message = "Opponent disconnected. Waiting for another player.";
      room.players.forEach((player) => {
        player.ready = false;
      });
    }

    emitRoom(io, room);
    deleteRoomIfEmpty(room.code);
  }
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((request, response) => {
    handle(request, response);
  });
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    socket.on("reaction:create-room", (payload, callback) => {
      createRoom(socket, io, payload, callback);
    });

    socket.on("reaction:join-room", (payload, callback) => {
      joinRoom(socket, io, payload, callback);
    });

    socket.on("reaction:toggle-ready", (payload, callback) => {
      toggleReady(socket, io, payload, callback);
    });

    socket.on("reaction:start-round", (payload, callback) => {
      startRound(socket, io, payload, callback);
    });

    socket.on("reaction:submit-click", (payload, callback) => {
      submitClick(socket, io, payload, callback);
    });

    socket.on("reaction:leave-room", (payload, callback) => {
      leaveRoom(socket, io, payload, callback);
    });

    socket.on("disconnect", () => {
      handleDisconnect(socket, io);
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(
      `> Ready on http://${hostname === "0.0.0.0" ? "localhost" : hostname}:${port}`,
    );
  });
});
