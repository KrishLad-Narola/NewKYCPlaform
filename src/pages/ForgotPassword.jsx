import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Mail,
  Lock,
  Loader2,
  Clock3,
} from "lucide-react";

import { toast } from "sonner";
import axiosInstance from "@/API/axiosInstance";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // 2 minutes timer
  const [timer, setTimer] = useState(0);

  // countdown
  useEffect(() => {
    let interval;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timer]);

  // format time => 02:00
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (loading || timer > 0) return;

    // ✅ Zod validation
    const validation = forgotPasswordSchema.safeParse({ email });

    if (!validation.success) {
      const errorMessage =
        validation.error.errors[0]?.message || "Invalid email";

      return toast.error(errorMessage);
    }

    try {
      setLoading(true);

      const response = await axiosInstance.post(
        "/auth/forgot-password",
        {
          email,
        }
      );

      toast.success(
        response?.data?.message ||
          "Password reset link sent successfully"
      );

      // start 2 minute cooldown
      setTimer(120);
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/30 blur-[140px]" />
      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-glow/20 blur-[140px]" />

      {/* Navbar */}
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

        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-foreground transition"
        >
          Back to login
        </Link>
      </header>

      <section className="relative z-10 px-6 lg:px-12 pt-16 pb-20 flex justify-center items-center">
        <div className="w-full max-w-lg relative">
          <form
            onSubmit={handleForgotPassword}
            className="glass-strong rounded-3xl p-8 shadow-card"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-mono text-cyan-glow mb-6">
              <Sparkles className="h-3 w-3" />
              <span>Password Recovery Portal</span>
            </div>

            <h1 className="font-display text-4xl font-semibold leading-tight">
              Forgot your password?
            </h1>

            <p className="mt-3 text-muted-foreground leading-relaxed">
              Enter your registered business email and we'll send you a secure
              password reset link.
            </p>

            {/* Email Input */}
            <div className="mt-8">
              <label className="text-xs text-muted-foreground">
                Work email
              </label>

              <div className="relative mt-1.5">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/[0.03] border border-slate-900/[0.08] focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition disabled:opacity-60"
                />
              </div>
            </div>

            {/* Timer */}
            {timer > 0 && (
              <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 flex items-center justify-between backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
                    <Clock3 className="h-5 w-5 text-cyan-glow" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Reset link already sent
                    </p>

                    <p className="text-xs text-muted-foreground">
                      You can request another link after cooldown
                    </p>
                  </div>
                </div>

                <div className="font-mono text-lg font-semibold text-cyan-glow">
                  {formatTime(timer)}
                </div>
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading || timer > 0}
              className="w-full mt-6 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-cyan-glow text-white font-medium shadow-glow hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending reset link...
                </>
              ) : (
                <>
                  Send reset link
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Footer */}
            <Link
              to="/"
              className="block text-center text-sm text-muted-foreground hover:text-foreground transition mt-5"
            >
              Remembered your password?{" "}
              <span className="text-cyan-glow">Sign in →</span>
            </Link>
          </form>
        </div>
      </section>
    </div>
  );
}