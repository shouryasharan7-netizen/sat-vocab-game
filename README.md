# SAT Vocab Game

> A stupidly simple way to actually remember SAT words. Built because I was tired of staring at Quizlet flashcards until my eyes glazed over.

[Live Demo](https://sat-vocab-game.vercel.app) · [Report Bug](https://github.com/shouryasharan7-netizen/sat-vocab-game/issues) · [Request Feature](https://github.com/shouryasharan7-netizen/sat-vocab-game/issues)

---

## The Problem

I was helping my cousin prep for the Digital SAT and realized every vocab app falls into one of two camps:

1. **Corporate hell** — expensive, bloated, and somehow still looks like it was designed in 2012
2. **Flashcard purgatory** — open Quizlet, scroll, flip, scroll, flip, retain nothing, repeat

The SAT doesn't test whether you can memorize a definition. It tests whether you recognize a word *in context* — buried in some dense passage about 19th-century botany or whatever. Most apps don't train that. This one tries to.

## What It Actually Does

It's a browser-based vocab trainer with a few game modes that force you to engage with words instead of just passively reading them:

- **Definition Match** — classic "what does this word mean," but with a twist: wrong answers are intentionally close. If the word is *benevolent*, one of the distractors is *belligerent*. You actually have to know the difference.
- **Context Clues** — fill-in-the-blank sentences that feel like real SAT reading passages. Not "The ___ dog barked." More like "The scientist's pragmatic approach contrasted sharply with her colleague's quixotic ambitions."
- **Speed Run** — 60 seconds. As many correct answers as you can handle. Good for panic-training your brain to recognize words under pressure.
- **Word Scramble** — unscramble the letters. Sounds simple, but it's weirdly effective for locking in spelling patterns, which helps with recognition.
- **Flashcards** — okay, yes, there are flashcards. But they track which ones you get wrong and surface them more often. No more scrolling past words you already know.
- **Review Weak Words** — a dedicated mode that only shows you words you've missed. No fluff.

There's also a spaced repetition system running under the hood. Miss a word a few times and it'll haunt you at just the right intervals until you actually know it.

## Tech Stack

I built this with stuff I actually like using:

- **Next.js 14** — App Router, because I'm a masochist who enjoys bleeding-edge React patterns
- **React + TypeScript** — type safety saves me from myself at 2 AM
- **Tailwind CSS** — I can't design, but I can copy a color palette and pretend
- **Framer Motion** — animations that don't feel like a PowerPoint from 2004
- **Lucide Icons** — no emojis in the UI. I have standards. Low standards, but standards.
- **localStorage** — your progress lives in your browser. No accounts, no tracking, no "sign up for premium to unlock the letter Z."

## Screenshots

<div align="center">
  <img src="screenshots/1.png" alt="Home Screen" width="80%" style="margin-bottom: 20px" />
  
  <br/>
  
  <img src="screenshots/2.png" alt="Definition Match" width="45%" />
  <img src="screenshots/3.png" alt="Word Details" width="45%" />
  
  <br/>
  <br/>

  <img src="screenshots/4.png" alt="Contrast Match" width="45%" />
  <img src="screenshots/5.png" alt="Smart Review" width="45%" />
</div>

## Getting Started

If you want to run this locally or mess with the code:

```bash
# Clone it
git clone https://github.com/shouryasharan7-netizen/sat-vocab-game.git
cd sat-vocab-game

# Install dependencies
npm install

# Run the dev server
npm run dev

# Open http://localhost:3000
```

That's it. No environment variables. No database setup. No Docker. Just vibes.

## The Word List

Currently sitting at around 200+ words, all hand-picked from high-frequency SAT lists and actual College Board practice tests. I'm slowly expanding it — the goal is 800+ with proper difficulty tiers (Common / Advanced / Obscure) and etymology breakdowns.

If you want to add words, check out `src/data/words.ts` (or wherever the word list lives in your repo). The format is pretty self-explanatory:

```typescript
{
  word: "aberration",
  definition: "a departure from what is normal or expected",
  example: "The sudden snowstorm in April was an aberration.",
  difficulty: "advanced",
  tags: ["official-sat", "common-root"]
}
```

## What's Next

Things I want to add but haven't had the time / energy / caffeine for yet:

- [ ] **Audio pronunciation** — Web Speech API is free and surprisingly decent
- [ ] **Passage Mode** — actual SAT-style paragraphs with vocab questions embedded
- [ ] **Anki export** — for the power users who want to take their weak words elsewhere
- [ ] **Daily Challenge** — everyone gets the same 10 words, compete for speed/accuracy
- [ ] **SEO pages** — `/words/aberration` so Google actually finds this thing
- [ ] **Dark mode polish** — it's dark by default but some of the contrast ratios are... questionable

## Contributing

Found a bug? Word definition that's slightly off? A game mode that feels like torture in a bad way? Open an issue or PR. I'm not precious about the code.

If you're adding words, please include:
- A real SAT-style context sentence (not "The cat was very [word]")
- At least one solid distractor for Definition Match mode
- The difficulty tier you think it belongs in

## Why Is This Free?

Because SAT prep is already expensive enough. Books, tutors, registration fees — the last thing students need is another $10/month subscription for a vocab app.

If this helped you and you want to say thanks, just share it with someone who's studying. Or star the repo. Or both. Whatever.

## License

MIT. Do whatever you want. Build a competitor. Fork it for the GRE. Turn it into a drinking game where you take a shot for every wrong answer. I don't care. Just don't sell the exact same thing and claim you built it from scratch, because that's lame.

---

*Built by someone who once misspelled "occurrence" three times in a row and decided to fix the system instead of just studying harder.*
