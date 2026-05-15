import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { z } from "zod";

import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Activity,
  TrendingUp,
  Mail,
} from "lucide-react";

import { TrustGauge } from "@/components/trust-gauge";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import axiosInstance from "@/API/axiosInstance";


const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export default function Landing() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState(
    "priya@helios-trade.com"
  );

  const [pw, setPw] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [errors, setErrors] = useState({});
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const validatedData = loginSchema.parse({
        email,
        password: pw,
      });
      setErrors({});
      const response = await axiosInstance.post(
        "http://192.168.100.149:3000/api/v1/auth/login",
        validatedData
      );

      const {accessToken,refreshToken,user,business,} = response.data;

      localStorage.setItem("accessToken",accessToken);
      localStorage.setItem("refreshToken",refreshToken);
      localStorage.setItem("user",JSON.stringify(user));
      login({ user, business });
      toast.success(response.data.message ||"Login successful");
      navigate("/dashboard");
    } catch (error) {
      console.log(error);


      if (error instanceof z.ZodError) {
        const fieldErrors = {};

        error.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });

        setErrors(fieldErrors);

        return;
      }
                  
      // toast.error(error?.response?.data?.message ||"Login failed");
    }
  };

  const handleSubmit = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40" />

      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/30 blur-[140px]" />

      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-glow/20 blur-[140px]" />

      {/* HEADER */}

      <header className="relative z-10 px-6 lg:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-cyan-glow grid place-items-center shadow-glow">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>

          <div>
            <div className="font-display font-semibold text-lg leading-none">
              Trustline
            </div>

            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Trust Infrastructure
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a className="hover:text-foreground transition">
            Platform
          </a>

          <a className="hover:text-foreground transition">
            Compliance
          </a>

          <a className="hover:text-foreground transition">
            Pricing
          </a>

          <a className="hover:text-foreground transition">
            Docs
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/register"
            className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground"
          >
            Register business
          </Link>

          
        </div>
      </header>

      {/* HERO SECTION */}

      <section className="relative z-10 px-6 lg:px-12 pt-12 pb-20 grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto items-center">
        {/* LEFT */}

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-mono text-cyan-glow mb-6">
            <Sparkles className="h-3 w-3" />

            <span>
              SOC 2 · ISO 27001 · GDPR Aligned
            </span>
          </div>

          <h1 className="font-display text-5xl lg:text-7xl font-semibold leading-[1.05] tracking-tight">
            Verify Once. <br />

            <span className="text-gradient">
              Trust Always.
            </span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">
            Enterprise-grade trust
            infrastructure for B2B procurement,
            partnerships, and finance.
            Compliance, credibility, and
            counterparty intelligence — unified.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
            {[
              {
                v: "12.8K",
                l: "Verified businesses",
              },
              {
                v: "₹148Cr",
                l: "Deals secured",
              },
              {
                v: "99.97%",
                l: "Uptime SLA",
              },
            ].map((s) => (
              <div
                key={s.l}
                className="glass rounded-2xl px-4 py-3"
              >
                <div className="font-mono text-xl font-semibold">
                  {s.v}
                </div>

                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                  {s.l}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            {[
              {
                i: Lock,
                t: "Zero-trust architecture",
              },
              {
                i: Eye,
                t: "Continuous monitoring",
              },
              {
                i: Activity,
                t: "Real-time risk signals",
              },
            ].map((m, i) => (
              <div
                key={i}
                className="glass rounded-full px-3.5 py-1.5 text-xs flex items-center gap-2 text-muted-foreground"
              >
                <m.i className="h-3.5 w-3.5 text-cyan-glow" />

                {m.t}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT LOGIN */}

        <div className="relative">
          {/* FLOATING CARD */}

          <div className="absolute -top-6 -left-6 glass-strong rounded-2xl p-5 animate-float shadow-card hidden md:block">
            <div className="flex items-center gap-4">
              <TrustGauge
                score={91}
                size={120}
                label="Live"
              />

              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Aurora Green
                </div>

                <div className="font-display font-semibold mt-1">
                  A+ rated
                </div>

                <div className="flex items-center gap-1 text-xs text-success font-mono mt-2">
                  <TrendingUp className="h-3 w-3" />
                  +6 in 30d
                </div>
              </div>
            </div>
          </div>

          {/* LOGIN FORM */}

          <form
            onSubmit={handleLogin}
            className="glass-strong rounded-3xl p-8 shadow-card relative"
          >
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-cyan-glow">
              Secure portal
            </div>

            <h2 className="font-display text-2xl font-semibold mt-2">
              Sign in to Trustline
            </h2>

            <p className="text-sm text-muted-foreground mt-1">
              Use your registered business
              credentials.
            </p>

            <div className="mt-6 space-y-4">
              {/* EMAIL */}

              <div>
                <label className="text-xs text-muted-foreground">
                  Work email
                </label>

                <div className="relative mt-1.5">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                  <input
                    type="email"
                    placeholder="Enter work email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    className={`w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/[0.03] border transition focus:outline-none focus:ring-2
                    ${
                      errors.email
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-slate-900/[0.08] focus:border-primary/50 focus:ring-primary/20"
                    }`}
                  />
                </div>

                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* PASSWORD */}

              <div>
                <label className="text-xs text-muted-foreground">
                  Password
                </label>

                <div className="relative mt-1.5">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                  <input
                    value={pw}
                    onChange={(e) =>
                      setPw(e.target.value)
                    }
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter password"
                    className={`w-full pl-11 pr-12 py-3 rounded-xl bg-slate-900/[0.03] border transition focus:outline-none focus:ring-2
                    ${
                      errors.password
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-slate-900/[0.08] focus:border-primary/50 focus:ring-primary/20"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* FORGOT PASSWORD */}

              <div className="flex items-center justify-end text-xs">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="text-cyan-glow hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-cyan-glow text-white font-medium shadow-glow hover:opacity-95 transition"
              >
                Continue securely

                <ArrowRight className="h-4 w-4" />
              </button>

              {/* REGISTER */}

              <Link
                to="/register"
                className="block text-center text-sm text-muted-foreground hover:text-foreground transition mt-3"
              >
                Don't have an account?{" "}
                <span className="text-cyan-glow">
                  Register your business →
                </span>
              </Link>
            </div>
          </form>

          {/* BOTTOM CARD */}

          <div
            className="absolute -bottom-6 -right-6 glass-strong rounded-2xl px-5 py-4 animate-float shadow-card hidden md:flex items-center gap-3"
            style={{
              animationDelay: "1.5s",
            }}
          >
            <div className="h-10 w-10 rounded-xl bg-success/20 grid place-items-center">
              <ShieldCheck className="h-5 w-5 text-success" />
            </div>

            <div>
              <div className="text-xs text-muted-foreground">
                Compliance verified
              </div>

              <div className="font-mono text-sm">
                GST · PAN · MCA
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}