import type { Vault } from "./types";
import { TOKENS } from "./tokens";
import deployments from "./deployments.json";

export const VAULTS: Vault[] = [
  {
    id: "hedera-high-yield-rwa",
    name: "Quark Hedera High Yield RWA",
    addresses: deployments.vaults["hedera-high-yield-rwa"].addresses,
    tokens: [
      { token: TOKENS.USDC_HEDERA, allocation: 50, quantity: 1_250_000 },
      { token: TOKENS.HBAR, allocation: 30, quantity: 2_678_571 },
      { token: TOKENS.HBARX, allocation: 20, quantity: 1_612_903 },
    ],
    depositToken: TOKENS.USDC_HEDERA,
    strategy: {
      name: "Hedera RWA Yield",
      description:
        "Allocates to tokenized real-world assets on Hedera including treasury bills, commercial paper, and institutional lending pools. Combines RWA yield with HBAR staking rewards for enhanced returns while maintaining low volatility and institutional-grade risk management.",
      riskLevel: "low",
      type: "hedera-native",
    },
    fees: {
      management: 0.5,
      performance: 10,
      deposit: 0,
      withdrawal: 0.1,
    },
    apy: 9.4,
    tvl: 2_500_000,
    totalDepositors: 34,
    sharePrice: 1.12,
    inception: "2025-11-01",
  },
  {
    id: "hedera-btc",
    name: "Quark Hedera BTC Vault",
    addresses: deployments.vaults["hedera-btc"].addresses,
    tokens: [
      { token: TOKENS.WBTC, allocation: 60, quantity: 18.5 },
      { token: TOKENS.HBAR, allocation: 25, quantity: 1_607_143 },
      { token: TOKENS.USDC_HEDERA, allocation: 15, quantity: 270_750 },
    ],
    depositToken: TOKENS.USDC_HEDERA,
    strategy: {
      name: "BTC Accumulation",
      description:
        "Bitcoin-focused vault that accumulates BTC exposure through wrapped BTC positions on Hedera, supplemented by HBAR yield and USDC reserves. Designed for investors seeking BTC upside with yield generation from Hedera-native protocols.",
      riskLevel: "high",
      type: "hedera-native",
    },
    fees: {
      management: 1.0,
      performance: 15,
      deposit: 0,
      withdrawal: 0.15,
    },
    apy: 14.2,
    tvl: 1_805_000,
    totalDepositors: 21,
    sharePrice: 1.34,
    inception: "2025-12-15",
  },
  {
    id: "crosschain-high-yield-defi",
    name: "Quark Crosschain High Yield DeFi",
    addresses: deployments.vaults["crosschain-high-yield-defi"].addresses,
    tokens: [
      { token: TOKENS.HBAR, allocation: 25, quantity: 4_464_286 },
      { token: TOKENS.ETH, allocation: 25, quantity: 365 },
      { token: TOKENS.USDC_HEDERA, allocation: 20, quantity: 1_250_000 },
      { token: TOKENS.USDC_ETH, allocation: 15, quantity: 937_500 },
      { token: TOKENS.USDC_BASE, allocation: 15, quantity: 937_500 },
    ],
    depositToken: TOKENS.USDC_HEDERA,
    strategy: {
      name: "Crosschain DeFi Alpha",
      description:
        "Pursues maximum DeFi yields across Hedera, Ethereum, and Base through concentrated liquidity positions, yield farming, and delta-neutral strategies. Actively managed with automated rebalancing via LayerZero OFT bridges for cross-chain capital efficiency.",
      riskLevel: "high",
      type: "multi-chain",
    },
    fees: {
      management: 1.0,
      performance: 15,
      deposit: 0,
      withdrawal: 0.15,
    },
    apy: 18.6,
    tvl: 6_250_000,
    totalDepositors: 89,
    sharePrice: 1.52,
    inception: "2025-10-01",
  },
  {
    id: "crosschain-high-yield-rwa",
    name: "Quark Crosschain High Yield RWA",
    addresses: deployments.vaults["crosschain-high-yield-rwa"].addresses,
    tokens: [
      { token: TOKENS.USDC_HEDERA, allocation: 30, quantity: 1_500_000 },
      { token: TOKENS.USDC_ETH, allocation: 25, quantity: 1_250_000 },
      { token: TOKENS.USDC_BASE, allocation: 20, quantity: 1_000_000 },
      { token: TOKENS.HBAR, allocation: 15, quantity: 2_678_571 },
      { token: TOKENS.ETH, allocation: 10, quantity: 146 },
    ],
    depositToken: TOKENS.USDC_HEDERA,
    strategy: {
      name: "Crosschain RWA Yield",
      description:
        "Combines tokenized real-world assets across multiple chains with stablecoin yield optimization. Sources RWA yields from Hedera, Ethereum, and Base while maintaining cross-chain diversification through LayerZero OFT infrastructure for institutional-grade risk-adjusted returns.",
      riskLevel: "medium",
      type: "multi-chain",
    },
    fees: {
      management: 0.75,
      performance: 12,
      deposit: 0,
      withdrawal: 0.1,
    },
    apy: 12.8,
    tvl: 5_000_000,
    totalDepositors: 67,
    sharePrice: 1.24,
    inception: "2025-10-15",
  },
];
