import { useState } from "react";
import { PageHeader, Panel } from "@/components/ui-kit";
import { auditLogs } from "@/lib/mock-data";
import { Download, Calendar } from "lucide-react";
import { toast } from "sonner";

const colors = {
  "Document Upload": "text-cyan-glow bg-cyan-glow/10",
  "Profile View": "text-indigo-soft bg-indigo-soft/10",
  "Deal Created": "text-primary bg-primary/15",
  "Score Updated": "text-success bg-success/10",
  "Verification": "text-warning bg-warning/10",
  "Login": "text-muted-foreground bg-slate-900/[0.03]",
};

export default function AuditPage() {
  const [filter, setFilter] = useState("All");
  const types = ["All", ...new Set(auditLogs.map((l) => l.type))];
  const rows = filter === "All" ? auditLogs : auditLogs.filter((l) => l.type === filter);

  const exportCsv = () => {
    const csv = ["id,type,actor,target,timestamp", ...rows.map((r) => `${r.id},${r.type},${r.actor},${r.target},${r.timestamp}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "audit-logs.csv"; a.click();
    toast.success("CSV exported");
  };

  return (
    <>
      <PageHeader kicker="Compliance" title="Audit Logs" description="Immutable, time-stamped record of every action across your account."
        actions={<button onClick={exportCsv} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass text-sm hover:bg-slate-900/[0.06]"><Download className="h-4 w-4" /> Export CSV</button>} />

      <Panel className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" /> Last 30 days
          </div>
          <div className="flex flex-wrap gap-1.5">
            {types.map((t) => (
              <button key={t} onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-full text-xs border transition ${filter === t ? "bg-gradient-to-r from-primary to-cyan-glow text-white border-transparent shadow-glow" : "glass text-muted-foreground hover:text-foreground"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      <Panel className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground bg-slate-900/[0.02]">
            <tr>
              <th className="px-5 py-3 font-medium">ID</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Actor</th>
              <th className="px-5 py-3 font-medium">Target</th>
              <th className="px-5 py-3 font-medium">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className="border-t border-slate-900/[0.06] hover:bg-slate-900/[0.03]">
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{l.id}</td>
                <td className="px-5 py-3"><span className={`text-[11px] font-mono uppercase px-2 py-1 rounded-full ${colors[l.type]}`}>{l.type}</span></td>
                <td className="px-5 py-3 font-mono text-xs">{l.actor}</td>
                <td className="px-5 py-3">{l.target}</td>
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{l.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
