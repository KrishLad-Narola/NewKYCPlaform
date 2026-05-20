import React from "react";
import { Routes, Route, Link, Navigate, Outlet, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { RoleSwitcher } from "@/components/role-switcher";

/* Public Pages */
import Landing from "@/pages/Landing";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import VerifyEmail from "@/pages/Verifyemail";
import ResetPassword from "@/pages/ResetPassword";

/* Protected Pages */
import ProfilePage from "@/pages/ProfilePage";
import ChangePassword from "@/pages/ChnagePassword";
import KycSubmitPage from "@/pages/KycSubmitPage";

/* Dashboard */
import DashboardLayout from "@/pages/dashboard/DashboardLayout";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import KycPage from "@/pages/dashboard/KycPage";
import TrustPage from "@/pages/dashboard/TrustPage";
import DealsPage from "@/pages/dashboard/DealsPage";
import DirectoryPage from "@/pages/dashboard/DirectoryPage";
import SharedPage from "@/pages/dashboard/SharedPage";
import AuditPage from "@/pages/dashboard/AuditPage";
import SettingsPage from "@/pages/dashboard/SettingsPage";

/* Admin */
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminHome from "@/pages/admin/AdminHome";
import AdminBusinesses from "@/pages/admin/AdminBusinesses";
import AdminKyc from "@/pages/admin/AdminKyc";
import AdminTrust from "@/pages/admin/AdminTrust";
import AdminDisputes from "@/pages/admin/AdminDisputes";
import AdminAudit from "@/pages/admin/AdminAudit";
import AdminSettings from "@/pages/admin/AdminSettings";

import PublicRoutes from "./routes/PublicRoutes";

/* ---------------- NOT FOUND ---------------- */
function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function KycGuard() {
  const { user, business, loading } = useAuth(); 
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (business?.kycStatus === "DRAFT" || business?.kycStatus === "PENDING_DOCUMENTS") {
    return <Navigate to="/kyc-submit" replace />;
  }

  return <Outlet />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoutes />}>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* AUTHENTICATED ROUTES */}
      <Route element={<ProtectedRoute />}>
        <Route path="/kyc-submit" element={<KycSubmitPage />} />

        {/* AFTER KYC CHECK */}
        <Route element={<KycGuard />}>
          {/* User Pages */}
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="kyc" element={<KycPage />} />
            <Route path="trust" element={<TrustPage />} />
            <Route path="deals" element={<DealsPage />} />
            <Route path="directory" element={<DirectoryPage />} />
            <Route path="shared" element={<SharedPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHome />} />
            <Route path="businesses" element={<AdminBusinesses />} />
            <Route path="kyc" element={<AdminKyc />} />
            <Route path="trust" element={<AdminTrust />} />
            <Route path="disputes" element={<AdminDisputes />} />
            <Route path="audit" element={<AdminAudit />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <RoleSwitcher />
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand
        duration={3000}
        theme="light"
      />
    </AuthProvider>
  );
}