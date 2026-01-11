# MantleForge - Hackathon Submission

## Project Name
**MantleForge** - AI Smart Contract Builder for Mantle

## Tagline
Generate, deploy, and interact with smart contracts using natural language on Mantle Network.

## Category
**Infrastructure & Tooling**

## Problem Statement
Creating smart contracts requires specialized Solidity knowledge, which creates a barrier for:
- Non-technical founders wanting to launch tokens
- Developers new to Web3
- Teams that need to rapidly prototype
- Anyone who just wants to deploy a simple contract

## Solution
MantleForge uses AI to translate natural language into production-ready Solidity smart contracts that can be deployed directly to Mantle Network.

**Example:**
> "Create an ERC-20 token called MantleGold with 1 million supply"

Instantly generates a complete, deployable ERC-20 contract.

## Features

### ✅ Implemented
- Natural language → Solidity code generation
- 6 contract templates: ERC-20, ERC-721 (NFT), Timelock, Voting DAO, MultiSig, Staking
- Wallet connection (MetaMask, etc.)
- Automatic Mantle network switching
- One-click deployment to Mantle Sepolia
- Beautiful, responsive UI

### 🚧 Roadmap
- On-chain contract verification
- Contract interaction UI
- Custom contract modifications
- AI-powered security audit
- Contract marketplace

## Technical Stack
- **Frontend**: HTML/CSS/JavaScript + TailwindCSS
- **Backend**: Node.js + Express
- **AI**: Pattern matching + Claude API integration (planned)
- **Blockchain**: ethers.js + Mantle RPC
- **Deployment**: Vercel / Railway ready

## Why Mantle?
1. **10x cheaper gas** - Deploy contracts for pennies
2. **EVM equivalent** - All Solidity contracts work natively
3. **Fast finality** - Quick deployment confirmations
4. **Growing ecosystem** - Perfect for new developers

## Demo
🔗 **Live Demo**: http://localhost:3000 (local)
🔗 **Video Demo**: [Coming soon]

## Screenshots

### Main Interface
```
+--------------------------------------------------+
|  🔗 Connect Wallet                               |
|                                                  |
|           MantleForge                            |
|  Generate smart contracts with AI, deploy to    |
|  Mantle in seconds                              |
|                                                  |
|  [Describe your smart contract...]              |
|                                                  |
|  [🔮 Generate Contract]                         |
|                                                  |
|  Examples: [ERC-20] [NFT] [Timelock] [Voting]   |
+--------------------------------------------------+
```

### Generated Contract
```
+--------------------------------------------------+
|  Generated Contract                  [📋 Copy]  |
|  Type: ERC20                        [🚀 Deploy] |
|                                                  |
|  // SPDX-License-Identifier: MIT                |
|  pragma solidity ^0.8.20;                       |
|                                                  |
|  import "@openzeppelin/contracts/...            |
|                                                  |
|  contract MantleGold is ERC20 {                 |
|      constructor() ERC20("MantleGold", "MANT") {|
|          _mint(msg.sender, 1000000 * 10 ** ...  |
|      }                                          |
|  }                                              |
+--------------------------------------------------+
```

## Team
- **Builder**: Solo developer
- **AI Assistant**: Claude

## Links
- **GitHub**: [To be created]
- **Live Demo**: [To be deployed]
- **Twitter**: [To be created]

## Prize Categories

### Primary: Infrastructure & Tooling ($15,000 pool)
- 1st: $8,000
- 2nd: $5,000
- 3rd: $2,000

### Also Eligible:
- Best Mantle Integration: $4,000
- Best UX/Demo: $5,000
- Community Choice: $2,000

**Maximum Potential: $17,000+**

## Submission Checklist
- [x] Project built
- [x] Mantle integration working
- [ ] GitHub repo created
- [ ] Live demo deployed
- [ ] Demo video recorded
- [ ] Submitted on HackQuest

## Quick Start (For Judges)

```bash
# Clone and run
git clone https://github.com/[username]/mantleforge
cd mantleforge
npm install
npm run dev

# Open http://localhost:3000
```

## Future Vision

MantleForge aims to become the go-to tool for:
1. Quick prototyping on Mantle
2. Teaching Solidity through AI
3. Lowering barriers to Web3 development
4. Building a marketplace of verified templates

With Mantle's low gas costs, even failed deployments are cheap learning experiences.
