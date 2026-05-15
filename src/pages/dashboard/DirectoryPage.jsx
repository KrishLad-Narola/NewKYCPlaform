import { Link } from "react-router-dom";
import { useState } from "react";
import { PageHeader, Panel, StatusBadge } from "@/components/ui-kit";
import { businesses } from "@/lib/mock-data";
import { Search, Filter, MapPin, ArrowUpRight } from "lucide-react";

export default function DirectoryPage() {
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState("All");
  const [scoreMin, setScoreMin] = useState(0);

  const industries = ["All", ...new Set(businesses.map((b) => b.industry))];
  const filtered = businesses.filter((b) =>
    (industry === "All" || b.industry === industry) &&
    b.trustScore >= scoreMin &&
    (b.name.toLowerCase().includes(q.toLowerCase()) || b.industry.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <>
      <PageHeader kicker="Network" title="Business Directory" description="Discover and verify businesses across the Trustline network. Every profile is registry-validated." />

      <Panel className="mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or industry…" className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/[0.03] border border-slate-900/[0.08] focus:outline-none focus:border-primary/50" />
          </div>
          <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="px-4 py-2.5 rounded-xl bg-slate-900/[0.03] border border-slate-900/[0.08]">
            {industries.map((i) => <option key={i} className="bg-surface">{i}</option>)}
          </select>
        </div>
        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          <Filter className="h-3.5 w-3.5" />
          <span>Min trust score:</span>
          <input type="range" min={0} max={100} value={scoreMin} onChange={(e) => setScoreMin(+e.target.value)} className="flex-1 max-w-xs accent-cyan-glow" />
          <span className="font-mono text-foreground tabular-nums">{scoreMin}</span>
        </div>
      </Panel>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((b) => (
          <Link to={`/profile/${b.id}`} key={b.id} className="glass rounded-2xl p-5 hover:bg-slate-900/[0.04] hover:border-primary/30 transition group">
            <div className="flex items-start justify-between">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-cyan-glow grid place-items-center font-display font-semibold shadow-glow">{b.logo}</div>
              <div className={`text-right`}>
                <div className={`font-mono text-2xl font-semibold ${b.trustScore >= 75 ? "text-success" : b.trustScore >= 50 ? "text-warning" : "text-danger"}`}>{b.trustScore}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Trust</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="font-medium">{b.name}</div>
              <div className="text-xs text-muted-foreground">{b.industry}</div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2"><MapPin className="h-3 w-3" /> {b.location}</div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <StatusBadge status={b.kycStatus} />
              <div className="text-xs text-cyan-glow inline-flex items-center gap-1 group-hover:gap-2 transition-all">View profile <ArrowUpRight className="h-3 w-3" /></div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
