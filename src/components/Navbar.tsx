import { Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { formatAddress, formatUsd } from "@/lib/format";
import { Wallet, LogOut, Zap } from "lucide-react";

export function Navbar() {
  const { isConnected, address, balance, connect, disconnect } = useWallet();
  const location = useLocation();

  const navLinks = [
    { to: "/vaults", label: "VAULTS" },
    { to: "/portfolio", label: "PORTFOLIO" },
  ];

  return (
    <nav className="border-b border-border bg-[#080808] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-foreground font-semibold text-base tracking-[1px] uppercase">
              Quark
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 text-[12px] font-semibold tracking-[0.5px] transition-colors ${
                  location.pathname.startsWith(link.to)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isConnected ? (
            <>
              <span className="text-[11px] font-medium text-muted-foreground tracking-[0.5px] uppercase">
                {formatUsd(balance)}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-[11px] tracking-[0.5px]"
                onClick={disconnect}
              >
                <Wallet className="h-3.5 w-3.5" />
                {formatAddress(address!)}
                <LogOut className="h-3 w-3 text-muted-foreground" />
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={connect} className="gap-2 text-[11px] font-bold tracking-[0.5px] uppercase">
              <Wallet className="h-3.5 w-3.5" />
              CONNECT WALLET
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
