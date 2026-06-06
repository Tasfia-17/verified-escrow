import './globals.css';

export const metadata = {
  title: 'Verified Escrow - Trustless Freelance Delivery',
  description: 'The first escrow platform with cryptographic delivery verification using Sui Move, Walrus, Seal, and Nautilus TEE.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
