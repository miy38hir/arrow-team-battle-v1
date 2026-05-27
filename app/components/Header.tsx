import Link from 'next/link';

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="header">
      <div>
        <div className="title">{title}</div>
        {subtitle && <div className="subtitle">{subtitle}</div>}
      </div>
      <div className="nav">
        <Link href="/admin">管理者画面</Link>
        <Link href="/cast">ホステス画面</Link>
      </div>
    </div>
  );
}
