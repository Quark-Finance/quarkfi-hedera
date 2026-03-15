interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  className?: string;
}

export function StatCard({ label, value, subValue, className = "" }: StatCardProps) {
  return (
    <div className={`border border-border bg-card p-5 ${className}`}>
      <p className="text-[11px] font-medium tracking-[0.5px] uppercase text-muted-foreground mb-2">
        {label}
      </p>
      <p className="text-[32px] font-bold tracking-[-1px] text-foreground font-display leading-none">
        {value}
      </p>
      {subValue && (
        <p className="text-[11px] font-medium tracking-[0.5px] text-muted-foreground mt-2 uppercase">
          {subValue}
        </p>
      )}
    </div>
  );
}
