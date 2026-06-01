const fs = require("fs");
const path = require("path");

function resolveCommandOnPath(command, pathValue = process.env.PATH || "") {
  const rawCommand = String(command || "").trim();
  if (!rawCommand) return null;

  const pathDirs = String(pathValue || "")
    .split(path.delimiter)
    .map((dir) => dir.trim())
    .filter(Boolean);
  const extensions =
    process.platform === "win32" && !path.extname(rawCommand)
      ? String(process.env.PATHEXT || ".COM;.EXE;.BAT;.CMD")
          .split(";")
          .filter(Boolean)
      : [""];

  for (const dir of pathDirs) {
    for (const extension of extensions) {
      const candidate = path.join(dir, `${rawCommand}${extension}`);
      try {
        fs.accessSync(
          candidate,
          process.platform === "win32" ? fs.constants.F_OK : fs.constants.X_OK,
        );
        return candidate;
      } catch (_error) {
        // try next candidate
      }
    }
  }

  return null;
}

function resolveExistingToolPath(
  baseDir,
  candidates,
  { allowPathLookup = false, pathValue = process.env.PATH || "" } = {},
) {
  const normalizedBaseDir = String(baseDir || "").trim();
  const list = Array.isArray(candidates) ? candidates : [];

  for (const candidate of list) {
    const rawCandidate = String(candidate || "").trim();
    if (!rawCandidate) continue;

    const absoluteCandidate = path.isAbsolute(rawCandidate)
      ? rawCandidate
      : normalizedBaseDir
        ? path.join(normalizedBaseDir, rawCandidate)
        : "";
    if (absoluteCandidate && fs.existsSync(absoluteCandidate)) {
      return absoluteCandidate;
    }
  }

  if (!allowPathLookup) return null;
  for (const candidate of list) {
    const resolved = resolveCommandOnPath(candidate, pathValue);
    if (resolved) return resolved;
  }
  return list.find((candidate) => String(candidate || "").trim()) || null;
}

function getPlatformToolCandidates(windowsCandidates, nonWindowsCandidates) {
  return process.platform === "win32" ? windowsCandidates : nonWindowsCandidates;
}

function resolveYtDlpPath(baseDir) {
  return resolveExistingToolPath(
    baseDir,
    getPlatformToolCandidates(["yt-dlp.exe", "yt-dlp"], ["yt-dlp"]),
    {
      allowPathLookup: true,
    },
  );
}

function resolveFfmpegPath(baseDir) {
  return resolveExistingToolPath(
    baseDir,
    getPlatformToolCandidates(["ffmpeg.exe", "ffmpeg"], ["ffmpeg"]),
    {
      allowPathLookup: true,
    },
  );
}

function resolveAtomicParsleyPath(baseDir) {
  return resolveExistingToolPath(
    baseDir,
    getPlatformToolCandidates(
      ["AtomicParsley.exe", "atomicparsley.exe", "AtomicParsley", "atomicparsley"],
      ["AtomicParsley", "atomicparsley"],
    ),
    {
      allowPathLookup: true,
    },
  );
}

module.exports = {
  resolveCommandOnPath,
  resolveExistingToolPath,
  resolveYtDlpPath,
  resolveFfmpegPath,
  resolveAtomicParsleyPath,
};
