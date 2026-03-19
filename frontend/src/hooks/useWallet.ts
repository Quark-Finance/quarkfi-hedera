import { useAccount, useBalance, useDisconnect } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { hederaTestnet } from "@/config/wagmi";

export function useWallet() {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({
    address,
    chainId: hederaTestnet.id,
  });
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();

  const balance = balanceData
    ? Number(balanceData.value) / 10 ** balanceData.decimals
    : 0;

  return {
    isConnected,
    address: address ?? null,
    balance,
    connect: () => open(),
    disconnect: () => disconnect(),
  };
}
