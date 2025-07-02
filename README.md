# sam-mc-server

AWSでMinecraftサーバーを立てるスタック。

## 機能

- DiscordからMinecraftサーバーの起動、停止
- DiscordとMinecraftゲーム内チャットの相互連携
- DiscordからMinecraftサーバーへのコマンド送信
- 無人状態が続くとサーバーが自動停止
- DiscordからMinecraftサーバーのデータダウンロードリクエスト

## 事前準備

1. [Bun](https://bun.sh)のインストール
1. [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)のインストール、ログイン
1. [AWS SAM CLI](https://docs.aws.amazon.com/ja_jp/serverless-application-model/latest/developerguide/install-sam-cli.html)のインストール
1. [bun-lambda](https://github.com/oven-sh/bun/tree/main/packages/bun-lambda)の作成
1. [Discord Bot](https://discord.com/developers/applications)の作成(以下で説明)

### Discord Botの準備

1. `Installation`タブで`Install Link`を`None`にする
1. `Bot`タブで`PUBLIC BOT`をオフにする
1. `Bot`タブで`Message Content Intent`をオンにする
1. `OAuth2`タブでURLを作成し、サーバーに招待する
    - Scopes
        - bot
        - applications.commands
    - Bot Permissions
        - Manage Webhooks
        - View Channels
        - Send Messages
        - Manage Messages
        - Embed Links
        - Read Message History
        - Add Reactions
    - Integration Type
        - Guild Install

## 使い方

```
$ bun i
$ bun run build
$ bun run deploy
```

### ビルド

DiscordBotイメージのビルド、SAMのビルドを行う。

```
$ bun run build
```

### デプロイ

S3バケットの作成、サーバー用環境変数ファイルのアップロード、SAMのデプロイ、DiscordBotイメージのプッシュを行う。

```
$ bun run deploy
```

### 削除

アップロードされたDiscordBotイメージの全削除、スタックの削除、S3バケットの削除を行う。

```
$ bun run delete
```

## Discord Bot

### /cmd {コマンド}

Minecraftサーバーへコマンドを送信する

例:  
`/cmd say こんにちは`

### /download

Minecraftサーバーのデータをダウンロードするボタンを発行する。

### /stop

Minecraftサーバーを停止する。
