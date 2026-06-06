'use client';

import { useCurrentAccount } from '@mysten/dapp-kit';
import Link from 'next/link';

export default function HomePage() {
  const account = useCurrentAccount();

  return (
    <div className="relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center mb-32">
          <div className="flex justify-center mb-8">
            <img src="/logo.svg" alt="Verified Escrow" className="w-32 h-32 float" />
          </div>
          
          <h1 className="text-7xl font-black mb-6 leading-tight">
            <span className="gradient-text">Trustless</span> Freelance<br/>Delivery Platform
          </h1>
          
          <p className="text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
            The first escrow platform with <span className="text-secondary font-semibold">cryptographic verification</span>
          </p>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            No human arbitrators. No trust required. Just math.
          </p>
          
          {!account ? (
            <div className="glass glow p-8 max-w-md mx-auto">
              <div className="text-secondary text-5xl mb-4">🔐</div>
              <p className="text-lg text-gray-300 mb-4">
                Connect your Sui wallet to get started
              </p>
              <p className="text-sm text-gray-400">
                Powered by <span className="text-primary font-semibold">Tatum</span> × <span className="text-secondary font-semibold">Walrus</span>
              </p>
            </div>
          ) : (
            <div className="flex justify-center gap-6">
              <Link
                href="/create"
                className="glass glow-hover px-10 py-5 rounded-2xl font-bold text-lg bg-gradient-to-r from-primary to-accent hover:scale-105 transition-all"
              >
                ✨ Post a Job
              </Link>
              <Link
                href="/jobs"
                className="glass glow-hover px-10 py-5 rounded-2xl font-bold text-lg border-2 border-primary hover:scale-105 transition-all"
              >
                🔍 Find Work
              </Link>
            </div>
          )}
        </div>

        {/* Problem Statement */}
        <div className="glass glow p-12 mb-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center gradient-text">The $10B Problem</h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            Smart contract escrow can hold funds, but <span className="text-red-400 font-semibold">cannot verify if work was actually delivered correctly</span>. 
            The entire freelance industry relies on trust or expensive human arbitrators. Payment disputes cost businesses billions annually.
          </p>
        </div>

        {/* How It Works */}
        <div className="mb-32">
          <h2 className="text-5xl font-bold text-center mb-4 gradient-text">How It Works</h2>
          <p className="text-center text-gray-400 mb-16 text-lg">Four steps to trustless verification</p>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                num: '1',
                icon: '📝',
                title: 'Client Creates Job',
                desc: 'Define acceptance criteria (test suite, validators, linters) and lock payment in Move escrow',
                color: 'from-violet-600 to-purple-600'
              },
              {
                num: '2',
                icon: '📦',
                title: 'Freelancer Delivers',
                desc: 'Upload work as encrypted Walrus blob with Seal access control (client can\'t peek)',
                color: 'from-purple-600 to-pink-600'
              },
              {
                num: '3',
                icon: '⚙️',
                title: 'Nautilus TEE Verifies',
                desc: 'Runs tests in isolated AWS Nitro Enclave, produces cryptographic attestation',
                color: 'from-pink-600 to-rose-600'
              },
              {
                num: '4',
                icon: '✅',
                title: 'Auto Payment',
                desc: 'Smart contract reads attestation: auto-release if pass, auto-refund if fail',
                color: 'from-rose-600 to-cyan-400'
              }
            ].map((step, i) => (
              <div key={i} className="glass glow-hover p-8 text-center group hover:scale-105 transition-all">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-6 text-4xl pulse-glow`}>
                  {step.icon}
                </div>
                <div className="text-5xl font-black text-primary mb-4">{step.num}</div>
                <h3 className="text-xl font-bold mb-3 text-secondary">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="glass glow p-12 mb-20">
          <h2 className="text-4xl font-bold text-center mb-12 gradient-text">Built on the Sui Stack</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: '⛓️', name: 'Sui Move', desc: 'Smart contract escrow logic', color: 'text-blue-400' },
              { icon: '💾', name: 'Walrus', desc: 'Decentralized blob storage', color: 'text-cyan-400' },
              { icon: '🔐', name: 'Seal', desc: 'Encrypted access control', color: 'text-purple-400' },
              { icon: '✓', name: 'Nautilus', desc: 'Verifiable TEE computation', color: 'text-green-400' }
            ].map((tech, i) => (
              <div key={i} className="text-center group">
                <div className={`text-6xl mb-4 ${tech.color} group-hover:scale-125 transition-transform`}>{tech.icon}</div>
                <h4 className="text-xl font-bold mb-2">{tech.name}</h4>
                <p className="text-sm text-gray-400">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            { value: '100%', label: 'Cryptographically Verified', icon: '🔒' },
            { value: '0', label: 'Human Arbitrators Needed', icon: '🤖' },
            { value: '$10B+', label: 'Market Problem Solved', icon: '💰' }
          ].map((stat, i) => (
            <div key={i} className="glass glow-hover p-8 text-center group">
              <div className="text-5xl mb-4 group-hover:scale-125 transition-transform">{stat.icon}</div>
              <div className="text-6xl font-black gradient-text mb-4">{stat.value}</div>
              <div className="text-gray-300 text-lg">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="glass glow p-16 text-center">
          <h2 className="text-4xl font-bold mb-6 gradient-text">Ready to Eliminate Trust?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the revolution in trustless work verification. No more disputes. No more delays.
          </p>
          {!account && (
            <p className="text-lg text-secondary font-semibold">
              ⬆️ Connect wallet above to start
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
