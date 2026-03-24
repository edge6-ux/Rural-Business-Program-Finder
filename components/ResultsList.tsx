"use client";

import { MatchResult } from "@/lib/matcher";
import { Board, exportBoardAsJSON } from "@/lib/localStore";

interface Props {
  board: Board;
  onRetake: () => void;
  onSave: () => void;
  alreadySaved: boolean;
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

export default function ResultsList({ board, onRetake, onSave, alreadySaved }: Props) {
  const { results, answers } = board;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {results.length > 0
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

      {results.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-[#565c65] text-sm mb-3">
            No programs matched your current profile. Try adjusting your business type or primary need.
          </p>
          <button
            onClick={onRetake}
            className="px-4 py-2 text-sm font-semibold bg-[#005ea2] text-white hover:bg-[#1a4480] transition-colors"
          >
            Retake Quiz
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {results.map((r) => (
            <ProgramCard key={r.program.id} result={r} />
          ))}
        </div>
      )}
    </div>
  );
}
