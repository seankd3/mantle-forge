# MantleForge - AI Smart Contract Builder

> Generate, deploy, and interact with Solidity smart contracts on Mantle using natural language.

## What It Does

MantleForge lets anyone create smart contracts without writing code:

1. **Describe** what you want in plain English
2. **Generate** production-ready Solidity code with AI
3. **Deploy** directly to Mantle Network (testnet or mainnet)
4. **Interact** with your deployed contracts through a simple UI

## Why Mantle?

- **10x cheaper gas** than Ethereum L1
- **EVM equivalent** - any Solidity contract works
- **Fast finality** for quick deployments
- **Growing ecosystem** for DeFi, RWA, and more

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS
- **AI**: Claude API for contract generation
- **Blockchain**: ethers.js + Mantle RPC
- **Contracts**: Hardhat for compilation

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Deploy to Mantle Sepolia
npm run deploy:testnet
```

## Example Prompts

- "Create an ERC-20 token called MantleGold with 1 million supply"
- "Build a simple NFT collection with mint and burn functions"
- "Make a timelock contract that releases funds after 30 days"
- "Create a voting contract for DAO proposals"

## Prize Category

**Infrastructure & Tooling Track** - $15,000 prize pool
- 1st: $8,000
- 2nd: $5,000
- 3rd: $2,000

Also eligible for:
- Best Mantle Integration: $4,000
- Best UX/Demo: $5,000

## Roadmap

- [x] Project setup
- [ ] AI contract generation
- [ ] Contract compilation
- [ ] Mantle deployment
- [ ] Interactive UI
- [ ] Demo video

## Team

Built for Mantle Global Hackathon 2025
