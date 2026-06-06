import { Providers } from '@/components/Providers';
import Header from '@/components/Header';
import './globals.css';

export const metadata = {
  title: 'Verified Escrow - Trustless Freelance Delivery with Cryptographic Verification',
  description: 'First escrow platform using Sui Stack (Walrus + Seal + Nautilus + Move) for zero-trust delivery verification. Built for Tatum x Walrus Hackathon 2026.',
  keywords: 'Sui, Walrus, Seal, Nautilus, escrow, freelance, TEE, cryptographic verification, blockchain',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <footer className="glass border-t border-primary/20 py-12 mt-20">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-gray-400 mb-4">
                Built for <span className="text-primary font-semibold">Tatum x Walrus Hackathon</span> · May 23 - June 6, 2026
              </p>
              <div className="flex justify-center space-x-6 mb-6">
                <a href="https://twitter.com/Tatum_io" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-secondary transition-colors">
                  @Tatum_io
                </a>
                <a href="https://twitter.com/WalrusFoundation" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-secondary transition-colors">
                  @WalrusFoundation
                </a>
                <a href="https://twitter.com/SuiNetwork" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-secondary transition-colors">
                  @SuiNetwork
                </a>
              </div>
              <p className="text-sm text-gray-500">
                Powered by Sui Move · Walrus · Seal · Nautilus TEE · Tatum RPC
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
