import { useParams, Link } from "react-router";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { StatCard } from "@/components/StatCard";
import { TokenIcon } from "@/components/TokenIcon";
import { RiskIndicator } from "@/components/RiskIndicator";
import { FeeBreakdown } from "@/components/FeeBreakdown";
import { useReadContract, useWriteContract } from "wagmi";
import { erc20Abi, parseUnits, formatUnits } from "viem";
import { useVault } from "@/hooks/useVaults";
import { useWallet } from "@/hooks/useWallet";
import { hederaTestnet } from "@/config/wagmi";
import { MOCK_PORTFOLIO } from "@/data/user";
import { TOKENS } from "@/data/tokens";
import {
  formatUsd,
  formatApy,
  formatNumber,
  formatPercent,
  formatDate,
  formatUsdPrecise,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";
import { ArrowLeft, Loader2, SearchX, ExternalLink } from "lucide-react";
import deployments from "@/data/deployments.json";

const TYPE_LABELS: Record<string, string> = {
  "hedera-native": "HEDERA NATIVE",
  "multi-chain": "MULTI-CHAIN",
  hybrid: "HYBRID",
};

const NETWORK_LABELS: Record<string, string> = {
  "hedera-testnet": "Hedera Testnet",
  "ethereum-sepolia": "Ethereum Sepolia",
  "base-sepolia": "Base Sepolia",
  "arbitrum-sepolia": "Arbitrum Sepolia",
};

const EXPLORER_URLS: Record<string, string> = {
  "hedera-testnet": "https://hashscan.io/testnet/contract/",
  "ethereum-sepolia": "https://sepolia.etherscan.io/address/",
  "base-sepolia": "https://sepolia.basescan.org/address/",
  "arbitrum-sepolia": "https://sepolia.arbiscan.io/address/",
};

const vaultAbi = [
  {
    name: "deposit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "to", type: "address" },
    ],
    outputs: [],
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [],
  },
  {
    name: "pricePerShare",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export function VaultDetail() {
  const { id } = useParams<{ id: string }>();
  const vault = useVault(id!);
  const { isConnected, address, connect } = useWallet();

  const usdcAddress = deployments.usdc["hedera-testnet"] as `0x${string}`;
  const vaultAddress = vault?.addresses["hedera-testnet"] as `0x${string}` | undefined;

  const { data: rawDepositBalance, refetch: refetchUsdcBalance } = useReadContract({
    address: usdcAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: hederaTestnet.id,
    query: { enabled: !!address },
  });
  const depositTokenBalance = rawDepositBalance
    ? Number(formatUnits(rawDepositBalance, 18))
    : 0;

  const { data: rawShareBalance, refetch: refetchShareBalance } = useReadContract({
    address: vaultAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: hederaTestnet.id,
    query: { enabled: !!address && !!vaultAddress },
  });
  const shareBalance = rawShareBalance
    ? Number(formatUnits(rawShareBalance, 18))
    : 0;

  const { data: rawPricePerShare } = useReadContract({
    address: vaultAddress,
    abi: vaultAbi,
    functionName: "pricePerShare",
    chainId: hederaTestnet.id,
    query: { enabled: !!vaultAddress },
  });
  const pricePerShare = rawPricePerShare ? Number(rawPricePerShare) / 1e6 : 1;
  const apy = (pricePerShare - 1) * 100;

  const writeContract = useWriteContract();

  const userPosition = MOCK_PORTFOLIO.positions.find((p) => p.vaultId === id);

  const [depositToken, setDepositToken] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"deposit" | "withdraw">("deposit");
  const [confirmTxHash, setConfirmTxHash] = useState("");

  if (!vault) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-10">
        <Link
          to="/vaults"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-primary mb-8 transition-colors tracking-[0.5px] uppercase"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          BACK TO VAULTS
        </Link>
        <EmptyState
          icon={SearchX}
          title="Vault Not Found"
          description={`No vault found with ID "${id}". It may have been removed or the URL is incorrect.`}
          action={
            <Link
              to="/vaults"
              className={cn(buttonVariants({ variant: "outline" }), "text-[11px] font-bold tracking-[0.5px] uppercase")}
            >
              BROWSE VAULTS
            </Link>
          }
        />
      </div>
    );
  }

  async function handleDeposit() {
    if (!depositAmount || parseFloat(depositAmount) <= 0 || !address || !vaultAddress) return;

    setIsLoading(true);
    try {
      const parsedAmount = parseUnits(depositAmount, 18);

      await writeContract.mutateAsync({
        address: usdcAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [vaultAddress, parsedAmount],
        chainId: hederaTestnet.id,
      });

      const tx = await writeContract.mutateAsync({
        address: vaultAddress,
        abi: vaultAbi,
        functionName: "deposit",
        args: [parsedAmount, address],
        chainId: hederaTestnet.id,
      });

      setConfirmAction("deposit");
      setConfirmTxHash(tx);
      setShowConfirm(true);
      setDepositAmount("");
      refetchUsdcBalance();
      refetchShareBalance();
    } catch (e) {
      console.error("Deposit failed:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleWithdraw() {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0 || !vaultAddress) return;

    setIsLoading(true);
    try {
      const parsedShares = parseUnits(withdrawAmount, 18);

      const tx = await writeContract.mutateAsync({
        address: vaultAddress,
        abi: vaultAbi,
        functionName: "withdraw",
        args: [parsedShares],
        chainId: hederaTestnet.id,
      });

      setConfirmAction("withdraw");
      setConfirmTxHash(tx);
      setShowConfirm(true);
      setWithdrawAmount("");
      refetchUsdcBalance();
      refetchShareBalance();
    } catch (e) {
      console.error("Withdraw failed:", e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      {/* Back link */}
      <Link
        to="/vaults"
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-primary mb-8 transition-colors tracking-[0.5px] uppercase"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        BACK TO VAULTS
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] font-bold tracking-[0.5px] text-primary uppercase mb-2">
            // VAULT DETAIL
          </p>
          <h1 className="text-[42px] font-bold tracking-[-1px] text-foreground font-display leading-tight mb-2">
            {vault.name}
          </h1>
          {vault.addresses["hedera-testnet"] && (
            <a
              href={`${EXPLORER_URLS["hedera-testnet"]}${vault.addresses["hedera-testnet"]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground hover:text-primary transition-colors mb-3"
            >
              {vault.addresses["hedera-testnet"]}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold tracking-[0.5px] text-muted-foreground border border-border px-2 py-0.5">
              {TYPE_LABELS[vault.strategy.type]}
            </span>
            <RiskIndicator level={vault.strategy.riskLevel} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <StatCard label="APY" value={formatApy(apy)} />
        <StatCard label="TOTAL_VALUE_LOCKED" value={formatUsd(vault.tvl)} />
        <StatCard label="PRICE_PER_SHARE" value={`${pricePerShare.toFixed(4)} USDC`} />
        <StatCard label="INCEPTION" value={formatDate(vault.inception)} />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Strategy */}
          <div className="border border-border bg-card p-6">
            <h2 className="text-[11px] font-bold tracking-[0.5px] text-muted-foreground uppercase mb-1">
              // STRATEGY
            </h2>
            <p className="text-[18px] font-semibold font-display text-foreground mb-3">
              {vault.strategy.name}
            </p>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              {vault.strategy.description}
            </p>
          </div>

          {/* Contract Addresses */}
          {Object.keys(vault.addresses).length > 0 && (
            <div className="border border-border bg-card p-6">
              <h2 className="text-[11px] font-bold tracking-[0.5px] text-muted-foreground uppercase mb-4">
                // CONTRACT ADDRESSES
              </h2>
              <div className="space-y-2">
                {Object.entries(vault.addresses).map(([network, address]) => (
                  <div key={network} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                    <span className="text-[11px] text-muted-foreground tracking-[0.5px] uppercase">
                      {NETWORK_LABELS[network] ?? network}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-foreground">
                        {address!.slice(0, 6)}...{address!.slice(-4)}
                      </span>
                      <a
                        href={`${EXPLORER_URLS[network] ?? "#"}${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Token Allocation */}
          <div className="border border-border bg-card p-6">
            <h2 className="text-[11px] font-bold tracking-[0.5px] text-muted-foreground uppercase mb-4">
              // TOKEN ALLOCATION
            </h2>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-[11px] font-bold tracking-[0.5px] text-muted-foreground uppercase pb-3">
                    TOKEN
                  </th>
                  <th className="text-right text-[11px] font-bold tracking-[0.5px] text-muted-foreground uppercase pb-3">
                    ALLOC
                  </th>
                  <th className="text-right text-[11px] font-bold tracking-[0.5px] text-muted-foreground uppercase pb-3">
                    QTY
                  </th>
                  <th className="text-right text-[11px] font-bold tracking-[0.5px] text-muted-foreground uppercase pb-3">
                    PRICE
                  </th>
                  <th className="text-right text-[11px] font-bold tracking-[0.5px] text-muted-foreground uppercase pb-3">
                    VALUE
                  </th>
                </tr>
              </thead>
              <tbody>
                {vault.tokens.map((vt) => (
                  <tr key={vt.token.symbol + vt.token.chain} className="border-b border-border">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <TokenIcon symbol={vt.token.symbol} color={vt.token.iconColor} />
                        <div>
                          <p className="text-[13px] font-semibold">{vt.token.symbol}</p>
                          <p className="text-[11px] text-muted-foreground">{vt.token.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-right text-[13px] font-medium">{vt.allocation}%</td>
                    <td className="text-right text-[13px] font-medium">{formatNumber(vt.quantity)}</td>
                    <td className="text-right text-[13px] text-muted-foreground">{formatUsdPrecise(vt.token.price)}</td>
                    <td className="text-right text-[13px] font-semibold text-primary">
                      {formatUsd(vt.quantity * vt.token.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fees */}
          <div className="border border-border bg-card p-6">
            <h2 className="text-[11px] font-bold tracking-[0.5px] text-muted-foreground uppercase mb-4">
              // FEE STRUCTURE
            </h2>
            <FeeBreakdown fees={vault.fees} />
          </div>
        </div>

        {/* Right column — Deposit / Withdraw */}
        <div>
          <div className="border border-border bg-card p-6 sticky top-20">
            <h2 className="text-[11px] font-bold tracking-[0.5px] text-muted-foreground uppercase mb-4">
              // INVEST
            </h2>

            {/* User's current position in this vault */}
            {isConnected && userPosition && (
              <div className="border border-border bg-secondary/30 mb-4">
                <div className="px-4 py-2.5 border-b border-border">
                  <p className="text-[10px] font-bold tracking-[0.5px] text-primary uppercase">
                    // YOUR POSITION
                  </p>
                </div>
                <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2 border-b border-border">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.5px] text-muted-foreground uppercase mb-0.5">CURRENT VALUE</p>
                    <p className="text-[15px] font-bold font-display tracking-[-0.5px] text-foreground">{formatUsd(userPosition.currentValue)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.5px] text-muted-foreground uppercase mb-0.5">SHARES</p>
                    <p className="text-[15px] font-bold font-display tracking-[-0.5px] text-foreground">{formatNumber(userPosition.currentValue / vault.sharePrice)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.5px] text-muted-foreground uppercase mb-0.5">P&amp;L</p>
                    <p className={`text-[13px] font-bold tracking-[0.5px] ${userPosition.pnl >= 0 ? "text-primary" : "text-negative"}`}>
                      {userPosition.pnl >= 0 ? "+" : ""}{formatUsd(userPosition.pnl)} ({formatPercent(userPosition.pnlPercent)})
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.5px] text-muted-foreground uppercase mb-0.5">SINCE</p>
                    <p className="text-[13px] font-medium text-muted-foreground">{formatDate(userPosition.depositDate)}</p>
                  </div>
                </div>
                {/* Holdings breakdown */}
                <div className="divide-y divide-border">
                  {userPosition.holdings.map((h, i) => {
                    const tokenColor = Object.values(TOKENS).find(
                      (t) => t.symbol === h.tokenSymbol && t.chain === h.chain
                    )?.iconColor ?? "#555555";
                    return (
                      <div key={i} className="flex items-center justify-between px-4 py-2">
                        <div className="flex items-center gap-2">
                          <TokenIcon symbol={h.tokenSymbol} color={tokenColor} size="sm" />
                          <div>
                            <span className="text-[11px] font-semibold text-foreground">{h.tokenSymbol}</span>
                            {h.chain !== "hedera" && (
                              <span className="ml-1 text-[9px] font-bold tracking-[0.5px] text-muted-foreground border border-border px-1">
                                {h.chain.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-semibold text-foreground">{formatUsd(h.valueUsd)}</p>
                          <p className="text-[10px] text-muted-foreground">{formatNumber(h.quantity)} {h.tokenSymbol}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!isConnected ? (
              <div className="space-y-4">
                {/* Ghost tab bar */}
                <div className="grid grid-cols-2 gap-1 bg-secondary p-1 pointer-events-none select-none">
                  <div className="h-8 bg-card border border-border flex items-center justify-center">
                    <span className="text-[11px] font-bold tracking-[0.5px] text-foreground uppercase">DEPOSIT</span>
                  </div>
                  <div className="h-8 flex items-center justify-center">
                    <span className="text-[11px] font-bold tracking-[0.5px] text-muted-foreground uppercase">WITHDRAW</span>
                  </div>
                </div>

                {/* Ghost fields */}
                <div className="space-y-3 pointer-events-none select-none opacity-40">
                  <div>
                    <div className="h-3 w-12 bg-secondary mb-1.5" />
                    <div className="h-9 border border-border bg-secondary" />
                  </div>
                  <div>
                    <div className="h-3 w-16 bg-secondary mb-1.5" />
                    <div className="h-9 border border-border bg-secondary" />
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <p className="text-[11px] text-muted-foreground tracking-[0.5px] uppercase text-center">
                    // WALLET REQUIRED TO INVEST
                  </p>
                  <Button onClick={connect} className="w-full text-[11px] font-bold tracking-[0.5px] uppercase">
                    CONNECT WALLET
                  </Button>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="deposit">
                <TabsList className="w-full">
                  <TabsTrigger value="deposit" className="flex-1 text-[11px] font-bold tracking-[0.5px] uppercase">
                    DEPOSIT
                  </TabsTrigger>
                  <TabsTrigger value="withdraw" className="flex-1 text-[11px] font-bold tracking-[0.5px] uppercase">
                    WITHDRAW
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="deposit" className="space-y-4 mt-4">
                  {/* Wallet balance */}
                  <div className="flex items-center justify-between px-3 py-2 bg-secondary border border-border">
                    <span className="text-[10px] font-bold tracking-[0.5px] text-muted-foreground uppercase">WALLET</span>
                    <span className="text-[11px] font-semibold text-foreground font-mono">
                      {depositTokenBalance.toFixed(2)} {vault.depositToken.symbol}
                    </span>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium tracking-[0.5px] text-muted-foreground uppercase mb-1.5 block">
                      TOKEN
                    </label>
                    <Select value={depositToken} onValueChange={(v) => setDepositToken(v ?? "")}>
                      <SelectTrigger>
                        <SelectValue placeholder="SELECT TOKEN" />
                      </SelectTrigger>
                      <SelectContent>

                        <SelectItem key={vault.depositToken.symbol + vault.depositToken.chain} value={vault.depositToken.symbol}>{vault.depositToken.symbol} — {vault.depositToken.name}</SelectItem>

                        {/* {vault.tokens.map((vt) => (
                          <SelectItem key={vt.token.symbol + vt.token.chain} value={vt.token.symbol}>
                            {vt.token.symbol} — {vt.token.name}
                          </SelectItem>
                        ))} */}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium tracking-[0.5px] text-muted-foreground uppercase mb-1.5 block">
                      AMOUNT
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      min="0"
                    />
                  </div>
                  <Separator />
                  <Button
                    className="w-full text-[11px] font-bold tracking-[0.5px] uppercase"
                    disabled={isLoading || !depositAmount || !depositToken}
                    onClick={handleDeposit}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "DEPOSIT"}
                  </Button>
                </TabsContent>

                <TabsContent value="withdraw" className="space-y-4 mt-4">
                  {/* Share balance */}
                  <div className="flex items-center justify-between px-3 py-2 bg-secondary border border-border">
                    <span className="text-[10px] font-bold tracking-[0.5px] text-muted-foreground uppercase">SHARES</span>
                    <span className="text-[11px] font-semibold text-foreground font-mono">
                      {shareBalance.toFixed(4)}
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium tracking-[0.5px] text-muted-foreground uppercase mb-1.5 block">
                      SHARES TO WITHDRAW
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      min="0"
                    />
                    {shareBalance > 0 && (
                      <div className="grid grid-cols-4 gap-1 mt-2">
                        {[25, 50, 75, 100].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() =>
                              setWithdrawAmount(
                                ((shareBalance * pct) / 100).toFixed(4)
                              )
                            }
                            className="py-1 border border-border bg-secondary text-[10px] font-bold tracking-[0.5px] text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors uppercase"
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />
                  <Button
                    variant="outline"
                    className="w-full text-[11px] font-bold tracking-[0.5px] uppercase"
                    disabled={isLoading || !withdrawAmount}
                    onClick={handleWithdraw}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "WITHDRAW"}
                  </Button>
                </TabsContent>
              </Tabs>
            )}

          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold font-display tracking-[-1px]">
              [TX SUBMITTED]
            </DialogTitle>
            <DialogDescription className="text-[13px] text-muted-foreground">
              Your {confirmAction.toUpperCase()} has been submitted to the network.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-secondary border border-border p-3 text-[11px] text-muted-foreground break-all">
            TX_HASH: {confirmTxHash}
          </div>
          <Button onClick={() => setShowConfirm(false)} className="w-full text-[11px] font-bold tracking-[0.5px] uppercase">
            DONE
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
