const { createLogger } = require("../services/logger-service");

function isLoopbackAddress(remoteAddress) {
  const remote = String(remoteAddress || "").toLowerCase();
  return remote === "::1" || remote === "127.0.0.1" || remote === "::ffff:127.0.0.1";
}

function normalizeSelectedPath(value, path) {
  const selectedPath = String(value || "").trim();
  if (!selectedPath) return "";
  const normalized = path.normalize(selectedPath);
  const root = path.parse(normalized).root;
  return normalized.length > root.length
    ? normalized.replace(/[\\/]+$/, "")
    : normalized;
}

function buildFolderPickerCommand(platform) {
  if (platform === "darwin") {
    return {
      command: "osascript",
      args: [
        "-e",
        'POSIX path of (choose folder with prompt "動画の保存先を選択してください")',
      ],
    };
  }

  if (platform === "win32") {
    return {
      command: "powershell.exe",
      args: [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        [
          "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8",
          "Add-Type -AssemblyName System.Windows.Forms",
          "$dialog = New-Object System.Windows.Forms.FolderBrowserDialog",
          "$dialog.Description = '動画の保存先を選択してください'",
          "if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {",
          "  Write-Output $dialog.SelectedPath",
          "  exit 0",
          "}",
          "exit 2",
        ].join("; "),
      ],
    };
  }

  return null;
}

function isFolderPickerCancel(platform, error) {
  if (!error) return false;
  if (platform === "darwin") {
    return Number(error.code) === 1 && /cancel/i.test(String(error.stderr || error.message || ""));
  }
  return platform === "win32" && Number(error.code) === 2;
}

function registerSavePathRoutes(app, deps) {
  const {
    execFile,
    path,
    apiOk,
    apiError,
    platform = process.platform,
  } = deps;
  const logger = deps.logger || createLogger("route-save-path");

  app.post("/api/select-save-path", (req, res) => {
    if (!isLoopbackAddress(req.socket?.remoteAddress)) {
      return apiError(
        res,
        403,
        "この操作はサーバー本体PC（localhost）からのみ実行できます。",
      );
    }

    const picker = buildFolderPickerCommand(platform);
    if (!picker) {
      return apiError(res, 501, "このOSでは保存先フォルダの選択に対応していません。");
    }

    execFile(
      picker.command,
      picker.args,
      {
        encoding: "utf8",
        windowsHide: true,
      },
      (error, stdout) => {
        if (isFolderPickerCancel(platform, error)) {
          return apiOk(res, { canceled: true, path: "" });
        }
        if (error) {
          logger.error("保存先フォルダ選択に失敗", { error: error.message });
          return apiError(res, 500, "保存先フォルダの選択に失敗しました。");
        }

        const selectedPath = normalizeSelectedPath(stdout, path);
        if (!selectedPath) {
          return apiOk(res, { canceled: true, path: "" });
        }
        return apiOk(res, { canceled: false, path: selectedPath });
      },
    );
  });
}

module.exports = {
  buildFolderPickerCommand,
  isFolderPickerCancel,
  isLoopbackAddress,
  normalizeSelectedPath,
  registerSavePathRoutes,
};
