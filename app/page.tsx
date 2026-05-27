import Link from 'next/link';

export default function Home() {
  return (
    <main className="container">
      <div className="header">
        <div>
          <div className="title">ARROW Team Battle</div>
          <div className="subtitle">チーム戦ポイント & ガチャシステム V1</div>
        </div>
        <div className="nav">
          <Link href="/admin">管理者画面</Link>
          <Link href="/cast">ホステス画面</Link>
        </div>
      </div>
      <div className="card">
        <h2>V1機能</h2>
        <p className="notice">管理者がポイント登録・ガチャ券付与を行い、ホステス側でランキング確認とガチャ実行ができます。Firebase Realtime Databaseに接続すると、全端末でリアルタイム反映されます。</p>
      </div>
    </main>
  );
}
