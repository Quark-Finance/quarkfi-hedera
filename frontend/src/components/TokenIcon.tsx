import { useState } from "react";

const TOKEN_IMAGES: Record<string, string> = {
  HBAR: "/tokens/hbar.svg",
  HBARX: "/tokens/hbarx.svg",
  USDC: "/tokens/usdc.svg",
  ETH: "/tokens/eth.svg",
  WBTC: "/tokens/wbtc.svg",
  ARB: "/tokens/arb.svg",
};

interface TokenIconProps {
  symbol: string;
  color: string;
  size?: "sm" | "md";
}

export function TokenIcon({ symbol, color, size = "md" }: TokenIconProps) {
  const [imgError, setImgError] = useState(false);
  const src = TOKEN_IMAGES[symbol];
  const sizeClasses = size === "sm" ? "w-6 h-6" : "w-8 h-8";

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={symbol}
        className={`${sizeClasses} shrink-0 rounded-full`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} flex items-center justify-center font-bold text-[9px] text-background shrink-0 rounded-full border border-border`}
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
        <div key={i} className="ring-1 ring-background rounded-full">
          <TokenIcon symbol={t.symbol} color={t.color} size="sm" />
        </div>
      ))}
    </div>
  );
}
