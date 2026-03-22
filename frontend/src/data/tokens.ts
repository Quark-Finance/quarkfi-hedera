import type { Token } from "./types";

export const TOKENS: Record<string, Token> = {
  HBAR: {
    symbol: "HBAR",
    name: "Hedera",
    chain: "hedera",
    price: 0.28,
    iconColor: "#8259ef",
  },
  HBARX: {
    symbol: "HBARX",
    name: "Staked HBAR",
    chain: "hedera",
    price: 0.31,
    iconColor: "#a07cf5",
  },
  USDC_HEDERA: {
    symbol: "USDC",
    name: "USD Coin (Hedera)",
    chain: "hedera",
    price: 1.0,
    iconColor: "#2775ca",
  },
  SAUCE: {
    symbol: "SAUCE",
    name: "SaucerSwap",
    chain: "hedera",
    price: 0.042,
    iconColor: "#ff6b35",
  },
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    chain: "ethereum",
    price: 3420.0,
    iconColor: "#627eea",
  },
  WBTC: {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    chain: "ethereum",
    price: 97500.0,
    iconColor: "#f7931a",
  },
  USDC_ETH: {
    symbol: "USDC",
    name: "USD Coin (Ethereum)",
    chain: "ethereum",
    price: 1.0,
    iconColor: "#2775ca",
  },
  ARB: {
    symbol: "ARB",
    name: "Arbitrum",
    chain: "arbitrum",
    price: 1.12,
    iconColor: "#28a0f0",
  },
  USDC_BASE: {
    symbol: "USDC",
    name: "USD Coin (Base)",
    chain: "base",
    price: 1.0,
    iconColor: "#2775ca",
  },
};
