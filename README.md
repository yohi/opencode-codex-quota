# opencode-codex-quota

OpenAI Codex の利用制限（レートリミット）状況を表示する OpenCode TUI プラグインです。

## 特徴

- Codex の Primary および Secondary レートリミットのクォータ残量をパーセンテージで表示
- 利用可能な場合はクレジット残高を表示
- TUI 表示に適したコンパクトなフォーマット
- Codex CLI の認証を利用（別途ログイン不要）
- OpenAI Codex プロトコルに基づいた動作

## 重要な注意点：認証について

**このプラグインの動作には Codex CLI による認証が必要です。**

GPT-5/Codex モデルを使用するために `opencode-openai-codex-auth` をインストールしている場合でも、以下の違いがあります：

- **`opencode-openai-codex-auth`**: **モデル推論**（チャット補完など）のための認証を処理します。
- **このプラグイン**: **Codex Usage API** (`/api/codex/usage`) のための認証を必要とします。

これらは別々のエンドポイントであるため、別途 Codex CLI で認証を行う必要があります：

```bash
codex auth login
```

一度認証を行うと、このプラグインは自動的に `~/.codex/auth.json` から認証情報を取得して使用します。

## 前提条件

このプラグインを使用するには、[Codex CLI](https://github.com/openai/codex) がインストールされ、認証されている必要があります。

```bash
brew install openai/tap/codex

codex auth login
```

プラグインは `~/.codex/auth.json` に保存された Codex CLI の認証情報を自動的に使用します。

## インストール方法

### オプション 1: ローカルにクローンする場合

```bash
git clone https://github.com/yohi/opencode-codex-quota ~/.config/opencode/opencode-codex-quota
cd ~/.config/opencode/opencode-codex-quota
npm ci
npm run build
```

`~/.config/opencode/opencode.jsonc` に以下を追加します：

```json
{
  "plugin": [
    "oh-my-opencode",
    "file://~/.config/opencode/opencode-codex-quota"
  ]
}
```

### オプション 2: 任意のローカルパスを指定する場合

任意の場所にクローンします：

```bash
git clone https://github.com/yohi/opencode-codex-quota /path/to/opencode-codex-quota
cd /path/to/opencode-codex-quota
npm ci
npm run build
```

設定ファイルに追加します：

```json
{
  "plugin": [
    "oh-my-opencode",
    "/path/to/opencode-codex-quota"
  ]
}
```

## 使い方

OpenCode 内で以下のコマンドを実行してください：

```bash
codex-status
```

### 出力例

```
[Codex]
Primary  :  50%🔋(↻in 5m)
Secondary:  25%🔋(↻in 1h 30m)
Credits  :  $15.50
```

### 自動トースト通知 (Automatic Toast Notifications)

このプラグインは、`ag-status` などのツール実行後に、レートリミットの状況を自動的にトースト通知として表示します。これにより、コマンドを手動で実行しなくても、バックグラウンドでリミットの消費状況を把握することができます。

### ステータス・インジケーター

| ステータス | 表示 |
|------------|------|
| 良好 (>20%) | `50%🔋` |
| 低下 (≤20%) | `15%⚠️` |
| 空 (0%) | `🪫0%` |
| 不明 | 表示されません |

### 時間フォーマット

- `in 5m` - 残り 5 分
- `in 1h 30m` - 残り 1 時間 30 分
- `now` - リセット時刻に到達
- `soon` - 1 分未満

## 開発

### ビルド

```bash
npm run build
```

### ウォッチモード

```bash
npm run dev
```

### クリーン

```bash
npm run clean
```

## 仕組み (How It Works)

このプラグインは Codex API からレートリミットデータを取得します：

- `~/.codex/auth.json` から認証情報（Codex CLI のクレデンシャル）を読み取ります。
- `GET /api/codex/usage` または `GET /wham/usage` (ChatGPT API) を呼び出します。
- 以下の内容を含む JSON レスポンスを解析します：
  - `rate_limit.primary_window`: プライマリウィンドウの使用データ
  - `rate_limit.secondary_window`: セカンダリウィンドウの使用データ
  - `credits`: クレジット残高とステータス
  - `plan_type`: サブスクリプションプラン情報

[openai/codex](https://github.com/openai/codex) リポジトリで定義されているプロトコルに基づいています。

## 要件

- [Codex CLI](https://github.com/openai/codex) がインストールされ、認証済みであること
- OpenCode v1.0.0 以上
- `@opencode-ai/plugin` v1.1.7 以上
- Node.js 18 以上

## トラブルシューティング

### "No access token available" エラーが出る場合

Codex CLI が正しくインストールされ、認証されているか確認してください：

```bash
codex auth login
```

認証情報の確認：

```bash
cat ~/.codex/auth.json | jq .tokens.access_token
```

## ライセンス

MIT
