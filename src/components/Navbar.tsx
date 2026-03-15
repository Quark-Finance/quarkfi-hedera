import { Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { formatAddress, formatUsd } from "@/lib/format";
import { Wallet, LogOut } from "lucide-react";

export function Navbar() {
  const { isConnected, address, balance, connect, disconnect } = useWallet();
  const location = useLocation();

  const navLinks = [
    { to: "/vaults", label: "Vaults" },
    { to: "/portfolio", label: "Portfolio" },
  ];

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">Q</span>
            </div>
            <span className="text-foreground font-semibold text-lg tracking-tight">
              Quark
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname.startsWith(link.to)
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <span className="text-sm text-muted-foreground">
                {formatUsd(balance)}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 font-mono text-xs"
                onClick={disconnect}
              >
                <Wallet className="h-3.5 w-3.5" />
                {formatAddress(address!)}
                <LogOut className="h-3 w-3 text-muted-foreground" />
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={connect} className="gap-2">
              <Wallet className="h-3.5 w-3.5" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
