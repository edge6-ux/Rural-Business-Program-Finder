/**
 * matcher.ts — deterministic, rule-based program scorer.
 *
 * HOW SCORING WORKS
 * -----------------
 * 1. Build a "need profile" — a set of tags derived from the user's quiz answers.
 * 2. For each program, count how many of its tags appear in the need profile.
 *    Each matching tag adds 1 point. No ML, no randomness.
 * 3. Filter programs that score 0 (no relevant tags).
 * 4. Build a human-readable "reasons" list from which tags matched.
 * 5. Return results sorted descending by score.
 *
 * EXTENDING THE MATCHER
 * ---------------------
 * - Add new tags to the TAG_MAPS below to cover new quiz answers.
 * - Add region filtering: if you add state-specific programs, put state codes
 *   in Program.regions and extract the user's state from zipOrCounty.
 */

import { Program, PROGRAMS, BusinessType, SizeCategory, PrimaryNeed } from "./mockPrograms";

export interface QuizAnswers {
  /** Free-text zip code or county name */
  zipOrCounty: string;
  /** Two-letter US state code derived or entered by the user */
  state: string;
  businessType: BusinessType;
  size: SizeCategory;
  primaryNeed: PrimaryNeed;
}

export interface MatchResult {
  program: Program;
  score: number;
  /** Human-readable bullets explaining why this program matched */
  reasons: string[];
}

// ---------------------------------------------------------------------------
// Tag maps — translate quiz answers into sets of program tags
// ---------------------------------------------------------------------------

const BUSINESS_TYPE_TAGS: Record<BusinessType, string[]> = {
  farmer: ["agriculture", "farming", "rural", "specialty-crop"],
  meat_processor: ["meat-processing", "processing", "agriculture", "rural"],
  retail: ["retail", "direct-marketing", "food-supply-chain", "small-business"],
  online: ["online", "food-supply-chain", "small-business"],
  other: ["small-business"],
};

const SIZE_TAGS: Record<SizeCategory, string[]> = {
  micro: ["micro-enterprise", "startup", "small-business"],
  small: ["small-business", "startup"],
  medium: ["small-business", "medium-business"],
  large: ["medium-business"],
};

const NEED_TAGS: Record<PrimaryNeed, string[]> = {
  loan: ["loan", "working-capital", "equipment", "real-estate"],
  grant: ["grant"],
  disaster_aid: ["disaster-aid"],
  technical_assistance: ["technical-assistance", "mentoring"],
};

// Human-friendly label for each tag, used when generating reasons.
const TAG_LABELS: Record<string, string> = {
  loan: "provides loans",
  grant: "offers grants",
  "disaster-aid": "covers disaster recovery",
  "technical-assistance": "offers technical assistance or mentoring",
  mentoring: "includes free mentoring",
  agriculture: "supports agricultural businesses",
  farming: "designed for farmers",
  "meat-processing": "targets meat/poultry processors",
  processing: "supports food processing",
  retail: "relevant to retail food sellers",
  online: "open to online food businesses",
  "small-business": "available to small businesses",
  "micro-enterprise": "specifically helps micro-enterprises",
  "medium-business": "available to mid-size businesses",
  startup: "open to new and early-stage businesses",
  rural: "serves rural areas and businesses",
  "working-capital": "can fund working capital",
  equipment: "can fund equipment purchases",
  "real-estate": "can fund real estate",
  "specialty-crop": "supports specialty crop producers",
  "direct-marketing": "supports direct-to-consumer marketing",
  "food-supply-chain": "supports food supply chain businesses",
  energy: "covers energy efficiency and renewables",
};

// ---------------------------------------------------------------------------
// Core matcher
// ---------------------------------------------------------------------------

/**
 * Returns programs ranked by relevance to the user's quiz answers.
 * Programs with score 0 are excluded.
 */
export function matchPrograms(answers: QuizAnswers): MatchResult[] {
  // Build the user's need-profile tag set
  const needTags = new Set<string>([
    ...BUSINESS_TYPE_TAGS[answers.businessType],
    ...SIZE_TAGS[answers.size],
    ...NEED_TAGS[answers.primaryNeed],
  ]);

  const results: MatchResult[] = [];

  for (const program of PROGRAMS) {
    // Region check: pass if program is national OR includes the user's state
    const stateUpper = answers.state.toUpperCase().trim();
    const regionOk =
      program.regions.includes("national") ||
      program.regions.includes(stateUpper);

    if (!regionOk) continue;

    // Score = number of the program's tags that appear in the need profile
    const matchedTags = program.tags.filter((t) => needTags.has(t));
    const score = matchedTags.length;

    if (score === 0) continue;

    // Build human-readable reasons from matched tags
    const reasons = matchedTags.map(
      (t) => TAG_LABELS[t] ?? t
    );

    // Deduplicate reasons (multiple tags can share a label)
    const uniqueReasons = [...new Set(reasons)];

    results.push({ program, score, reasons: uniqueReasons });
  }

  // Sort descending by score, then alphabetically by name for stable ordering
  results.sort((a, b) =>
    b.score !== a.score ? b.score - a.score : a.program.name.localeCompare(b.program.name)
  );

  return results;
}
