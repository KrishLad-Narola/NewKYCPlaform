import { Outlet } from "react-router-dom";
import { AppShell } from "@/components/app-shell";

export default function AdminLayout() {
  return (
    <AppShell kind="admin">
      <Outlet />
    </AppShell>
  );
}
