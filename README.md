# Quark Finance

> Institutional DeFi vaults on Hedera — built for the Hedera Hackathon.

Quark brings institutional-grade yield strategies to the Hedera ecosystem. Users deposit into curated vaults that allocate capital across Hedera-native protocols and crosschain DeFi opportunities, with real-time AI-powered portfolio assistance built directly into the platform.

---

## Architecture

```
quarkfi-hedera/
├── frontend/     # Vite + React + Tailwind — vault UI
├── server/       # Bun + Hono — Hedera AI Agent API
└── contracts/    # Foundry — ERC-4626 vaults + LayerZero OFT
```

---

## Frontend

### Key Features

- **Vault Discovery** — browse and filter vaults by APY, TVL, risk level, and strategy type
- **Vault Detail** — strategy breakdown, fee structure, token allocation, contract addresses with HashScan links
- **Deposit & Withdraw** — connect wallet, deposit USDC into vaults, withdraw shares; live on-chain balance reads via wagmi
- **Portfolio View** — positions, P&L, transaction history across all vaults
- **Dev Tools** — testnet faucet links, HTS token association, one-click USDC mint on all supported testnets
- **Quark AI** — in-app chat interface connected to the Hedera AI Agent (see below)

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Wallet | Reown AppKit + wagmi + viem |
| Chain | Hedera Testnet (EVM, chain ID 296) + Ethereum/Base/Arbitrum Sepolia |
| Routing | React Router v7 |

### Running the Frontend

```bash
cd frontend
cp .env.example .env          # add your WalletConnect project ID
bun install
bun run dev                   # http://localhost:5173
```

---

## AI Agent Server

The Quark AI Agent exposes an autonomous Hedera blockchain agent over a simple HTTP API, enabling natural-language interaction with the Hedera network directly from within the Quark UI.

### How It Works

**1. hedera-agent-kit**

The agent uses [`hedera-agent-kit`](https://github.com/hashgraph/hedera-agent-kit) — Hedera's official AI toolkit — to gain native access to the full Hedera service surface. Under the hood, the kit wraps every supported Hedera operation as a LangChain-compatible tool, organized into plugins:

- **Account Plugin** — query balances, token holdings, account info
- **Token Plugin** — create fungible/non-fungible tokens, transfer HTS tokens, associate/dissociate
- **Transfer Plugin** — HBAR and multi-token transfers
- **Contract Plugin** — deploy and call EVM smart contracts
- **Consensus Plugin** — create topics, submit and read HCS messages
- **Query Plugin** — exchange rates, transaction records, network info

All 10 core plugins are loaded, giving the agent access to the complete set of Hedera capabilities in a single session.

**2. LangChain + LangGraph ReAct Agent**

The toolkit feeds its tools into a [ReAct](https://arxiv.org/abs/2210.03629) agent (Reasoning + Acting) built with LangGraph. The agent autonomously decides which tools to call, in what order, and how to interpret their outputs — without any hardcoded decision trees. Every response may involve multiple tool calls chained together.

Conversation memory is persisted via LangGraph's `MemorySaver`, giving the agent full thread-aware context across a session. Each browser session gets its own thread ID, so multiple users can run independent conversations simultaneously.


**3. Wallet-Aware Context**

When a user has connected their wallet in the frontend, the wallet address is injected into every agent message as a context prefix. This means queries like "what is my balance?" resolve to the user's own account — not the server operator — without any additional configuration.

**4. Tool Call Transparency**

Every response includes a structured list of all tool calls made during reasoning. The `ResponseParserService` from hedera-agent-kit parses raw tool outputs into human-readable summaries that the frontend renders inline as collapsible badges — users can see exactly what the agent did on-chain.

### API

```
GET  /health          → { status: "ok" }
GET  /agent/status    → { status, tools, toolNames }
POST /agent/chat      → { message, threadId, walletAddress? }
                      ← { content, toolCalls[] }
```

### Running the Server

```bash
cd server
cp .env.example .env  # fill in credentials
bun install
bun run dev           # http://localhost:3001
```

---

## Contracts

Smart contracts are written in Solidity and compiled with Foundry. All deployments are on testnet.

### Contract Types

| Contract | Description |
|----------|-------------|
| `Vault.sol` | ERC-4626 single-chain vault — accepts USDC deposits, mints shares, tracks price per share |
| `CrosschainVault.sol` | LayerZero-enabled vault — receives crosschain USDC deposits from Sepolia networks |
| `CrosschainToken.sol` | LayerZero OFT — bridgeable USDC token deployed on each Sepolia network |
| `Token.sol` | Standard ERC-20 — testnet USDC on Hedera, mintable for testing |

---

### USDC Token

Quark-deployed testnet USDC. Used as the deposit token for all vaults. `Token.sol` on Hedera, `CrosschainToken.sol` (OFT) on EVM testnets.

| Network | Address | Explorer |
|---------|---------|---------|
| Hedera Testnet | `0x0944830916CECb637613c9Fd0e8F6C21ccFFB4eF` | [HashScan](https://hashscan.io/testnet/address/0x0944830916CECb637613c9Fd0e8F6C21ccFFB4eF) |
| Ethereum Sepolia | `0xC79d193E7cfB108cFd7f8F781F0A95F56EfdcB68` | [Etherscan](https://sepolia.etherscan.io/address/0xC79d193E7cfB108cFd7f8F781F0A95F56EfdcB68) |
| Arbitrum Sepolia | `0x30EA5467D7A1d6cFCc8677Ac7a4882d96DA7320D` | [Arbiscan](https://sepolia.arbiscan.io/address/0x30EA5467D7A1d6cFCc8677Ac7a4882d96DA7320D) |
| Base Sepolia | `0x50972CE2410bC1f9533d3b6d8e710917ce55769e` | [Basescan](https://sepolia.basescan.org/address/0x50972CE2410bC1f9533d3b6d8e710917ce55769e) |

---

### Vaults

#### Quark Hedera High Yield RWA
> Allocates to tokenized real-world assets on Hedera including treasury bills, commercial paper, and institutional lending pools. `Vault.sol`.

| Network | Address | Explorer |
|---------|---------|---------|
| Hedera Testnet | `0x62169eFC8F35DC91af254fe5B7e70cbe365913CD` | [HashScan](https://hashscan.io/testnet/address/0x62169eFC8F35DC91af254fe5B7e70cbe365913CD) |

---

#### Quark Hedera BTC Vault
> Bitcoin-focused vault accumulating BTC exposure through wrapped BTC positions on Hedera, supplemented by HBAR yield. `Vault.sol`.

| Network | Address | Explorer |
|---------|---------|---------|
| Hedera Testnet | `0xf60D71401f9e660236903aC0BaE6C43337d47871` | [HashScan](https://hashscan.io/testnet/address/0xf60D71401f9e660236903aC0BaE6C43337d47871) |

---

#### Quark Crosschain High Yield DeFi
> Pursues maximum DeFi yields across Hedera, Ethereum, and Base through concentrated liquidity and delta-neutral strategies. `CrosschainVault.sol` + LayerZero OFT bridging.

| Network | Address | Explorer |
|---------|---------|---------|
| Hedera Testnet | `0x8d325AD0Ca1fAdA242319B46D20c82d4EC891a85` | [HashScan](https://hashscan.io/testnet/address/0x8d325AD0Ca1fAdA242319B46D20c82d4EC891a85) |
| Ethereum Sepolia | `0x318919548Dd25b606A56A8F9684776c212462C53` | [Etherscan](https://sepolia.etherscan.io/address/0x318919548Dd25b606A56A8F9684776c212462C53) |
| Base Sepolia | `0x701a23D3DEC9f560681D86F9407C24879C429a06` | [Basescan](https://sepolia.basescan.org/address/0x701a23D3DEC9f560681D86F9407C24879C429a06) |

---

#### Quark Crosschain High Yield RWA
> Combines tokenized real-world assets across multiple chains with stablecoin yield optimization. `CrosschainVault.sol` + LayerZero OFT bridging.

| Network | Address | Explorer |
|---------|---------|---------|
| Hedera Testnet | `0xba8e52853e786dba35067937F142f73edEEb2ae6` | [HashScan](https://hashscan.io/testnet/address/0xba8e52853e786dba35067937F142f73edEEb2ae6) |
| Ethereum Sepolia | `0x791b6A0225B10285bb1C21356aa907F401EEE485` | [Etherscan](https://sepolia.etherscan.io/address/0x791b6A0225B10285bb1C21356aa907F401EEE485) |
| Base Sepolia | `0x2D5AC2C334d5ff0d395E60f207b4e0e888A98C44` | [Basescan](https://sepolia.basescan.org/address/0x2D5AC2C334d5ff0d395E60f207b4e0e888A98C44) |

