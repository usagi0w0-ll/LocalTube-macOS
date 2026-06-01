# LocalTube macOS

LocalTubeをmacOSで起動するための最小構成リポジトリです。

## 必要な外部ツール

Homebrewを用意したうえで、次をインストールしてください。

```sh
brew install node ffmpeg yt-dlp atomicparsley
```

必要になるコマンドは以下です。

- `node` / `npm`: LocalTube本体のNode.jsサーバーを起動
- `ffmpeg`: 動画/音声の結合、変換、サムネイル処理
- `yt-dlp`: 動画情報取得とダウンロード
- `AtomicParsley`: メタデータ/サムネイル埋め込み補助

## 起動方法

```sh
chmod +x start-mac.command
./start-mac.command
```

起動後、ブラウザで `http://localhost:3000` を開きます。

`start-mac.command` は不足ツールを確認し、`npm install` のあと `npm start` で `server.js` を起動します。

## 注意

macOSでは、設定画面のWindows自動起動機能は現時点で非対応です。
