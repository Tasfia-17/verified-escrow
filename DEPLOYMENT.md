# 🚀 Deployment Checklist - Verified Escrow

## ✅ What You Need

### Required Accounts
- [ ] Sui wallet with SUI tokens (for gas)
- [ ] Sui wallet with WAL tokens (for Walrus storage)
- [ ] Tatum API key (free at dashboard.tatum.io)
- [ ] AWS account (for Nautilus Nitro Enclave deployment)
- [ ] GitHub account (for code repository)
- [ ] Vercel account (for frontend hosting)

### Development Tools
- [ ] Node.js 18+ installed
- [ ] Rust 1.75+ installed  
- [ ] Sui CLI installed (`cargo install --locked --git https://github.com/MystenLabs/sui.git --branch mainnet sui`)
- [ ] Docker (for Nautilus enclave)
- [ ] Git

---

## 📋 Step-by-Step Deployment

### Phase 1: Local Setup (15 minutes)

#### 1.1 Clone and Install
```bash
cd ~/verified-escrow

# Install frontend dependencies
cd frontend
npm install

# Build Nautilus enclave
cd ../nautilus
cargo build --release

# Verify Move contracts compile
cd ../move
sui move build
```

#### 1.2 Configure Sui Wallet
```bash
# Check your Sui address
sui client active-address

# Check balances
sui client gas

# If on testnet, get faucet tokens
sui client faucet
```

#### 1.3 Get Tatum API Key
1. Visit https://dashboard.tatum.io
2. Sign up (free)
3. Create API key
4. Copy the key

---

### Phase 2: Deploy Smart Contracts (10 minutes)

#### 2.1 Deploy to Sui Mainnet
```bash
cd move

# Build contracts
sui move build

# Deploy (save output!)
sui client publish --gas-budget 200000000

# OUTPUT WILL LOOK LIKE:
# ╭─────────────────────────────────────────────╮
# │ Object Changes                              │
# ├─────────────────────────────────────────────┤
# │ Created Objects:                            │
# │  ┌── PackageID: 0xABC...                    │  ← SAVE THIS
# │  ┌── Platform: 0xDEF...                     │  ← SAVE THIS
# │  ┌── AdminCap: 0xGHI...                     │  ← SAVE THIS
# ╰─────────────────────────────────────────────╯
```

**IMPORTANT**: Save these addresses:
- `PackageID` → This is your `NEXT_PUBLIC_ESCROW_PACKAGE_ID`
- `Platform` → This is your `NEXT_PUBLIC_PLATFORM_ID`
- `AdminCap` → Keep safe, you need this to configure the platform

#### 2.2 Verify Deployment
```bash
# Check package exists
sui client object <PackageID>

# Check Platform object
sui client object <Platform>
```

---

### Phase 3: Deploy Nautilus Enclave (30 minutes)

**Option A: AWS Nitro Enclave (Production)**

Follow the official guide: https://docs.sui.io/sui-stack/nautilus/using-nautilus

Key steps:
1. Launch EC2 instance with Nitro Enclaves enabled
2. Build enclave image from Dockerfile
3. Deploy to Nitro
4. Get attestation document
5. Register enclave with Platform contract

**Option B: Local Development (Testing)**

```bash
cd nautilus
cargo run

# Enclave will start on http://localhost:8080
# Test endpoints:
curl http://localhost:8080/health_check
curl http://localhost:8080/get_attestation
```

#### 3.1 Register Enclave (After Deployment)

```bash
# Get enclave public key
ENCLAVE_PUB_KEY=$(curl http://localhost:8080/get_attestation | jq -r .public_key)

# Register with Platform contract (you need AdminCap)
sui client call \
  --package <PackageID> \
  --module escrow \
  --function register_enclave \
  --args <AdminCap> <Platform> "0x${ENCLAVE_PUB_KEY}" \
  --gas-budget 10000000
```

---

### Phase 4: Configure Frontend (5 minutes)

#### 4.1 Create .env File
```bash
cd frontend
cp .env.example .env
```

#### 4.2 Edit .env
```bash
# Edit with your actual values
NEXT_PUBLIC_TATUM_API_KEY=your_tatum_api_key_here
NEXT_PUBLIC_SUI_NETWORK=mainnet
NEXT_PUBLIC_TATUM_SUI_RPC=https://sui-mainnet.gateway.tatum.io
NEXT_PUBLIC_WALRUS_NETWORK=mainnet
NEXT_PUBLIC_ESCROW_PACKAGE_ID=0xABC...  # From Phase 2
NEXT_PUBLIC_PLATFORM_ID=0xDEF...         # From Phase 2
NEXT_PUBLIC_NAUTILUS_ENCLAVE_ID=0xGHI... # Enclave address or URL
```

#### 4.3 Test Locally
```bash
npm run dev

# Visit http://localhost:3000
# Connect wallet
# Try creating a job
```

---

### Phase 5: Deploy to Production (10 minutes)

#### 5.1 Push to GitHub
```bash
cd ~/verified-escrow
git init
git add .
git commit -m "Initial commit - Verified Escrow"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/verified-escrow.git
git push -u origin main
```

#### 5.2 Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repo
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   
5. Add Environment Variables (same as .env):
   ```
   NEXT_PUBLIC_TATUM_API_KEY
   NEXT_PUBLIC_SUI_NETWORK
   NEXT_PUBLIC_TATUM_SUI_RPC
   NEXT_PUBLIC_WALRUS_NETWORK
   NEXT_PUBLIC_ESCROW_PACKAGE_ID
   NEXT_PUBLIC_PLATFORM_ID
   NEXT_PUBLIC_NAUTILUS_ENCLAVE_ID
   ```

6. Click "Deploy"

#### 5.3 Get Your Live URL

Vercel will give you:
- Production: `https://verified-escrow.vercel.app`
- Custom domain (optional): Add in Vercel settings

---

## 🎥 Create Demo Video (30 minutes)

### Recording Setup
1. Use OBS Studio or Loom
2. 1920x1080 resolution
3. Clear audio (built-in mic is fine)
4. 2-3 minute target length

### What to Show
1. **Landing page** (10 seconds)
   - Show animated design
   - Explain the problem

2. **Connect wallet** (10 seconds)
   - Click connect button
   - Approve connection

3. **Create job** (60 seconds)
   - Fill in form
   - Show acceptance criteria
   - Submit transaction
   - Show on SuiVision/Suiscan

4. **Explain verification** (30 seconds)
   - How Nautilus TEE works
   - Show smart contract logic (briefly)

5. **Why it matters** (20 seconds)
   - No trust needed
   - $10B problem solved
   - Built on Sui Stack

### Upload Video
- YouTube (unlisted is fine)
- Include link in submission

---

## 📝 Hackathon Submission

### On tatum.io/sui-hackathon Submit:

1. **Project Name**: Verified Escrow

2. **GitHub URL**: `https://github.com/YOUR_USERNAME/verified-escrow`

3. **Live Demo URL**: `https://verified-escrow.vercel.app`

4. **Demo Video**: `https://youtube.com/watch?v=...`

5. **Description** (copy this):
```
Verified Escrow is the first trustless freelance delivery platform with cryptographic verification. We solve the $10B problem of verifying work delivery without human arbitrators using the complete Sui Stack:

- Walrus: Decentralized storage for deliverables
- Seal: Programmable encryption and access control  
- Nautilus: TEE verification in AWS Nitro Enclaves
- Sui Move: Smart contract escrow logic
- Tatum: Enterprise RPC + Data APIs

Key features:
✅ Zero-trust delivery verification
✅ Cryptographic attestations from TEE
✅ Automatic payment on verification
✅ Multi-sig dispute resolution
✅ Full Sui Stack integration

Walrus Integration: Deliverables stored as encrypted blobs with Seal access control. Blob IDs stored as Move object fields for composability.

Tatum Integration: All RPC calls via Tatum endpoints. Data API for wallet balance and USD/SUI exchange rates.

Smart Contracts: Deployed on Sui Mainnet at [YOUR_PACKAGE_ID]
```

6. **Social Sharing**:
   - Tweet: "Just built Verified Escrow - the first trustless freelance platform with cryptographic verification on @SuiNetwork using @Tatum_io RPC and @WalrusFoundation storage! 🚀 #BuildOnSui"
   - Tag all three accounts

---

## ✅ Final Checklist Before Submission

- [ ] Move contracts deployed to Sui Mainnet
- [ ] Nautilus enclave deployed (or simulated for demo)
- [ ] Frontend deployed to Vercel
- [ ] GitHub repo is public
- [ ] README.md has clear instructions
- [ ] Demo video recorded and uploaded
- [ ] .env.example has all variables
- [ ] LICENSE file included (Apache 2.0)
- [ ] Code is well-commented
- [ ] No API keys committed to GitHub
- [ ] Submission form completed
- [ ] Social media posts published

---

## 🆘 Troubleshooting

### "Insufficient gas"
```bash
# Check balance
sui client gas

# Get more SUI from faucet (testnet)
sui client faucet

# Or buy SUI on exchange (mainnet)
```

### "Package not found"
```bash
# Rebuild
cd move
sui move build --force

# Redeploy
sui client publish --gas-budget 200000000
```

### "Cannot connect to Walrus"
- Check NEXT_PUBLIC_WALRUS_NETWORK is set
- Walrus testnet: use testnet
- Walrus mainnet: use mainnet

### "Tatum API error"
- Verify API key is correct
- Check you haven't exceeded free tier limits
- Ensure no extra spaces in .env

### Frontend won't build
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run build
```

---

## 🎯 You're Ready!

Your project is **fully functional** and **submission-ready**.

**Time to completion**: ~2 hours total
- Setup: 15 min
- Deploy contracts: 10 min  
- Deploy enclave: 30 min
- Configure frontend: 5 min
- Deploy to Vercel: 10 min
- Record demo: 30 min
- Submit: 10 min

**Good luck! 🚀**
