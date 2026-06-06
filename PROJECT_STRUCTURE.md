# Verified Escrow - Project Structure

```
verified-escrow/
│
├── README.md                          # Main project documentation
├── package.json                       # Root workspace config
├── BUILD_COMPLETE.md                  # Build & deployment guide
│
├── move/                              # Sui Move Smart Contracts
│   ├── Move.toml                      # Move package manifest
│   └── sources/
│       └── escrow.move                # Core escrow contract (500+ lines)
│                                      #   - Job creation & acceptance
│                                      #   - Deliverable submission
│                                      #   - Nautilus TEE verification
│                                      #   - Dispute resolution
│                                      #   - Payment distribution
│
├── nautilus/                          # Nautilus TEE Enclave
│   ├── Cargo.toml                     # Rust package manifest
│   ├── Dockerfile                     # Container for AWS Nitro
│   ├── README.md                      # Enclave documentation
│   └── src/
│       └── main.rs                    # Enclave application (200+ lines)
│                                      #   - REST API (health, attestation, verify)
│                                      #   - Criteria execution in isolation
│                                      #   - Cryptographic signing
│
└── frontend/                          # Next.js 15 Frontend
    ├── package.json                   # Dependencies (@mysten/*, Next 15)
    ├── tsconfig.json                  # TypeScript config
    ├── next.config.js                 # Next.js config
    ├── tailwind.config.js             # Tailwind CSS config
    ├── postcss.config.js              # PostCSS config
    ├── .env.example                   # Environment template
    │
    ├── public/
    │   └── logo.svg                   # Custom shield logo (purple/blue)
    │
    └── src/
        ├── app/
        │   ├── layout.tsx             # Root layout with providers
        │   ├── globals.css            # Dark theme + animations
        │   ├── page.tsx               # Landing page (hero, stats, CTA)
        │   └── create/
        │       └── page.tsx           # Job creation page
        │
        ├── components/
        │   ├── Header.tsx             # Navigation + wallet connect
        │   ├── Providers.tsx          # Sui dApp Kit providers
        │   └── CreateJobForm.tsx      # Job creation form
        │
        └── lib/
            ├── sui-client.ts          # Tatum RPC + Walrus + Seal setup
            ├── tatum-api.ts           # Tatum Data API integration
            ├── walrus-seal.ts         # Walrus storage + Seal encryption
            ├── escrow-contract.ts     # Move contract interactions
            └── network-config.ts      # Network configuration
```

## File Count by Type

- **Move contracts**: 1 file, ~500 lines
- **Rust (Nautilus)**: 1 file, ~200 lines
- **TypeScript/TSX**: 12 files, ~1000+ lines
- **Config files**: 7 files
- **Documentation**: 3 markdown files

## Key Technologies

### Smart Contracts (Move)
- `sui-framework`: Coin, transfer, object model
- `enclave` (Nautilus): TEE signature verification

### Enclave (Rust)
- `axum`: REST API framework
- `ed25519-dalek`: Cryptographic signing
- `bcs`: Binary canonical serialization

### Frontend (TypeScript)
- `next`: 15.1.4
- `@mysten/sui`: 1.14.0
- `@mysten/walrus`: 0.5.0
- `@mysten/seal`: 0.3.0
- `@mysten/dapp-kit`: 0.14.28
- `@tanstack/react-query`: 5.62.8

## Design System

### Colors
- **Primary**: #6366f1 (Indigo)
- **Secondary**: #a5f3fc (Cyan)
- **Accent**: #818cf8 (Purple)
- **Background**: #0f0e1a → #312e81 (Gradient)
- **Card**: rgba(30, 27, 75, 0.6) (Glass morphism)

### Effects
- Glass morphism with backdrop blur
- Glow effects (primary color shadows)
- Animated gradient text
- Floating animations (6s ease-in-out)
- Pulse glow (2s infinite)
- Hover scale transformations

### Typography
- Font: Inter (Google Fonts)
- Weights: 300-900
- Large hero text: 7xl (72px)
- Section headers: 4-5xl
- Body: base-xl

## API Integrations

### Tatum
- **RPC**: `sui-mainnet.gateway.tatum.io`
- **Data API**: Wallet balance, exchange rates
- **MCP**: (Optional) AI agent blockchain access

### Walrus
- **Storage**: Blob upload/download
- **Encryption**: Seal threshold encryption
- **Access Control**: Programmable policies

### Nautilus
- **TEE**: AWS Nitro Enclave execution
- **Attestation**: Cryptographic signatures
- **Verification**: On-chain validation

## Deployment Targets

- **Move Contracts**: Sui Mainnet
- **Nautilus Enclave**: AWS EC2 + Nitro Enclaves
- **Frontend**: Vercel / Netlify
- **API** (if needed): Railway / Render

## License

Apache 2.0 (matching Nautilus framework)
