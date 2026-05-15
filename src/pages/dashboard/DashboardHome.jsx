import { Link } from "react-router-dom";
import { TrustGauge } from "@/components/trust-gauge";
import { Panel, PageHeader, StatCard, StatusBadge } from "@/components/ui-kit";
import { kycDocuments, deals, riskFlags, auditLogs, formatINR, trustHistory } from "@/lib/mock-data";
import { FileCheck2, CheckCircle2, Clock, XCircle, Upload, Plus, Share2, AlertTriangle, ArrowUpRight, Activity } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function DashboardHome() {
  const verified = kycDocuments.filter((d) => d.status === "verified").length;
  const pending = kycDocuments.filter((d) => d.status === "pending").length;
  const rejected = kycDocuments.filter((d) => d.status === "rejected").length;
  const active = deals.filter((d) => d.status === "active").length;

  return (
    <>
      <PageHeader
        kicker="Operational Overview"
        title="Welcome back, Helios Trade"
        description="Your trust posture, compliance signals, and counterparty intelligence — all in one place."
        actions={
          <>
            <Link to="/dashboard/kyc" className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass text-sm hover:bg-slate-900/[0.06] transition">
              <Upload className="h-4 w-4" /> Upload document
            </Link>
            <Link to="/dashboard/deals" className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-primary to-cyan-glow text-white text-sm font-medium shadow-glow">
              <Plus className="h-4 w-4" /> Create deal
            </Link>
          </>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trust Score */}
        <Panel className="lg:col-span-1 flex flex-col items-center text-center" glow>
          <div className="text-[11px] uppercase tracking-[0.25em] text-cyan-glow">Trust Index</div>
          <TrustGauge score={85} size={240} className="my-4" />
          <div className="flex items-center gap-2 text-xs text-success font-mono">
            <ArrowUpRight className="h-3 w-3" /> +3 over last 30 days
          </div>
          <Link to="/dashboard/trust" className="mt-4 text-xs text-cyan-glow hover:underline">Open Trust analytics →</Link>
        </Panel>

        {/* Stats */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          <StatCard label="Documents" value={kycDocuments.length} hint={`${verified} verified`} accent="primary" icon={<FileCheck2 className="h-5 w-5" />} />
          <StatCard label="Verified" value={verified} hint="Up to date" accent="success" icon={<CheckCircle2 className="h-5 w-5" />} />
          <StatCard label="Pending" value={pending} hint="Avg 2 days to clear" accent="warning" icon={<Clock className="h-5 w-5" />} />
          <StatCard label="Rejected" value={rejected} hint="Action required" accent="danger" icon={<XCircle className="h-5 w-5" />} />
        </div>

        {/* History chart */}
        <Panel className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">12-month performance</div>
              <h3 className="font-display text-lg font-semibold">Trust score trajectory</h3>
            </div>
            <div className="text-xs font-mono text-muted-foreground">Updated 2m ago</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={trustHistory}>
                <defs>
                  <linearGradient id="ts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.14 220)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.62 0.20 260)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(1 0 0 / 0.05)" />
                <XAxis dataKey="month" stroke="oklch(0.70 0.02 255)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[60, 100]} stroke="oklch(0.70 0.02 255)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.22 0.04 260 / 0.10)", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="score" stroke="oklch(0.78 0.14 220)" strokeWidth={2.5} fill="url(#ts)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Active deals + flags */}
        <Panel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Active deals</h3>
            <span className="text-xs font-mono text-cyan-glow">{active} live</span>
          </div>
          <div className="space-y-3">
            {deals.filter((d) => d.status === "active" || d.status === "disputed").map((d) => (
              <Link to="/dashboard/deals" key={d.id} className="block glass rounded-xl p-3 hover:bg-slate-900/[0.04] transition">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-mono text-[10px] text-muted-foreground">{d.id}</div>
                  <StatusBadge status={d.status} />
                </div>
                <div className="text-sm font-medium mt-1 truncate">{d.name}</div>
                <div className="flex items-center justify-between mt-1.5 text-xs">
                  <span className="text-muted-foreground truncate">{d.counterparty}</span>
                  <span className="font-mono text-foreground">{formatINR(d.value)}</span>
                </div>
              </Link>
            ))}
          </div>
        </Panel>

        {/* Risk flags */}
        <Panel className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> Risk signals</h3>
            <span className="text-xs font-mono text-warning">{riskFlags.length} active</span>
          </div>
          <div className="space-y-2">
            {riskFlags.map((f) => (
              <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/[0.03] border border-slate-900/[0.06]">
                <div className={`h-2 w-2 rounded-full ${f.severity === "high" ? "bg-danger" : f.severity === "medium" ? "bg-warning" : "bg-cyan-glow"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{f.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{f.description}</div>
                </div>
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                  f.severity === "high" ? "text-danger border-danger/40 bg-danger/10" :
                  f.severity === "medium" ? "text-warning border-warning/40 bg-warning/10" :
                  "text-cyan-glow border-cyan-glow/40 bg-cyan-glow/10"
                }`}>{f.severity}</span>
                <button className="text-xs text-cyan-glow hover:underline">Resolve</button>
              </div>
            ))}
          </div>
        </Panel>

        {/* Activity feed */}
        <Panel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2"><Activity className="h-4 w-4 text-cyan-glow" /> Recent activity</h3>
          </div>
          <div className="space-y-3">
            {auditLogs.slice(0, 5).map((l) => (
              <div key={l.id} className="flex items-start gap-3 text-sm">
                <div className="h-7 w-7 rounded-lg bg-primary/15 grid place-items-center shrink-0">
                  <Share2 className="h-3.5 w-3.5 text-cyan-glow" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate"><span className="text-foreground">{l.type}</span> · <span className="text-muted-foreground">{l.target}</span></div>
                  <div className="text-[10px] font-mono text-muted-foreground">{l.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Quick actions */}
        <Panel className="lg:col-span-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <QuickAction icon={Upload} title="Upload document" desc="Add new KYC artefact" to="/dashboard/kyc" />
            <QuickAction icon={Plus} title="Create deal" desc="Start a new agreement" to="/dashboard/deals" />
            <QuickAction icon={Share2} title="Share profile" desc="Send public trust link" to="/dashboard/shared" />
          </div>
        </Panel>
      </div>
    </>
  );
}

function QuickAction({ icon: Icon, title, desc, to }) {
  return (
    <Link to={to} className="group glass rounded-2xl p-4 flex items-center gap-4 hover:bg-slate-900/[0.04] hover:border-primary/30 transition">
      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-cyan-glow grid place-items-center shadow-glow">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-cyan-glow transition" />
    </Link>
  );
}
