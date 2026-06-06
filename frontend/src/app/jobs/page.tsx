'use client';

import Nav from '@/components/Nav';

const mockJobs = [
  { id: '1', title: 'Build REST API with JWT auth', budget: '$500', criteria: 'npm test', state: 'Open', posted: '2h ago' },
  { id: '2', title: 'Smart contract audit report', budget: '$1,200', criteria: 'pytest audit/', state: 'Open', posted: '5h ago' },
  { id: '3', title: 'React dashboard (1000+ words doc)', budget: '$300', criteria: 'wc -w deliverable', state: 'Open', posted: '1d ago' },
  { id: '4', title: 'Rust CLI tool with full test suite', budget: '$800', criteria: 'cargo test', state: 'Open', posted: '2d ago' },
];

export default function JobsPage() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px 80px' }}>
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div className="label" style={{ marginBottom: 12 }}>Browse</div>
            <h1 style={{ fontFamily: 'var(--font-pt-serif)', fontSize: 48, fontWeight: 400, lineHeight: 1 }}>
              Open Jobs<br /><span className="lime">verified on delivery.</span>
            </h1>
          </div>
          <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--color-mid-gray-border)' }}>
            {mockJobs.length} OPEN · SUI TESTNET
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--color-dark-grid)' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 160px 100px 80px', gap: 20, padding: '12px 22px', background: 'var(--surface-subtle-panel)' }}>
            {['Job Title', 'Budget', 'Criteria', 'Status', 'Posted'].map(h => (
              <span key={h} className="label">{h}</span>
            ))}
          </div>
          {mockJobs.map((job, i) => (
            <div key={job.id} className="fade-up card-trace" style={{
              display: 'grid', gridTemplateColumns: '1fr 120px 160px 100px 80px',
              gap: 20, padding: '18px 22px', background: 'var(--surface-dark-card)',
              alignItems: 'center', cursor: 'pointer',
              animationDelay: `${i * 0.07}s`,
            }}>
              <div>
                <div style={{ fontFamily: 'var(--font-inter-tight)', fontSize: 14, marginBottom: 4 }}>{job.title}</div>
              </div>
              <div style={{ color: 'var(--color-lime-interface)', fontFamily: 'var(--font-jetbrains)', fontSize: 13 }}>{job.budget}</div>
              <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--color-mid-gray-border)', background: '#000', padding: '4px 8px', border: '1px solid var(--color-dark-grid)' }}>{job.criteria}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, background: 'var(--color-lime-interface)', display: 'inline-block', boxShadow: 'var(--shadow-sm)' }} />
                <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, color: 'var(--color-lime-interface)' }}>{job.state}</span>
              </div>
              <div style={{ color: 'var(--color-faint-grid)', fontSize: 12 }}>{job.posted}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40, padding: '28px', background: 'var(--surface-dark-card)', border: '1px solid var(--color-dark-grid)', textAlign: 'center' }}>
          <div className="label" style={{ marginBottom: 12 }}>On-chain jobs load after wallet connect + contract deployment</div>
          <p style={{ color: 'var(--color-mid-gray-border)', fontSize: 13 }}>
            Above jobs are demo placeholders. Real jobs are fetched from the Sui Move escrow contract once{' '}
            <span className="lime">NEXT_PUBLIC_ESCROW_PACKAGE_ID</span> is set.
          </p>
        </div>
      </main>
    </>
  );
}
