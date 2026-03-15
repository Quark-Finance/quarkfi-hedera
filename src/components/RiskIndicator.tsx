const RISK_CONFIG = {
  low: { label: "[LOW RISK]", className: "text-primary bg-primary/10 border-primary/40" },
  medium: { label: "[MEDIUM]", className: "text-warning bg-warning/10 border-warning/40" },
  high: { label: "[HIGH RISK]", className: "text-negative bg-negative/10 border-negative/40" },
};

interface RiskIndicatorProps {
  level: "low" | "medium" | "high";
}

export function RiskIndicator({ level }: RiskIndicatorProps) {
  const config = RISK_CONFIG[level];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold tracking-[0.5px] uppercase border ${config.className}`}>
      {config.label}
    </span>
  );
}
