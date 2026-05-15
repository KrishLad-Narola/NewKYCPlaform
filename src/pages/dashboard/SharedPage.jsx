import { PageHeader, Panel } from "@/components/ui-kit";
import { businesses } from "@/lib/mock-data";
import { Link2, Copy, Eye } from "lucide-react";
import { toast } from "sonner";

export default function SharedPage() {
  const copy = (id) => {
    navigator.clipboard?.writeText(`${window.location.origin}/profile/${id}`);
    toast.success("Public profile link copied");
  };
  return (
    <>
      <PageHeader kicker="Distribution" title="Shared Profiles" description="Permissioned, public-facing trust profiles you've shared with counterparties." />
      <div className="grid md:grid-cols-2 gap-4">
        {businesses.slice(0, 4).map((b) => (
          <Panel key={b.id}>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-cyan-glow grid place-items-center font-display font-semibold shadow-glow">{b.logo}</div>
              <div className="flex-1">
                <div className="font-medium">{b.name}</div>
                <div className="text-xs text-muted-foreground">{b.industry}</div>
              </div>
              <div className="text-xs font-mono text-muted-foreground"><Eye className="h-3 w-3 inline mr-1" />{Math.floor(Math.random() * 80) + 20} views</div>
            </div>
            <div className="mt-4 flex items-center gap-2 glass rounded-xl px-3 py-2 text-xs font-mono text-muted-foreground">
              <Link2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">trustline.io/profile/{b.id}</span>
              <button onClick={() => copy(b.id)} className="ml-auto h-7 w-7 grid place-items-center rounded-md hover:bg-slate-900/[0.06]"><Copy className="h-3.5 w-3.5" /></button>
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
