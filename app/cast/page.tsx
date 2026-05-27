'use client';

import { Header } from '@/app/components/Header';
import { RankingTable } from '@/app/components/RankingTable';
import { db } from '@/lib/firebase';
import { useBattleData } from '@/lib/hooks';
import { drawRank, gachaNames, gachaPoints } from '@/lib/rules';
import { child, push, ref, set, update } from 'firebase/database';
import { useMemo, useState } from 'react';

function timeLabel(ms: number) {
  return new Date(ms).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

export default function CastPage() {
  const { teams, casts, events, tickets, results, rankings } = useBattleData();
  const [selectedCastId, setSelectedCastId] = useState('');
  const [drawingTicketId, setDrawingTicketId] = useState('');
  const [lastResult, setLastResult] = useState<{ rank: string; point: number; name: string } | null>(null);

  const selectedCast = useMemo(() => casts.find(c => c.id === selectedCastId), [casts, selectedCastId]);
  const selectedTeam = useMemo(() => teams.find(t => t.id === selectedCast?.teamId), [teams, selectedCast]);
  const myTickets = useMemo(() => tickets.filter(t => t.castId === selectedCastId && !t.used), [tickets, selectedCastId]);
  const myEvents = useMemo(() => events.filter(e => e.castId === selectedCastId), [events, selectedCastId]);
  const myResults = useMemo(() => results.filter(r => r.castId === selectedCastId), [results, selectedCastId]);
  const myTotal = useMemo(() => {
    return myEvents.reduce((sum, e) => sum + e.point, 0) + myResults.reduce((sum, r) => sum + r.point, 0);
  }, [myEvents, myResults]);

  async function draw(ticketId: string) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket || ticket.used) return;
    setDrawingTicketId(ticketId);
    const rank = drawRank();
    const point = gachaPoints[ticket.gachaType][rank];
    const resultRef = push(child(ref(db), 'gachaResults'));
    await set(resultRef, {
      ticketId: ticket.id,
      castId: ticket.castId,
      castName: ticket.castName,
      teamId: ticket.teamId,
      teamName: ticket.teamName,
      gachaType: ticket.gachaType,
      rank,
      point,
      createdAt: Date.now(),
    });
    await update(ref(db, `gachaTickets/${ticket.id}`), { used: true, usedAt: Date.now() });
    setLastResult({ rank, point, name: gachaNames[ticket.gachaType] });
    setDrawingTicketId('');
  }

  const feed = useMemo(() => {
    const eventFeed = events.slice(0, 20).map(e => ({
      id: `e-${e.id}`,
      time: e.createdAt,
      text: `${e.castName} / ${e.type}`,
      point: e.point,
    }));
    const resultFeed = results.slice(0, 20).map(r => ({
      id: `r-${r.id}`,
      time: r.createdAt,
      text: `${r.castName} / ${gachaNames[r.gachaType]} ${r.rank}賞`,
      point: r.point,
    }));
    return [...eventFeed, ...resultFeed].sort((a,b) => b.time - a.time).slice(0, 20);
  }, [events, results]);

  return (
    <main className="container">
      <Header title="ホステス画面" subtitle="ランキング確認・ガチャ実行・自分の貢献pt確認" />
      <div className="grid">
        <section className="card col-4">
          <h2>自分を選択</h2>
          <label className="label">ホステス名</label>
          <select className="select" value={selectedCastId} onChange={e => { setSelectedCastId(e.target.value); setLastResult(null); }}>
            <option value="">選択</option>
            {casts.map(c => <option key={c.id} value={c.id}>{c.name} / {teams.find(t => t.id === c.teamId)?.name || '-'}</option>)}
          </select>
          {selectedCast && selectedTeam && (
            <div>
              <div className="badge">所属チーム：{selectedTeam.name}</div>
              <p className="notice">自分の貢献pt：<span className="point">{myTotal}pt</span></p>
              <p className="notice">未使用ガチャ：<span className="point">{myTickets.length}件</span></p>
            </div>
          )}
        </section>

        <section className="card col-4">
          <h2>チームランキング</h2>
          <RankingTable rankings={rankings} />
        </section>

        <section className="card col-4">
          <h2>ガチャ結果</h2>
          <div className="gachaBox">
            {lastResult ? (
              <>
                <div className="badge">{lastResult.name}</div>
                <div className="gachaRank">{lastResult.rank}賞</div>
                <div className="point">+{lastResult.point}pt</div>
              </>
            ) : (
              <p className="notice">ガチャを回すとここに結果が表示されます。</p>
            )}
          </div>
        </section>

        <section className="card col-6">
          <h2>回せるガチャ</h2>
          {!selectedCast && <p className="notice">先に自分の名前を選択してください。</p>}
          {selectedCast && myTickets.length === 0 && <p className="notice">現在、回せるガチャはありません。</p>}
          <div className="row">
            {myTickets.map(t => (
              <button key={t.id} className="button primary" disabled={drawingTicketId === t.id} onClick={() => draw(t.id)}>
                {gachaNames[t.gachaType]}を回す
              </button>
            ))}
          </div>
        </section>

        <section className="card col-6">
          <h2>自分の履歴</h2>
          <table className="table">
            <thead><tr><th>時間</th><th>内容</th><th>pt</th></tr></thead>
            <tbody>
              {[...myEvents.map(e => ({ id: `e-${e.id}`, time: e.createdAt, text: e.type, point: e.point })), ...myResults.map(r => ({ id: `r-${r.id}`, time: r.createdAt, text: `${gachaNames[r.gachaType]} ${r.rank}賞`, point: r.point }))]
                .sort((a,b) => b.time - a.time)
                .slice(0, 12)
                .map(item => <tr key={item.id}><td>{timeLabel(item.time)}</td><td>{item.text}</td><td className="point">+{item.point}</td></tr>)}
            </tbody>
          </table>
        </section>

        <section className="card col-12">
          <h2>全体速報</h2>
          <table className="table">
            <thead><tr><th>時間</th><th>内容</th><th>pt</th></tr></thead>
            <tbody>
              {feed.map(item => <tr key={item.id}><td>{timeLabel(item.time)}</td><td>{item.text}</td><td className="point">+{item.point}</td></tr>)}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
