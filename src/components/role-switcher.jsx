import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Shield, UserCog, LogOut } from "lucide-react";

export function RoleSwitcher() {
  const { role, setRole } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const set = (r) => {
    setRole(r);
    if (r === "business" && !pathname.startsWith("/dashboard")) navigate("/dashboard");
    else if (r === "admin" && !pathname.startsWith("/admin")) navigate("/admin");
    else if (r === "guest") navigate("/");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 glass-strong rounded-2xl p-2 flex items-center gap-1 shadow-card">
      <button onClick={() => set("guest")} className={`px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition ${role === "guest" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
        <LogOut className="h-3 w-3" /> Guest
      </button>
      <button onClick={() => set("business")} className={`px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition ${role === "business" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
        <Shield className="h-3 w-3" /> Business
      </button>
      <button onClick={() => set("admin")} className={`px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition ${role === "admin" ? "bg-gradient-to-r from-primary to-cyan-glow text-white" : "text-muted-foreground hover:text-foreground"}`}>
        <UserCog className="h-3 w-3" /> Admin
      </button>
    </div>
  );
}
