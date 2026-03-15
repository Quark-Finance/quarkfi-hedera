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
import {
  formatUsd,
  formatApy,
  formatNumber,
  formatDate,
  formatUsdPrecise,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader2 } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  "hedera-native": "HEDERA NATIVE",
  "multi-chain": "MULTI-CHAIN",
  hybrid: "HYBRID",
};

export function VaultDetail() {
  const { id } = useParams<{ id: string }>();
  const vault = useVault(id!);
  const { isConnected, connect } = useWallet();

  const [depositToken, setDepositToken] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"deposit" | "withdraw">("deposit");
  const [confirmAmount, setConfirmAmount] = useState("");

  if (!vault) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-10">
        <p className="text-[13px] text-muted-foreground">// VAULT NOT FOUND</p>
        <Link
          to="/vaults"
          className={cn(buttonVariants({ variant: "outline" }), "mt-4 text-[11px] font-bold tracking-[0.5px] uppercase")}
        >
          BACK TO VAULTS
        </Link>
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

            {!isConnected ? (
              <div className="text-center py-8">
                <p className="text-[13px] text-muted-foreground mb-4">
                  CONNECT WALLET TO PROCEED
                </p>
                <Button onClick={connect} className="w-full text-[11px] font-bold tracking-[0.5px] uppercase">
                  CONNECT WALLET
                </Button>
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
                  <div>
                    <label className="text-[11px] font-medium tracking-[0.5px] text-muted-foreground uppercase mb-1.5 block">
                      AMOUNT_USD
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      min="0"
                    />
                  </div>
                  <Separator />
                  <Button
                    variant="outline"
                    className="w-full text-[11px] font-bold tracking-[0.5px] uppercase"
                    disabled={isLoading || !withdrawAmount}
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
