# SBA Rural Tracker — Recommendation Engine Prototype

A Next.js prototype that matches rural business owners with SBA and USDA programs through a short quiz. No backend, no account required. All data persists in `localStorage`.

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing the Quiz

1. Click **+ New Search** (top-right) or **Start Quiz** on the home page.
2. Answer the 4 questions:
   - **Location** — any zip code or county name + 2-letter state (e.g. `78520`, `TX`)
   - **Business type** — farmer, meat processor, retail, online, or other
   - **Size** — micro / small / medium / large (by headcount or revenue)
   - **Primary need** — loan, grant, disaster aid, or technical assistance
3. Click **Find Programs** to see ranked matches.
4. Each result shows:
   - Why it matched (tag-level reasons)
   - Max funding amount where applicable
   - **Apply / Learn More** CTA linking to the official program page
5. Use **Export JSON** to download results. Use **Save Results** to keep the board locally. Use **Sign up to save across devices** (stub) to preview the account CTA.

### Example inputs that return good results

| Scenario | Business type | Need | Expected top result |
|---|---|---|---|
| Beginning farmer | Farmer | Loan | USDA FSA Beginning Farmer Loan |
| Disaster recovery | Farmer | Disaster aid | USDA FSA Emergency Loan / SBA EIDL |
| Small meat processor | Meat processor | Grant | USDA MPPEP |
| Micro rural business | Other | Grant | USDA RBDG / RMAP |
| Online food seller | Online | Grant | USDA LFPP |

---

## Project Structure

```
app/
  page.tsx          — Home board + quiz entry point (client component)
  layout.tsx        — Root layout (Next.js App Router)
components/
  QuizModal.tsx     — 4-step quiz UI (stepped state machine)
  ResultsList.tsx   — Ranked program cards with reasons + CTAs
lib/
  mockPrograms.ts   — 17 seeded SBA/USDA programs with tags and regions
  matcher.ts        — Rule-based scoring function (pure, no side effects)
  localStore.ts     — localStorage wrapper (boards, last answers, export)
```

---

## How Matching Works

See `lib/matcher.ts` for full inline documentation. Summary:

1. Quiz answers are translated into a **tag set** using three lookup maps:
   - `BUSINESS_TYPE_TAGS` — e.g. `farmer → [agriculture, farming, rural, ...]`
   - `SIZE_TAGS` — e.g. `micro → [micro-enterprise, startup, small-business]`
   - `NEED_TAGS` — e.g. `loan → [loan, working-capital, equipment, real-estate]`
2. Each program's `tags` array is intersected with the user's tag set.
3. **Score = number of matching tags.** Programs scoring 0 are filtered out.
4. Results are sorted descending by score (ties broken alphabetically).
5. Each matched tag is surfaced as a human-readable reason string.

**To add a new program:** add an entry to `lib/mockPrograms.ts` with appropriate tags.
**To add a new quiz answer:** add it to the relevant map in `lib/matcher.ts`.

---

## What to Measure (Analytics)

Three events are already instrumented as `console.log("[analytics] ...")` calls — replace with your analytics SDK (Plausible, Segment, etc.):

| Event | Where | What to track |
|---|---|---|
| `quiz_complete` | `app/page.tsx` | `businessType`, `primaryNeed`, `resultsCount` — funnel drop-off and profile distribution |
| `apply_cta_click` | `components/ResultsList.tsx` | `programId` — CTR per program; which programs drive the most clicks |
| `export_json_click` | `components/ResultsList.tsx` | `boardId` — export usage rate vs. total searches |

Key questions to answer after a pilot:
- **Time-to-result**: how long from page load to seeing results? (measure with `performance.now()` around quiz submit)
- **Top programs**: which programs appear most and get the most apply clicks?
- **Zero-result rate**: what % of quiz submissions return 0 matches? (signals missing programs or bad tags)

---

## Dependencies

Only what `create-next-app` installs: Next.js 14, React 18, Tailwind CSS. No external paid APIs, no AI calls.
