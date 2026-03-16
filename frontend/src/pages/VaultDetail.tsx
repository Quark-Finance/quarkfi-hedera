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
import { useVault } from "@/hooks/useVaults";
import { useWallet } from "@/hooks/useWallet";
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
import { ArrowLeft, Loader2, SearchX } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  "hedera-native": "HEDERA NATIVE",
  "multi-chain": "MULTI-CHAIN",
  hybrid: "HYBRID",
};

export function VaultDetail() {
  const { id } = useParams<{ id: string }>();
  const vault = useVault(id!);
  const { isConnected, connect } = useWallet();
  const userPosition = MOCK_PORTFOLIO.positions.find((p) => p.vaultId === id);

  const [depositToken, setDepositToken] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawToken, setWithdrawToken] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const selectedWithdrawHolding = userPosition?.holdings.find(
    (h) => `${h.tokenSymbol}:${h.chain}` === withdrawToken
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"deposit" | "withdraw">("deposit");
  const [confirmAmount, setConfirmAmount] = useState("");

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

  async function handleSubmit(action: "deposit" | "withdraw") {
    const amount = action === "deposit" ? depositAmount : withdrawAmount;
    if (!amount || parseFloat(amount) <= 0) return;

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);

    setConfirmAction(action);
    setConfirmAmount(amount);
    setShowConfirm(true);

    if (action === "deposit") setDepositAmount("");
    else setWithdrawAmount("");
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
          <h1 className="text-[42px] font-bold tracking-[-1px] text-foreground font-display leading-tight mb-3">
            {vault.name}
          </h1>
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
        <StatCard label="APY" value={formatApy(vault.apy)} />
        <StatCard label="TOTAL_VALUE_LOCKED" value={formatUsd(vault.tvl)} />
        <StatCard label="DEPOSITORS" value={formatNumber(vault.totalDepositors)} />
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
                    <p className="text-[10px] font-bold tracking-[0.5px] text-muted-foreground uppercase mb-0.5">COST BASIS</p>
                    <p className="text-[15px] font-bold font-display tracking-[-0.5px] text-foreground">{formatUsd(userPosition.depositedAmount)}</p>
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
                  <div>
                    <label className="text-[11px] font-medium tracking-[0.5px] text-muted-foreground uppercase mb-1.5 block">
                      TOKEN
                    </label>
                    <Select value={depositToken} onValueChange={(v) => setDepositToken(v ?? "")}>
                      <SelectTrigger>
                        <SelectValue placeholder="SELECT TOKEN" />
                      </SelectTrigger>
                      <SelectContent>
                        {vault.tokens.map((vt) => (
                          <SelectItem key={vt.token.symbol + vt.token.chain} value={vt.token.symbol}>
                            {vt.token.symbol} — {vt.token.name}
                          </SelectItem>
                        ))}
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
                    onClick={() => handleSubmit("deposit")}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "DEPOSIT"}
                  </Button>
                </TabsContent>

                <TabsContent value="withdraw" className="space-y-4 mt-4">
                  {/* Token selector */}
                  <div>
                    <label className="text-[11px] font-medium tracking-[0.5px] text-muted-foreground uppercase mb-1.5 block">
                      TOKEN
                    </label>
                    <Select
                      value={withdrawToken}
                      onValueChange={(v) => {
                        setWithdrawToken(v ?? "");
                        setWithdrawAmount("");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="SELECT TOKEN" />
                      </SelectTrigger>
                      <SelectContent>
                        {(userPosition?.holdings ?? vault.tokens.map((vt) => ({
                          tokenSymbol: vt.token.symbol,
                          chain: vt.token.chain,
                          quantity: 0,
                          valueUsd: 0,
                        }))).map((h) => (
                          <SelectItem key={`${h.tokenSymbol}:${h.chain}`} value={`${h.tokenSymbol}:${h.chain}`}>
                            {h.tokenSymbol}{h.chain !== "hedera" ? ` (${h.chain})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Balance + amount */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-medium tracking-[0.5px] text-muted-foreground uppercase">
                        AMOUNT
                      </label>
                      {selectedWithdrawHolding && (
                        <span className="text-[11px] text-muted-foreground tracking-[0.3px]">
                          BAL: <span className="text-foreground font-semibold">{formatNumber(selectedWithdrawHolding.quantity)}</span> {selectedWithdrawHolding.tokenSymbol}
                          <span className="text-muted-foreground ml-1">({formatUsd(selectedWithdrawHolding.valueUsd)})</span>
                        </span>
                      )}
                    </div>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      min="0"
                    />
                    {/* Quick % buttons */}
                    {selectedWithdrawHolding && (
                      <div className="grid grid-cols-4 gap-1 mt-2">
                        {[25, 50, 75, 100].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() =>
                              setWithdrawAmount(
                                ((selectedWithdrawHolding.quantity * pct) / 100).toFixed(4)
                              )
                            }
                            className="py-1 border border-border bg-secondary text-[10px] font-bold tracking-[0.5px] text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors uppercase"
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Estimated USD value */}
                    {withdrawAmount && selectedWithdrawHolding && (
                      <p className="text-[11px] text-muted-foreground mt-1.5 tracking-[0.3px]">
                        ≈ {formatUsd(
                          (parseFloat(withdrawAmount) / selectedWithdrawHolding.quantity) *
                          selectedWithdrawHolding.valueUsd
                        )} USD
                      </p>
                    )}
                  </div>

                  <Separator />
                  <Button
                    variant="outline"
                    className="w-full text-[11px] font-bold tracking-[0.5px] uppercase"
                    disabled={isLoading || !withdrawAmount || !withdrawToken}
                    onClick={() => handleSubmit("withdraw")}
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
              Your {confirmAction.toUpperCase()} of ${confirmAmount} has been submitted to the network.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-secondary border border-border p-3 text-[11px] text-muted-foreground break-all">
            TX_HASH: 0x{Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}
          </div>
          <Button onClick={() => setShowConfirm(false)} className="w-full text-[11px] font-bold tracking-[0.5px] uppercase">
            DONE
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
