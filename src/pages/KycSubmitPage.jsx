import { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  Check,
  ArrowLeft,
  ArrowRight,
  X,
  Loader2,
} from "lucide-react";

import axiosInstance from "@/API/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const DOCUMENT_OPTIONS = [
  { key: "GST_CERTIFICATE", label: "GST Certificate" },
  { key: "PAN_CARD", label: "PAN Card" },
  { key: "INCORPORATION_CERTIFICATE", label: "Incorporation Certificate" },
  { key: "BANK_PROOF", label: "Bank Proof" },
];

export default function KycSubmitPage() {
  const navigate = useNavigate();

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
  const [loadingExistingDocs, setLoadingExistingDocs] = useState(true);

  const currentDoc = DOCUMENT_OPTIONS[docIndex];
  const isLastDoc = docIndex === DOCUMENT_OPTIONS.length - 1;

  useEffect(() => {
    const fetchSubmittedDocuments = async () => {
      try {
        setLoadingExistingDocs(true);

        const response = await axiosInstance.get("/kyc");

        const data = response?.data?.data || response?.data || {};
        const documents = data?.documents || [];

        const submittedDocs = documents.map((doc) => doc.type);

        setCompletedDocs(submittedDocs);

        const nextPendingIndex = DOCUMENT_OPTIONS.findIndex(
          (doc) => !submittedDocs.includes(doc.key)
        );

        if (nextPendingIndex === -1) {
          navigate("/kyc-complete");
          return;
        }

        setDocIndex(nextPendingIndex);
      } catch (err) {
        toast.error(
          err?.response?.data?.message ||
            "Failed to load KYC documents"
        );
      } finally {
        setLoadingExistingDocs(false);
      }
    };

    fetchSubmittedDocuments();
  }, []);

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
      toast.error("Invalid format");
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

      setTemporaryUploadId(data.temporaryUploadId);
      setExtractedData(data.extractedData || {});
      setDocStep(1);

      toast.success("Document extracted successfully");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Extraction failed"
      );
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
    try {
      setSubmitting(true);

      await axiosInstance.post("/kyc/documents", {
        temporaryUploadId,
        metaData: extractedData,
      });

      const updatedCompleted = [
        ...completedDocs,
        currentDoc.key,
      ];

      setCompletedDocs(updatedCompleted);

      toast.success(`${currentDoc.label} submitted`);

      if (isLastDoc) {
        navigate("/kyc-complete");
      } else {
        resetDocState();
        setDocIndex((prev) => prev + 1);
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Submission failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const flatFields = extractedData
    ? flattenObject(extractedData)
    : [];

  if (loadingExistingDocs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">

        <div className="px-8 py-7 border-b border-slate-100">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-blue-600 mb-2">
                KYC Verification
              </p>

              <h1 className="text-3xl font-bold text-slate-900">
                {currentDoc.label}
              </h1>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="h-11 w-11 rounded-full border border-slate-200 flex items-center justify-center"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            {DOCUMENT_OPTIONS.map((doc, i) => {
              const isDone = completedDocs.includes(doc.key);
              const isCurrent = i === docIndex;

              return (
                <div key={doc.key} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-14 w-14 rounded-2xl flex items-center justify-center font-bold
                      ${
                        isDone
                          ? "bg-green-500 text-white"
                          : isCurrent
                          ? "bg-blue-600 text-white"
                          : "border-2 border-slate-300 text-slate-400"
                      }`}
                    >
                      {isDone ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        `0${i + 1}`
                      )}
                    </div>

                    <p className="mt-3 text-sm font-medium">
                      {doc.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-8">

          {docStep === 0 && !extracting && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-3xl p-20 flex flex-col items-center justify-center cursor-pointer"
            >
              <UploadCloud className="h-12 w-12 text-blue-600 mb-5" />

              <h3 className="text-xl font-bold">
                Upload {currentDoc.label}
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                PDF, PNG, JPG
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
            <div className="py-20 flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-6" />

              <h3 className="text-xl font-bold">
                Extracting Document Data
              </h3>

              <div className="w-full max-w-md mt-8">
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                <p className="text-right text-sm mt-2">
                  {progress}%
                </p>
              </div>
            </div>
          )}

          {docStep === 1 && extractedData && !submitting && (
            <>
              <h2 className="text-2xl font-bold mb-8">
                Review Extracted Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {flatFields.map(([path, value]) => {
                  const label = path
                    .split(".")
                    .map(formatLabel)
                    .join(" › ");

                  return (
                    <div key={path}>
                      <label className="block text-sm mb-2">
                        {label}
                      </label>

                      <input
                        type="text"
                        value={value || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            path,
                            e.target.value
                          )
                        }
                        className="w-full h-12 rounded-2xl border border-slate-300 px-4"
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {submitting && (
            <div className="py-20 flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-6" />

              <h3 className="text-xl font-bold">
                Submitting {currentDoc.label}
              </h3>
            </div>
          )}

          {!extracting && !submitting && (
            <div className="flex items-center justify-between mt-10 pt-8 border-t">
              <button
                onClick={
                  docStep === 1
                    ? resetDocState
                    : () => navigate(-1)
                }
                className="h-12 px-6 rounded-2xl border border-slate-300 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />

                {docStep === 1 ? "Re-upload" : "Back"}
              </button>

              {docStep === 1 && (
                <button
                  onClick={handleSubmit}
                  className="h-12 px-7 rounded-2xl bg-blue-600 text-white flex items-center gap-2"
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
      </div>
    </div>
  );
}

