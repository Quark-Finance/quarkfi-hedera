interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  className?: string;
}

export function StatCard({ label, value, subValue, className = "" }: StatCardProps) {
  return (
    <div className={`rounded-lg border border-border bg-card p-5 ${className}`}>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {subValue && (
        <p className="text-sm text-muted-foreground mt-1">{subValue}</p>
      )}
    </div>
  );
}
