import { useRef, useState } from "react";
import { PageHeader, Panel } from "@/components/ui-kit";
import {
  Bell,
  Eye,
  Key,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [prefs, setPrefs] = useState({
    verifications: true,
    deals: true,
    score: true,
    flags: true,
  });

  const [vis, setVis] = useState("Summary");

  // Logo upload state
  const [logo, setLogo] = useState(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate image type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    // Validate image size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    // Create preview URL
    const imageUrl = URL.createObjectURL(file);

    setLogo(imageUrl);

    toast.success("Logo uploaded successfully");
  };

  return (
    <>
      <PageHeader
        kicker="Configuration"
        title="Settings"
        description="Manage account, privacy, notifications, and developer access."
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile */}
        <Panel>
          <h3 className="font-display text-lg font-semibold mb-4">
            Profile
          </h3>

          <div className="flex items-center gap-4 mb-5">
            {/* Logo Preview */}
            <div className="h-16 w-16 rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-cyan-glow shadow-glow">
              {logo ? (
                <img
                  src={logo}
                  alt="Company logo"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full grid place-items-center text-xl font-display font-semibold text-white">
                  HT
                </div>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              className="hidden"
            />

            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl glass text-sm hover:bg-slate-900/[0.06]"
            >
              <Upload className="h-4 w-4" />
              Upload logo
            </button>
          </div>

          <Input
            label="Company name"
            defaultValue="Helios Trade Networks"
          />

          <Input
            label="Industry"
            defaultValue="Logistics & Supply Chain"
          />

          <Input
            label="Website"
            defaultValue="https://helios-trade.com"
          />
        </Panel>

        {/* Notifications */}
        <Panel>
          <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-cyan-glow" />
            Notifications
          </h3>

          {[
            {
              k: "verifications",
              l: "Verification updates",
            },
            {
              k: "deals",
              l: "Deal activity",
            },
            {
              k: "score",
              l: "Trust score changes",
            },
            {
              k: "flags",
              l: "Risk flag alerts",
            },
          ].map(({ k, l }) => (
            <Toggle
              key={k}
              label={l}
              checked={prefs[k]}
              onChange={(v) =>
                setPrefs((p) => ({
                  ...p,
                  [k]: v,
                }))
              }
            />
          ))}
        </Panel>

        {/* Privacy */}
        <Panel>
          <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Eye className="h-4 w-4 text-cyan-glow" />
            Privacy
          </h3>

          <div className="text-sm text-muted-foreground mb-3">
            Document visibility on public profile
          </div>

          <div className="grid grid-cols-3 gap-2">
            {["Full", "Summary", "Score Only"].map((o) => (
              <button
                key={o}
                onClick={() => setVis(o)}
                className={`px-3 py-2 rounded-xl text-sm border transition ${
                  vis === o
                    ? "bg-gradient-to-r from-primary to-cyan-glow text-white border-transparent shadow-glow"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                {o}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <Toggle
              label="Public trust score badge"
              checked
            />
          </div>
        </Panel>

        {/* API Access */}
        <Panel>
          <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Key className="h-4 w-4 text-cyan-glow" />
            API access
          </h3>

          <div className="glass rounded-xl px-3 py-2.5 flex items-center gap-2 font-mono text-xs">
            <span className="text-cyan-glow">
              tl_live_
            </span>

            <span className="text-muted-foreground tracking-widest">
              ••••••••••••••••a8f3
            </span>

            <button
              onClick={() =>
                toast.success("API key regenerated")
              }
              className="ml-auto inline-flex items-center gap-1 text-xs text-foreground hover:text-cyan-glow"
            >
              <RotateCcw className="h-3 w-3" />
              Regenerate
            </button>
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            Use this key to access the Trustline API.
            Treat it like a password.
          </p>
        </Panel>

        {/* Danger Zone */}
        <Panel className="lg:col-span-2 border-l-4 border-danger">
          <h3 className="font-display text-lg font-semibold text-danger flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Danger zone
          </h3>

          <p className="text-sm text-muted-foreground mt-1">
            Deactivating your account removes public
            access and pauses verification flows. Data
            is retained for 90 days.
          </p>

          <button
            onClick={() =>
              toast.error("Confirm in support portal")
            }
            className="mt-4 px-3.5 py-2 rounded-xl bg-danger/15 text-danger border border-danger/30 text-sm hover:bg-danger/25 transition"
          >
            Deactivate account
          </button>
        </Panel>
      </div>
    </>
  );
}

function Input({ label, ...p }) {
  return (
    <div className="mb-3">
      <label className="text-xs text-muted-foreground">
        {label}
      </label>

      <input
        {...p}
        className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-slate-900/[0.03] border border-slate-900/[0.08] focus:outline-none focus:border-primary/50"
      />
    </div>
  );
}

function Toggle({
  label,
  checked = false,
  onChange,
}) {
  return (
    <label className="flex items-center justify-between py-2.5 cursor-pointer">
      <span className="text-sm">{label}</span>

      <button
        type="button"
        onClick={() => onChange?.(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${
          checked
            ? "bg-gradient-to-r from-primary to-cyan-glow"
            : "bg-slate-900/[0.06]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}