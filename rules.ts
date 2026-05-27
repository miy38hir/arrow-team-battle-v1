export type Rank = 'S' | 'A' | 'B' | 'C' | 'D';
export type GachaType = 'douhan' | 'champagne_50000' | 'champagne_150000' | 'champagne_300000';

export const gachaNames: Record<GachaType, string> = {
  douhan: '同伴ガチャ',
  champagne_50000: 'シャンパンガチャ',
  champagne_150000: 'プレミアムシャンパンガチャ',
  champagne_300000: 'VIPシャンパンガチャ',
};

export const gachaPoints: Record<GachaType, Record<Rank, number>> = {
  douhan: { S: 50, A: 30, B: 15, C: 10, D: 5 },
  champagne_50000: { S: 80, A: 40, B: 20, C: 15, D: 10 },
  champagne_150000: { S: 250, A: 150, B: 80, C: 40, D: 25 },
  champagne_300000: { S: 600, A: 350, B: 200, C: 100, D: 60 },
};

export const fixedPoints = {
  a_shimei: 10,
  b_shimei: 5,
};

export function drawRank(): Rank {
  const r = Math.random() * 100;
  if (r < 3) return 'S';
  if (r < 10) return 'A';
  if (r < 30) return 'B';
  if (r < 60) return 'C';
  return 'D';
}

export function getDouhanPointByTime(time: string): { point: number; ticket?: GachaType; label: string } {
  // time format HH:mm
  if (!time) return { point: 0, label: '同伴 時間未入力' };
  if (time <= '20:30') return { point: 20, label: '同伴 20:30まで' };
  if (time <= '21:00') return { point: 10, label: '同伴 21:00まで' };
  if (time <= '21:30') return { point: 5, label: '同伴 21:30まで' };
  if (time <= '22:00') return { point: 0, ticket: 'douhan', label: '同伴ガチャ権利' };
  return { point: 0, label: '同伴 対象外' };
}

export function getChampagneGacha(amount: number): GachaType | null {
  if (amount >= 300000) return 'champagne_300000';
  if (amount >= 150000) return 'champagne_150000';
  if (amount >= 50000) return 'champagne_50000';
  return null;
}
