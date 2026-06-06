'use client';

import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { uploadCriteria } from '@/lib/walrus-seal';
import { createJob } from '@/lib/escrow-contract';
import { usdToMIST } from '@/lib/tatum-api';

export default function CreateJobForm() {
  const account = useCurrentAccount();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [paymentUSD, setPaymentUSD] = useState('');
  const [criteria, setCriteria] = useState('#!/bin/bash\n# Acceptance criteria\n# Exit 0 for pass, non-zero for fail\n\nnpm test\nexit $?');
  const [arbitrators, setArbitrators] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Upload acceptance criteria to Walrus
      const criteriaBlobId = await uploadCriteria(criteria, title, account);

      // Convert USD to MIST
      const paymentMIST = await usdToMIST(parseFloat(paymentUSD));

      // Parse arbitrators
      const arbitratorsList = arbitrators.split(',').map(a => a.trim()).filter(Boolean);
      
      if (arbitratorsList.length === 0) {
        throw new Error('At least one arbitrator is required');
      }

      // Create job on-chain
      await createJob({
        paymentMIST,
        title,
        description,
        criteriaBlobId,
        arbitrators: arbitratorsList,
        requiredApprovals: Math.ceil(arbitratorsList.length / 2),
        signer: account,
      });

      setSuccess(true);
      
      // Reset form
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setPaymentUSD('');
        setCriteria('#!/bin/bash\nnpm test\nexit $?');
        setArbitrators('');
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error creating job:', err);
      setError(err.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="glass glow p-12 text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold gradient-text mb-4">Wallet Required</h2>
          <p className="text-gray-400">
            Please connect your Sui wallet to create a job
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="glass glow p-8">
        <h2 className="text-3xl font-bold gradient-text mb-8">Create New Job</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-6">
            <p className="text-green-400 text-sm">✅ Job created successfully!</p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-secondary">
              Job Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Build REST API with authentication"
              className="w-full px-4 py-3 bg-black/20 border border-primary/30 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-secondary">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed job requirements, deliverables, timeline..."
              className="w-full px-4 py-3 bg-black/20 border border-primary/30 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-secondary">
              Payment (USD) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                min="1"
                value={paymentUSD}
                onChange={(e) => setPaymentUSD(e.target.value)}
                placeholder="100.00"
                className="w-full pl-8 pr-4 py-3 bg-black/20 border border-primary/30 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Converted to SUI via Tatum exchange rates
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-secondary">
              Acceptance Criteria (Bash Script) *
            </label>
            <textarea
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              placeholder="#!/bin/bash&#10;npm test&#10;exit $?"
              className="w-full px-4 py-3 bg-black/20 border border-primary/30 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm transition-all"
              rows={10}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 This code runs in Nautilus TEE to verify deliverable. Exit 0 = pass, non-zero = fail
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-secondary">
              Arbitrators (comma-separated Sui addresses) *
            </label>
            <input
              type="text"
              value={arbitrators}
              onChange={(e) => setArbitrators(e.target.value)}
              placeholder="0x123..., 0x456..., 0x789..."
              className="w-full px-4 py-3 bg-black/20 border border-primary/30 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm transition-all"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              🔒 Multi-sig committee for dispute resolution (majority vote required)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full glass glow-hover py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-primary to-accent hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⚙️</span>
                Creating Job...
              </span>
            ) : (
              '✨ Create Job & Lock Payment'
            )}
          </button>
        </div>
      </div>

      <div className="glass p-6">
        <h3 className="font-semibold text-secondary mb-3">💡 Example Criteria</h3>
        <div className="space-y-3 text-sm">
          <div className="bg-black/30 p-3 rounded-lg">
            <p className="text-gray-400 mb-2">JavaScript Tests:</p>
            <code className="text-cyan-400">npm install && npm test</code>
          </div>
          <div className="bg-black/30 p-3 rounded-lg">
            <p className="text-gray-400 mb-2">Python Tests:</p>
            <code className="text-cyan-400">pip install -r requirements.txt && pytest</code>
          </div>
          <div className="bg-black/30 p-3 rounded-lg">
            <p className="text-gray-400 mb-2">Word Count (min 1000 words):</p>
            <code className="text-cyan-400">[ $(wc -w &lt; $DELIVERABLE_PATH) -ge 1000 ]</code>
          </div>
        </div>
      </div>
    </form>
  );
}
