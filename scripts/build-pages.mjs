import { access, cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, "..");
const excludedEntries = [
  {
    source: resolve(projectRoot, "src", "app", "api"),
    temp: resolve(projectRoot, ".pages-build", "app-api"),
  },
  {
    source: resolve(projectRoot, "src", "app", "profile"),
    temp: resolve(projectRoot, ".pages-build", "app-profile"),
  },
];
const nextBin = resolve(projectRoot, "node_modules", "next", "dist", "bin", "next");

async function moveEntryOutOfTheWay(entry) {
  await rm(entry.temp, { recursive: true, force: true });
  await mkdir(dirname(entry.temp), { recursive: true });

  try {
    await access(entry.source);
  } catch (error) {
    const candidate = error;

    if (candidate && typeof candidate === "object" && "code" in candidate && candidate.code === "ENOENT") {
      return false;
    }

    throw error;
  }

  await cp(entry.source, entry.temp, { recursive: true });
  await rm(entry.source, { recursive: true, force: true });

  return true;
}

function runNextBuild() {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(process.execPath, [nextBin, "build"], {
      cwd: projectRoot,
      stdio: "inherit",
      env: {
        ...process.env,
        GITHUB_PAGES: "true",
        NEXT_PUBLIC_STATIC_DEMO: "true",
      },
    });

    child.on("error", rejectPromise);
    child.on("exit", (code) => {
      resolvePromise(code ?? 1);
    });
  });
}

async function restoreEntry(entry, moved) {
  if (!moved) {
    return;
  }

  await rm(entry.source, { recursive: true, force: true });
  await cp(entry.temp, entry.source, { recursive: true });
  await rm(entry.temp, { recursive: true, force: true });
}

async function main() {
  const movedEntries = [];

  for (const entry of excludedEntries) {
    const moved = await moveEntryOutOfTheWay(entry);
    movedEntries.push({ entry, moved });
  }

  try {
    const exitCode = await runNextBuild();
    for (const item of [...movedEntries].reverse()) {
      await restoreEntry(item.entry, item.moved);
    }
    await rm(resolve(projectRoot, ".pages-build"), { recursive: true, force: true });
    return exitCode;
  } catch (error) {
    for (const item of [...movedEntries].reverse()) {
      await restoreEntry(item.entry, item.moved);
    }
    await rm(resolve(projectRoot, ".pages-build"), { recursive: true, force: true });
    throw error;
  }
}

const exitCode = await main();
process.exit(exitCode ?? 0);
