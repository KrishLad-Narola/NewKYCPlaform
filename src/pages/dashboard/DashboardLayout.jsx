import { Outlet } from "react-router-dom";
import { AppShell } from "@/components/app-shell";

export default function DashboardLayout() {
  return (
    <AppShell kind="business">
      <Outlet />
    </AppShell>
  );
}
