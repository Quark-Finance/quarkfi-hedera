import { Badge } from "@/components/ui/badge";

const RISK_CONFIG = {
  low: { label: "Low Risk", className: "bg-positive/15 text-positive border-positive/30" },
  medium: { label: "Medium", className: "bg-chart-4/15 text-chart-4 border-chart-4/30" },
  high: { label: "High Risk", className: "bg-negative/15 text-negative border-negative/30" },
};

interface RiskIndicatorProps {
  level: "low" | "medium" | "high";
}

export function RiskIndicator({ level }: RiskIndicatorProps) {
  const config = RISK_CONFIG[level];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
