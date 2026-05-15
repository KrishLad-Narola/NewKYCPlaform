import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    ShieldCheck,
    CheckCircle2,
    XCircle,
    Loader2,
    Sparkles,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [verified, setVerified] = useState(false);

    const token = searchParams.get("token");

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                await axios.post(
                    "http://192.168.100.149:3000/api/v1/auth/verify-email",
                    { token }
                );

                setVerified(true);
                toast.success("Email verified successfully");

                setTimeout(() => {
                    navigate("/");
                }, 3000);
            } catch (error) {
                setVerified(false);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            verifyEmail();
        } else {
            setLoading(false);
            setVerified(false);
            toast.error("Verification token missing");
        }
    }, [token, navigate]);

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

            {/* Content */}
            <section className="relative z-10 px-6 lg:px-12 pt-16 pb-20 flex justify-center items-center">
                <div className="w-full max-w-lg relative">

                    {/* Verification Card */}
                    <div className="glass-strong rounded-3xl p-8 shadow-card text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-mono text-cyan-glow mb-6">
                            <Sparkles className="h-3 w-3" />
                            <span>Secure Verification Portal</span>
                        </div>

                        {loading ? (
                            <>
                                <Loader2 className="h-14 w-14 mx-auto text-cyan-glow animate-spin" />

                                <h1 className="mt-6 font-display text-4xl font-semibold leading-tight">
                                    Verifying your email...
                                </h1>

                                <p className="mt-3 text-muted-foreground leading-relaxed">
                                    Please wait while we securely verify your email address.
                                </p>
                            </>
                        ) : verified ? (
                            <>
                                <CheckCircle2 className="h-14 w-14 mx-auto text-green-400" />

                                <h1 className="mt-6 font-display text-4xl font-semibold leading-tight">
                                    Email verified
                                </h1>

                                <p className="mt-3 text-muted-foreground leading-relaxed">
                                    Your business account has been successfully verified.
                                    Redirecting to login...
                                </p>

                                <Link
                                    to="/"
                                    className="inline-flex items-center justify-center mt-6 px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-cyan-glow text-white font-medium shadow-glow hover:opacity-95 transition"
                                >
                                    Continue to login
                                </Link>
                            </>
                        ) : (
                            <>
                                <XCircle className="h-14 w-14 mx-auto text-red-400" />

                                <h1 className="mt-6 font-display text-4xl font-semibold leading-tight">
                                    Verification failed
                                </h1>

                                <p className="mt-3 text-muted-foreground leading-relaxed">
                                    The verification link is invalid or has expired.
                                </p>

                                <Link
                                    to="/"
                                    className="inline-flex items-center justify-center mt-6 px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-cyan-glow text-white font-medium shadow-glow hover:opacity-95 transition"
                                >
                                    Back to login
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}