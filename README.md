# Verified Escrow

**Trustless Freelance Delivery with Cryptographic Verification**

A decentralized escrow platform that combines Walrus storage, Seal access control, Nautilus TEE verification, and Sui Move smart contracts to solve the fundamental trust problem in freelance work: verifying delivery without human arbitrators.

---

## The Problem

Smart contract escrow can hold funds, but cannot verify if work was actually delivered correctly. The entire $10B+ freelance industry relies on trust or expensive human arbitrators.

## The Solution

Cryptographically verified delivery using the full Sui Stack:

1. **Client creates a job** on Sui -- defines acceptance criteria (test suite, format spec, word count, etc.) and locks payment as a Move object
2. **Freelancer submits deliverable** as a Walrus blob, sealed with Seal (client cannot peek before payment logic runs)
3. **Nautilus TEE runs verification** -- executes code, runs tests, checks specs -- and produces a cryptographic attestation
4. **The Move smart contract reads the attestation** and auto-releases or auto-refunds payment
5. **If disputed**: Seal policy unlocks the blob to arbitrators (multi-sig committee), who see the evidence and vote, with outcome recorded immutably on-chain

---

## Architecture

```
Client                   Freelancer              Nautilus TEE
  |                          |                        |
  |-- Create Job ----------->|                        |
  |   (lock SUI payment)     |                        |
  |                          |-- Submit Deliverable ->|
  |                          |   (Walrus blob +        |
  |                          |    Seal encryption)     |
  |                          |                        |-- Run acceptance criteria
  |                          |                        |   (bash script in Nitro Enclave)
  |                          |                        |-- Sign attestation
  |                          |                        |
  |<-- Auto release/refund via Move contract ----------|
```

### Components

| Directory | Description |
|-----------|-------------|
| `frontend/` | Next.js 15 + TypeScript + Sui dApp Kit |
| `move/` | Sui Move smart contracts (escrow, verification, disputes) |
| `nautilus/` | Rust application running inside AWS Nitro Enclave |

### Tech Stack

- **Sui Move** -- Smart contracts for escrow, verification, and dispute resolution
- **Walrus** -- Decentralized blob storage for deliverables and acceptance criteria
- **Seal** -- Encrypted access control (hides deliverable until verification or dispute)
- **Nautilus** -- Verifiable off-chain computation with TEE attestations
- **Tatum** -- Enterprise Sui RPC + Data APIs (wallet balance, exchange rates)
- **Next.js 15** -- Frontend framework
- **@mysten/dapp-kit** -- Sui wallet connection
- **Rust (axum)** -- Nautilus enclave HTTP server

---

## Features

- Zero-trust verification -- math, not humans, decides if work passes
- Sealed deliverables -- client cannot see work until the payment decision is made
- Cryptographic attestations -- every verification is auditable on-chain
- Multi-sig arbitration -- if disputed, committee gets access via Seal
- Immutable evidence -- all blobs on Walrus with Proof-of-Availability
- Flexible criteria -- supports tests, linters, validators, and custom bash scripts
- USD pricing -- Tatum exchange rates convert USD to SUI/MIST automatically

---

## Quick Start

### Prerequisites

- Node.js 18+
- Sui CLI
- Tatum API key (free at https://dashboard.tatum.io)
- Sui wallet (Slush Wallet or similar)
- AWS account with Nitro Enclaves enabled (for Nautilus)

### 1. Clone and Install

```bash
git clone https://github.com/Tasfia-17/verified-escrow
cd verified-escrow
cd frontend && npm install
```

### 2. Configure Environment

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:

```env
NEXT_PUBLIC_TATUM_API_KEY=your_tatum_api_key
NEXT_PUBLIC_SUI_NETWORK=mainnet
NEXT_PUBLIC_TATUM_SUI_RPC=https://sui-mainnet.gateway.tatum.io
NEXT_PUBLIC_WALRUS_NETWORK=mainnet
NEXT_PUBLIC_ESCROW_PACKAGE_ID=<deployed_package_id>
NEXT_PUBLIC_PLATFORM_ID=<platform_object_id>
NEXT_PUBLIC_NAUTILUS_ENCLAVE_ID=<enclave_address>
```

### 3. Deploy Move Contracts

```bash
cd move
sui move build
sui client publish --gas-budget 200000000
```

Copy the published package ID and platform object ID into your `.env`.

### 4. Deploy Nautilus Enclave

```bash
cd nautilus
docker build -t verified-escrow-enclave .
# Follow AWS Nitro Enclave deployment steps in nautilus/README.md
```

### 5. Run Frontend

```bash
cd frontend
npm run dev
```

Open http://localhost:3000.

---

## Vercel Deployment

The project is pre-configured for Vercel. The `vercel.json` at the root points to the `frontend/` directory.

### Steps

1. Push this repo to GitHub
2. Import the repo in [vercel.com/new](https://vercel.com/new)
3. Vercel auto-detects the config -- no manual settings needed
4. Add environment variables in the Vercel dashboard (same keys as `.env.example`)
5. Deploy

### Required Environment Variables on Vercel

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_TATUM_API_KEY` | Tatum API key from dashboard.tatum.io |
| `NEXT_PUBLIC_SUI_NETWORK` | `mainnet` or `testnet` |
| `NEXT_PUBLIC_TATUM_SUI_RPC` | Tatum Sui RPC endpoint |
| `NEXT_PUBLIC_WALRUS_NETWORK` | `mainnet` or `testnet` |
| `NEXT_PUBLIC_ESCROW_PACKAGE_ID` | Deployed Move package ID |
| `NEXT_PUBLIC_PLATFORM_ID` | Platform shared object ID |
| `NEXT_PUBLIC_NAUTILUS_ENCLAVE_ID` | Registered Nautilus enclave address |

---

## How Verification Works

1. Client writes an acceptance criteria script (bash):
   ```bash
   #!/bin/bash
   npm install && npm test
   exit $?
   ```
2. The script is uploaded to Walrus as a public blob
3. When the freelancer submits their deliverable, the Nautilus enclave:
   - Fetches both blobs from Walrus
   - Extracts the deliverable to a temp directory
   - Runs the criteria script with `DELIVERABLE_PATH` set
   - Captures exit code, stdout, and stderr
4. The enclave signs an attestation with its Ed25519 key
5. The Move contract verifies the signature on-chain and auto-settles payment

---

## Project Structure

```
verified-escrow/
├── frontend/                    # Next.js app (deployed to Vercel)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Landing page
│   │   │   ├── create/page.tsx  # Create job page
│   │   │   ├── layout.tsx       # Root layout
│   │   │   └── globals.css      # Global styles
│   │   ├── components/
│   │   │   ├── Header.tsx       # Navigation + wallet connect
│   │   │   ├── Providers.tsx    # Sui + query providers
│   │   │   └── CreateJobForm.tsx # Job creation form
│   │   └── lib/
│   │       ├── sui-client.ts    # Tatum-powered Sui client
│   │       ├── escrow-contract.ts # Move contract calls
│   │       ├── walrus-seal.ts   # Walrus upload + Seal encrypt
│   │       ├── tatum-api.ts     # Tatum Data API calls
│   │       └── network-config.ts # Network configuration
│   ├── .env.example
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
├── move/                        # Sui Move smart contracts
│   ├── sources/
│   │   └── escrow.move          # Main escrow contract
│   └── Move.toml
├── nautilus/                    # TEE enclave (Rust)
│   ├── src/
│   │   └── main.rs              # Axum HTTP server
│   ├── Cargo.toml
│   └── Dockerfile
├── vercel.json                  # Vercel deployment config
└── README.md
```

---

## Built For

Tatum x Walrus Hackathon -- May 23 to June 6, 2026

### Walrus and Tatum Integration

- Walrus blobs are the core data storage for deliverables and criteria (not decorative)
- Seal encrypts deliverables with programmable on-chain access policies
- Blob IDs are stored as Sui Move object fields (fully composable)
- All blockchain RPC calls go through Tatum Sui nodes
- Tatum Data API used for wallet portfolio and USD/SUI exchange rates

---

## License

Apache 2.0
