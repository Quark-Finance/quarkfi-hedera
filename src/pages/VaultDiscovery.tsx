import { Link } from "react-router";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
import { TokenStack } from "@/components/TokenIcon";
import { RiskIndicator } from "@/components/RiskIndicator";
import { useVaults, type SortField } from "@/hooks/useVaults";
import { formatUsd, formatApy } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ArrowUpDown, Search } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  "hedera-native": "HEDERA",
  "multi-chain": "MULTI-CHAIN",
  hybrid: "HYBRID",
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
      <th className={`px-4 py-3 text-left ${className}`}>
        <button
          onClick={() => toggleSort(field)}
          className={`flex items-center gap-1 text-[11px] font-bold tracking-[0.5px] uppercase transition-colors ${
            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {children}
          <ArrowUpDown
            className={`h-3 w-3 ${isActive ? "opacity-100" : "opacity-30"}`}
          />
          {isActive && (
            <span className="text-[9px]">
              {sortDir === "asc" ? "\u2191" : "\u2193"}
            </span>
          )}
        </button>
      </th>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <div className="mb-8">
        <p className="text-[11px] font-bold tracking-[0.5px] text-primary uppercase mb-2">
          // VAULT DISCOVERY
        </p>
        <h1 className="text-[42px] font-bold tracking-[-1px] text-foreground font-display">
          Vaults
        </h1>
        <p className="text-[14px] text-muted-foreground mt-1">
          Discover and invest in institutional-grade DeFi vaults
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="SEARCH VAULTS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-[11px] tracking-[0.5px] uppercase placeholder:text-muted-foreground"
          />
        </div>
        <Select value={riskFilter} onValueChange={(v) => setRiskFilter(v ?? "all")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="RISK LEVEL" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ALL RISK</SelectItem>
            <SelectItem value="low">LOW</SelectItem>
            <SelectItem value="medium">MEDIUM</SelectItem>
            <SelectItem value="high">HIGH</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="VAULT TYPE" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ALL TYPES</SelectItem>
            <SelectItem value="hedera-native">HEDERA</SelectItem>
            <SelectItem value="multi-chain">MULTI-CHAIN</SelectItem>
            <SelectItem value="hybrid">HYBRID</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-[#080808]">
              <SortHeader field="name">VAULT</SortHeader>
              <th className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.5px] uppercase text-muted-foreground">
                TOKENS
              </th>
              <SortHeader field="apy" className="text-right">
                APY
              </SortHeader>
              <SortHeader field="tvl" className="text-right">
                TVL
              </SortHeader>
              <SortHeader field="risk">RISK</SortHeader>
              <SortHeader field="depositors" className="text-right">
                DEPOSITORS
              </SortHeader>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {vaults.map((vault) => (
              <tr
                key={vault.id}
                className="border-b border-border hover:bg-secondary/50 transition-colors"
              >
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[13px] font-semibold text-foreground">
                      {vault.name}
                    </span>
                    <span className="text-[9px] font-bold tracking-[0.5px] text-muted-foreground border border-border px-1.5 py-0.5 w-fit">
                      {TYPE_LABELS[vault.strategy.type]}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <TokenStack
                    tokens={vault.tokens.map((t) => ({
                      symbol: t.token.symbol,
                      color: t.token.iconColor,
                    }))}
                  />
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-[18px] font-bold font-display text-primary">
                    {formatApy(vault.apy)}
                  </span>
                </td>
                <td className="px-4 py-4 text-right text-[13px] font-semibold">
                  {formatUsd(vault.tvl)}
                </td>
                <td className="px-4 py-4">
                  <RiskIndicator level={vault.strategy.riskLevel} />
                </td>
                <td className="px-4 py-4 text-right text-[13px] text-muted-foreground font-medium">
                  {vault.totalDepositors}
                </td>
                <td className="px-4 py-4 text-right">
                  <Link
                    to={`/vaults/${vault.id}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "text-[11px] font-bold tracking-[0.5px] uppercase"
                    )}
                  >
                    VIEW →
                  </Link>
                </td>
              </tr>
            ))}
            {vaults.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-16 text-[13px] text-muted-foreground"
                >
                  // NO VAULTS FOUND MATCHING YOUR FILTERS
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
