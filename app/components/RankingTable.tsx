import type { Team } from '@/lib/types';

export function RankingTable({ rankings }: { rankings: Team[] }) {
  return (
    <table className="table">
      <thead><tr><th>順位</th><th>チーム</th><th>pt</th></tr></thead>
      <tbody>
        {rankings.map((team, index) => (
          <tr key={team.id}>
            <td className={index === 0 ? 'rank1' : ''}>{index + 1}位</td>
            <td>{team.name}</td>
            <td className="point">{team.totalPoint || 0}pt</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
