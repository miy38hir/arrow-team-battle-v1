import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ARROW Team Battle',
  description: 'Team battle point and gacha system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
