import { Link } from "react-router-dom";
import { PageHeader, Panel, StatCard, StatusBadge } from "@/components/ui-kit";
import { businesses, kycDocuments, deals, auditLogs } from "@/lib/mock-data";
import { Users, ShieldCheck, AlertOctagon, Flag, ArrowUpRight } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const verifByDay = [
  { d: "Mon", v: 14, r: 2 }, { d: "Tue", v: 18, r: 1 }, { d: "Wed", v: 22, r: 3 },
  { d: "Thu", v: 19, r: 2 }, { d: "Fri", v: 27, r: 4 }, { d: "Sat", v: 12, r: 1 }, { d: "Sun", v: 8, r: 0 },
];

export default function AdminHome() {
  const pending = kycDocuments.filter((d) => d.status === "pending").length;
  const flagged = businesses.filter((b) => b.trustScore < 50).length;
  const disputed = deals.filter((d) => d.status === "disputed").length;

  return (
    <>
      <PageHeader kicker="Operator Console" title="System Operations" description="Real-time platform health, verification throughput, and intervention queues." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total businesses" value={businesses.length.toLocaleString() + "K"} hint="↑ 4.2% wow" accent="primary" icon={<Users className="h-5 w-5" />} />
        <StatCard label="Pending verifications" value={pending} hint="SLA 24h" accent="warning" icon={<ShieldCheck className="h-5 w-5" />} />
        <StatCard label="Flagged accounts" value={flagged} hint="Manual review" accent="danger" icon={<Flag className="h-5 w-5" />} />
        <StatCard label="Active disputes" value={disputed} hint="Avg 3d to close" accent="primary" icon={<AlertOctagon className="h-5 w-5" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Panel className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Verification throughput</h3>
            <div className="text-xs font-mono text-muted-foreground">Last 7 days</div>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={verifByDay}>
                <CartesianGrid stroke="oklch(1 0 0 / 0.05)" />
                <XAxis dataKey="d" stroke="oklch(0.70 0.02 255)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.70 0.02 255)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.22 0.04 260 / 0.10)", borderRadius: 12 }} />
                <Bar dataKey="v" fill="oklch(0.62 0.20 260)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="r" fill="oklch(0.65 0.22 25)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <h3 className="font-display text-lg font-semibold mb-4">Verification queue</h3>
          <div className="space-y-3">
            {kycDocuments.filter((d) => d.status === "pending").slice(0, 5).map((d) => (
              <Link to="/admin/kyc" key={d.id} className="block glass rounded-xl p-3 hover:bg-slate-900/[0.04] transition">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-mono text-muted-foreground">{d.id.toUpperCase()}</div>
                  <StatusBadge status={d.status} />
                </div>
                <div className="text-sm">{d.type}</div>
                <div className="text-[10px] font-mono text-muted-foreground mt-1">{d.uploadedAt}</div>
              </Link>
            ))}
            <Link to="/admin/kyc" className="text-xs text-cyan-glow inline-flex items-center gap-1 hover:gap-2 transition-all">Open queue <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
        </Panel>

        <Panel className="lg:col-span-3">
          <h3 className="font-display text-lg font-semibold mb-4">System alerts</h3>
          <div className="space-y-2">
            {auditLogs.slice(0, 5).map((l) => (
              <div key={l.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-900/[0.06] last:border-0">
                <div className="flex items-center gap-3">
                  <div className="font-mono text-[10px] text-muted-foreground w-16">{l.id}</div>
                  <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-full bg-primary/15 text-cyan-glow">{l.type}</span>
                  <span>{l.target}</span>
                </div>
                <div className="text-xs font-mono text-muted-foreground">{l.timestamp}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
