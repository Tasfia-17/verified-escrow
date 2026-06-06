'use client';

import Nav from '@/components/Nav';
import { useCurrentAccount } from '@mysten/dapp-kit';

const mockMyJobs = [
  { id: '1', title: 'Build REST API with JWT auth', budget: '$500', role: 'Client', state: 'Submitted', updated: '1h ago' },
  { id: '2', title: 'Smart contract audit report', budget: '$1,200', role: 'Freelancer', state: 'Verified Pass', updated: '3h ago' },
];

const stateColor: Record<string, string> = {
  'Open': 'var(--color-lime-interface)',
  'Submitted': '#ffd166',
  'Verified Pass': 'var(--color-lime-interface)',
  'Verified Fail': '#ff6b6b',
  'Disputed': '#ff6b6b',
  'Completed': 'var(--color-mid-gray-border)',
};

export default function MyJobsPage() {
  const account = useCurrentAccount();

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px 80px' }}>
        <div style={{ marginBottom: 32 }}>
          <div className="label" style={{ marginBottom: 12 }}>Dashboard</div>
          <h1 style={{ fontFamily: 'var(--font-pt-serif)', fontSize: 48, fontWeight: 400, lineHeight: 1 }}>
            My Jobs<br /><span className="lime">escrow activity.</span>
          </h1>
        </div>

        {!account ? (
          <div style={{ border: '1px solid var(--color-dark-grid)', padding: '48px', textAlign: 'center', background: 'var(--surface-dark-card)' }}>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--color-lime-interface)', marginBottom: 16, letterSpacing: '0.1em' }}>WALLET REQUIRED</div>
            <p style={{ color: 'var(--color-mid-gray-border)', fontSize: 14 }}>Connect your Sui wallet to view your jobs.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--color-dark-grid)', marginBottom: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 80px 140px 80px', gap: 20, padding: '12px 22px', background: 'var(--surface-subtle-panel)' }}>
                {['Job Title', 'Budget', 'Role', 'Status', 'Updated'].map(h => (
                  <span key={h} className="label">{h}</span>
                ))}
              </div>
              {mockMyJobs.map((job, i) => (
                <div key={job.id} className="fade-up card-trace" style={{
                  display: 'grid', gridTemplateColumns: '1fr 120px 80px 140px 80px',
                  gap: 20, padding: '18px 22px', background: 'var(--surface-dark-card)',
                  alignItems: 'center', animationDelay: `${i * 0.07}s`,
                }}>
                  <div style={{ fontFamily: 'var(--font-inter-tight)', fontSize: 14 }}>{job.title}</div>
                  <div style={{ color: 'var(--color-lime-interface)', fontFamily: 'var(--font-jetbrains)', fontSize: 13 }}>{job.budget}</div>
                  <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, color: 'var(--color-mid-gray-border)', letterSpacing: '0.06em' }}>{job.role.toUpperCase()}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, background: stateColor[job.state] || 'var(--color-mid-gray-border)', display: 'inline-block' }} />
                    <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, color: stateColor[job.state] || 'var(--color-mid-gray-border)' }}>{job.state.toUpperCase()}</span>
                  </div>
                  <div style={{ color: 'var(--color-faint-grid)', fontSize: 12 }}>{job.updated}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '20px 22px', background: 'var(--surface-dark-card)', border: '1px solid var(--color-dark-grid)' }}>
              <span className="label">Connected: </span>
              <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--color-lime-interface)' }}>{account.address.slice(0, 8)}...{account.address.slice(-6)}</span>
              <span className="label" style={{ marginLeft: 16 }}>Real jobs load after contract deployment</span>
            </div>
          </>
        )}
      </main>
    </>
  );
}
