import { cn } from "@/lib/utils";

export function Panel({ children, className, glow }) {
  return (
    <div className={cn("glass rounded-2xl p-6", glow && "glow-primary", className)}>{children}</div>
  );
}

export function StatCard({ label, value, hint, accent = "primary", icon }) {
  const map = { primary: "text-primary", success: "text-success", warning: "text-warning", danger: "text-danger" };
  return (
    <Panel className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
          <div className="mt-2 font-display text-3xl font-semibold tabular-nums">{value}</div>
          {hint && <div className={cn("mt-1 text-xs font-mono", map[accent])}>{hint}</div>}
        </div>
        {icon && <div className={cn("h-10 w-10 rounded-xl glass grid place-items-center", map[accent])}>{icon}</div>}
      </div>
      <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
    </Panel>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    verified: "bg-success/15 text-success border-success/30",
    pending: "bg-warning/15 text-warning border-warning/30",
    rejected: "bg-danger/15 text-danger border-danger/30",
    active: "bg-primary/15 text-primary border-primary/30",
    draft: "bg-slate-900/[0.03] text-muted-foreground border-slate-900/[0.08]",
    completed: "bg-success/15 text-success border-success/30",
    disputed: "bg-danger/15 text-danger border-danger/30",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider border", styles[status])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", {
        "bg-success": status === "verified" || status === "completed",
        "bg-warning": status === "pending",
        "bg-danger": status === "rejected" || status === "disputed",
        "bg-primary": status === "active",
        "bg-muted-foreground": status === "draft",
      })} />
      {status}
    </span>
  );
}

export function PageHeader({ title, description, actions, kicker }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        {kicker && <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-cyan-glow mb-2">{kicker}</div>}
        <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
