import { useState } from "react";
import {
    UploadCloud,
    Check,
    ArrowRight,
    ArrowLeft,
    FileText,
    X,
    CircleX,
} from "lucide-react";

import axiosInstance from "@/API/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

const steps = [
    "SELECT",
    "UPLOAD",
    "OCR",
    "VALIDATE",
    "REVIEW",
    "SUBMIT",
];

export default function KycSubmitPage() {
    const navigate = useNavigate();
    const { fetchUserProfile } = useAuth();

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [progress, setProgress] = useState(0);

    const [selectedDoc, setSelectedDoc] = useState("gstCertificate");

    const [files, setFiles] = useState({
        gstCertificate: null,
        incorporationCertificate: null,
        bankAccount: null,
        panCard: null,
    });

    const [uploadStatus, setUploadStatus] = useState({
        gstCertificate: null,
        incorporationCertificate: null,
        bankAccount: null,
        panCard: null,
    });

    const [extractedData, setExtractedData] = useState({
        gstCertificate: null,
        incorporationCertificate: null,
        bankAccount: null,
        panCard: null,
    });

    const documentOptions = [
        { key: "GST_CERTIFICATE", label: "GST Certificate" },
        { key: "PAN_CARD", label: "PAN Card" },
        { key: "INCORPORATION_CERTIFICATE", label: "Incorporation Certificate" },
        { key: "BANK_PROOF", label: "Bank Proof" },
    ];

    const handleFileChange = async (file) => {
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size must be less than 10MB");
            setUploadStatus((p) => ({ ...p, [selectedDoc]: "error" }));
            return;
        }

        setUploadStatus((p) => ({ ...p, [selectedDoc]: "success" }));
        setFiles((p) => ({ ...p, [selectedDoc]: file }));

        await extractDocumentData(selectedDoc, file);
    };

    const extractDocumentData = async (key, file) => {
        try {
            setExtracting(true);
            setCurrentStep(2);

            toast.loading("Extracting document data...", {
                id: "extract-doc",
            });

            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", key);

            const response = await axiosInstance.post(
                "/kyc/documents/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    onUploadProgress: (e) => {
                        const percent = Math.round(
                            (e.loaded * 100) / e.total
                        );
                        setProgress(percent);
                    },
                }
            );

            setCurrentStep(3);

            const extracted = response?.data?.data || {};

            setExtractedData((prev) => ({
                ...prev,
                [key]: extracted,
            }));

            setCurrentStep(4);

            toast.success("Document extracted", {
                id: "extract-doc",
            });
        } catch (error) {
            toast.error(
                error?.response?.data?.message || "Extraction failed",
                { id: "extract-doc" }
            );

            setUploadStatus((p) => ({ ...p, [selectedDoc]: "error" }));
        } finally {
            setExtracting(false);
            setProgress(0);
        }
    };

    const validateDocuments = () => {
        if (
            !files.gstCertificate ||
            !files.incorporationCertificate ||
            !files.bankAccount ||
            !files.panCard
        ) {
            toast.error("Please upload all required documents");
            return false;
        }
        return true;
    };

    const submit = async () => {
        if (!validateDocuments()) return;

        try {
            setLoading(true);
            setCurrentStep(5);

            toast.loading("Submitting KYC...", {
                id: "submit-kyc",
            });

            const formData = new FormData();

            Object.entries(files).forEach(([k, v]) => {
                formData.append(k, v);
            });

            formData.append(
                "extractedData",
                JSON.stringify(extractedData)
            );

            await axiosInstance.post("/kyc/submit", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setCurrentStep(6);

            toast.success("KYC submitted successfully", {
                id: "submit-kyc",
            });

            await fetchUserProfile();
            navigate("/dashboard");
        } catch (error) {
            toast.error(
                error?.response?.data?.message || "Submission failed",
                { id: "submit-kyc" }
            );
        } finally {
            setLoading(false);
        }
    };

    const currentStatus = uploadStatus[selectedDoc];

    const formatLabel = (key) =>
        key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

    return (
        <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-4">
            <div className="w-full max-w-4xl rounded-[28px] bg-white shadow-2xl overflow-hidden">

                {/* HEADER */}
                <div className="px-8 py-7 border-b border-slate-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[11px] uppercase text-blue-600 font-semibold mb-2">
                                Secure Upload
                            </p>
                            <h1 className="text-3xl font-bold">Add KYC Document</h1>
                        </div>

                        <button onClick={() => navigate(-1)}>
                            <X />
                        </button>
                    </div>

                    {/* STEPPER */}
                    <div className="flex mt-8">
                        {steps.map((step, index) => (
                            <div key={step} className="flex items-center flex-1">
                                <div
                                    className={`h-8 w-8 rounded-full flex items-center justify-center ${currentStep >= index + 1
                                            ? "bg-blue-600 text-white"
                                            : "border text-slate-400"
                                        }`}
                                >
                                    {currentStep > index + 1 ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        index + 1
                                    )}
                                </div>

                                <span className="text-xs ml-2 uppercase">
                                    {step}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* BODY */}
                <div className="p-8">

                    {/* DOC SELECT */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {documentOptions.map((doc) => (
                            <button
                                key={doc.key}
                                onClick={() => setSelectedDoc(doc.key)}
                                className={`p-3 border rounded-xl ${selectedDoc === doc.key
                                        ? "bg-blue-50 border-blue-500"
                                        : ""
                                    }`}
                            >
                                {doc.label}
                            </button>
                        ))}
                    </div>

                    {/* UPLOAD */}
                    <label className="border-2 border-dashed rounded-3xl p-10 flex flex-col items-center cursor-pointer">
                        <UploadCloud className="h-10 w-10 text-blue-500 mb-3" />

                        <h3 className="text-lg font-semibold">
                            {files[selectedDoc]?.name ||
                                "Drop or upload file"}
                        </h3>

                        <input
                            type="file"
                            hidden
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) =>
                                handleFileChange(e.target.files[0])
                            }
                        />
                    </label>

                    {/* PROGRESS */}
                    {extracting && (
                        <div className="mt-4">
                            <div className="h-2 bg-gray-200 rounded">
                                <div
                                    className="h-2 bg-blue-600"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-xs mt-1">{progress}%</p>
                        </div>
                    )}

                    {/* EXTRACTED */}
                    {extractedData[selectedDoc] && (
                        <div className="mt-6 border p-4 rounded-xl">
                            {Object.entries(
                                extractedData[selectedDoc]
                            ).map(([k, v]) => (
                                <div key={k} className="text-sm">
                                    <b>{formatLabel(k)}:</b> {String(v)}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* FOOTER */}
                    <div className="flex justify-between items-center mt-8 border-t border-slate-200 pt-6">

                        <button
                            onClick={() => navigate(-1)}
                            className="h-11 px-5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </button>

                        <button
                            onClick={submit}
                            disabled={loading || extracting}
                            className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                "Submitting..."
                            ) : extracting ? (
                                "Extracting..."
                            ) : (
                                <>
                                    Submit
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}