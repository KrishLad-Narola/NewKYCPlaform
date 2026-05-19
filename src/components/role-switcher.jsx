import { Shield, UserCog } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export function RoleSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();

  const role = location.pathname.startsWith("/admin")
    ? "admin"
    : "business";

  return (
    <div className="fixed bottom-4 right-4 z-50 glass-strong rounded-2xl p-2 flex items-center gap-2 shadow-card">
      
      <button
        onClick={() => navigate("/dashboard")}
        className={`px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all duration-200 ${
          role === "business"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        <Shield className="h-3 w-3" />
        Business
      </button>

      <button
        onClick={() => navigate("/admin")}
        className={`px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all duration-200 ${
          role === "admin"
            ? "bg-gradient-to-r from-primary to-cyan-500 text-white"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        <UserCog className="h-3 w-3" />
        Admin
      </button>
    </div>
  );
}