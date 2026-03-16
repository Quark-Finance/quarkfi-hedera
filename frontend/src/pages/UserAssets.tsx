import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { useWallet } from "@/hooks/useWallet";
import { MOCK_PORTFOLIO } from "@/data/user";
import { VAULTS } from "@/data/vaults";
import { TOKENS } from "@/data/tokens";
import { formatUsd, formatPercent, formatDate, formatNumber } from "@/lib/format";
import { Wallet, ArrowUpRight, ArrowDownLeft, Vault, ReceiptText, ChevronDown, ChevronRight } from "lucide-react";
import { TokenIcon } from "@/components/TokenIcon";
import { EmptyState } from "@/components/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function getVaultName(vaultId: string): string {
  return VAULTS.find((v) => v.id === vaultId)?.name ?? vaultId;
}

function getTokenColor(symbol: string, chain: string): string {
  const match = Object.values(TOKENS).find(
    (t) => t.symbol === symbol && t.chain === chain
  );
  return match?.iconColor ?? "#555555";
}

export function UserAssets() {
  const { isConnected, connect } = useWallet();

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-10">
        <p className="text-[11px] font-bold tracking-[0.5px] text-primary uppercase mb-2">
          // PORTFOLIO OVERVIEW
        </p>
        <h1 className="text-[42px] font-bold tracking-[-1px] text-foreground font-display mb-8">
          Portfolio
        </h1>

        {/* Ghost stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10 pointer-events-none select-none">
          {["TOTAL_VALUE", "TOTAL_PNL", "ACTIVE_POSITIONS"].map((label) => (
            <div key={label} className="border border-border bg-card p-5">
              <p className="text-[11px] font-bold tracking-[0.5px] text-muted-foreground uppercase mb-2">
                {label}
              </p>
              <div className="h-8 w-24 bg-secondary rounded-none" />
            </div>
          ))}
        </div>

        {/* Lock gate */}
        <div className="border border-border bg-card flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 flex items-center justify-center border border-border bg-secondary mb-5">
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-[11px] font-bold tracking-[0.5px] text-primary uppercase mb-3">
            // WALLET REQUIRED
          </p>
          <h2 className="text-[24px] font-bold font-display tracking-[-1px] text-foreground mb-2">
            Connect to view your portfolio
          </h2>
          <p className="text-[13px] text-muted-foreground mb-6 max-w-xs tracking-[0.3px]">
            See your positions, P&amp;L, and full transaction history across all vaults.
          </p>
          <Button onClick={connect} className="text-[11px] font-bold tracking-[0.5px] uppercase">
            CONNECT WALLET
          </Button>
        </div>
      </div>
    );
  }

  const { totalValue, totalPnl, totalPnlPercent, positions, transactions } =
    MOCK_PORTFOLIO;

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  function toggleExpand(vaultId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(vaultId)) next.delete(vaultId);
      else next.add(vaultId);
      return next;
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <p className="text-[11px] font-bold tracking-[0.5px] text-primary uppercase mb-2">
        // PORTFOLIO OVERVIEW
      </p>
      <h1 className="text-[42px] font-bold tracking-[-1px] text-foreground font-display mb-8">
        Portfolio
      </h1>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
        <StatCard label="TOTAL_VALUE" value={formatUsd(totalValue)} />
        <StatCard
          label="TOTAL_PNL"
          value={`${totalPnl >= 0 ? "+" : ""}${formatUsd(totalPnl)}`}
          subValue={formatPercent(totalPnlPercent)}
        />
        <StatCard
          label="ACTIVE_POSITIONS"
          value={String(positions.length)}
          subValue="ACROSS VAULTS"
        />
      </div>

      {/* Positions */}
      <div className="border border-border bg-card mb-4">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-[11px] font-bold tracking-[0.5px] text-muted-foreground uppercase">
            // POSITIONS
          </h2>
        </div>
        <div className="divide-y divide-border">
          {positions.length === 0 ? (
            <EmptyState
              icon={Vault}
              title="No Positions"
              description="You haven't deposited into any vaults yet."
              action={
                <Link
                  to="/vaults"
                  className={cn(buttonVariants({ variant: "outline" }), "text-[11px] font-bold tracking-[0.5px] uppercase")}
                >
                  EXPLORE VAULTS
                </Link>
              }
            />
          ) : (
            positions.map((pos) => {
              const isOpen = expanded.has(pos.vaultId);
              return (
                <div key={pos.vaultId} className="border-b border-border last:border-0">
                  {/* Clickable header row */}
                  <button
                    onClick={() => toggleExpand(pos.vaultId)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-secondary/20 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 text-muted-foreground">
                        {isOpen
                          ? <ChevronDown className="h-4 w-4" />
                          : <ChevronRight className="h-4 w-4" />
                        }
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-foreground">
                          {getVaultName(pos.vaultId)}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[11px] text-muted-foreground tracking-[0.5px]">
                            SINCE {formatDate(pos.depositDate)}
                          </span>
                          <span className="text-[11px] text-muted-foreground tracking-[0.5px]">
                            COST BASIS {formatUsd(pos.depositedAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-[20px] font-bold font-display tracking-[-1px] text-foreground">
                        {formatUsd(pos.currentValue)}
                      </p>
                      <p className={`text-[11px] font-bold tracking-[0.5px] ${pos.pnl >= 0 ? "text-primary" : "text-negative"}`}>
                        {pos.pnl >= 0 ? "+" : ""}{formatUsd(pos.pnl)} ({formatPercent(pos.pnlPercent)})
                      </p>
                    </div>
                  </button>

                  {/* Expandable token breakdown */}
                  {isOpen && (
                    <div className="px-6 pb-5">
                      <div className="border border-border">
                        {/* Column headers */}
                        <div className="grid grid-cols-4 px-4 py-2 bg-secondary/50 border-b border-border">
                          {["ASSET", "QTY", "VALUE", "SHARE"].map((h) => (
                            <p key={h} className={`text-[10px] font-bold tracking-[0.5px] text-muted-foreground uppercase ${h !== "ASSET" ? "text-right" : ""}`}>
                              {h}
                            </p>
                          ))}
                        </div>
                        {pos.holdings.map((h, i) => (
                          <div key={i} className="grid grid-cols-4 items-center px-4 py-3 border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                            <div className="flex items-center gap-2">
                              <TokenIcon symbol={h.tokenSymbol} color={getTokenColor(h.tokenSymbol, h.chain)} size="sm" />
                              <div>
                                <span className="text-[12px] font-semibold text-foreground">{h.tokenSymbol}</span>
                                {h.chain !== "hedera" && (
                                  <span className="ml-1.5 text-[9px] font-bold tracking-[0.5px] text-muted-foreground uppercase border border-border px-1">
                                    {h.chain.toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-right text-[12px] font-medium text-muted-foreground">
                              {formatNumber(h.quantity)}
                            </p>
                            <p className="text-right text-[12px] font-semibold text-foreground">
                              {formatUsd(h.valueUsd)}
                            </p>
                            <p className="text-right text-[12px] font-medium text-muted-foreground">
                              {((h.valueUsd / pos.currentValue) * 100).toFixed(1)}%
                            </p>
                          </div>
                        ))}
                        {/* Footer: link to vault */}
                        <div className="px-4 py-2.5 bg-secondary/30 flex justify-end">
                          <Link
                            to={`/vaults/${pos.vaultId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] font-bold tracking-[0.5px] text-primary hover:underline uppercase"
                          >
                            VIEW VAULT →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="border border-border bg-card">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-[11px] font-bold tracking-[0.5px] text-muted-foreground uppercase">
            // TRANSACTION HISTORY
          </h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-[11px] font-bold tracking-[0.5px] text-muted-foreground uppercase">
                TYPE
              </th>
              <th className="px-6 py-3 text-left text-[11px] font-bold tracking-[0.5px] text-muted-foreground uppercase">
                VAULT
              </th>
              <th className="px-6 py-3 text-left text-[11px] font-bold tracking-[0.5px] text-muted-foreground uppercase">
                TOKEN
              </th>
              <th className="px-6 py-3 text-right text-[11px] font-bold tracking-[0.5px] text-muted-foreground uppercase">
                AMOUNT
              </th>
              <th className="px-6 py-3 text-right text-[11px] font-bold tracking-[0.5px] text-muted-foreground uppercase">
                DATE
              </th>
              <th className="px-6 py-3 text-right text-[11px] font-bold tracking-[0.5px] text-muted-foreground uppercase">
                STATUS
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon={ReceiptText}
                    title="No Transactions"
                    description="Your transaction history will appear here once you make your first deposit or withdrawal."
                  />
                </td>
              </tr>
            )}
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    {tx.type === "deposit" ? (
                      <ArrowDownLeft className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <ArrowUpRight className="h-3.5 w-3.5 text-negative" />
                    )}
                    <span className="text-[13px] font-medium uppercase">{tx.type}</span>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <Link
                    to={`/vaults/${tx.vaultId}`}
                    className="text-[13px] font-medium hover:text-primary transition-colors"
                  >
                    {getVaultName(tx.vaultId)}
                  </Link>
                </td>
                <td className="px-6 py-3 text-[13px] text-muted-foreground font-medium">
                  {tx.tokenSymbol}
                </td>
                <td className="px-6 py-3 text-right text-[13px] font-semibold">
                  {formatUsd(tx.amount)}
                </td>
                <td className="px-6 py-3 text-right text-[13px] text-muted-foreground">
                  {formatDate(tx.timestamp)}
                </td>
                <td className="px-6 py-3 text-right">
                  <span
                    className={`text-[9px] font-bold tracking-[0.5px] uppercase px-2 py-0.5 border ${
                      tx.status === "completed"
                        ? "text-primary border-primary/40 bg-primary/10"
                        : "text-warning border-warning/40 bg-warning/10"
                    }`}
                  >
                    [{tx.status === "completed" ? "COMPLETED" : "PENDING"}]
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
