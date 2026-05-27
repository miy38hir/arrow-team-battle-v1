# ARROW Team Battle V1

チーム戦ポイント、同伴/シャンパンガチャ、リアルタイムランキングの最小プロトタイプです。

## 画面

- `/admin` 黒服・マネージャー用：ホステス登録、チーム登録、ポイント登録、ガチャ券付与
- `/cast` ホステス用：ランキング確認、ガチャ実行、自分の貢献確認

## セットアップ

1. Firebaseでプロジェクトを作成
2. Realtime Databaseを作成
3. `.env.example` を `.env.local` にコピー
4. FirebaseのWebアプリ設定値を `.env.local` に貼り付け
5. テスト時のみ `firebase.rules.json` のように read/write を true にする
6. `npm install`
7. `npm run dev`
8. ブラウザで `http://localhost:3000/admin` と `http://localhost:3000/cast` を開く

## 注意

`firebase.rules.json` はテスト用です。本番では必ずログイン・権限管理を入れてください。
