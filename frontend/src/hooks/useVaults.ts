import { useMemo, useState } from "react";
import { VAULTS } from "@/data/vaults";
import type { Vault } from "@/data/types";

export type SortField = "apy" | "tvl" | "risk" | "name" | "depositors";
export type SortDirection = "asc" | "desc";

const RISK_ORDER = { low: 1, medium: 2, high: 3 };

interface UseVaultsOptions {
  initialSortBy?: SortField;
  initialSortDir?: SortDirection;
}

export function useVaults(options: UseVaultsOptions = {}) {
  const [sortBy, setSortBy] = useState<SortField>(
    options.initialSortBy ?? "tvl"
  );
  const [sortDir, setSortDir] = useState<SortDirection>(
    options.initialSortDir ?? "desc"
  );
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const vaults = useMemo(() => {
    let filtered = [...VAULTS];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.strategy.name.toLowerCase().includes(q)
      );
    }

    if (riskFilter !== "all") {
      filtered = filtered.filter((v) => v.strategy.riskLevel === riskFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((v) => v.strategy.type === typeFilter);
    }

    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "apy":
          cmp = a.apy - b.apy;
          break;
        case "tvl":
          cmp = a.tvl - b.tvl;
          break;
        case "risk":
          cmp =
            RISK_ORDER[a.strategy.riskLevel] -
            RISK_ORDER[b.strategy.riskLevel];
          break;
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "depositors":
          cmp = a.totalDepositors - b.totalDepositors;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return filtered;
  }, [sortBy, sortDir, riskFilter, typeFilter, search]);

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  const aggregates = useMemo(() => {
    return {
      totalTvl: VAULTS.reduce((sum, v) => sum + v.tvl, 0),
      avgApy:
        VAULTS.reduce((sum, v) => sum + v.apy, 0) / VAULTS.length,
      totalDepositors: VAULTS.reduce((sum, v) => sum + v.totalDepositors, 0),
    };
  }, []);

  return {
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
    aggregates,
  } as const;
}

export function useVault(id: string): Vault | undefined {
  return VAULTS.find((v) => v.id === id);
}
