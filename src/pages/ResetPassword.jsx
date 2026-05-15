import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import {
    ShieldCheck,
    ArrowRight,
    Sparkles,
    Lock,
    Eye,
    EyeOff,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { z } from "zod";

const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .trim()
            .min(6, "Password must be at least 6 characters"),

        confirmPassword: z.string().trim(),

        token: z.string().min(1, "Invalid reset link"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token") || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleResetPassword = async (e) => {
        e.preventDefault();

        const validation = resetPasswordSchema.safeParse({
            password,
            confirmPassword,
            token,
        });

        if (!validation.success) {
            const errors = validation.error.flatten();
            const firstError =
                errors.formErrors?.[0] ||
                errors.fieldErrors?.confirmPassword?.[0] ||
                errors.fieldErrors?.password?.[0] ||
                "Validation failed";

            return toast.error(firstError);
        }

        try {
            setLoading(true);

            const response = await axios.post(
                "http://192.168.100.149:3000/api/v1/auth/reset-password",
                {
                    token,
                    password,
                    confirmPassword,
                }
            );

            toast.success(
                response?.data?.message || "Password reset successfully"
            );

            setTimeout(() => {
                navigate("/");
            }, 1200);

        } catch (error) {
            console.log(error);

            if (error.response?.status === 400) {
                toast.error("Invalid or expired reset link");
            } else if (error.response?.status >= 500) {
                toast.error("Server error. Please try again later");
            } else if (error.request) {
                toast.error("Unable to connect to server");
            } else {
                toast.error("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden">

            <div className="absolute inset-0 grid-bg opacity-40" />
            <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/30 blur-[140px]" />
            <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-glow/20 blur-[140px]" />


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

            {/* Content */}
            <section className="relative z-10 px-6 lg:px-12 pt-16 pb-20 flex justify-center items-center">
                <div className="w-full max-w-lg">
                    <form
                        onSubmit={handleResetPassword}
                        className="glass-strong rounded-3xl p-8 shadow-card"
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-mono text-cyan-glow mb-6">
                            <Sparkles className="h-3 w-3" />
                            <span>Password Reset Portal</span>
                        </div>

                        {/* Heading */}
                        <h1 className="font-display text-4xl font-semibold leading-tight">
                            Reset your password
                        </h1>

                        <p className="mt-3 text-muted-foreground">
                            Enter your new secure password to regain access.
                        </p>

                        {/* Password */}
                        <div className="mt-8">
                            <label className="text-xs text-muted-foreground">
                                New Password
                            </label>

                            <div className="relative mt-1.5">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Enter new password"
                                    className="w-full pl-11 pr-12 py-3 rounded-xl bg-slate-900/[0.03] border border-slate-900/[0.08] focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="mt-5">
                            <label className="text-xs text-muted-foreground">
                                Confirm Password
                            </label>

                            <div className="relative mt-1.5">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    placeholder="Confirm new password"
                                    className="w-full pl-11 pr-12 py-3 rounded-xl bg-slate-900/[0.03] border border-slate-900/[0.08] focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-cyan-glow text-white font-medium shadow-glow hover:opacity-95 transition disabled:opacity-50"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                            {!loading && (
                                <ArrowRight className="h-4 w-4" />
                            )}
                        </button>

                        {/* Back */}
                        <Link
                            to="/"
                            className="block text-center text-sm text-muted-foreground hover:text-foreground transition mt-5"
                        >
                            Back to <span className="text-cyan-glow">Sign in →</span>
                        </Link>
                    </form>
                </div>
            </section>
        </div>
    );
}