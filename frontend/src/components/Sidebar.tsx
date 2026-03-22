import { Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { formatAddress, formatNumber } from "@/lib/format";
import {
  LayoutDashboard,
  Wallet,
  LogOut,
  Bot,
  FlaskConical,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/vaults", label: "VAULTS", icon: LayoutDashboard },
  { to: "/portfolio", label: "PORTFOLIO", icon: Wallet },
  { to: "/ai", label: "QUARK AI", icon: Bot },
  { to: "/dev", label: "DEV TOOLS", icon: FlaskConical },
];

export function Sidebar() {
  const { isConnected, address, balance, connect, disconnect } = useWallet();
  const location = useLocation();

  return (
    <aside className="w-[240px] h-screen sticky top-0 flex flex-col border-r border-border bg-[#080808]">
      {/* Logo */}
      <Link to="/" className="px-5 h-14 flex items-center gap-3 border-b border-border">
        <img
          src="/logo/quark_logo_white.svg"
          alt="Quark"
          className="h-6 w-6"
        />
        <span className="text-foreground font-semibold text-base tracking-[1px] uppercase">
          Quark
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[9px] font-bold tracking-[0.5px] text-muted-foreground uppercase px-3 mb-2">
          // NAVIGATION
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 text-[12px] font-semibold tracking-[0.5px] transition-colors ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Wallet section */}
      <div className="px-4 py-4 border-t border-border">
        {isConnected ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold tracking-[0.5px] text-muted-foreground uppercase">
                // WALLET
              </span>
            </div>
            <p className="text-[11px] font-medium text-foreground">
              {formatAddress(address!)}
            </p>
            <p className="text-[11px] font-medium text-muted-foreground">
              {formatNumber(balance)} HBAR
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-[11px] font-bold tracking-[0.5px] uppercase mt-1"
              onClick={disconnect}
            >
              <LogOut className="h-3 w-3" />
              DISCONNECT
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            className="w-full gap-2 text-[11px] font-bold tracking-[0.5px] uppercase"
            onClick={connect}
          >
            <Wallet className="h-3.5 w-3.5" />
            CONNECT WALLET
          </Button>
        )}
      </div>
    </aside>
  );
}
