import { useState, useRef, useEffect } from "react";
import {
    UploadCloud,
    Check,
    ArrowLeft,
    ArrowRight,
    X,
    Loader2,
    ShieldCheck,
    Clock,
    Home,
} from "lucide-react";

import axiosInstance from "@/API/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

const DOCUMENT_OPTIONS = [
    { key: "GST_CERTIFICATE", label: "GST Certificate" },
    { key: "PAN_CARD", label: "PAN Card" },
    { key: "INCORPORATION_CERTIFICATE", label: "Incorporation Certificate" },
    { key: "BANK_PROOF", label: "Bank Proof" },
];

const DOC_STEPS = ["Upload", "Review", "Submit"];

const REDIRECT_SECONDS = 5;

export default function KycSubmitPage() {
    const navigate = useNavigate();
    const { fetchUserProfile } = useAuth();
    const fileInputRef = useRef(null);

    const [docIndex, setDocIndex] = useState(0);
    const [docStep, setDocStep] = useState(0);

    const [extracting, setExtracting] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [progress, setProgress] = useState(0);

    const [file, setFile] = useState(null);
    const [temporaryUploadId, setTemporaryUploadId] = useState(null);
    const [extractedData, setExtractedData] = useState(null);

    const [completedDocs, setCompletedDocs] = useState([]);

    const [kycComplete, setKycComplete] = useState(false);
    const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

    const countdownRef = useRef(null);

    const currentDoc = DOCUMENT_OPTIONS[docIndex];
    const isLastDoc = docIndex === DOCUMENT_OPTIONS.length - 1;

    useEffect(() => {
        if (!kycComplete) return;

        countdownRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownRef.current);
                    navigate("/");
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdownRef.current);
    }, [kycComplete, navigate]);

    const formatLabel = (key) =>
        key
            .replace(/([A-Z])/g, " $1")
            .replace(/_/g, " ")
            .replace(/^\s*/, "")
            .replace(/^./, (s) => s.toUpperCase())
            .trim();

    const flattenObject = (obj, prefix = "") => {
        if (!obj || typeof obj !== "object") return [];

        return Object.entries(obj).flatMap(([k, v]) => {
            const fullKey = prefix ? `${prefix}.${k}` : k;

            if (v && typeof v === "object" && !Array.isArray(v)) {
                return flattenObject(v, fullKey);
            }

            return [[fullKey, v]];
        });
    };

    const setNestedValue = (obj, path, value) => {
        const keys = path.split(".");
        const updated = { ...obj };

        let ref = updated;

        for (let i = 0; i < keys.length - 1; i++) {
            ref[keys[i]] = { ...ref[keys[i]] };
            ref = ref[keys[i]];
        }

        ref[keys[keys.length - 1]] = value;

        return updated;
    };

    const resetDocState = () => {
        setFile(null);
        setTemporaryUploadId(null);
        setExtractedData(null);
        setProgress(0);
        setDocStep(0);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFileChange = async (e) => {
        const selected = e.target.files?.[0];

        if (!selected) return;

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        if (selected.size > 10 * 1024 * 1024) {
            toast.error("File size must be less than 10MB");
            return;
        }

        const allowed = [
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/jpg",
        ];

        if (!allowed.includes(selected.type)) {
            toast.error("Invalid format. Allowed: PDF, PNG, JPG");
            return;
        }

        setFile(selected);

        try {
            setExtracting(true);
            setProgress(0);

            const formData = new FormData();

            formData.append("document", selected);
            formData.append("type", currentDoc.key);

            const response = await axiosInstance.post(
                "/kyc/documents/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },

                    onUploadProgress: (evt) => {
                        if (!evt.total) return;

                        setProgress(
                            Math.round((evt.loaded * 100) / evt.total)
                        );
                    },
                }
            );

            const data = response?.data?.data || response?.data || {};

            const uploadId = data.temporaryUploadId;
            const extracted = data.extractedData || {};

            if (!uploadId) {
                throw new Error("No temporaryUploadId returned");
            }

            setTemporaryUploadId(uploadId);
            setExtractedData(extracted);
            setDocStep(1);

            toast.success("Document extracted successfully");
        } catch (err) {
            console.error(err);

            toast.error(
                err?.response?.data?.message ||
                    err?.message ||
                    "Extraction failed"
            );

            setFile(null);
        } finally {
            setExtracting(false);
            setProgress(0);
        }
    };

    const handleFieldChange = (path, value) => {
        setExtractedData((prev) =>
            setNestedValue(prev, path, value)
        );
    };

    const handleSubmit = async () => {
        if (!temporaryUploadId || !extractedData) return;

        try {
            setSubmitting(true);
            setDocStep(2);

            await axiosInstance.post("/kyc/documents", {
                temporaryUploadId,
                metaData: extractedData,
            });

            const updatedCompleted = [
                ...completedDocs,
                currentDoc.key,
            ];

            setCompletedDocs(updatedCompleted);

            toast.success( `${currentDoc.label} submitted successfully` );

            if (isLastDoc) {
                await fetchUserProfile();
                setKycComplete(true);
            } else {
                resetDocState();
                setDocIndex((prev) => prev + 1);
            }
        } catch (err) {
            console.error(err);

            toast.error(
                err?.response?.data?.message ||
                    "Submission failed"
            );

            setDocStep(1);
        } finally {
            setSubmitting(false);
        }
    };

    const flatFields = extractedData
        ? flattenObject(extractedData)
        : [];

    if (kycComplete) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200">
                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="h-20 w-20 rounded-full bg-green-500 flex items-center justify-center mb-6">
                            <ShieldCheck className="h-10 w-10 text-white" />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 mb-2">  KYC Submitted </h2>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Your documents have been submitted successfully.
                            Verification usually takes less than 24 hours.
                        </p>
                        <div className="w-full mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                            <div className="flex items-start gap-3">
                                <Clock className="h-5 w-5 text-slate-500 mt-0.5 shrink-0" />

                                <div>
                                    <p className="text-sm font-medium text-slate-700">
                                        Verification in Progress
                                    </p>

                                    <p className="text-xs text-slate-500 mt-1">
                                        You will receive an update once your
                                        KYC is verified.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs uppercase tracking-wide text-slate-400 mb-3">
                                Documents Submitted
                            </p>

                            <div className="space-y-2">
                                {DOCUMENT_OPTIONS.map((doc) => (
                                    <div
                                        key={doc.key}
                                        className="flex items-center gap-2"
                                    >
                                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                                            <Check className="h-3 w-3 text-green-600" />
                                        </div>

                                        <span className="text-sm text-slate-600">
                                            {doc.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-600">
                                Redirecting in {countdown}s
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                clearInterval(countdownRef.current);
                                navigate("/");
                            }}
                            className="w-full h-11 mt-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2 text-sm"
                        >
                            <Home className="h-4 w-4" />
                            Go to Homepage
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200">

                <div className="px-8 py-6 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-blue-500 font-medium mb-1">
                                KYC Verification
                            </p>

                            <h1 className="text-2xl font-bold text-slate-900">
                                {currentDoc.label}
                            </h1>
                        </div>

                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        {DOCUMENT_OPTIONS.map((doc, i) => {
                            const isDone = completedDocs.includes(doc.key);
                            const isCurrent = i === docIndex;

                            return (
                                <div
                                    key={doc.key}
                                    className="flex items-center flex-1"
                                >
                                    <div className="flex flex-col items-center gap-1">
                                        <div
                                            className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                                                isDone
                                                    ? "bg-green-500 text-white"
                                                    : isCurrent
                                                    ? "bg-blue-600 text-white"
                                                    : "border border-slate-300 text-slate-400"
                                            }`}
                                        >
                                            {isDone ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                i + 1
                                            )}
                                        </div>

                                        <span className="text-[10px] text-slate-500 text-center">
                                            {doc.label}
                                        </span>
                                    </div>

                                    {i <
                                        DOCUMENT_OPTIONS.length - 1 && (
                                        <div className="flex-1 h-px bg-slate-200 mx-2 mb-5" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-8">

                    {docStep === 0 && !extracting && (
                        <div
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                            className="border-2 border-dashed border-slate-300 rounded-2xl p-14 flex flex-col items-center cursor-pointer hover:bg-slate-50"
                        >
                            <UploadCloud className="h-12 w-12 text-blue-500 mb-4" />

                            <p className="text-base font-semibold text-slate-700">
                                Upload {currentDoc.label}
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                                PDF, PNG, JPG · Max 10MB
                            </p>

                            <input
                                ref={fileInputRef}
                                type="file"
                                hidden
                                accept=".pdf,.png,.jpg,.jpeg"
                                onChange={handleFileChange}
                            />
                        </div>
                    )}

                    {extracting && (
                        <div className="flex flex-col items-center py-12 gap-4">
                            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />

                            <p className="font-medium text-slate-700">
                                Extracting document data...
                            </p>

                            <div className="w-full max-w-xs">
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600"
                                        style={{
                                            width: `${progress}%`,
                                        }}
                                    />
                                </div>

                                <p className="text-xs text-slate-400 mt-1 text-right">
                                    {progress}%
                                </p>
                            </div>
                        </div>
                    )}

                    {submitting && (
                        <div className="flex flex-col items-center py-12 gap-4">
                            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />

                            <p className="font-medium text-slate-700">
                                Submitting {currentDoc.label}...
                            </p>
                        </div>
                    )}

                    {docStep === 1 &&
                        !submitting &&
                        extractedData && (
                            <>
                                <div className="mb-5">
                                    <p className="font-semibold text-slate-800">
                                        Review Extracted Data
                                    </p>

                                    <p className="text-sm text-slate-400">
                                        Edit incorrect fields before
                                        submission
                                    </p>
                                </div>

                                {file && (
                                    <div className="flex items-center gap-2 mb-5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                                        <Check className="h-4 w-4 text-green-500" />

                                        <span className="text-sm text-slate-600 truncate">
                                            {file.name}
                                        </span>

                                        <button
                                            onClick={resetDocState}
                                            className="ml-auto text-xs text-slate-500"
                                        >
                                            Change file
                                        </button>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {flatFields.map(([path, value]) => {
                                        const label = path
                                            .split(".")
                                            .map(formatLabel)
                                            .join(" › ");

                                        const strVal =
                                            value === null ||
                                            value === undefined
                                                ? ""
                                                : String(value);

                                        return (
                                            <div key={path}>
                                                <label className="block text-xs text-slate-500 mb-1">
                                                    {label}
                                                </label>

                                                <input
                                                    type="text"
                                                    value={strVal}
                                                    onChange={(e) =>
                                                        handleFieldChange(
                                                            path,
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                    {!extracting && !submitting && (
                        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
                            <button
                                onClick={
                                    docStep === 1
                                        ? resetDocState
                                        : () => navigate(-1)
                                }
                                className="h-11 px-5 rounded-xl border border-slate-300 text-slate-600 flex items-center gap-2 text-sm"
                            >
                                <ArrowLeft className="h-4 w-4" />

                                {docStep === 1
                                    ? "Re-upload"
                                    : "Back"}
                            </button>

                            {docStep === 1 && (
                                <button
                                    onClick={handleSubmit}
                                    className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 text-sm"
                                >
                                    {isLastDoc
                                        ? "Submit & Finish"
                                        : "Submit & Continue"}

                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="px-8 pb-6 text-center">
                    <p className="text-xs text-slate-400">
                        Document {docIndex + 1} of{" "}
                        {DOCUMENT_OPTIONS.length}
                    </p>
                </div>
            </div>
        </div>
    );
}