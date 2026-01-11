/**
 * MantleForge - AI Smart Contract Generator
 * Generates Solidity contracts from natural language descriptions
 */

import { ethers } from 'ethers';

// Mantle Network Configuration
const MANTLE_NETWORKS = {
  mainnet: {
    chainId: 5000,
    rpc: 'https://rpc.mantle.xyz',
    explorer: 'https://explorer.mantle.xyz'
  },
  sepolia: {
    chainId: 5003,
    rpc: 'https://rpc.sepolia.mantle.xyz',
    explorer: 'https://explorer.sepolia.mantle.xyz'
  }
};

// Contract templates for common patterns
const CONTRACT_TEMPLATES = {
  erc20: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract {{NAME}} is ERC20 {
    constructor() ERC20("{{TOKEN_NAME}}", "{{SYMBOL}}") {
        _mint(msg.sender, {{SUPPLY}} * 10 ** decimals());
    }
}`,

  erc721: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract {{NAME}} is ERC721, Ownable {
    uint256 private _tokenIds;
    uint256 public maxSupply = {{MAX_SUPPLY}};
    uint256 public mintPrice = {{MINT_PRICE}} ether;

    constructor() ERC721("{{TOKEN_NAME}}", "{{SYMBOL}}") Ownable(msg.sender) {}

    function mint() public payable {
        require(_tokenIds < maxSupply, "Max supply reached");
        require(msg.value >= mintPrice, "Insufficient payment");
        _tokenIds++;
        _safeMint(msg.sender, _tokenIds);
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}`,

  timelock: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract {{NAME}} {
    address public beneficiary;
    uint256 public releaseTime;

    constructor(address _beneficiary, uint256 _lockDays) payable {
        beneficiary = _beneficiary;
        releaseTime = block.timestamp + (_lockDays * 1 days);
    }

    function release() public {
        require(block.timestamp >= releaseTime, "Too early");
        require(address(this).balance > 0, "No funds");
        payable(beneficiary).transfer(address(this).balance);
    }

    function timeRemaining() public view returns (uint256) {
        if (block.timestamp >= releaseTime) return 0;
        return releaseTime - block.timestamp;
    }
}`,

  voting: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract {{NAME}} {
    struct Proposal {
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 deadline;
        bool executed;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    uint256 public proposalCount;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function createProposal(string memory description, uint256 durationDays) public {
        proposalCount++;
        proposals[proposalCount] = Proposal({
            description: description,
            forVotes: 0,
            againstVotes: 0,
            deadline: block.timestamp + (durationDays * 1 days),
            executed: false
        });
    }

    function vote(uint256 proposalId, bool support) public {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp < proposal.deadline, "Voting ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        hasVoted[proposalId][msg.sender] = true;
        if (support) {
            proposal.forVotes++;
        } else {
            proposal.againstVotes++;
        }
    }

    function getResult(uint256 proposalId) public view returns (string memory) {
        Proposal storage proposal = proposals[proposalId];
        if (proposal.forVotes > proposal.againstVotes) return "Passed";
        if (proposal.againstVotes > proposal.forVotes) return "Rejected";
        return "Tie";
    }
}`,

  multisig: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract {{NAME}} {
    address[] public owners;
    uint256 public required;

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
    }

    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmations;
    uint256 public transactionCount;

    modifier onlyOwner() {
        bool isOwner = false;
        for (uint i = 0; i < owners.length; i++) {
            if (owners[i] == msg.sender) isOwner = true;
        }
        require(isOwner, "Not owner");
        _;
    }

    constructor(address[] memory _owners, uint256 _required) {
        require(_owners.length >= _required, "Invalid required");
        owners = _owners;
        required = _required;
    }

    receive() external payable {}

    function submitTransaction(address to, uint256 value, bytes memory data) public onlyOwner returns (uint256) {
        transactionCount++;
        transactions[transactionCount] = Transaction({
            to: to,
            value: value,
            data: data,
            executed: false,
            confirmations: 0
        });
        return transactionCount;
    }

    function confirmTransaction(uint256 txId) public onlyOwner {
        require(!confirmations[txId][msg.sender], "Already confirmed");
        confirmations[txId][msg.sender] = true;
        transactions[txId].confirmations++;

        if (transactions[txId].confirmations >= required) {
            executeTransaction(txId);
        }
    }

    function executeTransaction(uint256 txId) internal {
        Transaction storage txn = transactions[txId];
        require(!txn.executed, "Already executed");
        txn.executed = true;
        (bool success,) = txn.to.call{value: txn.value}(txn.data);
        require(success, "Tx failed");
    }
}`,

  staking: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract {{NAME}} {
    IERC20 public stakingToken;
    uint256 public rewardRate = {{REWARD_RATE}}; // rewards per second per token staked

    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public lastUpdateTime;
    mapping(address => uint256) public rewards;

    constructor(address _token) {
        stakingToken = IERC20(_token);
    }

    function stake(uint256 amount) external {
        updateReward(msg.sender);
        stakingToken.transferFrom(msg.sender, address(this), amount);
        stakedBalance[msg.sender] += amount;
    }

    function withdraw(uint256 amount) external {
        updateReward(msg.sender);
        stakedBalance[msg.sender] -= amount;
        stakingToken.transfer(msg.sender, amount);
    }

    function claimRewards() external {
        updateReward(msg.sender);
        uint256 reward = rewards[msg.sender];
        rewards[msg.sender] = 0;
        payable(msg.sender).transfer(reward);
    }

    function updateReward(address account) internal {
        if (stakedBalance[account] > 0) {
            uint256 timeElapsed = block.timestamp - lastUpdateTime[account];
            rewards[account] += stakedBalance[account] * rewardRate * timeElapsed / 1e18;
        }
        lastUpdateTime[account] = block.timestamp;
    }

    receive() external payable {}
}`
};

/**
 * Parse natural language to detect contract type and parameters
 */
function parsePrompt(prompt) {
  const lower = prompt.toLowerCase();

  // Detect contract type
  let type = 'custom';
  let params = {};

  if (lower.includes('erc20') || lower.includes('token') && lower.includes('supply')) {
    type = 'erc20';
    // Extract token name
    const nameMatch = prompt.match(/called?\s+["']?(\w+)["']?/i);
    params.name = nameMatch ? nameMatch[1] : 'MyToken';
    // Extract symbol
    const symbolMatch = prompt.match(/symbol\s+["']?(\w+)["']?/i);
    params.symbol = symbolMatch ? symbolMatch[1] : params.name.substring(0, 4).toUpperCase();
    // Extract supply
    const supplyMatch = prompt.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:million|m|thousand|k)?\s*(?:total\s+)?supply/i);
    if (supplyMatch) {
      let supply = parseFloat(supplyMatch[1].replace(/,/g, ''));
      if (lower.includes('million') || lower.includes(' m ')) supply *= 1000000;
      if (lower.includes('thousand') || lower.includes(' k ')) supply *= 1000;
      params.supply = supply;
    } else {
      params.supply = 1000000;
    }
  }
  else if (lower.includes('nft') || lower.includes('erc721') || lower.includes('collectible')) {
    type = 'erc721';
    const nameMatch = prompt.match(/called?\s+["']?(\w+)["']?/i);
    params.name = nameMatch ? nameMatch[1] : 'MyNFT';
    params.symbol = params.name.substring(0, 4).toUpperCase();
    const supplyMatch = prompt.match(/(\d+)\s*(?:max\s+)?supply/i);
    params.maxSupply = supplyMatch ? parseInt(supplyMatch[1]) : 10000;
    const priceMatch = prompt.match(/(\d+(?:\.\d+)?)\s*(?:eth|ether|mnt)/i);
    params.mintPrice = priceMatch ? parseFloat(priceMatch[1]) : 0.01;
  }
  else if (lower.includes('timelock') || lower.includes('lock') && lower.includes('release')) {
    type = 'timelock';
    params.name = 'TimeLock';
    const daysMatch = prompt.match(/(\d+)\s*days?/i);
    params.lockDays = daysMatch ? parseInt(daysMatch[1]) : 30;
  }
  else if (lower.includes('voting') || lower.includes('vote') || lower.includes('dao') || lower.includes('proposal')) {
    type = 'voting';
    params.name = 'VotingContract';
  }
  else if (lower.includes('multisig') || lower.includes('multi-sig') || lower.includes('multiple signatures')) {
    type = 'multisig';
    params.name = 'MultiSigWallet';
    const requiredMatch = prompt.match(/(\d+)\s*(?:of|out of)\s*(\d+)/i);
    params.required = requiredMatch ? parseInt(requiredMatch[1]) : 2;
  }
  else if (lower.includes('staking') || lower.includes('stake')) {
    type = 'staking';
    params.name = 'StakingPool';
    params.rewardRate = '1000000000000'; // 0.000001 per second
  }

  return { type, params };
}

/**
 * Generate Solidity contract from template
 */
function generateFromTemplate(type, params) {
  let template = CONTRACT_TEMPLATES[type];
  if (!template) return null;

  // Replace all placeholders
  let contract = template
    .replace(/\{\{NAME\}\}/g, params.name || 'Contract')
    .replace(/\{\{TOKEN_NAME\}\}/g, params.name || 'Token')
    .replace(/\{\{SYMBOL\}\}/g, params.symbol || 'TKN')
    .replace(/\{\{SUPPLY\}\}/g, params.supply || 1000000)
    .replace(/\{\{MAX_SUPPLY\}\}/g, params.maxSupply || 10000)
    .replace(/\{\{MINT_PRICE\}\}/g, params.mintPrice || 0.01)
    .replace(/\{\{LOCK_DAYS\}\}/g, params.lockDays || 30)
    .replace(/\{\{REWARD_RATE\}\}/g, params.rewardRate || '1000000000000');

  return contract;
}

/**
 * Main contract generation function
 */
export function generateContract(prompt) {
  console.log(`\n🔮 Generating contract for: "${prompt}"\n`);

  const { type, params } = parsePrompt(prompt);
  console.log(`📋 Detected type: ${type}`);
  console.log(`📋 Parameters:`, params);

  const contract = generateFromTemplate(type, params);

  if (contract) {
    console.log(`\n✅ Generated ${type.toUpperCase()} contract!\n`);
    return {
      success: true,
      type,
      params,
      code: contract
    };
  }

  return {
    success: false,
    error: 'Could not generate contract from prompt. Try being more specific.'
  };
}

/**
 * Deploy contract to Mantle network
 */
export async function deployContract(bytecode, abi, network = 'sepolia', privateKey) {
  const config = MANTLE_NETWORKS[network];
  const provider = new ethers.JsonRpcProvider(config.rpc);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log(`\n🚀 Deploying to Mantle ${network}...`);
  console.log(`📍 Deployer: ${wallet.address}`);

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`\n✅ Deployed at: ${address}`);
  console.log(`🔍 Explorer: ${config.explorer}/address/${address}`);

  return {
    address,
    explorer: `${config.explorer}/address/${address}`
  };
}

// CLI interface
if (process.argv[1].includes('contract-generator')) {
  const prompt = process.argv.slice(2).join(' ') || 'Create an ERC-20 token called MantleGold with 1 million supply';
  const result = generateContract(prompt);

  if (result.success) {
    console.log('━'.repeat(60));
    console.log(result.code);
    console.log('━'.repeat(60));
  } else {
    console.error('❌', result.error);
  }
}
