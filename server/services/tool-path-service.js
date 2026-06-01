const fs = require("fs");
const path = require("path");

function resolveExistingToolPath(baseDir, candidates, { allowPathLookup = false } = {}) {
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
  resolveExistingToolPath,
  resolveYtDlpPath,
  resolveFfmpegPath,
  resolveAtomicParsleyPath,
};
