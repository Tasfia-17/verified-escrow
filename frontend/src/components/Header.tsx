'use client';

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import Link from 'next/link';

export default function Header() {
  const account = useCurrentAccount();

  return (
    <header className="glass sticky top-0 z-50 border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-3 group">
            <img src="/logo.svg" alt="Verified Escrow" className="w-10 h-10 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-black gradient-text">
              Verified Escrow
            </span>
          </Link>
          
          {account && (
            <nav className="hidden md:flex space-x-6">
              <Link href="/jobs" className="text-gray-300 hover:text-secondary transition-colors font-medium">
                Browse Jobs
              </Link>
              <Link href="/create" className="text-gray-300 hover:text-secondary transition-colors font-medium">
                Create Job
              </Link>
              <Link href="/my-jobs" className="text-gray-300 hover:text-secondary transition-colors font-medium">
                My Jobs
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <ConnectButton className="!bg-gradient-to-r !from-primary !to-accent hover:!scale-105 !transition-all" />
        </div>
      </div>
    </header>
  );
}
