# SAT Vocab Quest 🚀

A fast, lightweight, and actually fun web game I built to help myself and other high schoolers study for the Digital SAT reading and writing section without falling asleep or getting paywalled.

Built for **Hack Club Stardance**.

- **Play in browser**: [satvocab.xyz](https://satvocab.xyz)
- **Offline / PWA**: Installable directly on your phone or Chromebook with full offline support.
- **Cost**: 100% free forever. No accounts, no paywalls, zero ads, zero tracking.

---

## Why I Built This

When studying for the Digital SAT, I ran into two big problems:

1. **Every popular tool wanted money.** Quizlet locked spaced repetition and practice tests behind a $36/year subscription.
2. **Flashcards don't reflect the test.** The Digital SAT rarely asks you for a straight dictionary definition. Instead, it tests words *in context*—dropping words like *equivocal*, *pragmatic*, *disparate*, and *ephemeral* into dense science, history, or humanities passages. If you only memorize words in isolation, you get tricked by deceptive distractors.

I wanted a game that:
- Felt tactile and responsive like an arcade game.
- Supported fast keyboard navigation (`1-4` for multiple choice, `Space` and arrows for flashcards).
- Synthesized its own sound effects procedurally with the Web Audio API so it doesn't download 50MB of audio files.
- Implemented real spaced repetition (Leitner 6-box system) so you focus on words you actually struggle with.
- Worked completely offline on the bus ride to school.

---

## Game Modes

| Mode | What it does | Best for |
|:---|:---|:---|
| **Definition Match** | 4-choice rapid fire quiz with tricky distractor definitions. Supports keys `[1]`, `[2]`, `[3]`, `[4]`. | Fast recognition & drill |
| **Context Clues** | Fill-in-the-blank sentences styled after authentic College Board reading passages. | Real test readiness |
| **Speed Run** | 60-second adrenaline sprint. Tests instinctive word recall under time pressure. | Breaking test anxiety |
| **Word Scramble** | Unscramble letters against the clock. | Locking down prefixes & roots |
| **Flashcards** | 3D card flips with Leitner intervals. Press `Space` to flip, `←` / `→` to grade. | Self-paced memorization |
| **Community Hardest** | Dynamically serves the top 50 most failed words across all players. | Beating the test curve |
| **Smart Review** | Your personal hit list of overdue words or words with low accuracy. | Targeted retention |

---

## The Leitner Spaced Repetition Engine

The spaced repetition system (`src/lib/srs.ts`) uses a 6-box Leitner model. Words move up when you answer correctly and drop back to Box 0 whenever you miss:

```text
       ┌──────────┐  Correct  ┌──────────┐  Correct  ┌──────────┐
New ──>│  Box 0   ├──────────>│  Box 1   ├──────────>│  Box 2   ├── ... ──> [Box 5: Mastered ✨]
       │ Immediate│           │  1 Day   │           │  3 Days  │
       └─────┬────┘           └────┬─────┘           └────┬─────┘
             ▲                     │                      │
             └────── Missed ───────┴────── Missed ────────┘
```

| Box | Review Interval | Learning Stage |
|:---:|:---|:---|
| **0** | Today / Immediate | New word or recently missed |
| **1** | 1 day | Early learning |
| **2** | 3 days | Short-term memory |
| **3** | 7 days | Consolidation |
| **4** | 14 days | Long-term memory |
| **5** | 30 days | Mastered ✨ |

All progress is saved immediately to your browser's `localStorage`. You can also generate a temporary 6-digit sync code in the app to copy your save between your phone and laptop without registering an account.

---

## Audio Architecture (Zero Audio Files)

Instead of shipping bulky MP3 or WAV files, the audio engine (`src/lib/sound.ts`) synthesizes all sounds on the fly using the browser's native **Web Audio API**:

- **Correct Chime**: A dual-tone sine wave arpeggio (587.33 Hz $\to$ 880 Hz) with an exponential gain falloff.
- **Error Buzzer**: A 140 Hz downward ramped triangle wave.
- **Streak Fanfare**: A 3-note ascending chord arpeggio (C5 $\to$ E5 $\to$ G5) triggered at 5+ streaks.
- **Mute Toggle**: A tactile button in the header that persists your audio preference in `localStorage`.

Total audio asset weight: **0 KB**.

---

## Tech Stack & Design Philosophy

- **Framework**: React 19 + TypeScript + Vite.
- **Styling**: Tailwind CSS v4. Clean custom CSS keyframes for card flips and screen transitions instead of heavy animation bundles.
- **Icons**: Lucide React.
- **State**: Zustand with local storage persistence.
- **Backend (Optional)**: Vercel Serverless Functions + Upstash Redis for global leaderboards and multi-device sync codes. (The entire game is 100% playable offline without the backend).
- **Bundle Size**: Under 250 KB total gzipped. Runs smoothly on any school Chromebook.

---

## Getting Started Locally

Requirements: Node.js 18+

```bash
# 1. Clone the repository
git clone https://github.com/shouryasharan7-netizen/sat-vocab-game.git
cd sat-vocab-game

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

To check code health and run a production build:
```bash
npm run lint      # oxlint checks
npm run build     # TypeScript typecheck + Vite production bundle
npm run preview   # Preview the production build locally
```

---

## Contributing Words & Roots

Want to add words from your own practice tests or improve sentence examples?

The vocabulary list lives in `src/data/words.ts`. Each entry follows this TypeScript schema:

```typescript
{
  word: "ephemeral",
  pos: "adjective",
  def: "lasting for a very short time; fleeting",
  ex: "The ephemeral beauty of cherry blossoms draws millions of visitors every spring.",
  synonyms: ["fleeting", "transient", "evanescent"],
  antonyms: ["permanent", "eternal", "enduring"],
  roots: [
    { root: "epi-", meaning: "upon / for" },
    { root: "hemera", meaning: "day" }
  ]
}
```

Pull requests and typo fixes are welcome!

---

## License

MIT License. Free to use, fork, study, and adapt.
