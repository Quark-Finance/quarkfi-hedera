import { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { formatAddress } from "@/lib/format";
import { hederaTestnet } from "@/config/wagmi";
import {
  Wallet,
  ExternalLink,
  Copy,
  Check,
  Coins,
  Link2,
  FlaskConical,
  RefreshCw,
} from "lucide-react";

const USDC_TOKEN_ADDRESS = "0x0000000000000000000000000000000000068cda" as const;
const USDC_DECIMALS = 6;

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

// HTS precompile at 0x167 for token association
const HTS_PRECOMPILE = "0x0000000000000000000000000000000000000167" as const;
const HTS_ABI = [
  {
    name: "associateToken",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "account", type: "address" },
      { name: "token", type: "address" },
    ],
    outputs: [{ name: "responseCode", type: "int64" }],
  },
] as const;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="text-muted-foreground hover:text-primary transition-colors">
      {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

function StatRow({ label, value, extra }: { label: string; value: string; extra?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-b-0">
      <span className="text-[11px] text-muted-foreground tracking-[0.5px] uppercase">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-medium text-foreground font-mono">{value}</span>
        {extra}
      </div>
    </div>
  );
}

export function DevTools() {
  const { isConnected, address, balance, connect } = useWallet();
  const { address: wagmiAddress } = useAccount();

  const { data: usdcRaw, refetch: refetchUsdc } = useReadContract({
    address: USDC_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [wagmiAddress ?? "0x"],
    chainId: hederaTestnet.id,
    query: { enabled: !!wagmiAddress },
  });

  const usdcBalance = usdcRaw !== undefined ? Number(usdcRaw) / 10 ** USDC_DECIMALS : null;

  const {
    data: associateTxHash,
    isPending: isAssociating,
    writeContract: associate,
    error: associateError,
  } = useWriteContract();

  const { isLoading: isAssociateConfirming, isSuccess: isAssociateSuccess } =
    useWaitForTransactionReceipt({ hash: associateTxHash });

  const handleAssociate = () => {
    if (!wagmiAddress) return;
    associate({
      address: HTS_PRECOMPILE,
      abi: HTS_ABI,
      functionName: "associateToken",
      args: [wagmiAddress, USDC_TOKEN_ADDRESS],
      chainId: hederaTestnet.id,
    });
  };

  // If balanceOf succeeds (even returning 0), the token is associated.
  // If it errors (unassociated tokens revert on Hedera), show the associate button.
  // False positive "not associated" on network error is harmless — the associate tx
  // will return TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT, which we handle in the UI.
  const isAssociated = usdcRaw !== undefined;

  if (!isConnected) {
    return (
      <div className="flex flex-col h-screen">
        <div className="border-b border-border px-8 py-4 shrink-0">
          <p className="text-[11px] font-bold tracking-[0.5px] text-primary uppercase mb-1">
            // DEV TOOLS
          </p>
          <h1 className="text-[18px] font-semibold font-display text-foreground">
            Testnet Faucets
          </h1>
        </div>
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-sm">
            <div className="border border-border bg-card p-8 text-center">
              <div className="w-12 h-12 flex items-center justify-center border border-border bg-secondary mx-auto mb-5">
                <Wallet className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-[11px] font-bold tracking-[0.5px] text-primary uppercase mb-3">
                // WALLET REQUIRED
              </p>
              <h2 className="text-[22px] font-bold font-display tracking-[-1px] text-foreground mb-2">
                Connect to use Dev Tools
              </h2>
              <p className="text-[13px] text-muted-foreground mb-6 tracking-[0.3px]">
                Connect your wallet to view balances and request testnet tokens.
              </p>
              <Button
                onClick={connect}
                className="w-full text-[11px] font-bold tracking-[0.5px] uppercase"
              >
                CONNECT WALLET
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-border px-8 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-[0.5px] text-primary uppercase mb-1">
              // DEV TOOLS
            </p>
            <h1 className="text-[18px] font-semibold font-display text-foreground">
              Testnet Faucets
            </h1>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 border border-warning/40 bg-warning/10 text-[9px] font-bold tracking-[0.5px] uppercase text-warning">
            <FlaskConical className="h-3 w-3" />
            TESTNET ONLY
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 max-w-2xl">
        {/* Wallet Info */}
        <div className="border border-border bg-card">
          <div className="px-5 py-3 border-b border-border">
            <p className="text-[9px] font-bold tracking-[0.5px] text-muted-foreground uppercase">
              // CONNECTED WALLET
            </p>
          </div>
          <div className="px-5 py-1">
            <StatRow
              label="Address"
              value={formatAddress(address!)}
              extra={<CopyButton text={address!} />}
            />
            <StatRow label="HBAR Balance" value={`${balance.toFixed(4)} HBAR`} />
            <StatRow
              label="USDC Balance"
              value={usdcBalance !== null ? `${usdcBalance.toFixed(2)} USDC` : "—"}
              extra={
                <button onClick={() => refetchUsdc()} className="text-muted-foreground hover:text-primary transition-colors">
                  <RefreshCw className="h-3 w-3" />
                </button>
              }
            />
            <StatRow
              label="USDC Token"
              value={isAssociated ? "ASSOCIATED" : "NOT ASSOCIATED"}
              extra={
                isAssociated ? (
                  <Check className="h-3 w-3 text-primary" />
                ) : undefined
              }
            />
          </div>
        </div>

        {/* Token Association */}
        {!isAssociated && (
          <div className="border border-warning/40 bg-warning/5">
            <div className="px-5 py-3 border-b border-warning/40">
              <p className="text-[9px] font-bold tracking-[0.5px] text-warning uppercase">
                // TOKEN ASSOCIATION REQUIRED
              </p>
            </div>
            <div className="px-5 py-4 space-y-3">
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                On Hedera, your account must be associated with a token before it can receive it.
                Associate with USDC before requesting from the faucet.
              </p>
              <Button
                onClick={handleAssociate}
                disabled={isAssociating || isAssociateConfirming}
                variant="outline"
                className="gap-2 text-[11px] font-bold tracking-[0.5px] uppercase"
              >
                <Link2 className="h-3.5 w-3.5" />
                {isAssociating
                  ? "CONFIRM IN WALLET..."
                  : isAssociateConfirming
                    ? "CONFIRMING..."
                    : isAssociateSuccess
                      ? "ASSOCIATED"
                      : "ASSOCIATE USDC TOKEN"}
              </Button>
              {associateError && (
                <p className="text-[11px] text-negative tracking-[0.3px]">
                  {associateError.message.includes("TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT")
                    ? "Token is already associated. Refresh to update."
                    : `Error: ${associateError.message.slice(0, 120)}`}
                </p>
              )}
            </div>
          </div>
        )}

        {/* HBAR Faucet */}
        <div className="border border-border bg-card">
          <div className="px-5 py-3 border-b border-border">
            <p className="text-[9px] font-bold tracking-[0.5px] text-muted-foreground uppercase">
              // HBAR FAUCET
            </p>
          </div>
          <div className="px-5 py-4 space-y-3">
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Request testnet HBAR from the Hedera Portal. You'll receive 100 HBAR per request (once every 24 hours).
              HBAR is needed for gas fees on all transactions.
            </p>
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary border border-border">
              <span className="text-[11px] text-muted-foreground font-mono flex-1 truncate">
                {address}
              </span>
              <CopyButton text={address!} />
            </div>
            <a
              href="https://portal.hedera.com/faucet"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-secondary text-[11px] font-bold tracking-[0.5px] uppercase text-foreground hover:bg-accent transition-colors"
            >
              <Coins className="h-3.5 w-3.5" />
              OPEN HBAR FAUCET
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </a>
          </div>
        </div>

        {/* USDC Faucet */}
        <div className="border border-border bg-card">
          <div className="px-5 py-3 border-b border-border">
            <p className="text-[9px] font-bold tracking-[0.5px] text-muted-foreground uppercase">
              // USDC FAUCET
            </p>
          </div>
          <div className="px-5 py-4 space-y-3">
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Request testnet USDC from Circle's official faucet. You'll receive 20 USDC per request (once every 2 hours).
              Make sure your token is associated first.
            </p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-3 py-2 bg-secondary border border-border">
                <span className="text-[11px] text-muted-foreground font-mono flex-1 truncate">
                  {address}
                </span>
                <CopyButton text={address!} />
              </div>
              <p className="text-[9px] text-muted-foreground tracking-[0.3px]">
                Paste this address into the Circle faucet. Select "Hedera" as the network.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 bg-muted-foreground" />
                Token ID: 0.0.429274
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 bg-muted-foreground" />
                Decimals: 6
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 bg-muted-foreground" />
                EVM: {USDC_TOKEN_ADDRESS.slice(0, 10)}...
              </span>
            </div>
            <a
              href="https://faucet.circle.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-[11px] font-bold tracking-[0.5px] uppercase hover:bg-primary/90 transition-colors"
            >
              <Coins className="h-3.5 w-3.5" />
              OPEN USDC FAUCET
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Contract Reference */}
        <div className="border border-border bg-card">
          <div className="px-5 py-3 border-b border-border">
            <p className="text-[9px] font-bold tracking-[0.5px] text-muted-foreground uppercase">
              // REFERENCE
            </p>
          </div>
          <div className="px-5 py-1">
            <StatRow
              label="USDC Token ID"
              value="0.0.429274"
              extra={<CopyButton text="0.0.429274" />}
            />
            <StatRow
              label="USDC EVM Address"
              value={`${USDC_TOKEN_ADDRESS.slice(0, 10)}...${USDC_TOKEN_ADDRESS.slice(-4)}`}
              extra={<CopyButton text={USDC_TOKEN_ADDRESS} />}
            />
            <StatRow label="Chain ID" value="296" />
            <StatRow label="Network" value="Hedera Testnet" />
          </div>
        </div>
      </div>
    </div>
  );
}
