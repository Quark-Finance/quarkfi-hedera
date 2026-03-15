import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TriangleAlert } from "lucide-react";

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-8">
      <div className="w-14 h-14 flex items-center justify-center border border-border bg-secondary mb-6">
        <TriangleAlert className="h-6 w-6 text-warning" />
      </div>
      <p className="text-[11px] font-bold tracking-[0.5px] text-warning uppercase mb-3">
        // ERROR 404
      </p>
      <h1 className="text-[42px] font-bold tracking-[-1px] text-foreground font-display mb-2">
        Page Not Found
      </h1>
      <p className="text-[13px] text-muted-foreground max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className={cn(
            buttonVariants({ variant: "default" }),
            "text-[11px] font-bold tracking-[0.5px] uppercase"
          )}
        >
          HOME
        </Link>
        <Link
          to="/vaults"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "text-[11px] font-bold tracking-[0.5px] uppercase"
          )}
        >
          EXPLORE VAULTS
        </Link>
      </div>
    </div>
  );
}
