import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/StatCard";
import { useWallet } from "@/hooks/useWallet";
import { MOCK_PORTFOLIO } from "@/data/user";
import { VAULTS } from "@/data/vaults";
import {
  formatUsd,
  formatPercent,
  formatDate,
} from "@/lib/format";
import { Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";

function getVaultName(vaultId: string): string {
  return VAULTS.find((v) => v.id === vaultId)?.name ?? vaultId;
}

export function UserAssets() {
  const { isConnected, connect } = useWallet();

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          Connect your wallet to view your portfolio, positions, and transaction
          history.
        </p>
        <Button onClick={connect} size="lg">
          Connect Wallet
        </Button>
      </div>
    );
  }

  const { totalValue, totalPnl, totalPnlPercent, positions, transactions } =
    MOCK_PORTFOLIO;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">
        Portfolio
      </h1>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Value" value={formatUsd(totalValue)} />
        <StatCard
          label="Total P&L"
          value={`${totalPnl >= 0 ? "+" : ""}${formatUsd(totalPnl)}`}
          subValue={formatPercent(totalPnlPercent)}
        />
        <StatCard
          label="Active Positions"
          value={String(positions.length)}
          subValue="Across vaults"
        />
      </div>

      {/* Positions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {positions.map((pos) => (
              <div
                key={pos.vaultId}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30"
              >
                <div>
                  <Link
                    to={`/vaults/${pos.vaultId}`}
                    className="font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {getVaultName(pos.vaultId)}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Deposited {formatDate(pos.depositDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {formatUsd(pos.currentValue)}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      pos.pnl >= 0 ? "text-positive" : "text-negative"
                    }`}
                  >
                    {pos.pnl >= 0 ? "+" : ""}
                    {formatUsd(pos.pnl)} ({formatPercent(pos.pnlPercent)})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Vault</TableHead>
                <TableHead>Token</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {tx.type === "deposit" ? (
                        <ArrowDownLeft className="h-4 w-4 text-positive" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-negative" />
                      )}
                      <span className="capitalize">{tx.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/vaults/${tx.vaultId}`}
                      className="hover:text-primary transition-colors"
                    >
                      {getVaultName(tx.vaultId)}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tx.tokenSymbol}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatUsd(tx.amount)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDate(tx.timestamp)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        tx.status === "completed" ? "outline" : "secondary"
                      }
                      className={
                        tx.status === "completed"
                          ? "border-positive/30 text-positive"
                          : ""
                      }
                    >
                      {tx.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
