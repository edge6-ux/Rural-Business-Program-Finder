"use client";

import { MatchResult } from "@/lib/matcher";
import { Board, exportBoardAsJSON } from "@/lib/localStore";

interface Props {
  board: Board;
  onRetake: () => void;
  onSave: () => void;
  alreadySaved: boolean;
  loading?: boolean;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 4
      ? "bg-[#ecf3ec] text-[#19511e]"
      : score >= 2
      ? "bg-[#d9e8f6] text-[#1a4480]"
      : "bg-[#f0f0f0] text-[#565c65]";
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {score} match{score !== 1 ? "es" : ""}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="border border-[#a9aeb1] p-5 bg-white animate-pulse" aria-hidden="true">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-5 bg-gray-200 rounded-full w-16" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
      <div className="space-y-1.5 mb-4">
        <div className="h-2.5 bg-gray-200 rounded w-20 mb-2" />
        <div className="h-2.5 bg-gray-200 rounded w-1/2" />
        <div className="h-2.5 bg-gray-200 rounded w-2/5" />
      </div>
      <div className="h-8 bg-gray-200 rounded w-32" />
    </div>
  );
}

function ProgramCard({ result }: { result: MatchResult }) {
  const { program, score, reasons } = result;
  return (
    <div className="border border-[#a9aeb1] p-5 bg-white shadow-sm hover:shadow-md hover:border-[#005ea2] transition-all">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug">{program.name}</h3>
        <ScoreBadge score={score} />
      </div>

      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{program.description}</p>

      {/* Why it matched */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Why it matched
        </p>
        <ul className="space-y-0.5">
          {reasons.map((r) => (
            <li key={r} className="text-xs text-gray-600 flex gap-1.5 items-start">
              <span className="text-green-500 mt-0.5">✓</span>
              <span className="capitalize">{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Amount badge if present */}
      {program.maxAmount && (
        <p className="text-xs text-gray-500 mb-3">
          <span className="font-medium">Max amount:</span> {program.maxAmount}
        </p>
      )}

      {/* CTA */}
      <a
        href={program.link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          // Track CTA click for measurement (console stand-in for analytics)
          console.log("[analytics] apply_cta_click", { programId: program.id });
        }}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#005ea2] text-white hover:bg-[#1a4480] transition-colors"
      >
        Apply / Learn More
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 7l-10 10M17 7H7m10 0v10" />
        </svg>
      </a>
    </div>
  );
}

export default function ResultsList({ board, onRetake, onSave, alreadySaved, loading }: Props) {
  const { results, answers } = board;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {loading
              ? "Finding programs…"
              : results.length > 0
              ? `${results.length} program${results.length !== 1 ? "s" : ""} matched`
              : "No programs matched"}
          </h2>
          <p className="text-sm text-gray-500">
            For: {answers.zipOrCounty}, {answers.state} &middot;{" "}
            {answers.businessType.replace("_", " ")} &middot;{" "}
            {answers.primaryNeed.replace("_", " ")}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={onRetake}
            className="px-3 py-1.5 text-xs border border-[#005ea2] text-[#005ea2] hover:bg-[#eff6fb] transition-colors"
          >
            Retake Quiz
          </button>
          {!alreadySaved && (
            <button
              onClick={onSave}
              className="px-3 py-1.5 text-xs bg-[#005ea2] text-white font-semibold hover:bg-[#1a4480] transition-colors"
            >
              Save Results
            </button>
          )}
          <button
            onClick={() => {
              exportBoardAsJSON(board);
              console.log("[analytics] export_json_click", { boardId: board.id });
            }}
            className="px-3 py-1.5 text-xs border border-[#a9aeb1] text-[#565c65] hover:bg-[#f0f0f0] transition-colors"
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* Sign-up nudge */}
      <div className="border-l-4 border-[#005ea2] bg-[#eff6fb] px-4 py-3 text-sm flex items-start gap-3">
        <span className="text-[#005ea2] text-lg leading-none mt-0.5">ℹ</span>
        <div>
          <span className="font-semibold text-[#1a4480]">Results stored locally.</span>{" "}
          <span className="text-[#3d4551]">
            <button
              className="underline font-medium text-[#005ea2] hover:text-[#1a4480]"
              onClick={() => alert("Account sign-up coming soon!")}
            >
              Sign up to sync across devices.
            </button>
          </span>
        </div>
      </div>

      {loading ? (
        <div aria-live="polite" aria-busy="true" aria-label="Loading program results">
          <div className="grid gap-4">
            {[1, 2, 3].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="border border-[#dfe1e2] bg-[#f0f0f0] p-8" role="region" aria-label="No programs found">
          <div className="flex justify-center mb-4">
            <svg
              className="w-12 h-12 text-[#a9aeb1]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="M21 21l-3.5-3.5" />
              <path strokeLinecap="round" d="M8.5 11h5M11 8.5v5" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-[#1b1b1b] text-center mb-2">
            No programs matched your search
          </h3>
          <p className="text-sm text-[#565c65] text-center mb-5">
            Try one of these next steps:
          </p>
          <ul className="space-y-3 mb-6 max-w-sm mx-auto">
            <li className="flex gap-2 items-start text-sm text-[#1b1b1b]">
              <span className="text-[#005ea2] font-bold shrink-0">1.</span>
              <span><strong>Broaden your filters</strong> — select &ldquo;Other Rural Small Business&rdquo; or change your primary need.</span>
            </li>
            <li className="flex gap-2 items-start text-sm text-[#1b1b1b]">
              <span className="text-[#005ea2] font-bold shrink-0">2.</span>
              <span><strong>Search neighboring counties</strong> — some programs are region-specific and may cover adjacent areas.</span>
            </li>
            <li className="flex gap-2 items-start text-sm text-[#1b1b1b]">
              <span className="text-[#005ea2] font-bold shrink-0">3.</span>
              <span>
                <strong>Contact the SBA directly</strong> —{" "}
                <a
                  href="https://www.sba.gov/local-assistance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-[#005ea2] hover:text-[#1a4480]"
                >
                  find your local SBA district office
                </a>{" "}
                for personalized guidance.
              </span>
            </li>
          </ul>
          <div className="flex justify-center">
            <button
              onClick={onRetake}
              className="px-6 py-2.5 text-sm font-semibold bg-[#005ea2] text-white rounded hover:bg-[#1a4480] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005ea2]"
            >
              Clear filters &amp; retake quiz
            </button>
          </div>
        </div>
      ) : (
        <div aria-live="polite" className="grid gap-4">
          {results.map((r) => (
            <ProgramCard key={r.program.id} result={r} />
          ))}
        </div>
      )}
    </div>
  );
}
