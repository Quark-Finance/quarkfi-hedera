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
    <div className="max-w-7xl mx-auto px-8">
      {/* Hero */}
      <section className="py-28 text-center">
        <p className="text-[11px] font-bold tracking-[0.5px] text-primary uppercase mb-6">
          // INSTITUTIONAL DEFI PROTOCOL
        </p>
        <h1 className="text-[42px] font-bold tracking-[-1px] text-foreground font-display leading-tight mb-4">
          Bring DeFi Yields
          <br />
          To Institutions
        </h1>
        <p className="text-[14px] font-normal text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
          Quark delivers institutional-grade decentralized finance on Hedera.
          Professionally managed vaults, transparent fees, real-time analytics.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/vaults"
            className={cn(
              buttonVariants({ size: "lg" }),
              "gap-2 text-[11px] font-bold tracking-[0.5px] uppercase"
            )}
          >
            EXPLORE VAULTS
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/portfolio"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "text-[11px] font-bold tracking-[0.5px] uppercase"
            )}
          >
            VIEW PORTFOLIO
          </Link>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="pb-28">
        <p className="text-[11px] font-bold tracking-[0.5px] text-muted-foreground uppercase mb-4">
          // SYSTEM STATUS
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <StatCard
            label="TOTAL_VALUE_LOCKED"
            value={formatUsd(aggregates.totalTvl)}
            subValue="ACROSS ALL VAULTS"
          />
          <StatCard
            label="AVERAGE_APY"
            value={formatApy(aggregates.avgApy)}
            subValue="NET OF FEES"
          />
          <StatCard
            label="TOTAL_DEPOSITORS"
            value={formatNumber(aggregates.totalDepositors)}
            subValue="INSTITUTIONAL INVESTORS"
          />
        </div>
      </section>
    </div>
  );
}
