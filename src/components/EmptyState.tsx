import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 flex items-center justify-center border border-border bg-secondary mb-4">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="text-[18px] font-semibold font-display text-foreground mb-1">
        {title}
      </h3>
      <p className="text-[13px] text-muted-foreground max-w-sm mb-4">
        {description}
      </p>
      {action}
    </div>
  );
}
