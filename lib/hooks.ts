'use client';

import { onValue, ref } from 'firebase/database';
import { useEffect, useMemo, useState } from 'react';
import { db } from './firebase';
import type { Cast, GachaResult, GachaTicket, PointEvent, Team } from './types';

function valuesWithId<T>(obj: Record<string, Omit<T, 'id'>> | null | undefined): T[] {
  if (!obj) return [];
  return Object.entries(obj).map(([id, value]) => ({ id, ...(value as object) } as T));
}

export function useBattleData() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [casts, setCasts] = useState<Cast[]>([]);
  const [events, setEvents] = useState<PointEvent[]>([]);
  const [tickets, setTickets] = useState<GachaTicket[]>([]);
  const [results, setResults] = useState<GachaResult[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubTeams = onValue(ref(db, 'teams'), (snap) => setTeams(valuesWithId<Team>(snap.val())));
    const unsubCasts = onValue(ref(db, 'casts'), (snap) => setCasts(valuesWithId<Cast>(snap.val())));
    const unsubEvents = onValue(ref(db, 'events'), (snap) => setEvents(valuesWithId<PointEvent>(snap.val()).sort((a,b) => b.createdAt - a.createdAt)));
    const unsubTickets = onValue(ref(db, 'gachaTickets'), (snap) => setTickets(valuesWithId<GachaTicket>(snap.val()).sort((a,b) => b.createdAt - a.createdAt)));
    const unsubResults = onValue(ref(db, 'gachaResults'), (snap) => setResults(valuesWithId<GachaResult>(snap.val()).sort((a,b) => b.createdAt - a.createdAt)));
    setReady(true);
    return () => { unsubTeams(); unsubCasts(); unsubEvents(); unsubTickets(); unsubResults(); };
  }, []);

  const teamTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    teams.forEach(t => totals[t.id] = 0);
    events.forEach(e => totals[e.teamId] = (totals[e.teamId] || 0) + (e.point || 0));
    results.forEach(r => totals[r.teamId] = (totals[r.teamId] || 0) + (r.point || 0));
    return totals;
  }, [teams, events, results]);

  const rankings = useMemo(() => {
    return [...teams]
      .map(team => ({ ...team, totalPoint: teamTotals[team.id] || 0 }))
      .sort((a,b) => (b.totalPoint || 0) - (a.totalPoint || 0));
  }, [teams, teamTotals]);

  return { ready, teams, casts, events, tickets, results, rankings };
}
