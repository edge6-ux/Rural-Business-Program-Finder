"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import QuizModal from "@/components/QuizModal";
import ResultsList from "@/components/ResultsList";
import { QuizAnswers, MatchResult } from "@/lib/matcher";
import {
  Board,
  getBoards,
  saveBoard,
  deleteBoard,
  getLastAnswers,
} from "@/lib/localStore";

type View = "home" | "results";

function trackEvent(name: string, payload?: Record<string, unknown>) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dl = (window as any).dataLayer;
    if (Array.isArray(dl)) {
      dl.push({ event: name, ...payload });
    }
  } catch {
    // analytics unavailable — fail silently
  }
}

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [quizOpen, setQuizOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);
  const [lastAnswers, setLastAnswers] = useState<QuizAnswers | null>(null);

  // Load persisted boards on mount
  useEffect(() => {
    setBoards(getBoards());
    setLastAnswers(getLastAnswers());
  }, []);

  function handleQuizComplete(answers: QuizAnswers, results: MatchResult[]) {
    const board = saveBoard(
      `Search — ${new Date().toLocaleDateString()}`,
      answers,
      results
    );
    setBoards(getBoards());
    setActiveBoard(board);
    setLastAnswers(answers);
    setQuizOpen(false);
    setView("results");
    console.log("[analytics] quiz_complete", {
      businessType: answers.businessType,
      primaryNeed: answers.primaryNeed,
      resultsCount: results.length,
    });
  }

  function handleSaveBoard() {
    // Board is already saved on quiz complete; this is a no-op stub for re-saves
    setBoards(getBoards());
  }

  function handleDeleteBoard(id: string) {
    deleteBoard(id);
    setBoards(getBoards());
    if (activeBoard?.id === id) {
      setActiveBoard(null);
      setView("home");
    }
  }

  function openBoard(board: Board) {
    setActiveBoard(board);
    setView("results");
  }

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">

      {/* USWDS .gov banner */}
      <section className="bg-[#f0f0f0] border-b border-[#a9aeb1]">
        <div className="max-w-5xl mx-auto px-4 py-1.5 flex items-center gap-2 text-xs text-[#1b1b1b]">
          <svg
            aria-hidden="true"
            focusable="false"
            className="w-4 h-3 shrink-0"
            viewBox="0 0 59 44"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>U.S. flag</title>
            <g fill="none">
              <g>
                <rect width="59" height="44" fill="#B22234" />
                {[0,1,2,3,4,5].map((i) => (
                  <rect key={i} y={i * 6 + (i > 0 ? 1 : 0)} width="59" height="3.4" fill="#B22234" />
                ))}
                {[0,1,2,3,4,5,6].map((i) => (
                  <rect key={i} y={i * 6 + 3.4} width="59" height="2.7" fill="white" />
                ))}
                <rect width="24" height="20" fill="#3C3B6E" />
              </g>
            </g>
          </svg>
          <span className="font-semibold">An official website of the United States government</span>
          <span className="text-[#005ea2] ml-1 cursor-pointer hover:underline hidden sm:inline">Here&apos;s how you know ›</span>
        </div>
      </section>

      {/* SBA Header — white logo bar */}
      <header className="bg-white sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
          {/* SBA Logo */}
          <button
            onClick={() => setView("home")}
            className="shrink-0 flex items-center"
            aria-label="Go to homepage"
          >
            <Image
              src="/logo3.png"
              alt="U.S. Small Business Administration"
              height={48}
              width={200}
              style={{ width: "auto", height: "clamp(32px, 6vw, 48px)" }}
              priority
            />
          </button>

          <button
            onClick={() => setQuizOpen(true)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold bg-[#005ea2] text-white rounded-none hover:bg-[#1a4480] transition-colors min-h-[40px]"
          >
            + New Search
          </button>
        </div>

        {/* Dark blue nav bar (USWDS extended header bottom bar) */}
        <div className="bg-[#1a4480] h-10 flex items-center px-4">
          <div className="max-w-5xl mx-auto w-full">
            <span className="text-white text-sm font-semibold tracking-wide">
              Rural Business Program Finder
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 sm:py-10 flex-1 w-full">
        {view === "home" && (
          <div>
            {/* Hero */}
            <section aria-labelledby="hero-heading" className="mb-10">
              <div className="bg-[#eff6fb] border-l-4 border-[#005ea2] px-4 py-6 sm:px-6 sm:py-8 mb-8">
                <h1
                  id="hero-heading"
                  className="text-2xl sm:text-3xl font-bold text-[#1b1b1b] mb-3 leading-tight"
                >
                  Find federal programs for rural businesses — fast.
                </h1>
                <p className="text-[#3d4551] text-sm sm:text-base leading-relaxed max-w-xl mb-5">
                  Search grants, loans, and technical assistance by location,
                  industry, and eligibility. Answer 4 quick questions — no
                  account needed.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    id="hero-find"
                    onClick={() => {
                      trackEvent("hero_cta_click", { cta: "find_programs" });
                      setQuizOpen(true);
                    }}
                    aria-label="Find programs — open the search quiz"
                    className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-sm font-semibold bg-[#005ea2] text-white hover:bg-[#1a4480] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005ea2]"
                  >
                    Find programs
                  </button>
                  <button
                    onClick={() => setHowItWorksOpen(true)}
                    aria-label="How it works — learn about this tool"
                    className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-sm font-semibold border border-[#005ea2] text-[#005ea2] hover:bg-[#d9e8f6] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005ea2]"
                  >
                    How it works
                  </button>
                </div>

                <p className="mt-5 text-xs text-[#565c65]">
                  Source: Administering agencies.{" "}
                  <a
                    href="https://www.sba.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#005ea2] hover:text-[#1a4480]"
                  >
                    Visit sba.gov
                  </a>{" "}
                  for official program details.
                </p>
              </div>
            </section>

            {/* Saved boards */}
            {boards.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-[#565c65] uppercase tracking-wide mb-3">
                  Saved Searches
                </h2>
                <div className="grid gap-3">
                  {boards.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white border border-[#a9aeb1] px-4 py-3 flex items-center justify-between gap-3 hover:border-[#005ea2] hover:shadow-sm transition-all"
                    >
                      <button
                        className="flex-1 text-left"
                        onClick={() => openBoard(b)}
                      >
                        <p className="text-sm font-medium text-gray-800">{b.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {b.results.length} match
                          {b.results.length !== 1 ? "es" : ""} &middot;{" "}
                          {b.answers.businessType.replace("_", " ")} &middot;{" "}
                          {b.answers.primaryNeed.replace("_", " ")}
                        </p>
                      </button>
                      <div className="flex gap-2 items-center shrink-0">
                        <button
                          onClick={() => openBoard(b)}
                          className="text-xs text-[#1a4480] hover:underline font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteBoard(b.id)}
                          aria-label="Delete search"
                          className="text-xs text-gray-400 hover:text-red-500"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {boards.length === 0 && (
              <div className="mt-4 border-2 border-dashed border-[#a9aeb1] py-12 text-center">
                <p className="text-[#71767a] text-sm">
                  No saved searches yet. Start the quiz to find your programs.
                </p>
              </div>
            )}
          </div>
        )}

        {view === "results" && activeBoard && (
          <ResultsList
            board={activeBoard}
            onRetake={() => setQuizOpen(true)}
            onSave={handleSaveBoard}
            alreadySaved={boards.some((b) => b.id === activeBoard.id)}
          />
        )}
      </main>

      {/* Quiz modal */}
      {quizOpen && (
        <QuizModal
          onComplete={handleQuizComplete}
          onClose={() => setQuizOpen(false)}
          initialAnswers={lastAnswers}
        />
      )}

      {/* How it works modal */}
      {howItWorksOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hiw-title"
        >
          <div className="bg-white shadow-2xl w-full max-w-md p-6 sm:p-8 relative border-t-4 border-[#005ea2] overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setHowItWorksOpen(false)}
              aria-label="Close how it works"
              className="absolute top-4 right-4 text-[#71767a] hover:text-[#1b1b1b] text-xl leading-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#005ea2]"
            >
              ✕
            </button>
            <h2 id="hiw-title" className="text-xl font-bold text-[#1b1b1b] mb-4">
              How it works
            </h2>
            <ol className="space-y-4 text-sm text-[#1b1b1b]">
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[#005ea2] text-white text-xs font-bold flex items-center justify-center">1</span>
                <div>
                  <p className="font-semibold">Answer 4 questions</p>
                  <p className="text-[#565c65] mt-0.5">Tell us your location, business type, size, and primary need.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[#005ea2] text-white text-xs font-bold flex items-center justify-center">2</span>
                <div>
                  <p className="font-semibold">Get matched programs</p>
                  <p className="text-[#565c65] mt-0.5">We filter SBA and USDA programs to those you may qualify for.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[#005ea2] text-white text-xs font-bold flex items-center justify-center">3</span>
                <div>
                  <p className="font-semibold">Apply through the agency</p>
                  <p className="text-[#565c65] mt-0.5">Each result links directly to the official program page. No middleman.</p>
                </div>
              </li>
            </ol>
            <p className="mt-6 text-xs text-[#565c65] border-t border-[#dfe1e2] pt-4">
              Program data is sourced from SBA and USDA agency publications.
              Eligibility is determined solely by the administering agency.{" "}
              <a
                href="https://www.sba.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-[#005ea2]"
              >
                sba.gov
              </a>
            </p>
            <button
              onClick={() => {
                setHowItWorksOpen(false);
                trackEvent("hero_cta_click", { cta: "find_programs_from_hiw" });
                setQuizOpen(true);
              }}
              className="mt-4 w-full px-5 py-2.5 text-sm font-semibold bg-[#005ea2] text-white hover:bg-[#1a4480] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005ea2]"
            >
              Find programs
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#162e52] text-white mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row gap-6 justify-between">
            <div>
              <div className="mb-3">
                <Image
                  src="/footer3.png"
                  alt="U.S. Small Business Administration"
                  height={40}
                  width={160}
                  style={{ width: "auto", height: "40px" }}
                />
              </div>
              <p className="text-[#a9c6e3] text-xs">409 3rd St., SW, Washington, DC 20416</p>
              <p className="text-[#a9c6e3] text-xs">1-800-827-5722</p>
            </div>
            <div className="max-w-sm">
              <p className="text-[#a9c6e3] text-xs leading-relaxed">
                This tool is for informational purposes only. Program eligibility is
                determined by the administering agency. Visit{" "}
                <a href="https://www.sba.gov/" target="_blank" rel="noopener noreferrer" className="text-white underline">sba.gov</a> for official program details.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
