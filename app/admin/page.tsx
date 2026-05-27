'use client';

import { Header } from '@/app/components/Header';
import { RankingTable } from '@/app/components/RankingTable';
import { db } from '@/lib/firebase';
import { useBattleData } from '@/lib/hooks';
import { fixedPoints, getChampagneGacha, getDouhanPointByTime, gachaNames } from '@/lib/rules';
import type { Cast } from '@/lib/types';
import { child, push, ref, remove, set } from 'firebase/database';
import { useMemo, useState } from 'react';

function slug(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[.#$\[\]/]/g, '-');
}

export default function AdminPage() {
  const { teams, casts, events, tickets, results, rankings } = useBattleData();
  const [teamName, setTeamName] = useState('');
  const [castName, setCastName] = useState('');
  const [castTeamId, setCastTeamId] = useState('');
  const [selectedCastId, setSelectedCastId] = useState('');
  const [douhanTime, setDouhanTime] = useState('20:30');
  const [champagneAmount, setChampagneAmount] = useState('50000');
  const [message, setMessage] = useState('');

  const selectedCast = useMemo(() => casts.find(c => c.id === selectedCastId), [casts, selectedCastId]);
  const selectedTeam = useMemo(() => teams.find(t => t.id === selectedCast?.teamId), [teams, selectedCast]);

  async function addTeam() {
    if (!teamName.trim()) return;
    const id = slug(teamName);
    await set(ref(db, `teams/${id}`), { name: teamName.trim() });
    setTeamName('');
    setMessage('チームを追加しました。');
  }

  async function addCast() {
    if (!castName.trim() || !castTeamId) return;
    const id = slug(castName);
    await set(ref(db, `casts/${id}`), { name: castName.trim(), teamId: castTeamId });
    setCastName('');
    setMessage('ホステスを追加しました。');
  }

  function requireCast(): Cast | null {
    if (!selectedCast || !selectedTeam) {
      setMessage('ホステスを選択してください。');
      return null;
    }
    return selectedCast;
  }

  async function addPoint(type: string, point: number) {
    const cast = requireCast();
    if (!cast || !selectedTeam) return;
    const eventRef = push(child(ref(db), 'events'));
    await set(eventRef, {
      castId: cast.id,
      castName: cast.name,
      teamId: selectedTeam.id,
      teamName: selectedTeam.name,
      type,
      point,
      createdAt: Date.now(),
    });
    setMessage(`${cast.name}：${type} ${point}ptを加算しました。`);
  }

  async function addTicket(gachaType: 'douhan' | 'champagne_50000' | 'champagne_150000' | 'champagne_300000') {
    const cast = requireCast();
    if (!cast || !selectedTeam) return;
    const ticketRef = push(child(ref(db), 'gachaTickets'));
    await set(ticketRef, {
      castId: cast.id,
      castName: cast.name,
      teamId: selectedTeam.id,
      teamName: selectedTeam.name,
      gachaType,
      used: false,
      createdAt: Date.now(),
    });
    setMessage(`${cast.name}に${gachaNames[gachaType]}を付与しました。`);
  }

  async function registerDouhan() {
    const result = getDouhanPointByTime(douhanTime);
    if (result.ticket) {
      await addTicket(result.ticket);
      return;
    }
    if (result.point > 0) {
      await addPoint(result.label, result.point);
      return;
    }
    setMessage(result.label + 'のため、加算なしです。');
  }

  async function registerChampagne() {
    const amount = Number(champagneAmount || 0);
    const gachaType = getChampagneGacha(amount);
    if (!gachaType) {
      setMessage('5万円未満のため、シャンパンガチャ対象外です。');
      return;
    }
    await addTicket(gachaType);
  }

  async function deleteEvent(id: string) {
    await remove(ref(db, `events/${id}`));
  }

  async function deleteTicket(id: string) {
    await remove(ref(db, `gachaTickets/${id}`));
  }

  return (
    <main className="container">
      <Header title="管理者画面" subtitle="黒服・マネージャー用：登録・ガチャ券付与・修正" />
      {message && <div className="card" style={{ marginBottom: 14 }}><span className="notice">{message}</span></div>}

      <div className="grid">
        <section className="card col-4">
          <h2>初期登録</h2>
          <label className="label">チーム名</label>
          <input className="input" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="RED" />
          <button className="button primary" onClick={addTeam}>チーム追加</button>
          <hr style={{ borderColor: 'var(--line)', margin: '16px 0' }} />
          <label className="label">ホステス名</label>
          <input className="input" value={castName} onChange={e => setCastName(e.target.value)} placeholder="しゅり" />
          <label className="label">所属チーム</label>
          <select className="select" value={castTeamId} onChange={e => setCastTeamId(e.target.value)}>
            <option value="">選択</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button className="button primary" onClick={addCast}>ホステス追加</button>
        </section>

        <section className="card col-4">
          <h2>行動登録</h2>
          <label className="label">対象ホステス</label>
          <select className="select" value={selectedCastId} onChange={e => setSelectedCastId(e.target.value)}>
            <option value="">選択</option>
            {casts.map(c => <option key={c.id} value={c.id}>{c.name} / {teams.find(t => t.id === c.teamId)?.name || '-'}</option>)}
          </select>
          <div className="row" style={{ marginBottom: 10 }}>
            <button className="button" onClick={() => addPoint('A指名', fixedPoints.a_shimei)}>A指名 +10pt</button>
            <button className="button" onClick={() => addPoint('B指名', fixedPoints.b_shimei)}>B指名 +5pt</button>
          </div>
          <label className="label">同伴入店時間</label>
          <input className="input" type="time" value={douhanTime} onChange={e => setDouhanTime(e.target.value)} />
          <button className="button primary" onClick={registerDouhan}>同伴登録</button>
          <hr style={{ borderColor: 'var(--line)', margin: '16px 0' }} />
          <label className="label">シャンパン金額</label>
          <input className="input" type="number" value={champagneAmount} onChange={e => setChampagneAmount(e.target.value)} />
          <button className="button primary" onClick={registerChampagne}>シャンパンガチャ付与</button>
        </section>

        <section className="card col-4">
          <h2>現在ランキング</h2>
          <RankingTable rankings={rankings} />
        </section>

        <section className="card col-6">
          <h2>未使用ガチャ券</h2>
          <table className="table">
            <thead><tr><th>名前</th><th>ガチャ</th><th>状態</th><th></th></tr></thead>
            <tbody>
              {tickets.filter(t => !t.used).slice(0, 12).map(t => (
                <tr key={t.id}><td>{t.castName}</td><td>{gachaNames[t.gachaType]}</td><td>未使用</td><td><button className="button danger" onClick={() => deleteTicket(t.id)}>削除</button></td></tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card col-6">
          <h2>直近履歴</h2>
          <table className="table">
            <thead><tr><th>名前</th><th>内容</th><th>pt</th><th></th></tr></thead>
            <tbody>
              {events.slice(0, 12).map(e => (
                <tr key={e.id}><td>{e.castName}</td><td>{e.type}</td><td className="point">+{e.point}</td><td><button className="button danger" onClick={() => deleteEvent(e.id)}>削除</button></td></tr>
              ))}
              {results.slice(0, 8).map(r => (
                <tr key={r.id}><td>{r.castName}</td><td>{gachaNames[r.gachaType]} {r.rank}賞</td><td className="point">+{r.point}</td><td></td></tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
