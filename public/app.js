/**
 * MantleForge - Frontend Web3 Integration
 * Handles wallet connection and contract deployment to Mantle
 */

// Mantle Network Configuration
const MANTLE_SEPOLIA = {
  chainId: '0x138B', // 5003 in hex
  chainName: 'Mantle Sepolia Testnet',
  nativeCurrency: {
    name: 'MNT',
    symbol: 'MNT',
    decimals: 18
  },
  rpcUrls: ['https://rpc.sepolia.mantle.xyz'],
  blockExplorerUrls: ['https://explorer.sepolia.mantle.xyz']
};

const MANTLE_MAINNET = {
  chainId: '0x1388', // 5000 in hex
  chainName: 'Mantle',
  nativeCurrency: {
    name: 'MNT',
    symbol: 'MNT',
    decimals: 18
  },
  rpcUrls: ['https://rpc.mantle.xyz'],
  blockExplorerUrls: ['https://explorer.mantle.xyz']
};

let currentCode = '';
let walletAddress = null;

// Check if wallet is connected
async function checkWallet() {
  if (typeof window.ethereum !== 'undefined') {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) {
      walletAddress = accounts[0];
      updateWalletUI();
    }
  }
}

// Connect wallet
async function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    alert('Please install MetaMask or another Web3 wallet!');
    window.open('https://metamask.io/download/', '_blank');
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    walletAddress = accounts[0];
    updateWalletUI();

    // Switch to Mantle Sepolia
    await switchToMantle();
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    alert('Failed to connect wallet: ' + error.message);
  }
}

// Switch to Mantle network
async function switchToMantle(mainnet = false) {
  const network = mainnet ? MANTLE_MAINNET : MANTLE_SEPOLIA;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.chainId }]
    });
  } catch (switchError) {
    // Chain not added, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [network]
        });
      } catch (addError) {
        console.error('Failed to add Mantle network:', addError);
      }
    }
  }
}

// Update wallet UI
function updateWalletUI() {
  const btn = document.getElementById('wallet-btn');
  if (walletAddress) {
    const short = walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4);
    btn.textContent = '🟢 ' + short;
    btn.classList.remove('mantle-bg');
    btn.classList.add('bg-green-600');
  } else {
    btn.textContent = '🔗 Connect Wallet';
    btn.classList.add('mantle-bg');
    btn.classList.remove('bg-green-600');
  }
}

// Set prompt from example
function setPrompt(text) {
  document.getElementById('prompt').value = text;
}

// Generate contract
async function generateContract() {
  const prompt = document.getElementById('prompt').value;
  if (!prompt) {
    alert('Please enter a description');
    return;
  }

  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('output').classList.add('hidden');

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();

    document.getElementById('loading').classList.add('hidden');

    if (data.success) {
      currentCode = data.code;
      document.getElementById('contract-code').textContent = data.code;
      document.getElementById('contract-type').textContent = data.type.toUpperCase();
      document.getElementById('output').classList.remove('hidden');

      // Show params
      const paramsDiv = document.getElementById('contract-params');
      paramsDiv.innerHTML = Object.entries(data.params)
        .map(([k, v]) => `<span class="bg-white/10 px-2 py-1 rounded">${k}: ${v}</span>`)
        .join(' ');
    } else {
      alert(data.error || 'Failed to generate contract');
    }
  } catch (err) {
    document.getElementById('loading').classList.add('hidden');
    alert('Error: ' + err.message);
  }
}

// Copy contract code
function copyCode() {
  navigator.clipboard.writeText(currentCode);

  const btn = event.target;
  const original = btn.textContent;
  btn.textContent = '✅ Copied!';
  setTimeout(() => btn.textContent = original, 2000);
}

// Deploy contract (placeholder - would need actual compilation)
async function deployContract() {
  if (!walletAddress) {
    await connectWallet();
    if (!walletAddress) return;
  }

  // Check balance
  const balance = await window.ethereum.request({
    method: 'eth_getBalance',
    params: [walletAddress, 'latest']
  });

  const balanceMNT = parseInt(balance, 16) / 1e18;

  if (balanceMNT < 0.01) {
    const goToFaucet = confirm(
      `Your balance is ${balanceMNT.toFixed(4)} MNT.\n\n` +
      `You need testnet MNT to deploy. Go to faucet?`
    );
    if (goToFaucet) {
      window.open('https://faucet.sepolia.mantle.xyz', '_blank');
    }
    return;
  }

  alert(
    '🚀 Contract Ready for Deployment!\n\n' +
    'To deploy:\n' +
    '1. Copy the contract code\n' +
    '2. Go to Remix IDE (remix.ethereum.org)\n' +
    '3. Paste and compile\n' +
    '4. Deploy to Mantle Sepolia\n\n' +
    'Full on-chain deployment coming soon!'
  );
}

// Open in Remix
function openInRemix() {
  // Encode contract for Remix
  const encoded = encodeURIComponent(currentCode);
  const remixUrl = `https://remix.ethereum.org/?code=${encoded}`;
  window.open(remixUrl, '_blank');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkWallet();

  // Listen for account changes
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      walletAddress = accounts[0] || null;
      updateWalletUI();
    });
  }
});
