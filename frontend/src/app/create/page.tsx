'use client';

import { useState } from 'react';
import Nav from '@/components/Nav';

export default function CreateJobPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [paymentUSD, setPaymentUSD] = useState('');
  const [criteria, setCriteria] = useState('#!/bin/bash\nnpm install && npm test\nexit $?');
  const [arbitrators, setArbitrators] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Contract interaction requires wallet + deployed package
      throw new Error('Connect Sui wallet to submit on-chain');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, node: React.ReactNode, hint?: string) => (
    <div>
      <div className="label" style={{ marginBottom: 8 }}>{label}</div>
      {node}
      {hint && <div style={{ color: 'var(--color-faint-grid)', fontSize: 11, marginTop: 6, fontFamily: 'var(--font-jetbrains)' }}>{hint}</div>}
    </div>
  );

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px 80px' }}>
        <div style={{ marginBottom: 32 }}>
          <div className="label" style={{ marginBottom: 12 }}>New Job</div>
          <h1 style={{ fontFamily: 'var(--font-pt-serif)', fontSize: 48, fontWeight: 400, lineHeight: 1 }}>
            Post a Job<br /><span className="lime">with cryptographic criteria.</span>
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 1, background: 'var(--color-dark-grid)', alignItems: 'start' }}>
          {/* Form */}
          <form onSubmit={handleSubmit} style={{ background: 'var(--surface-dark-card)', padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {error && (
              <div style={{ border: '1px solid #7a2020', background: 'rgba(122,32,32,0.15)', padding: '12px 16px', color: '#ff6b6b', fontSize: 13, fontFamily: 'var(--font-jetbrains)' }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ border: '1px solid var(--color-glow-green)', background: 'rgba(89,115,33,0.15)', padding: '12px 16px', color: 'var(--color-lime-interface)', fontSize: 13, fontFamily: 'var(--font-jetbrains)' }}>
                ✓ JOB CREATED SUCCESSFULLY
              </div>
            )}

            {field('Job Title *',
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Build REST API with authentication" required />
            )}

            {field('Description *',
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailed requirements, deliverables, timeline..." rows={4} required style={{ resize: 'vertical' }} />
            )}

            {field('Payment (USD) *',
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-mid-gray-border)' }}>$</span>
                <input type="number" step="0.01" min="1" value={paymentUSD} onChange={e => setPaymentUSD(e.target.value)} placeholder="100.00" style={{ paddingLeft: 28 }} required />
              </div>,
              'Converted to SUI via Tatum exchange rates'
            )}

            {field('Acceptance Criteria (Bash Script) *',
              <textarea value={criteria} onChange={e => setCriteria(e.target.value)} rows={8} required style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 12, resize: 'vertical' }} />,
              '// Exit 0 = pass, non-zero = fail. Runs in Nautilus TEE.'
            )}

            {field('Arbitrators (comma-separated Sui addresses) *',
              <input value={arbitrators} onChange={e => setArbitrators(e.target.value)} placeholder="0x123..., 0x456..." style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 12 }} required />,
              '// Multi-sig committee for dispute resolution'
            )}

            <button type="submit" className="btn-lime pulse" disabled={loading} style={{ justifyContent: 'center', fontSize: 13, letterSpacing: '0.04em' }}>
              {loading ? '⚙ CREATING JOB...' : 'CREATE JOB & LOCK PAYMENT →'}
            </button>
          </form>

          {/* Sidebar */}
          <div style={{ background: 'var(--surface-dark-card)', padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <div className="label" style={{ marginBottom: 16, color: 'var(--color-lime-interface)' }}>Example Criteria</div>
              {[
                { lang: 'JavaScript', code: 'npm install && npm test' },
                { lang: 'Python', code: 'pip install -r requirements.txt && pytest' },
                { lang: 'Word count', code: '[ $(wc -w < $DELIVERABLE_PATH) -ge 1000 ]' },
                { lang: 'Rust', code: 'cargo test --release' },
              ].map(({ lang, code }) => (
                <div key={lang} style={{ marginBottom: 16 }}>
                  <div style={{ color: 'var(--color-faint-grid)', fontSize: 11, marginBottom: 6, fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.06em' }}>{lang.toUpperCase()}</div>
                  <div style={{ background: '#000', border: '1px solid var(--color-dark-grid)', padding: '10px 14px', fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--color-lime-interface)', cursor: 'pointer' }}
                    onClick={() => setCriteria(`#!/bin/bash\n${code}\nexit $?`)}>
                    {code}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--color-dark-grid)', paddingTop: 20 }}>
              <div className="label" style={{ marginBottom: 12 }}>How payment works</div>
              {[
                ['TEE passes', 'Freelancer receives payment minus 2.5% fee'],
                ['TEE fails', 'Client receives full refund instantly'],
                ['Disputed', 'Arbitrators vote, Seal unlocks evidence'],
              ].map(([event, outcome]) => (
                <div key={event as string} style={{ marginBottom: 12, display: 'flex', gap: 10 }}>
                  <span style={{ color: 'var(--color-lime-interface)', fontFamily: 'var(--font-jetbrains)', fontSize: 10, minWidth: 80 }}>{event as string}</span>
                  <span style={{ color: 'var(--color-mid-gray-border)', fontSize: 12 }}>{outcome as string}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
