"use client";

import { useRef, useState } from "react";
import { QuizAnswers, matchPrograms, MatchResult } from "@/lib/matcher";
import { saveLastAnswers } from "@/lib/localStore";

interface Props {
  onComplete: (answers: QuizAnswers, results: MatchResult[]) => void;
  onClose: () => void;
  initialAnswers?: QuizAnswers | null;
}

type Step = 0 | 1 | 2 | 3;

const STEPS = 4;

const BUSINESS_TYPES = [
  { value: "farmer",         label: "Farmer / Rancher",           ariaLabel: "Farming or agriculture" },
  { value: "meat_processor", label: "Meat / Poultry Processor",   ariaLabel: "Meat or poultry processing" },
  { value: "retail",         label: "Retail Food Seller",         ariaLabel: "Retail or storefront" },
  { value: "online",         label: "Online Food Business",       ariaLabel: "Online business" },
  { value: "other",          label: "Other Rural Small Business", ariaLabel: "Other business type" },
] as const;

// ── SVG icons ──────────────────────────────────────────────────────────────

const svgProps = {
  width: 24, height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function IconFarmer() {
  return (
    <svg {...svgProps}>
      {/* stem */}
      <line x1="12" y1="22" x2="12" y2="9" />
      {/* left grain head */}
      <path d="M12 9 C10 7 9 4 11 3 C13 2 13 6 12 9" />
      {/* right grain head */}
      <path d="M12 9 C14 7 15 4 13 3 C11 2 11 6 12 9" />
      {/* left lower leaf */}
      <path d="M12 14 C10 12 8 11 8 8" />
      {/* right lower leaf */}
      <path d="M12 14 C14 12 16 11 16 8" />
    </svg>
  );
}

function IconMeatProcessor() {
  return (
    <svg {...svgProps}>
      {/* knife blade */}
      <path d="M8 3 C14 3 17 7 16 12 L8 12 Z" />
      {/* handle */}
      <line x1="8" y1="12" x2="8" y2="21" />
      {/* bolster line */}
      <line x1="6" y1="12" x2="10" y2="12" />
    </svg>
  );
}

function IconRetail() {
  return (
    <svg {...svgProps}>
      {/* bag body */}
      <path d="M5 7 H19 L17 21 H7 Z" />
      {/* handles */}
      <path d="M9 7 C9 4 15 4 15 7" />
    </svg>
  );
}

function IconOnline() {
  return (
    <svg {...svgProps}>
      {/* screen */}
      <rect x="3" y="3" width="18" height="13" rx="1.5" />
      {/* keyboard base */}
      <path d="M1 20 H23 L21 16 H3 Z" />
      {/* screen detail */}
      <line x1="9" y1="20" x2="15" y2="20" />
    </svg>
  );
}

function IconOther() {
  return (
    <svg {...svgProps}>
      {/* roof */}
      <path d="M3 10 L12 3 L21 10" />
      {/* walls */}
      <rect x="5" y="10" width="14" height="11" />
      {/* door */}
      <rect x="9" y="15" width="6" height="6" />
    </svg>
  );
}

const BUSINESS_TYPE_ICONS: Record<string, React.ReactNode> = {
  farmer:         <IconFarmer />,
  meat_processor: <IconMeatProcessor />,
  retail:         <IconRetail />,
  online:         <IconOnline />,
  other:          <IconOther />,
};

// ── Generic accessible radiogroup (steps 2 & 3) ────────────────────────────

function GenericRadioGroup<T extends string>({
  value,
  onChange,
  options,
  groupLabel,
}: {
  value: T | undefined;
  onChange: (v: T) => void;
  options: ReadonlyArray<{ value: T; label: string; desc?: string }>;
  groupLabel: string;
}) {
  const groupRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    const len = options.length;
    let next: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      next = (index + 1) % len;
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      next = (index - 1 + len) % len;
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = len - 1;
    }
    if (next !== null) {
      e.preventDefault();
      onChange(options[next].value);
      const buttons = groupRef.current?.querySelectorAll<HTMLElement>('[role="radio"]');
      buttons?.[next]?.focus();
    }
  }

  return (
    <div role="radiogroup" aria-label={groupLabel} ref={groupRef} className="space-y-2">
      {options.map((opt, i) => {
        const selected = value === opt.value;
        const isFirst = i === 0;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={selected}
            aria-label={opt.label}
            tabIndex={value ? (selected ? 0 : -1) : isFirst ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={`w-full text-left px-4 py-3 min-h-[44px] border text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#005ea2] ${
              selected
                ? "border-2 border-[#005ea2] bg-[#eff6fb] font-semibold text-[#1a4480]"
                : "border-[#a9aeb1] hover:border-[#005ea2] text-[#1b1b1b]"
            }`}
          >
            <span className="font-semibold">{opt.label}</span>
            {opt.desc && <span className="block text-xs text-gray-500 mt-0.5">{opt.desc}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ── Accessible radiogroup for step 1 ──────────────────────────────────────

function BusinessTypeRadioGroup({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  const groupRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    const len = BUSINESS_TYPES.length;
    let next: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      next = (index + 1) % len;
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      next = (index - 1 + len) % len;
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = len - 1;
    }
    if (next !== null) {
      e.preventDefault();
      onChange(BUSINESS_TYPES[next].value);
      const buttons = groupRef.current?.querySelectorAll<HTMLElement>('[role="radio"]');
      buttons?.[next]?.focus();
    }
  }

  return (
    <div role="radiogroup" aria-label="Business type" ref={groupRef} className="space-y-2">
      {BUSINESS_TYPES.map((bt, i) => {
        const selected = value === bt.value;
        const isFirst = i === 0;
        return (
          <button
            key={bt.value}
            role="radio"
            aria-checked={selected}
            aria-label={bt.ariaLabel}
            tabIndex={value ? (selected ? 0 : -1) : isFirst ? 0 : -1}
            onClick={() => onChange(bt.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={`w-full flex items-center gap-3 px-4 py-3 min-h-[44px] border text-sm transition-colors text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#005ea2] ${
              selected
                ? "border-2 border-[#005ea2] bg-[#eff6fb] text-[#1a4480] font-semibold"
                : "border-[#a9aeb1] hover:border-[#005ea2] text-[#1b1b1b]"
            }`}
          >
            <span className={selected ? "text-[#005ea2]" : "text-[#565c65]"}>
              {BUSINESS_TYPE_ICONS[bt.value]}
            </span>
            {bt.label}
          </button>
        );
      })}
    </div>
  );
}

const SIZES = [
  { value: "micro", label: "Micro (1–4 employees or < $250K revenue)" },
  { value: "small", label: "Small (5–49 employees or $250K–$5M revenue)" },
  { value: "medium", label: "Medium (50–249 employees or $5M–$50M revenue)" },
  { value: "large", label: "Large (250+ employees or > $50M revenue)" },
] as const;

const NEEDS = [
  { value: "loan", label: "Loan / Financing", desc: "Working capital, equipment, or real estate" },
  { value: "grant", label: "Grant", desc: "Non-repayable funding for eligible activities" },
  { value: "disaster_aid", label: "Disaster Recovery Aid", desc: "Relief after a natural disaster or emergency" },
  { value: "technical_assistance", label: "Technical Assistance", desc: "Mentoring, training, or business planning help" },
] as const;

function ProgressBar({ step }: { step: Step }) {
  return (
    <div className="flex gap-1 mb-6">
      {Array.from({ length: STEPS }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 transition-colors ${
            i <= step ? "bg-[#005ea2]" : "bg-[#dfe1e2]"
          }`}
        />
      ))}
    </div>
  );
}

export default function QuizModal({ onComplete, onClose, initialAnswers }: Props) {
  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>(
    initialAnswers ?? {}
  );
  const [error, setError] = useState("");

  function update<K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setError("");
  }

  function next() {
    if (step === 0 && !answers.zipOrCounty?.trim()) {
      setError("Please enter your zip code or county.");
      return;
    }
    if (step === 0 && !answers.state?.trim()) {
      setError("Please enter your state abbreviation (e.g. TX).");
      return;
    }
    if (step === 1 && !answers.businessType) {
      setError("Please select a business type.");
      return;
    }
    if (step === 2 && !answers.size) {
      setError("Please select a size.");
      return;
    }
    if (step < 3) {
      setStep((s) => (s + 1) as Step);
    }
  }

  function submit() {
    if (!answers.primaryNeed) {
      setError("Please select your primary need.");
      return;
    }
    const full = answers as QuizAnswers;
    saveLastAnswers(full);
    const results = matchPrograms(full);
    onComplete(full, results);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white shadow-2xl w-full max-w-lg p-6 sm:p-8 relative border-t-4 border-[#005ea2] overflow-y-auto max-h-[90vh]">
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close quiz"
          className="absolute top-4 right-4 text-[#71767a] hover:text-[#1b1b1b] text-xl leading-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005ea2]"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-[#1b1b1b] mb-1">
          Find Your Programs
        </h2>
        <p className="text-sm text-[#565c65] mb-4">
          Answer 4 quick questions — no account required.
        </p>

        <ProgressBar step={step} />

        {/* Step 0 — Location */}
        {step === 0 && (
          <div className="space-y-4">
            <p className="font-medium text-gray-800">Where is your business located?</p>
            <div>
              <label className="block text-sm font-semibold text-[#1b1b1b] mb-1">Zip Code or County</label>
              <input
                type="text"
                className="w-full border-b-2 border-[#565c65] px-3 py-2 text-sm focus:outline-none focus:border-[#005ea2] bg-[#f0f0f0]"
                placeholder="e.g. 78520 or Cameron County"
                value={answers.zipOrCounty ?? ""}
                onChange={(e) => update("zipOrCounty", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1b1b1b] mb-1">State (2-letter code)</label>
              <input
                type="text"
                maxLength={2}
                className="w-32 border-b-2 border-[#565c65] px-3 py-2 text-sm uppercase focus:outline-none focus:border-[#005ea2] bg-[#f0f0f0]"
                placeholder="TX"
                value={answers.state ?? ""}
                onChange={(e) => update("state", e.target.value.toUpperCase())}
              />
            </div>
          </div>
        )}

        {/* Step 1 — Business type */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="font-medium text-gray-800">What best describes your business?</p>
            <BusinessTypeRadioGroup
              value={answers.businessType}
              onChange={(v) => update("businessType", v as QuizAnswers["businessType"])}
            />
          </div>
        )}

        {/* Step 2 — Size */}
        {step === 2 && (
          <div className="space-y-3">
            <p className="font-medium text-gray-800">How large is your business?</p>
            <GenericRadioGroup
              value={answers.size}
              onChange={(v) => update("size", v as QuizAnswers["size"])}
              options={SIZES}
              groupLabel="Business size"
            />
          </div>
        )}

        {/* Step 3 — Primary need */}
        {step === 3 && (
          <div className="space-y-3">
            <p className="font-medium text-gray-800">What is your primary need right now?</p>
            <GenericRadioGroup
              value={answers.primaryNeed}
              onChange={(v) => update("primaryNeed", v as QuizAnswers["primaryNeed"])}
              options={NEEDS}
              groupLabel="Primary need"
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 gap-3">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="px-4 py-3 sm:py-2 text-sm text-[#005ea2] border border-[#005ea2] hover:bg-[#eff6fb] transition-colors min-h-[44px]"
            >
              Back
            </button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <button
              onClick={next}
              className="px-6 py-3 sm:py-2 text-sm font-semibold bg-[#005ea2] text-white hover:bg-[#1a4480] transition-colors min-h-[44px]"
            >
              Next
            </button>
          ) : (
            <button
              onClick={submit}
              className="px-6 py-3 sm:py-2 text-sm font-semibold bg-[#005ea2] text-white hover:bg-[#1a4480] transition-colors min-h-[44px]"
            >
              Find Programs
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
