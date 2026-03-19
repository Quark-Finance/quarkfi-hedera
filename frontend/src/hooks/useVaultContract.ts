import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import { hederaTestnet } from "@/config/wagmi";

// Placeholder ABI — replace with real vault contract ABI once deployed
const VAULT_ABI = [
  {
    name: "deposit",
    type: "function",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

// Replace with actual deployed vault contract address
const VAULT_ADDRESS = "0x" as `0x${string}`;

export function useVaultContract() {
  const { data: txHash, isPending, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const vaultBalance = useReadContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: "balanceOf",
    args: ["0x" as `0x${string}`],
    chainId: hederaTestnet.id,
  });

  function deposit(amountInHbar: string) {
    writeContract({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: "deposit",
      value: parseEther(amountInHbar),
      chainId: hederaTestnet.id,
    });
  }

  function withdraw(amountInWei: bigint) {
    writeContract({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: "withdraw",
      args: [amountInWei],
      chainId: hederaTestnet.id,
    });
  }

  return {
    deposit,
    withdraw,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    vaultBalance,
  };
}
