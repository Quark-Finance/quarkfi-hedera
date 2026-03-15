interface TokenIconProps {
  symbol: string;
  color: string;
  size?: "sm" | "md";
}

export function TokenIcon({ symbol, color, size = "md" }: TokenIconProps) {
  const sizeClasses = size === "sm" ? "w-6 h-6 text-[9px]" : "w-8 h-8 text-[10px]";

  return (
    <div
      className={`${sizeClasses} flex items-center justify-center font-bold text-background shrink-0 border border-border`}
      style={{ backgroundColor: color }}
    >
      {symbol.slice(0, 2)}
    </div>
  );
}

interface TokenStackProps {
  tokens: { symbol: string; color: string }[];
}

export function TokenStack({ tokens }: TokenStackProps) {
  return (
    <div className="flex -space-x-1">
      {tokens.map((t, i) => (
        <div key={i} className="ring-1 ring-background">
          <TokenIcon symbol={t.symbol} color={t.color} size="sm" />
        </div>
      ))}
    </div>
  );
}
