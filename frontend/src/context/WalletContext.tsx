import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, type Config } from "wagmi";
import { createAppKit } from "@reown/appkit/react";
import {
  wagmiAdapter,
  projectId,
  networks,
  appMetadata,
} from "@/config/wagmi";

const queryClient = new QueryClient();

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata: appMetadata,
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#00FF88",
    "--w3m-border-radius-master": "0px",
    "--w3m-font-family": "'JetBrains Mono Variable', monospace",
  },
});

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
