import { useState } from "react";
import { PageHeader, Panel } from "@/components/ui-kit";
import { TrustGauge } from "@/components/trust-gauge";
import { trustBreakdown, trustHistory, riskFlags } from "@/lib/mock-data";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ChevronDown, AlertTriangle } from "lucide-react";

const faqs = [
  { q: "What affects my trust score?", a: "Your score blends KYC authenticity (40%), legal compliance (30%), and transaction history (30%). Each factor is updated continuously from primary registries and on-platform deal performance." },
  { q: "How often is my score recalculated?", a: "Scores are recomputed in real-time on any verified event — new deal completion, document refresh, dispute resolution, or external risk signal." },
  { q: "Can a counterparty see all my documents?", a: "No. Only verification status is shared by default. Full document access requires explicit permission grant via Shared Profiles." },
  { q: "How do I improve my score?", a: "Resolve open risk flags, complete pending KYC artefacts, and close active deals successfully. Most businesses see a 5–10 point lift within 60 days." },
];

export default function TrustPage() {
  const [open, setOpen] = useState(0);

  return (
    <>
      <PageHeader kicker="Trust Intelligence" title="Trust Score" description="Composite signal of authenticity, compliance, and operational performance — benchmarked across the Trustline network." />

      <div className="grid lg:grid-cols-3 gap-6">
        <Panel className="lg:col-span-1 flex flex-col items-center text-center" glow>
          <TrustGauge score={85} size={260} className="mb-4" />
          <div className="text-sm text-muted-foreground">Top <span className="text-foreground font-medium">12%</span> in Logistics</div>
          <div className="grid grid-cols-3 gap-3 mt-6 w-full">
            {[{ l: "30d", v: "+3" }, { l: "90d", v: "+7" }, { l: "1y", v: "+14" }].map((s) => (
              <div key={s.l} className="glass rounded-xl py-2.5">
                <div className="text-[10px] uppercase text-muted-foreground">{s.l}</div>
                <div className="font-mono text-success font-semibold">{s.v}</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="lg:col-span-2">
          <h3 className="font-display text-lg font-semibold mb-4">Score breakdown</h3>
          <div className="space-y-4">
            {trustBreakdown.map((b) => {
              const pct = (b.score / b.max) * 100;
              return (
                <div key={b.factor}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{b.factor}</span>
                      <span className="text-[10px] font-mono uppercase text-muted-foreground">{b.weight}% weight</span>
                    </div>
                    <span className="font-mono">{b.score}/{b.max}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-900/[0.03] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-cyan-glow rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel className="lg:col-span-2">
          <h3 className="font-display text-lg font-semibold mb-4">12-month history</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={trustHistory}>
                <CartesianGrid stroke="oklch(1 0 0 / 0.05)" />
                <XAxis dataKey="month" stroke="oklch(0.70 0.02 255)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[60, 100]} stroke="oklch(0.70 0.02 255)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.22 0.04 260 / 0.10)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="score" stroke="oklch(0.78 0.14 220)" strokeWidth={2.5} dot={{ fill: "oklch(0.62 0.20 260)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> Risk flags</h3>
          <div className="space-y-3">
            {riskFlags.map((f) => (
              <div key={f.id} className="glass rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium">{f.title}</div>
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${f.severity === "high" ? "text-danger bg-danger/15" : f.severity === "medium" ? "text-warning bg-warning/15" : "text-cyan-glow bg-cyan-glow/15"}`}>{f.severity}</span>
                </div>
                <div className="text-xs text-muted-foreground">{f.description}</div>
                <button className="mt-2 text-xs text-cyan-glow hover:underline">Resolve →</button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="lg:col-span-3">
          <h3 className="font-display text-lg font-semibold mb-2">Frequently asked</h3>
          <div className="divide-y divide-slate-900/[0.06]">
            {faqs.map((f, i) => (
              <div key={i} className="py-3">
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between text-left">
                  <span className="text-sm font-medium">{f.q}</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open === i ? "rotate-180" : ""}`} />
                </button>
                {open === i && <div className="text-sm text-muted-foreground mt-2 pr-8 animate-in fade-in slide-in-from-top-1">{f.a}</div>}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
