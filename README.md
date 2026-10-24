# SAT Vocab Quest 🚀

A fast, no-nonsense web game I built to help myself (and anyone else suffering through the Digital SAT) actually memorize vocabulary without falling asleep.

Built for **Hack Club Stardance**.

- **Live Site**: [satvocab.xyz](https://satvocab.xyz)
- **Offline / PWA**: Installable on iOS/Android or desktop directly from your browser.

---

## Why I Built This

I was studying for the Digital SAT reading and writing section, and every vocab tool I found was either:
1. Locked behind a $35/year subscription (looking at you, Quizlet Plus).
2. Clunky and boring — flipping plain text cards where you just look at the word, nod, flip it, pretend you knew it, and move on.

The real Digital SAT doesn't just ask for a dictionary definition. It throws high-difficulty words like *aberration*, *sycophant*, or *pragmatic* into dense science or history paragraphs. If you only memorize words in isolation, you freeze up during the test.

I wanted something that felt like an arcade game, ran super fast on my phone during bus rides, worked completely offline, and had real spaced repetition built in so I wouldn't waste time reviewing words I already mastered.

---

## Game Modes

- **Definition Match**: Rapid-fire multiple choice. The distractors are chosen to be close enough that you actually have to read carefully.
- **Context Clues**: Fill-in-the-blank sentences styled like real Digital SAT reading passages (science, history, literature, economics).
- **Speed Run**: 60 seconds on the clock. Score as many points as you can to build quick recognition under pressure.
- **Word Scramble**: Unscramble the letters against the clock. Really good for locking down spelling and root structures.
- **Flashcards**: Quick-flip 3D cards with "Got It" and "Need Review" buttons that plug straight into the Leitner scheduler.
- **Smart Review**: A filtered deck showing only the words you've missed or that are due for review based on your Leitner intervals.
- **Community Hardest**: Pulls the top 50 most frequently missed words from players globally.

---

## How the Spaced Repetition Works

The game uses a classic **Leitner 6-Box System** (`src/lib/srs.ts`):

| Box | Review Interval | Status |
|:---:|:---|:---|
| **0** | Today / Immediate | New or recently missed |
| **1** | 1 day | Learning |
| **2** | 3 days | Review |
| **3** | 7 days | Retaining |
| **4** | 14 days | Strong |
| **5** | 30 days | Mastered ✨ |

- When you get a word **right**, it advances up one box.
- When you get a word **wrong**, it immediately resets to Box 0 so you review it again.
- Once a word hits Box 5, you earn the "Mastered" trophy and confetti burst.

All progress saves directly to your browser's `localStorage` instantly. If you switch between your phone and laptop, you can generate a 6-digit sync code in the app to mirror your save without creating an account.

---

## Tech Stack & Architecture

I wanted this project to be as clean, lightweight, and dependency-free as possible. No heavy bloated libraries:

- **Frontend**: React 19 + TypeScript + Vite.
- **Styling**: Tailwind CSS v4. All animations (screen transitions, card flips, button taps) use native CSS transitions and keyframes instead of heavy animation bundles.
- **Audio**: Web Audio API (`src/lib/sound.ts`). All sound effects (correct chimes, error buzzers, streak fanfares) are procedurally synthesized using audio oscillators and gain envelopes. Zero audio files or MP3 downloads.
- **State**: Zustand with localStorage persistence.
- **Backend (Optional / Serverless)**:
  - Vercel Serverless Functions (`api/`)
  - Upstash Redis for the global leaderboard, anti-cheat XP validation, and device sync.
  - The app works 100% offline even without the backend.
- **Bundle Weight**: ~230 KB total gzipped. Runs smoothly on any low-end school Chromebook or mobile device.

---

## Project Structure

```text
sat-vocab-game/
├── api/                  # Serverless routes for leaderboard, sync & anti-cheat
├── public/               # PWA icons, manifest & soundless static assets
├── src/
│   ├── components/
│   │   ├── game-modes/   # Quiz, Flashcard, Scramble, Contrast modes
│   │   ├── screens/      # HomeScreen, GameScreen, ResultsScreen, ReviewScreen, LeaderboardScreen
│   │   └── ui/           # Buttons, Cards, Modals, Particle Canvas
│   ├── data/             # 1,000+ curated SAT vocabulary words with context sentences
│   ├── hooks/            # useGameLoop (turn timer and round timing)
│   ├── lib/
│   │   ├── api.ts        # Cloud sync client
│   │   ├── sound.ts      # Procedural Web Audio API sound engine
│   │   ├── srs.ts        # Leitner box spaced repetition calculation
│   │   └── utils.ts      # Clean cn() class merger
│   ├── types/            # TypeScript contracts for words, cards & game state
│   ├── App.tsx           # Screen routing & modal coordination
│   ├── main.tsx          # Root mount & PWA service worker registration
│   └── index.css         # Tailwind directives, theme variables & CSS keyframes
├── package.json
└── vite.config.ts
```

---

## Running Locally

Requirements: Node.js 18+

```bash
# 1. Clone the repo
git clone https://github.com/shouryasharan7-netizen/sat-vocab-game.git
cd sat-vocab-game

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

To test the production build:
```bash
npm run build
npm run preview
```

---

## Adding More Words

Words live in `src/data/words.ts`. Each entry follows this format:

```typescript
{
  word: "capricious",
  def: "given to sudden and unaccountable changes of mood or behavior; fickle",
  ex: "The capricious weather ruined our plans for an outdoor graduation.",
  pos: "adjective",
  synonyms: ["fickle", "volatile", "unpredictable"],
  antonyms: ["stable", "constant"]
}
```

If you spot a typo or want to submit extra words or etymology roots, feel free to open a PR!

---

## License

MIT License. Free to use, fork, study, or adapt for other exams (GRE, ACT, TOEFL).
