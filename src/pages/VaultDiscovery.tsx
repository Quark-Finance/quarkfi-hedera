import { Link } from "react-router";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { TokenStack } from "@/components/TokenIcon";
import { RiskIndicator } from "@/components/RiskIndicator";
import { useVaults, type SortField } from "@/hooks/useVaults";
import { formatUsd, formatApy } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ArrowUpDown, Search } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  "hedera-native": "Hedera",
  "multi-chain": "Multi-Chain",
  hybrid: "Hybrid",
};

export function VaultDiscovery() {
  const {
    vaults,
    sortBy,
    sortDir,
    toggleSort,
    riskFilter,
    setRiskFilter,
    typeFilter,
    setTypeFilter,
    search,
    setSearch,
  } = useVaults();

  function SortHeader({
    field,
    children,
    className = "",
  }: {
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }) {
    const isActive = sortBy === field;
    return (
      <TableHead className={className}>
        <button
          onClick={() => toggleSort(field)}
          className={`flex items-center gap-1 hover:text-foreground transition-colors ${
            isActive ? "text-foreground" : ""
          }`}
        >
          {children}
          <ArrowUpDown
            className={`h-3.5 w-3.5 ${isActive ? "opacity-100" : "opacity-40"}`}
          />
          {isActive && (
            <span className="text-[10px]">
              {sortDir === "asc" ? "\u2191" : "\u2193"}
            </span>
          )}
        </button>
      </TableHead>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          Vaults
        </h1>
        <p className="text-muted-foreground">
          Discover and invest in institutional-grade DeFi vaults
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vaults..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={riskFilter} onValueChange={(v) => setRiskFilter(v ?? "all")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Risk Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Vault Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="hedera-native">Hedera</SelectItem>
            <SelectItem value="multi-chain">Multi-Chain</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SortHeader field="name">Vault</SortHeader>
              <TableHead>Tokens</TableHead>
              <SortHeader field="apy" className="text-right">
                APY
              </SortHeader>
              <SortHeader field="tvl" className="text-right">
                TVL
              </SortHeader>
              <SortHeader field="risk">Risk</SortHeader>
              <SortHeader field="depositors" className="text-right">
                Depositors
              </SortHeader>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {vaults.map((vault) => (
              <TableRow key={vault.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {vault.name}
                    </span>
                    <Badge
                      variant="outline"
                      className="w-fit mt-1 text-[10px] px-1.5 py-0"
                    >
                      {TYPE_LABELS[vault.strategy.type]}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <TokenStack
                    tokens={vault.tokens.map((t) => ({
                      symbol: t.token.symbol,
                      color: t.token.iconColor,
                    }))}
                  />
                </TableCell>
                <TableCell className="text-right font-semibold text-positive">
                  {formatApy(vault.apy)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatUsd(vault.tvl)}
                </TableCell>
                <TableCell>
                  <RiskIndicator level={vault.strategy.riskLevel} />
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {vault.totalDepositors}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    to={`/vaults/${vault.id}`}
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {vaults.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-muted-foreground"
                >
                  No vaults found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
