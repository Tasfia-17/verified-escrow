# ⚡ QUICK START - Deploy in 2 Hours

## You Have Everything. Here's What To Do:

### 1. Get Tatum API Key (5 min)
```bash
# Visit: https://dashboard.tatum.io
# Sign up (free)
# Copy your API key
```

### 2. Install & Test Locally (15 min)
```bash
cd ~/verified-escrow/frontend
npm install
cp .env.example .env

# Edit .env - add your Tatum key
nano .env

# Test locally
npm run dev
# Visit http://localhost:3000
```

### 3. Deploy Contracts (10 min)
```bash
cd ~/verified-escrow/move
sui move build
sui client publish --gas-budget 200000000

# SAVE THE OUTPUT:
# - PackageID → NEXT_PUBLIC_ESCROW_PACKAGE_ID
# - Platform → NEXT_PUBLIC_PLATFORM_ID
```

### 4. Update Frontend Config (5 min)
```bash
cd ~/verified-escrow/frontend

# Edit .env with contract addresses
nano .env
```

### 5. Push to GitHub (5 min)
```bash
cd ~/verified-escrow
git init
git add .
git commit -m "Verified Escrow - Tatum x Walrus Hackathon"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/verified-escrow.git
git push -u origin main
```

### 6. Deploy to Vercel (10 min)
1. Go to https://vercel.com
2. Import GitHub repo
3. Root directory: `frontend`
4. Add all env variables from .env
5. Deploy

### 7. Record Demo (30 min)
- Use OBS/Loom
- Follow DEMO_SCRIPT.md
- Show: landing → connect wallet → create job → explain
- Upload to YouTube

### 8. Submit (10 min)
Go to: https://tatum.io/sui-hackathon

Fill in:
- **Project**: Verified Escrow
- **GitHub**: your-repo-url
- **Demo**: your-vercel-url
- **Video**: youtube-link
- **Description**: (copy from SUMMARY.md)

### 9. Social (5 min)
Tweet: 
```
Just built Verified Escrow - first trustless freelance platform with cryptographic verification! 

Built on @SuiNetwork using @Tatum_io RPC and @WalrusFoundation storage 🚀

Demo: [your-vercel-url]

#BuildOnSui #TatumHackathon
```

---

## 🎯 That's It!

Total time: ~2 hours
Prize potential: Up to $1,000

**Everything is ready. Just deploy and submit.**

Questions? Check:
- DEPLOYMENT.md (detailed guide)
- SUMMARY.md (complete overview)
- STATUS.txt (what you have)

**GO WIN THIS! 🚀**
