#!/bin/bash
set -e

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR"

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

APP_URL="http://localhost:3000"
missing_tools=()

require_command() {
  local command_name="$1"
  local display_name="${2:-$1}"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    missing_tools+=("$display_name")
  fi
}

require_atomicparsley() {
  if command -v AtomicParsley >/dev/null 2>&1; then
    return 0
  fi
  if command -v atomicparsley >/dev/null 2>&1; then
    return 0
  fi
  missing_tools+=("AtomicParsley")
}

require_command "node"
require_command "npm"
require_command "ffmpeg"
require_command "yt-dlp"
require_atomicparsley

if [ "${#missing_tools[@]}" -gt 0 ]; then
  echo "LocalTube の起動に必要な外部ツールが見つかりません:"
  printf '  - %s\n' "${missing_tools[@]}"
  echo
  echo "Homebrew を用意したうえで、次のコマンドを実行してください:"
  echo "  brew install node ffmpeg yt-dlp atomicparsley"
  echo
  echo "インストール後、もう一度 start-mac.command を実行してください。"
  exit 1
fi

echo "LocalTube の依存パッケージを確認しています..."
npm install

echo
echo "LocalTube を起動します。"
echo "ブラウザで ${APP_URL} を開いてください。"

if command -v open >/dev/null 2>&1; then
  (
    sleep 2
    open "$APP_URL" >/dev/null 2>&1 || true
  ) &
fi

npm start
