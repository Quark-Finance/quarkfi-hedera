import type { VaultFees } from "@/data/types";

interface FeeBreakdownProps {
  fees: VaultFees;
}

export function FeeBreakdown({ fees }: FeeBreakdownProps) {
  const rows = [
    { label: "MANAGEMENT_FEE", value: `${fees.management}% / YEAR` },
    { label: "PERFORMANCE_FEE", value: `${fees.performance}% OF PROFITS` },
    { label: "DEPOSIT_FEE", value: fees.deposit === 0 ? "NONE" : `${fees.deposit}%` },
    { label: "WITHDRAWAL_FEE", value: fees.withdrawal === 0 ? "NONE" : `${fees.withdrawal}%` },
  ];

  return (
    <div className="divide-y divide-border">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between py-3">
          <span className="text-[11px] font-medium tracking-[0.5px] text-muted-foreground">
            {row.label}
          </span>
          <span className="text-[13px] font-semibold text-foreground">
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
