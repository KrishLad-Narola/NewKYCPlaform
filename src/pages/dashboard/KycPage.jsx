import { useEffect, useRef, useState } from "react";
import { PageHeader, Panel, StatusBadge } from "@/components/ui-kit";
import { kycDocuments } from "@/lib/mock-data";
import {
  Upload, FileText, Eye, Download, RefreshCw, AlertTriangle, X, CloudUpload,
  Loader2, Check, ScanLine, ShieldCheck, FileWarning, CircleAlert, Info,
} from "lucide-react";
import { toast } from "sonner";

const tabs = ["All", "GST Certificate", "PAN Card", "Incorporation Certificate", "Bank Proof"];

export default function KycPage() {
  const [tab, setTab] = useState("All");
  const [open, setOpen] = useState(false);
  const filtered = tab === "All" ? kycDocuments : kycDocuments.filter((d) => d.type === tab);

  const expiring = kycDocuments.filter((d) => {
    const days = (new Date(d.expiresAt).getTime() - Date.now()) / 86400000;
    return days < 60 && days > 0;
  });

  return (
    <>
      <PageHeader
        kicker="Compliance"
        title="KYC Documents"
        description="Manage business verification artefacts. OCR extraction and government registry sync run automatically."
        actions={
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-primary to-cyan-glow text-white text-sm font-medium shadow-glow">
            <Upload className="h-4 w-4" /> Upload document
          </button>
        }
      />

      {expiring.length > 0 && (
        <div className="glass rounded-2xl p-4 mb-6 border-l-4 border-warning flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          <div className="text-sm">
            <span className="font-medium">{expiring.length} document{expiring.length > 1 ? "s" : ""}</span>{" "}
            <span className="text-muted-foreground">expiring within 60 days · review recommended</span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-5">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition ${
              tab === t ? "bg-gradient-to-r from-primary to-cyan-glow text-white border-transparent shadow-glow" : "glass text-muted-foreground hover:text-foreground"
            }`}>
            {t}
          </button>
        ))}
      </div>

      <Panel className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground bg-slate-900/[0.02]">
            <tr>
              <th className="px-5 py-3 font-medium">Document</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Uploaded</th>
              <th className="px-5 py-3 font-medium">Expires</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => <DocRow key={d.id} d={d} />)}
          </tbody>
        </table>
      </Panel>

      {open && <UploadModal onClose={() => setOpen(false)} />}
    </>
  );
}

function DocRow({ d }) {
  return (
    <tr className="border-t border-slate-900/[0.06] hover:bg-slate-900/[0.02] transition">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center text-primary">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">{d.name}</div>
            <div className="text-[10px] font-mono text-muted-foreground">{d.id.toUpperCase()}</div>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 text-muted-foreground">{d.type}</td>
      <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{d.uploadedAt}</td>
      <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{d.expiresAt}</td>
      <td className="px-5 py-4"><StatusBadge status={d.status} /></td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1 justify-end">
          <IconBtn icon={Eye} label="View" />
          <IconBtn icon={RefreshCw} label="Re-upload" />
          <IconBtn icon={Download} label="Download" />
        </div>
      </td>
    </tr>
  );
}

function IconBtn({ icon: Icon, label }) {
  return (
    <button title={label} className="h-8 w-8 rounded-lg grid place-items-center text-muted-foreground hover:text-foreground hover:bg-slate-900/[0.05] transition">
      <Icon className="h-4 w-4" />
    </button>
  );
}

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED_MIME = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
const ACCEPTED_EXT = [".pdf", ".png", ".jpg", ".jpeg"];

const docTypeOptions = ["GST Certificate", "PAN Card", "Incorporation Certificate", "Bank Proof"];

const validators = {
  "GST Certificate":           { field: "GSTIN", regex: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, example: "27AAACH1234A1Z9" },
  "PAN Card":                  { field: "PAN",   regex: /^[A-Z]{5}[0-9]{4}[A-Z]$/,                                     example: "AAACH1234A" },
  "Incorporation Certificate": { field: "CIN",   regex: /^[A-Z][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/,            example: "U74999MH2018PLC312841" },
  "Bank Proof":                { field: "IFSC",  regex: /^[A-Z]{4}0[A-Z0-9]{6}$/,                                      example: "HDFC0001234" },
};

function bytesToHuman(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

function UploadModal({ onClose }) {
  const [stage, setStage] = useState("drop");
  const [docType, setDocType] = useState("GST Certificate");
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState([]);
  const [edits, setEdits] = useState({});
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);
  const abortRef = useRef({ aborted: false });

  useEffect(() => () => { abortRef.current.aborted = true; }, []);

  const validateFile = (f) => {
    const ext = "." + (f.name.split(".").pop() || "").toLowerCase();
    if (!ACCEPTED_EXT.includes(ext) && !ACCEPTED_MIME.includes(f.type)) {
      return `Unsupported file type "${ext || f.type || "unknown"}". Allowed: PDF, PNG, JPG.`;
    }
    if (f.size === 0) return "File appears to be empty (0 bytes).";
    if (f.size > MAX_BYTES) return `File is ${bytesToHuman(f.size)} — limit is ${bytesToHuman(MAX_BYTES)}.`;
    if (f.name.length > 120) return "Filename is too long (max 120 chars).";
    return null;
  };

  const runPipeline = async (f) => {
    abortRef.current = { aborted: false };
    setError(null);
    setProgress(0);
    setStage("validating");

    await wait(450);
    if (abortRef.current.aborted) return;

    setStage("uploading");
    for (let p = 0; p <= 100; p += 8) {
      await wait(60);
      if (abortRef.current.aborted) return;
      setProgress(Math.min(p, 100));
    }
    toast.success("File uploaded · encrypted at rest", { description: f.name });

    setStage("ocr");
    await wait(1400);
    if (abortRef.current.aborted) return;

    setStage("registry");
    await wait(1000);
    if (abortRef.current.aborted) return;

    const name = f.name.toLowerCase();
    if (name.includes("blur") || name.includes("scan_fail")) {
      return finishError("OCR confidence too low", "We couldn't extract enough text from this scan. Try a higher-resolution copy (≥300 DPI) or a PDF instead of a photo.");
    }
    if (name.includes("expired")) {
      return finishError("Document expired", "The document's validity date is in the past. Upload the latest version issued by the authority.");
    }
    if (name.includes("mismatch")) {
      return finishError("Registry mismatch", "Extracted ID was not found on the official registry. Please verify the document or contact compliance@trustline.io.");
    }

    const v = validators[docType];
    const guessed = mockExtract(docType);
    const conf = {};
    Object.keys(guessed).forEach((k) => (conf[k] = 0.82 + Math.random() * 0.17));
    const fieldsArr = Object.entries(guessed).map(([k, val]) => ({
      key: k,
      value: val,
      confidence: +(conf[k]).toFixed(2),
      ok: k === v.field ? v.regex.test(val) : true,
    }));
    setFields(fieldsArr);
    setEdits(Object.fromEntries(fieldsArr.map((f) => [f.key, f.value])));
    setStage("preview");
    toast.info("Extraction complete · review fields", { description: `${fieldsArr.length} fields detected` });
  };

  const finishError = (title, detail) => {
    setError({ title, detail });
    setStage("error");
    toast.error(title, { description: detail });
  };

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    const err = validateFile(f);
    if (err) { toast.error("Upload rejected", { description: err }); return; }
    setFile(f);
    runPipeline(f);
  };

  const cancel = () => {
    abortRef.current.aborted = true;
    setStage("drop");
    setFile(null);
    setProgress(0);
    toast.info("Upload cancelled");
  };

  const submit = () => {
    const v = validators[docType];
    const editedPrimary = edits[v.field];
    if (editedPrimary && !v.regex.test(editedPrimary)) {
      toast.error(`Invalid ${v.field}`, { description: `Expected format like ${v.example}.` });
      return;
    }
    toast.success("Document submitted for verification", { description: "Verification SLA: under 24 hours." });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="glass-strong rounded-3xl w-full max-w-xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-900/[0.06]">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-primary">Secure upload</div>
            <h3 className="font-display text-xl font-semibold mt-0.5">Add KYC document</h3>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg grid place-items-center hover:bg-slate-900/[0.05]"><X className="h-4 w-4" /></button>
        </div>

        <div className="px-6 pt-4">
          <Stepper stage={stage} />
        </div>

        <div className="p-6 pt-4">
          {stage === "drop" && (
            <>
              <div className="mb-4">
                <label className="text-xs text-muted-foreground">Document type</label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  {docTypeOptions.map((t) => (
                    <button key={t} onClick={() => setDocType(t)}
                      className={`px-3 py-2 rounded-xl text-xs text-left border transition ${
                        docType === t ? "border-primary/40 bg-primary/5 text-foreground shadow-[0_0_0_3px_oklch(0.55_0.20_262_/_0.10)]" : "border-slate-900/[0.08] hover:border-slate-900/[0.12] text-muted-foreground"
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <input ref={inputRef} type="file" hidden accept={ACCEPTED_EXT.join(",")}
                onChange={(e) => handleFiles(e.target.files)} />
              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
                className={`cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition ${
                  drag ? "border-primary bg-primary/5" : "border-slate-900/[0.12] hover:border-primary/40 hover:bg-primary/[0.03]"
                }`}>
                <CloudUpload className="h-10 w-10 text-primary mx-auto mb-3" />
                <div className="font-medium">Drop your file here or click to browse</div>
                <div className="text-xs text-muted-foreground mt-1">PDF · PNG · JPG · max {bytesToHuman(MAX_BYTES)}</div>
              </div>
              <div className="mt-3 flex items-start gap-2 text-[11px] text-muted-foreground">
                <Info className="h-3.5 w-3.5 mt-px shrink-0 text-primary" />
                <span>Files are encrypted in transit and at rest. We extract structured fields via OCR and validate them against the {validators[docType].field} registry.</span>
              </div>
            </>
          )}

          {stage === "validating" && (
            <Centered icon={<ShieldCheck className="h-7 w-7 text-primary" />}
              title="Verifying file integrity" detail="Running anti-virus and signature checks…" />
          )}

          {stage === "uploading" && (
            <div className="py-2">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center text-primary"><Loader2 className="h-5 w-5 animate-spin" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{file?.name}</div>
                  <div className="text-[11px] font-mono text-muted-foreground">{file ? bytesToHuman(file.size) : ""} · uploading securely</div>
                </div>
                <div className="font-mono text-sm tabular-nums">{progress}%</div>
              </div>
              <div className="h-2 rounded-full bg-slate-900/[0.06] overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-cyan-glow transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-4 flex justify-end">
                <button onClick={cancel} className="text-xs text-muted-foreground hover:text-danger transition">Cancel upload</button>
              </div>
            </div>
          )}

          {stage === "ocr" && (
            <Centered
              icon={<ScanLine className="h-7 w-7 text-primary animate-pulse" />}
              title="Running OCR engine" detail="Detecting text regions and extracting fields…"
              chips={["Layout analysis", "Text recognition", "Field detection"]}
            />
          )}

          {stage === "registry" && (
            <Centered
              icon={<ShieldCheck className="h-7 w-7 text-primary" />}
              title="Cross-checking with registry" detail={`Validating ${validators[docType].field} with the official registry…`}
              chips={["Format check", "Registry lookup", "Status sync"]}
            />
          )}

          {stage === "preview" && (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-muted-foreground">Extracted fields · review and edit if needed</div>
                <div className="text-[11px] font-mono text-success flex items-center gap-1"><Check className="h-3 w-3" /> OCR successful</div>
              </div>
              <div className="rounded-xl border border-slate-900/[0.08] divide-y divide-slate-900/[0.06]">
                {fields.map((f) => {
                  const v = validators[docType];
                  const isPrimary = f.key === v.field;
                  const current = edits[f.key] ?? f.value;
                  const valid = !isPrimary || v.regex.test(current);
                  const lowConf = f.confidence < 0.88;
                  return (
                    <div key={f.key} className="px-4 py-3 flex items-center gap-3">
                      <div className="w-32 text-xs text-muted-foreground">{f.key}</div>
                      <div className="flex-1">
                        <input value={current}
                          onChange={(e) => setEdits((p) => ({ ...p, [f.key]: e.target.value }))}
                          className={`w-full px-3 py-1.5 rounded-lg bg-white border font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                            !valid ? "border-danger/50 bg-danger/[0.03]" : "border-slate-900/[0.10]"
                          }`} />
                        {!valid && (
                          <div className="mt-1 text-[11px] text-danger flex items-center gap-1">
                            <CircleAlert className="h-3 w-3" /> Expected format like {v.example}
                          </div>
                        )}
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full whitespace-nowrap ${
                        lowConf ? "bg-warning/15 text-warning" : "bg-success/15 text-success"
                      }`}>{Math.round(f.confidence * 100)}%</span>
                    </div>
                  );
                })}
              </div>

              {fields.some((f) => f.confidence < 0.88) && (
                <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-warning/10 border border-warning/30">
                  <FileWarning className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-medium text-warning">Low-confidence fields detected</div>
                    <div className="text-muted-foreground mt-0.5">Review highlighted fields before submitting. Editing will improve future extractions.</div>
                  </div>
                </div>
              )}

              <div className="mt-5 flex items-center justify-between">
                <button onClick={() => { setStage("drop"); setFile(null); }} className="text-xs text-muted-foreground hover:text-foreground transition">
                  ← Upload different file
                </button>
                <button onClick={submit}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-cyan-glow text-white text-sm font-medium shadow-glow">
                  <Check className="h-4 w-4" /> Confirm & submit
                </button>
              </div>
            </>
          )}

          {stage === "error" && error && (
            <div className="py-2">
              <div className="rounded-2xl border border-danger/30 bg-danger/5 p-5 flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-danger/15 grid place-items-center text-danger shrink-0">
                  <CircleAlert className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-danger">{error.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">{error.detail}</div>
                  {file && <div className="mt-2 text-[11px] font-mono text-muted-foreground">File: {file.name} · {bytesToHuman(file.size)}</div>}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <button onClick={() => { setStage("drop"); setFile(null); setError(null); }} className="text-xs text-muted-foreground hover:text-foreground">← Try a different file</button>
                <button onClick={() => file && runPipeline(file)} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass text-sm hover:bg-slate-900/[0.04]">
                  <RefreshCw className="h-3.5 w-3.5" /> Retry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Centered({ icon, title, detail, chips }) {
  return (
    <div className="py-8 text-center">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 grid place-items-center mx-auto animate-pulse-ring">
        {icon}
      </div>
      <div className="mt-4 font-medium">{title}</div>
      <div className="text-xs text-muted-foreground mt-1">{detail}</div>
      {chips && (
        <div className="mt-4 flex justify-center flex-wrap gap-1.5">
          {chips.map((c) => <span key={c} className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full bg-primary/10 text-primary">{c}</span>)}
        </div>
      )}
    </div>
  );
}

const stageOrder = ["drop", "uploading", "ocr", "registry", "preview"];
const stageLabels = { drop: "Select", validating: "Verify", uploading: "Upload", ocr: "OCR", registry: "Validate", preview: "Review", error: "Error" };

function Stepper({ stage }) {
  const active = stage === "validating" ? "uploading" : stage === "error" ? "preview" : stage;
  const idx = stageOrder.indexOf(active);
  return (
    <div className="flex items-center gap-1.5 mb-2">
      {stageOrder.map((s, i) => {
        const done = i < idx;
        const current = i === idx;
        const isError = stage === "error" && i === idx;
        return (
          <div key={s} className="flex items-center gap-1.5 flex-1 last:flex-none">
            <div className={`h-6 w-6 rounded-full grid place-items-center text-[10px] font-mono border transition ${
              isError ? "bg-danger text-white border-danger" :
              done ? "bg-success text-white border-success" :
              current ? "bg-gradient-to-br from-primary to-cyan-glow text-white border-transparent shadow-glow" :
              "border-slate-900/[0.10] text-muted-foreground"
            }`}>
              {done ? <Check className="h-3 w-3" /> : i + 1}
            </div>
            <div className={`text-[10px] uppercase tracking-widest ${current ? "text-foreground" : "text-muted-foreground"}`}>{stageLabels[s]}</div>
            {i < stageOrder.length - 1 && <div className={`flex-1 h-px ${i < idx ? "bg-success/40" : "bg-slate-900/[0.08]"}`} />}
          </div>
        );
      })}
    </div>
  );
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function mockExtract(t) {
  if (t === "GST Certificate") return { GSTIN: "27AAACH1234A1Z9", "Legal Name": "Helios Trade Networks Pvt Ltd", State: "Maharashtra", "Valid Until": "2026-09-11" };
  if (t === "PAN Card") return { PAN: "AAACH1234A", Name: "Helios Trade Networks Pvt Ltd", "Date of Issue": "2018-04-22" };
  if (t === "Incorporation Certificate") return { CIN: "U74999MH2018PLC312841", "Company Name": "Helios Trade Networks Pvt Ltd", "Date of Incorporation": "2018-03-10" };
  return { IFSC: "HDFC0001234", "Account Holder": "Helios Trade Networks Pvt Ltd", Bank: "HDFC Bank", "Account Type": "Current" };
}
