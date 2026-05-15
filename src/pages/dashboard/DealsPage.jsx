import { useState } from "react";
import { PageHeader, Panel, StatusBadge } from "@/components/ui-kit";
import { deals, businesses, formatINR } from "@/lib/mock-data";
import { Plus, X, Handshake, Calendar, TrendingUp, AlertOctagon, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function DealsPage() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [dispute, setDispute] = useState(false);

  return (
    <>
      <PageHeader kicker="Pipeline" title="My Deals" description="Track active, completed, and disputed agreements with verified counterparties."
        actions={<button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-primary to-cyan-glow text-white text-sm font-medium shadow-glow"><Plus className="h-4 w-4" /> New deal</button>} />

      <Panel className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground bg-slate-900/[0.02]">
            <tr>
              <th className="px-5 py-3 font-medium">Deal</th>
              <th className="px-5 py-3 font-medium">Counterparty</th>
              <th className="px-5 py-3 font-medium">Value</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Created</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((d) => (
              <tr key={d.id} className="border-t border-slate-900/[0.06] hover:bg-slate-900/[0.03] transition cursor-pointer" onClick={() => setSelected(d)}>
                <td className="px-5 py-4">
                  <div className="font-medium">{d.name}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">{d.id}</div>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{d.counterparty}</td>
                <td className="px-5 py-4 font-mono">{formatINR(d.value)}</td>
                <td className="px-5 py-4"><StatusBadge status={d.status} /></td>
                <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{d.createdAt}</td>
                <td className="px-5 py-4 text-right">
                  <button className="text-xs text-cyan-glow hover:underline">View →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      {open && <CreateDealModal onClose={() => setOpen(false)} />}
      {selected && <DealDetail d={selected} onClose={() => setSelected(null)} onDispute={() => setDispute(true)} />}
      {dispute && <DisputeModal onClose={() => setDispute(false)} />}
    </>
  );
}

function CreateDealModal({ onClose }) {
  return (
    <Modal onClose={onClose} title="Create deal" kicker="New agreement">
      <form onSubmit={(e) => { e.preventDefault(); toast.success("Deal draft created"); onClose(); }} className="space-y-4">
        <Input label="Deal title" placeholder="Q1 Component Supply Agreement" />
        <div>
          <label className="text-xs text-muted-foreground">Counterparty</label>
          <select className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-slate-900/[0.03] border border-slate-900/[0.08] focus:outline-none focus:border-primary/50">
            {businesses.map((b) => <option key={b.id} value={b.id} className="bg-surface">{b.name} · Trust {b.trustScore}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Deal value (INR)" placeholder="2500000" />
          <Input label="Expected completion" type="date" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Description</label>
          <textarea rows={3} className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-slate-900/[0.03] border border-slate-900/[0.08] focus:outline-none focus:border-primary/50" placeholder="Brief scope and terms…" />
        </div>
        <button className="w-full mt-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-cyan-glow text-white text-sm font-medium shadow-glow">Create draft</button>
      </form>
    </Modal>
  );
}

function DealDetail({ d, onClose, onDispute }) {
  return (
    <Modal onClose={onClose} title={d.name} kicker={d.id} wide>
      <div className="flex items-center gap-3 mb-5">
        <StatusBadge status={d.status} />
        <span className="text-sm text-muted-foreground">{d.counterparty}</span>
        <span className="font-mono text-sm">{formatINR(d.value)}</span>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Stat icon={Calendar} label="Created" value={d.createdAt} />
        <Stat icon={TrendingUp} label="Value" value={formatINR(d.value)} />
        <Stat icon={Handshake} label="Counterparty" value={d.counterparty} />
      </div>

      <div className="text-sm text-muted-foreground mb-6">{d.description}</div>

      <h4 className="font-display font-semibold mb-3">Activity timeline</h4>
      <div className="space-y-3 mb-6 border-l-2 border-slate-900/[0.08] pl-4">
        {[
          { t: "Deal created", d: d.createdAt },
          { t: "Counterparty accepted terms", d: "2025-10-14" },
          { t: "First milestone delivered", d: "2025-10-28" },
          { t: "Payment received (40%)", d: "2025-11-02" },
        ].map((e, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full bg-cyan-glow shadow-glow" />
            <div className="text-sm">{e.t}</div>
            <div className="text-[10px] font-mono text-muted-foreground">{e.d}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 justify-end">
        <button onClick={onDispute} className="px-3.5 py-2 rounded-xl glass text-sm text-danger hover:bg-danger/10 inline-flex items-center gap-2">
          <AlertOctagon className="h-4 w-4" /> Raise dispute
        </button>
        <button onClick={() => { toast.success("Deal marked complete"); onClose(); }} className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-primary to-cyan-glow text-white text-sm font-medium shadow-glow inline-flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> Mark complete
        </button>
      </div>
    </Modal>
  );
}

function DisputeModal({ onClose }) {
  return (
    <Modal onClose={onClose} title="Raise dispute" kicker="Formal escalation">
      <form onSubmit={(e) => { e.preventDefault(); toast.success("Dispute submitted to compliance team"); onClose(); }} className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground">Reason</label>
          <select className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-slate-900/[0.03] border border-slate-900/[0.08]">
            {["Non-delivery", "Quality issues", "Payment default", "Misrepresentation", "Other"].map((o) => <option key={o} className="bg-surface">{o}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Description</label>
          <textarea rows={4} className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-slate-900/[0.03] border border-slate-900/[0.08]" placeholder="Provide detailed context…" />
        </div>
        <button className="w-full px-4 py-2.5 rounded-xl bg-danger/90 hover:bg-danger text-white text-sm font-medium">Submit dispute</button>
      </form>
    </Modal>
  );
}

function Modal({ children, onClose, title, kicker, wide }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={`glass-strong rounded-3xl w-full ${wide ? "max-w-2xl" : "max-w-lg"} p-6 shadow-card`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-cyan-glow">{kicker}</div>
            <h3 className="font-display text-xl font-semibold">{title}</h3>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg grid place-items-center hover:bg-slate-900/[0.03]"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, ...p }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input {...p} className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-slate-900/[0.03] border border-slate-900/[0.08] focus:outline-none focus:border-primary/50" />
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="glass rounded-xl p-3 flex items-center gap-3">
      <Icon className="h-4 w-4 text-cyan-glow" />
      <div>
        <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
