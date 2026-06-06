'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';

// Remove duplicate inline Nav - now using shared Nav component

const stats = [
  { value: '100%', label: 'Cryptographically verified' },
  { value: '0',    label: 'Human arbitrators needed' },
  { value: '$10B+', label: 'Market problem solved' },
  { value: '<5s',  label: 'TEE verification time' },
];

const features = [
  { tag: 'SUI MOVE',   title: 'Smart Contract Escrow',       body: 'Payment locked in a Move object the moment a job is created. Auto-releases on verified pass, auto-refunds on verified fail. No human can intervene.' },
  { tag: 'WALRUS',     title: 'Decentralized Delivery',      body: 'Freelancer uploads the deliverable as a Walrus blob with Proof-of-Availability. The work is stored permanently before a single token moves.' },
  { tag: 'SEAL',       title: 'Encrypted Access Control',    body: 'Deliverable is Seal-encrypted on upload. Client cannot read the work before the verification runs. Access unlocks only after settlement or dispute.' },
  { tag: 'NAUTILUS',   title: 'TEE Verification',            body: 'Acceptance criteria (bash, pytest, custom validators) run inside an AWS Nitro Enclave. The operator cannot see or bias the result. Every verdict is signed.' },
  { tag: 'TATUM RPC',  title: 'Enterprise-Grade RPC',        body: 'All on-chain calls route through Tatum Sui nodes. Wallet balances and USD/SUI exchange rates pulled from Tatum Data API in real time.' },
  { tag: 'MULTI-SIG',  title: 'Dispute Arbitration',         body: 'If either party disputes the TEE verdict, a pre-selected arbitrator committee votes. Seal policy unlocks the blob as evidence. Outcome is immutable on-chain.' },
];

const ticker = [
  'SUI MOVE', '·', 'WALRUS STORAGE', '·', 'SEAL ENCRYPTION', '·',
  'NAUTILUS TEE', '·', 'TATUM RPC', '·', 'MULTI-SIG DISPUTES', '·',
  'ZERO TRUST', '·', 'CRYPTOGRAPHIC PROOF', '·', 'AUTO SETTLEMENT', '·',
];

const TERMINAL_LINES = [
  '> escrow create "Build REST API" --pay 500 --wait',
  '  locking 500 USDC in Move escrow...',
  '  uploading criteria to Walrus...',
  '  freelancer submitted deliverable...',
  '  routing to Nautilus TEE enclave...',
  '  running: npm install && npm test',
  '  ✓ PASS  tests=42/42  coverage=97%',
  '  tx=0xbe059f25...cd4b  releasing payment...',
];

function Terminal() {
  const [lines, setLines] = useState<string[]>([]);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    if (cursor >= TERMINAL_LINES.length) {
      const t = setTimeout(() => { setLines([]); setCursor(0); }, 3000);
      return () => clearTimeout(t);
    }
    const delay = cursor === 0 ? 600 : cursor < 2 ? 400 : 700;
    const t = setTimeout(() => {
      setLines(l => [...l, TERMINAL_LINES[cursor]]);
      setCursor(c => c + 1);
    }, delay);
    return () => clearTimeout(t);
  }, [cursor]);

  return (
    <div style={{
      background: '#000', border: '1px solid var(--color-dark-grid)',
      padding: '16px 20px', fontFamily: 'var(--font-jetbrains)', fontSize: 11,
      lineHeight: 1.8, minHeight: 168, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ color: 'var(--color-faint-grid)', marginBottom: 8, fontSize: 10, letterSpacing: '0.1em' }}>
        VERIFIED ESCROW v1.0 · SUI TESTNET
      </div>
      {lines.map((l, i) => (
        <div key={i} style={{
          color: l.startsWith('  ✓') ? 'var(--color-lime-interface)'
               : l.startsWith('  tx=') ? 'var(--color-mid-gray-border)'
               : l.startsWith('>') ? '#fff' : 'var(--color-mid-gray-border)',
        }}>{l}</div>
      ))}
      {cursor < TERMINAL_LINES.length && (
        <span style={{ color: 'var(--color-lime-interface)', animation: 'blink 1s step-end infinite' }}>█</span>
      )}
    </div>
  );
}

function GridCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    const dots = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
      r: Math.random() * 1.2 + 0.3,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(37,37,37,0.6)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > W) d.vx *= -1;
        if (d.y < 0 || d.y > H) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(197,255,74,0.4)';
        ctx.fill();
      });
      dots.forEach((a, i) => dots.slice(i + 1).forEach(b => {
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 100) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(197,255,74,${0.08 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }));
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

function Nav() {
  return null;
}

export default function HomePage() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
        <div className="scanline" />

        {/* Hero */}
        <section style={{ padding: '80px 0 60px', borderBottom: '1px solid var(--color-dark-grid)', position: 'relative', overflow: 'hidden', minHeight: 480 }}>
          <GridCanvas />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: 16 }}>
              <span className="label">Built on Sui · Walrus · Seal · Nautilus · Tatum</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-pt-serif)', fontSize: 72, fontWeight: 400, lineHeight: 1, letterSpacing: '-0.02em', maxWidth: 800, marginBottom: 24 }}>
              Freelance escrow<br />
              <span className="lime glitch">you can verify.</span>
            </h1>
            <p style={{ color: 'var(--color-white-outlined-text)', fontSize: 16, lineHeight: 1.6, maxWidth: 480, marginBottom: 36 }}>
              The first escrow platform where delivery verification runs inside a hardware-isolated TEE, results are cryptographically signed, and payment settles automatically without any human arbitrator.
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 40 }}>
              <Link href="/create" className="btn-lime pulse">Post a Job →</Link>
              <Link href="/jobs" className="btn-ghost">Find Work</Link>
            </div>
            <div style={{ maxWidth: 560 }}>
              <Terminal />
            </div>
          </div>
        </section>

        {/* Ticker */}
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {[...ticker, ...ticker].map((t, i) => (
              <span key={i} style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, letterSpacing: '0.12em', color: t === '·' ? 'var(--color-faint-grid)' : 'var(--color-mid-gray-border)' }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid var(--color-dark-grid)' }}>
          {stats.map(({ value, label }, i) => (
            <div key={i} className="fade-up" style={{ padding: '28px 22px', borderRight: i < 3 ? '1px solid var(--color-dark-grid)' : 'none' }}>
              <div style={{ fontFamily: 'var(--font-pt-serif)', fontSize: 40, fontWeight: 400, color: 'var(--color-lime-interface)', lineHeight: 1 }}>{value}</div>
              <div className="label" style={{ marginTop: 8 }}>{label}</div>
            </div>
          ))}
        </section>

        {/* How it works */}
        <section style={{ padding: '40px 0', borderBottom: '1px solid var(--color-dark-grid)' }}>
          <div className="label" style={{ marginBottom: 16 }}>How It Works</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, background: 'var(--color-dark-grid)' }}>
            {[
              { step: '01', title: 'Client Posts Job',        desc: 'Define acceptance criteria (test suite or validator script) and lock SUI payment in a Move escrow object.' },
              { step: '02', title: 'Freelancer Delivers',      desc: 'Upload work as a Walrus blob, Seal-encrypted. Client cannot read it before verification runs.' },
              { step: '03', title: 'Nautilus TEE Verifies',    desc: 'Criteria script runs in an AWS Nitro Enclave. Operator cannot see or bias the result. Verdict is signed.' },
              { step: '04', title: 'Auto Settlement',          desc: 'Move contract reads the attestation. Pass: payment released. Fail: client refunded. No humans involved.' },
            ].map(({ step, title, desc }, i) => (
              <div key={i} className="fade-up card-trace" style={{ padding: '22px', background: 'var(--surface-dark-card)' }}>
                <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 28, fontWeight: 600, color: 'var(--color-lime-interface)', marginBottom: 12, lineHeight: 1 }}>{step}</div>
                <div style={{ fontFamily: 'var(--font-pt-serif)', fontSize: 18, fontWeight: 400, lineHeight: 1.2, marginBottom: 10 }}>{title}</div>
                <div style={{ color: 'var(--color-mid-gray-border)', fontSize: 13, lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: '40px 0 60px' }}>
          <div className="label" style={{ marginBottom: 28 }}>Core Architecture</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--color-dark-grid)' }}>
            {features.map(({ tag, title, body }, i) => (
              <div key={i} className="card card-trace fade-up">
                <div className="label" style={{ color: 'var(--color-lime-interface)', marginBottom: 12 }}>{tag}</div>
                <div style={{ fontFamily: 'var(--font-pt-serif)', fontSize: 22, fontWeight: 400, lineHeight: 1.15, marginBottom: 12 }}>{title}</div>
                <div style={{ color: 'var(--color-mid-gray-border)', fontSize: 13, lineHeight: 1.6 }}>{body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '40px 0 80px', borderTop: '1px solid var(--color-dark-grid)', textAlign: 'center' }}>
          <div className="label" style={{ marginBottom: 20 }}>Ready to eliminate trust?</div>
          <h2 style={{ fontFamily: 'var(--font-pt-serif)', fontSize: 48, fontWeight: 400, marginBottom: 16 }}>
            No arbitrators.<br /><span className="lime">Just math.</span>
          </h2>
          <p style={{ color: 'var(--color-mid-gray-border)', fontSize: 15, marginBottom: 32 }}>
            Connect your Sui wallet and post or accept a job in under 2 minutes.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/create" className="btn-lime pulse">Post a Job →</Link>
            <Link href="/jobs" className="btn-ghost">Browse Jobs</Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--color-dark-grid)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, color: 'var(--color-faint-grid)', letterSpacing: '0.08em' }}>
          VERIFIED ESCROW · TATUM x WALRUS HACKATHON 2026
        </span>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['https://twitter.com/Tatum_io', '@Tatum_io'], ['https://twitter.com/WalrusFoundation', '@WalrusFoundation'], ['https://twitter.com/SuiNetwork', '@SuiNetwork']].map(([href, label]) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, color: 'var(--color-mid-gray-border)', textDecoration: 'none', letterSpacing: '0.06em' }}>
              {label}
            </a>
          ))}
        </div>
      </footer>
    </>
  );
}
