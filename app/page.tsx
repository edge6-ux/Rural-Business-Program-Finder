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

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [quizOpen, setQuizOpen] = useState(false);
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
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          {/* SBA Logo */}
          <button
            onClick={() => setView("home")}
            className="shrink-0 flex items-center"
          >
            <Image
              src="/logo3.png"
              alt="U.S. Small Business Administration"
              height={48}
              width={200}
              style={{ width: "auto", height: "48px" }}
              priority
            />
          </button>

          <button
            onClick={() => setQuizOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[#005ea2] text-white rounded-none hover:bg-[#1a4480] transition-colors"
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

      <main className="max-w-3xl mx-auto px-4 py-10 flex-1 w-full">
        {view === "home" && (
          <div>
            {/* Hero */}
            <div className="mb-10">
              <div className="bg-[#eff6fb] border-l-4 border-[#005ea2] px-6 py-6 mb-8">
                <h1 className="text-2xl font-bold text-[#1b1b1b] mb-2">
                  Find Rural Business Programs
                </h1>
                <p className="text-[#3d4551] text-sm leading-relaxed max-w-lg">
                  Answer 4 quick questions and we&apos;ll match you with SBA and USDA
                  programs you may be eligible for — no account needed.
                </p>
                <button
                  onClick={() => setQuizOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#005ea2] text-white hover:bg-[#1a4480] transition-colors"
                >
                  Start the Quiz
                </button>
              </div>
            </div>

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
                <span className="text-white underline">sba.gov</span> for official program details.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
