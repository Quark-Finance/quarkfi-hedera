interface TokenIconProps {
  symbol: string;
  color: string;
  size?: "sm" | "md";
}

export function TokenIcon({ symbol, color, size = "md" }: TokenIconProps) {
  const sizeClasses = size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs";

  return (
    <div
      className={`${sizeClasses} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
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
    <div className="flex -space-x-2">
      {tokens.map((t, i) => (
        <div key={i} className="ring-2 ring-card rounded-full">
          <TokenIcon symbol={t.symbol} color={t.color} size="sm" />
        </div>
      ))}
    </div>
  );
}
