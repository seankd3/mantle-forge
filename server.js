/**
 * MantleForge - AI Smart Contract Builder Server
 * Web interface for generating and deploying contracts
 */

import express from 'express';
import cors from 'cors';
import { generateContract } from './src/contract-generator.js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Generate contract from prompt
app.post('/api/generate', (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const result = generateContract(prompt);
  res.json(result);
});

// Compile contract
app.post('/api/compile', async (req, res) => {
  const { code } = req.body;

  try {
    // Write contract to temp file
    const tempDir = '/tmp/mantleforge';
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const contractPath = path.join(tempDir, 'Contract.sol');
    fs.writeFileSync(contractPath, code);

    // For demo, return mock compiled output
    // In production, would use solc
    res.json({
      success: true,
      bytecode: '0x608060405234801561001057600080fd5b50...',
      abi: [{ type: 'constructor', inputs: [] }],
      message: 'Contract compiled successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Mantle network info
app.get('/api/networks', (req, res) => {
  res.json({
    mainnet: {
      chainId: 5000,
      name: 'Mantle',
      rpc: 'https://rpc.mantle.xyz',
      explorer: 'https://explorer.mantle.xyz',
      currency: 'MNT'
    },
    sepolia: {
      chainId: 5003,
      name: 'Mantle Sepolia',
      rpc: 'https://rpc.sepolia.mantle.xyz',
      explorer: 'https://explorer.sepolia.mantle.xyz',
      currency: 'MNT',
      faucet: 'https://faucet.sepolia.mantle.xyz'
    }
  });
});

// Serve frontend
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MantleForge - AI Smart Contract Builder</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Space Grotesk', sans-serif; }
    .gradient-bg { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); }
    .mantle-accent { color: #00d4aa; }
    .mantle-bg { background-color: #00d4aa; }
    pre { white-space: pre-wrap; word-wrap: break-word; }
  </style>
</head>
<body class="gradient-bg min-h-screen text-white">
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div></div>
      <div class="text-center">
        <h1 class="text-5xl font-bold mb-2">
          <span class="mantle-accent">Mantle</span>Forge
        </h1>
        <p class="text-lg text-gray-300">Generate smart contracts with AI, deploy to Mantle in seconds</p>
      </div>
      <button id="wallet-btn" onclick="connectWallet()" class="mantle-bg text-black font-bold py-2 px-4 rounded-xl hover:opacity-90">
        🔗 Connect Wallet
      </button>
    </div>

    <!-- Main Interface -->
    <div class="max-w-4xl mx-auto">
      <!-- Input Section -->
      <div class="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6">
        <label class="block text-lg mb-3 font-medium">Describe your smart contract:</label>
        <textarea
          id="prompt"
          class="w-full h-32 bg-black/30 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d4aa]"
          placeholder="Create an ERC-20 token called MantleGold with 1 million supply..."
        ></textarea>
        <button
          onclick="generateContract()"
          class="mantle-bg text-black font-bold py-3 px-8 rounded-xl mt-4 hover:opacity-90 transition"
        >
          🔮 Generate Contract
        </button>
      </div>

      <!-- Examples -->
      <div class="bg-white/5 rounded-xl p-4 mb-6">
        <p class="text-sm text-gray-400 mb-2">Try these examples:</p>
        <div class="flex flex-wrap gap-2">
          <button onclick="setPrompt('Create an ERC-20 token called MantleGold with 1 million supply')" class="bg-white/10 px-3 py-1 rounded-full text-sm hover:bg-white/20">ERC-20 Token</button>
          <button onclick="setPrompt('Build an NFT collection called MantleApes with 10000 max supply and 0.05 MNT mint price')" class="bg-white/10 px-3 py-1 rounded-full text-sm hover:bg-white/20">NFT Collection</button>
          <button onclick="setPrompt('Create a timelock contract that releases funds after 30 days')" class="bg-white/10 px-3 py-1 rounded-full text-sm hover:bg-white/20">Timelock</button>
          <button onclick="setPrompt('Build a voting contract for DAO proposals')" class="bg-white/10 px-3 py-1 rounded-full text-sm hover:bg-white/20">Voting DAO</button>
          <button onclick="setPrompt('Create a 2 of 3 multisig wallet')" class="bg-white/10 px-3 py-1 rounded-full text-sm hover:bg-white/20">MultiSig</button>
          <button onclick="setPrompt('Build a staking pool contract')" class="bg-white/10 px-3 py-1 rounded-full text-sm hover:bg-white/20">Staking</button>
        </div>
      </div>

      <!-- Output Section -->
      <div id="output" class="hidden">
        <div class="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">Generated Contract</h2>
            <div class="flex gap-2">
              <button onclick="copyCode()" class="bg-white/10 px-4 py-2 rounded-lg text-sm hover:bg-white/20">📋 Copy</button>
              <button onclick="deployContract()" class="mantle-bg text-black px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90">🚀 Deploy to Mantle</button>
            </div>
          </div>
          <pre id="contract-code" class="bg-black/50 rounded-xl p-4 overflow-x-auto text-sm text-green-400"></pre>
        </div>

        <!-- Contract Info -->
        <div id="contract-info" class="bg-white/5 rounded-xl p-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-400">Type:</span>
              <span id="contract-type" class="ml-2 mantle-accent font-medium"></span>
            </div>
            <div>
              <span class="text-gray-400">Network:</span>
              <span class="ml-2">Mantle Sepolia (Testnet)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div id="loading" class="hidden text-center py-12">
        <div class="animate-spin w-12 h-12 border-4 border-[#00d4aa] border-t-transparent rounded-full mx-auto"></div>
        <p class="mt-4 text-gray-300">Generating your contract...</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="text-center mt-12 text-gray-500 text-sm">
      <p>Built for Mantle Global Hackathon 2025 | Powered by AI</p>
      <p class="mt-2">
        <a href="https://mantle.xyz" target="_blank" class="hover:text-[#00d4aa]">Mantle Network</a> •
        <a href="https://faucet.sepolia.mantle.xyz" target="_blank" class="hover:text-[#00d4aa]">Get Testnet MNT</a>
      </p>
    </div>
  </div>

  <script src="/app.js"></script>
</body>
</html>
  `);
});

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🔮 MantleForge - AI Smart Contract Builder             ║
║                                                          ║
║   Server running at: http://localhost:${PORT}              ║
║                                                          ║
║   Built for Mantle Global Hackathon 2025                 ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});
