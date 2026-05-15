import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";

const steps = ["Company", "Contact & Address", "Account"];

const registerSchema = z
  .object({
    companyName: z.string().trim().min(2, "Company name is required"),
    BusinessType: z.string().trim().min(2, "Business type is required"),
    industry: z.string().trim().min(2, "Industry is required"),
    CINNumber: z.string().trim().regex(/^[A-Z0-9]{10,25}$/, "Invalid CIN Number"),

    PhoneNumber: z.string().trim().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),


    addressline1: z.string().trim().min(3, "Address is too short"),
    addressline2: z.string().optional(),
    city: z.string().trim().min(2, "City is required"),
    state: z.string().trim().min(2, "State is required"),
    country: z.string().trim().min(2, "Country is required"),
    pincode: z.string().trim().regex(/^[0-9]{6}$/, "Pincode must be 6 digits"),

    firstname: z.string().trim().min(3, "First name is required"),
    lastname: z.string().trim().min(3, "Last name is required"),
    email: z.string().trim().email("Invalid email address"),
    password: z.string().trim().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().trim().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function Register() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

    const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    BusinessType: ["private_limited", "public_limited", "llp", "partnership", "sole_proprietorship", "others"][0],
    industry: "",
    CINNumber: "",
    PhoneNumber: "",
    addressline1: "",
    addressline2: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[key];
        return newErrs;
      });
    }
  };

  const next = () => setStep((prev) => Math.min(prev + 1, 2));
  const prev = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleNext = () => {
    const currentStepFields = {
      0: ["companyName", "BusinessType", "industry", "CINNumber"],
      1: ["PhoneNumber", "addressline1", "city", "state", "country", "pincode"],
      2: ["firstname", "lastname", "email", "password", "confirmPassword"],
    };

    const fields = currentStepFields[step];

    const result = registerSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const stepErrors = {};
      let hasError = false;

      fields.forEach((f) => {
        if (fieldErrors[f]) {
          stepErrors[f] = fieldErrors[f];
          hasError = true;
        }
      });

      if (hasError) {
        setErrors(stepErrors);
        const firstError = Object.values(stepErrors)[0]?.[0];
        toast.error(firstError || "Please fix errors");
        return;
      }
    }

    setErrors({});
    next();
  };

  const submit = async () => {
    const result = registerSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(fieldErrors);
      toast.error(Object.values(fieldErrors)[0]?.[0] || "Validation failed");
      return;
    }

    try {
      await axios.post(
        "http://192.168.100.149:3000/api/v1/businesses/onboard",
        {
          legalName: form.companyName,
          companyType: form.BusinessType.toUpperCase().replace(/\s+/g, "_"),
          industry: form.industry,
          cinNumber: form.CINNumber,
          primaryContactNumber: form.PhoneNumber,
          registeredAddress: {
            line1: form.addressline1,
            line2: form.addressline2,
            city: form.city,
            state: form.state,
            country: form.country,
            pincode: form.pincode,
          },
          firstName: form.firstname,
          lastName: form.lastname,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }
      );

      toast.success("Registration successful");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-primary/20 blur-[120px]" />

      <div className="relative w-full max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
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

        </Link>

        {/* Stepper Header */}
        <div className="flex items-center gap-3 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-3 flex-1">
              <div
                className={`h-8 w-8 rounded-full grid place-items-center text-xs font-mono border transition-all ${i < step
                  ? "bg-success text-white border-success"
                  : i === step
                    ? "bg-gradient-to-br from-primary to-cyan-glow text-white border-transparent shadow-glow"
                    : "border-slate-900/[0.08] text-muted-foreground"
                  }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <div className="text-xs">
                <div className={i <= step ? "text-foreground" : "text-muted-foreground"}>{s}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Step {i + 1}</div>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px ${i < step ? "bg-success/50" : "bg-slate-900/[0.06]"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="glass-strong rounded-3xl p-8 shadow-card">
          <h1 className="font-display text-2xl font-semibold">Register your business</h1>
          <div className="mt-6 space-y-4 animate-in fade-in duration-300" key={step}>
            {step === 0 && (
              <>
                <Input label="Company Name" value={form.companyName} onChange={(v) => set("companyName", v)} error={errors?.companyName?.[0]} />
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="field-wrapper">

                    <Select
                      label="Business Type"
                      value={form.BusinessType}
                      onChange={(v) => set("BusinessType", v)}
                      options={[
                        { value: "private_limited", label: "Private Limited" },
                        { value: "public_limited", label: "Public Limited" },
                        { value: "llp", label: "LLP" },
                        { value: "partnership", label: "Partnership" },
                        { value: "sole_proprietorship", label: "Sole Proprietorship" },
                        { value: "others", label: "Others" },
                      ]}
                      error={errors?.BusinessType?.[0]}
                    />

                    {errors?.BusinessType?.[0] && <span className="error">{errors.BusinessType[0]}</span>}
                  </div>
                  <Input label="Industry" value={form.industry} onChange={(v) => set("industry", v)} error={errors?.industry?.[0]} />
                </div>
                <Input label="CIN Number" value={form.CINNumber} onChange={(v) => set("CINNumber", v)} error={errors?.CINNumber?.[0]} />
              </>
            )}

            {step === 1 && (
              <>
                <Input label="Phone Number" value={form.PhoneNumber} onChange={(v) => {
                  const onlyNums = v.replace(/[^0-9]/g, '');
                  set("PhoneNumber", onlyNums);
                }} error={errors?.PhoneNumber?.[0]}
                />

                <Input label="Address Line 1" value={form.addressline1} onChange={(v) => set("addressline1", v)} error={errors?.addressline1?.[0]} />
                <Input label="Address Line 2" value={form.addressline2} onChange={(v) => set("addressline2", v)} error={errors?.addressline2?.[0]} />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="City" value={form.city} onChange={(v) => set("city", v)} error={errors?.city?.[0]} />
                  <Input label="State" value={form.state} onChange={(v) => set("state", v)} error={errors?.state?.[0]} />
                  <Input label="Country" value={form.country} onChange={(v) => set("country", v)} error={errors?.country?.[0]} />
                  <Input label="Pincode" value={form.pincode} onChange={(v) => {
                    const onlyDigits = v.replace(/[^0-9]/g, '');
                    if (onlyDigits.length <= 6) {
                      set("pincode", onlyDigits);
                    }
                  }}
                    error={errors?.pincode?.[0]}
                    maxLength={6}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="First Name" value={form.firstname} onChange={(v) => set("firstname", v)} error={errors?.firstname?.[0]} />
                  <Input label="Last Name" value={form.lastname} onChange={(v) => set("lastname", v)} error={errors?.lastname?.[0]} />
                </div>
                <Input label="Email" value={form.email} onChange={(v) => set("email", v)} error={errors?.email?.[0]} />
                <div className="space-y-4">
                  <Input
                    label="Email"
                    value={form.email}
                    onChange={(v) => set("email", v)}
                    error={errors?.email?.[0]}
                  />

                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(v) => set("password", v)}
                      error={errors?.password?.[0]}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                 
                 <div className="space-y-4">
                  
                  <div className="relative">
                    <Input
                      label="Confirm Password"
                      type={showPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(v) => set("confirmPassword", v)}
                      error={errors?.confirmPassword?.[0]}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              
              </>
            )}
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={prev}
              disabled={step === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-sm disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>

            {step < 2 ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-cyan-glow text-white text-sm font-medium shadow-glow"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={submit}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-cyan-glow text-white text-sm font-medium shadow-glow"
              >
                Create Account <Check className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", error }) {
  return (
    <div className="w-full">
      <label className="text-xs text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1.5 w-full px-4 py-2.5 rounded-xl bg-slate-900/[0.03] border transition focus:outline-none ${error
          ? "border-red-500 focus:ring-1 focus:ring-red-500"
          : "border-slate-900/[0.08] focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          }`}
      />
      {error && <p className="text-[10px] text-red-500 mt-1 ml-1">{error}</p>}
    </div>
  );
}


function Select({ label, value, onChange, options = [], error }) {
  return (
    <div className="w-full">
      <label className="text-xs text-muted-foreground">{label}</label>

      <div className="relative mt-1.5">
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-900/[0.03] border transition focus:outline-none appearance-none ${error
              ? "border-red-500 focus:ring-1 focus:ring-red-500"
              : "border-slate-900/[0.08] focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            }`}
        >
          <option value="" disabled>
            Select {label}
          </option>

          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Arrow icon */}
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg
            className="w-4 h-4 text-gray-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {error && (
        <p className="text-[10px] text-red-500 mt-1 ml-1">{error}</p>
      )}
    </div>
  );
}