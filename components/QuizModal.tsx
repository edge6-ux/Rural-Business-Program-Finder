"use client";

import { useState } from "react";
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
  { value: "farmer", label: "Farmer / Rancher", emoji: "🌾" },
  { value: "meat_processor", label: "Meat / Poultry Processor", emoji: "🥩" },
  { value: "retail", label: "Retail Food Seller", emoji: "🏪" },
  { value: "online", label: "Online Food Business", emoji: "💻" },
  { value: "other", label: "Other Rural Small Business", emoji: "🏘️" },
] as const;

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
      <div className="bg-white shadow-2xl w-full max-w-lg p-8 relative border-t-4 border-[#005ea2]">
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close quiz"
          className="absolute top-4 right-4 text-[#71767a] hover:text-[#1b1b1b] text-xl leading-none"
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
            {BUSINESS_TYPES.map((bt) => (
              <button
                key={bt.value}
                onClick={() => update("businessType", bt.value)}
                className={`w-full text-left px-4 py-3 border text-sm transition-colors ${
                  answers.businessType === bt.value
                    ? "border-[#005ea2] border-2 bg-[#eff6fb] font-semibold text-[#1a4480]"
                    : "border-[#a9aeb1] hover:border-[#005ea2] text-[#1b1b1b]"
                }`}
              >
                <span className="mr-2">{bt.emoji}</span>
                {bt.label}
              </button>
            ))}
          </div>
        )}

        {/* Step 2 — Size */}
        {step === 2 && (
          <div className="space-y-3">
            <p className="font-medium text-gray-800">How large is your business?</p>
            {SIZES.map((s) => (
              <button
                key={s.value}
                onClick={() => update("size", s.value)}
                className={`w-full text-left px-4 py-3 border text-sm transition-colors ${
                  answers.size === s.value
                    ? "border-[#005ea2] border-2 bg-[#eff6fb] font-semibold text-[#1a4480]"
                    : "border-[#a9aeb1] hover:border-[#005ea2] text-[#1b1b1b]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Step 3 — Primary need */}
        {step === 3 && (
          <div className="space-y-3">
            <p className="font-medium text-gray-800">What is your primary need right now?</p>
            {NEEDS.map((n) => (
              <button
                key={n.value}
                onClick={() => update("primaryNeed", n.value)}
                className={`w-full text-left px-4 py-3 border text-sm transition-colors ${
                  answers.primaryNeed === n.value
                    ? "border-[#005ea2] border-2 bg-[#eff6fb] font-semibold text-[#1a4480]"
                    : "border-[#a9aeb1] hover:border-[#005ea2] text-[#1b1b1b]"
                }`}
              >
                <span className="font-semibold">{n.label}</span>
                <span className="block text-xs text-gray-500 mt-0.5">{n.desc}</span>
              </button>
            ))}
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
              className="px-4 py-2 text-sm text-[#005ea2] border border-[#005ea2] hover:bg-[#eff6fb] transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <button
              onClick={next}
              className="px-6 py-2 text-sm font-semibold bg-[#005ea2] text-white hover:bg-[#1a4480] transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={submit}
              className="px-6 py-2 text-sm font-semibold bg-[#005ea2] text-white hover:bg-[#1a4480] transition-colors"
            >
              Find Programs
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
