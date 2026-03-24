/**
 * localStore.ts — thin localStorage wrapper.
 *
 * All data is stored under a single key as a JSON blob.
 * Shape:
 * {
 *   boards: Board[]     — named result-sets the user has saved
 *   lastAnswers: QuizAnswers | null
 * }
 */

import { QuizAnswers, MatchResult } from "./matcher";

export interface Board {
  id: string;
  name: string;
  createdAt: string; // ISO string
  answers: QuizAnswers;
  results: MatchResult[];
}

interface StoreData {
  boards: Board[];
  lastAnswers: QuizAnswers | null;
}

const STORE_KEY = "sba_rural_tracker";

function load(): StoreData {
  if (typeof window === "undefined") return { boards: [], lastAnswers: null };
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return { boards: [], lastAnswers: null };
    return JSON.parse(raw) as StoreData;
  } catch {
    return { boards: [], lastAnswers: null };
  }
}

function save(data: StoreData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

/** Returns all saved boards. */
export function getBoards(): Board[] {
  return load().boards;
}

/** Saves a new board and returns it. */
export function saveBoard(
  name: string,
  answers: QuizAnswers,
  results: MatchResult[]
): Board {
  const data = load();
  const board: Board = {
    id: `board_${Date.now()}`,
    name,
    createdAt: new Date().toISOString(),
    answers,
    results,
  };
  data.boards = [board, ...data.boards];
  save(data);
  return board;
}

/** Deletes a board by id. */
export function deleteBoard(id: string): void {
  const data = load();
  data.boards = data.boards.filter((b) => b.id !== id);
  save(data);
}

/** Persists the last quiz answers so the user doesn't have to re-enter. */
export function saveLastAnswers(answers: QuizAnswers): void {
  const data = load();
  data.lastAnswers = answers;
  save(data);
}

export function getLastAnswers(): QuizAnswers | null {
  return load().lastAnswers;
}

/** Downloads the given board as a JSON file. */
export function exportBoardAsJSON(board: Board): void {
  const blob = new Blob([JSON.stringify(board, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sba-results-${board.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
