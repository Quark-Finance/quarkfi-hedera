import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { useVaults } from "@/hooks/useVaults";
import { formatUsd, formatApy, formatNumber } from "@/lib/format";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Landing() {
  const { aggregates } = useVaults();

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* Hero */}
      <section className="py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-foreground mb-4">
          Institutional-Grade
          <br />
          DeFi Yields
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
          Quark brings decentralized finance to institutions. Invest in
          professionally managed vaults on Hedera with transparent fees,
          real-time analytics, and institutional compliance.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/vaults"
            className={cn(buttonVariants({ size: "lg" }), "gap-2")}
          >
            Explore Vaults
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/portfolio"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            View Portfolio
          </Link>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Total Value Locked"
            value={formatUsd(aggregates.totalTvl)}
            subValue="Across all vaults"
          />
          <StatCard
            label="Average APY"
            value={formatApy(aggregates.avgApy)}
            subValue="Net of fees"
          />
          <StatCard
            label="Total Depositors"
            value={formatNumber(aggregates.totalDepositors)}
            subValue="Institutional investors"
          />
        </div>
      </section>
    </div>
  );
}
