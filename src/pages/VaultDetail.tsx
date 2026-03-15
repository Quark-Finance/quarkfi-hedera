import { useParams, Link } from "react-router";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
  "hedera-native": "Hedera Native",
  "multi-chain": "Multi-Chain",
  hybrid: "Hybrid",
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
  const [confirmAction, setConfirmAction] = useState<"deposit" | "withdraw">(
    "deposit"
  );
  const [confirmAmount, setConfirmAmount] = useState("");

  if (!vault) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <p className="text-muted-foreground">Vault not found.</p>
        <Link
          to="/vaults"
          className={cn(buttonVariants({ variant: "ghost" }), "mt-4")}
        >
          Back to Vaults
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

    if (action === "deposit") {
      setDepositAmount("");
    } else {
      setWithdrawAmount("");
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Back link */}
      <Link
        to="/vaults"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Vaults
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            {vault.name}
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{TYPE_LABELS[vault.strategy.type]}</Badge>
            <RiskIndicator level={vault.strategy.riskLevel} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="APY" value={formatApy(vault.apy)} />
        <StatCard label="Total Value Locked" value={formatUsd(vault.tvl)} />
        <StatCard
          label="Depositors"
          value={formatNumber(vault.totalDepositors)}
        />
        <StatCard label="Inception" value={formatDate(vault.inception)} />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Strategy */}
          <Card>
            <CardHeader>
              <CardTitle>Strategy</CardTitle>
              <CardDescription>{vault.strategy.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {vault.strategy.description}
              </p>
            </CardContent>
          </Card>

          {/* Token Allocation */}
          <Card>
            <CardHeader>
              <CardTitle>Token Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead className="text-right">Allocation</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vault.tokens.map((vt) => (
                    <TableRow key={vt.token.symbol + vt.token.chain}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <TokenIcon
                            symbol={vt.token.symbol}
                            color={vt.token.iconColor}
                          />
                          <div>
                            <p className="font-medium">{vt.token.symbol}</p>
                            <p className="text-xs text-muted-foreground">
                              {vt.token.name}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {vt.allocation}%
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatNumber(vt.quantity)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatUsdPrecise(vt.token.price)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatUsd(vt.quantity * vt.token.price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Fees */}
          <Card>
            <CardHeader>
              <CardTitle>Fee Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <FeeBreakdown fees={vault.fees} />
            </CardContent>
          </Card>
        </div>

        {/* Right column — Deposit / Withdraw */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Invest</CardTitle>
            </CardHeader>
            <CardContent>
              {!isConnected ? (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your wallet to deposit or withdraw
                  </p>
                  <Button onClick={connect} className="w-full">
                    Connect Wallet
                  </Button>
                </div>
              ) : (
                <Tabs defaultValue="deposit">
                  <TabsList className="w-full">
                    <TabsTrigger value="deposit" className="flex-1">
                      Deposit
                    </TabsTrigger>
                    <TabsTrigger value="withdraw" className="flex-1">
                      Withdraw
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="deposit" className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">
                        Token
                      </label>
                      <Select
                        value={depositToken}
                        onValueChange={(v) => setDepositToken(v ?? "")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select token" />
                        </SelectTrigger>
                        <SelectContent>
                          {vault.tokens.map((vt) => (
                            <SelectItem
                              key={vt.token.symbol + vt.token.chain}
                              value={vt.token.symbol}
                            >
                              {vt.token.symbol} — {vt.token.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">
                        Amount
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
                      className="w-full"
                      disabled={
                        isLoading || !depositAmount || !depositToken
                      }
                      onClick={() => handleSubmit("deposit")}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Deposit"
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="withdraw" className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">
                        Amount (USD)
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
                      className="w-full"
                      disabled={isLoading || !withdrawAmount}
                      onClick={() => handleSubmit("withdraw")}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Withdraw"
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Submitted</DialogTitle>
            <DialogDescription>
              Your {confirmAction} of ${confirmAmount} has been submitted to the
              network.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md bg-muted p-3 font-mono text-xs text-muted-foreground break-all">
            tx: 0x{Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}
          </div>
          <Button onClick={() => setShowConfirm(false)} className="w-full">
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
