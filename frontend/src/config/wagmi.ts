import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { defineChain } from "viem";

export const hederaTestnet = defineChain({
  id: 296,
  name: "Hedera Testnet",
  nativeCurrency: { name: "HBAR", symbol: "HBAR", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet.hashio.io/api"] },
  },
  blockExplorers: {
    default: { name: "HashScan", url: "https://hashscan.io/testnet" },
  },
  testnet: true,
});

export const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "";

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [hederaTestnet];

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

export const appMetadata = {
  name: "Quark Finance",
  description: "Institutional DeFi Vaults on Hedera",
  url: "https://quark.finance",
  icons: ["/logo/quark_logo_white.svg"],
};
