'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@mysten/dapp-kit';

const links = [
  ['/', 'Home'],
  ['/create', 'Post Job'],
  ['/jobs', 'Find Work'],
  ['/my-jobs', 'My Jobs'],
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav style={{
      background: 'var(--surface-subtle-panel)',
      borderBottom: '1px solid var(--color-dark-grid)',
      padding: '0 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 52, position: 'sticky', top: 0, zIndex: 100,
    }}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: 'var(--color-lime-interface)', fontFamily: 'var(--font-jetbrains)', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em' }}>VERIFIED</span>
        <span style={{ color: 'var(--color-faint-grid)', fontFamily: 'var(--font-jetbrains)', fontSize: 10 }}>ESCROW</span>
      </Link>
      <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
        {links.map(([href, label]) => (
          <Link key={href} href={href} style={{
            textDecoration: 'none', fontFamily: 'var(--font-inter-tight)', fontSize: 13,
            color: pathname === href ? 'var(--color-silver-whisper)' : 'var(--color-mid-gray-border)',
            borderBottom: pathname === href ? '1.5px solid var(--color-lime-interface)' : '1.5px solid transparent',
            paddingBottom: 2, transition: 'color 0.2s',
          }}>{label}</Link>
        ))}
        <ConnectButton style={{ background: 'var(--color-lime-interface)', color: '#000', border: 'none', fontFamily: 'var(--font-inter-tight)', fontSize: 12, fontWeight: 600, padding: '8px 16px', cursor: 'pointer' }} />
      </div>
    </nav>
  );
}
