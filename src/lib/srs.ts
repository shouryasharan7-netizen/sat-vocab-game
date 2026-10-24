// Leitner box spaced repetition system for vocab review
// Box 0 = new/failed (today), Box 1 = 1 day, Box 2 = 3 days, Box 3 = 7 days, Box 4 = 14 days, Box 5 = 30 days

export type LeitnerBox = 0 | 1 | 2 | 3 | 4 | 5;
export const MASTERY_BOX: LeitnerBox = 5;

export const BOX_INTERVALS_DAYS: Record<LeitnerBox, number> = {
  0: 0,
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface SRSCard {
  wordKey: string;
  box: LeitnerBox;
  nextReviewAt: number;
  seenCount: number;
  history: boolean[];
}

export type SRSDeck = Record<string, SRSCard>;

export function calculateNextReviewDate(box: LeitnerBox, fromTimestamp: number = Date.now()): number {
  const days = BOX_INTERVALS_DAYS[box] ?? 0;
  return fromTimestamp + days * MS_PER_DAY;
}

export function updateCardBox(
  card: SRSCard | undefined,
  wordKey: string,
  isCorrect: boolean,
  now: number = Date.now()
): SRSCard {
  const currentBox = card?.box ?? 0;
  const nextBox: LeitnerBox = isCorrect ? (Math.min(currentBox + 1, MASTERY_BOX) as LeitnerBox) : 0;

  return {
    wordKey,
    box: nextBox,
    nextReviewAt: calculateNextReviewDate(nextBox, now),
    seenCount: (card?.seenCount ?? 0) + 1,
    history: [...(card?.history ?? []), isCorrect].slice(-10),
  };
}

export function isCardDue(card: SRSCard, now: number = Date.now()): boolean {
  return card.nextReviewAt <= now;
}

export function isMastered(card: SRSCard): boolean {
  return card.box >= MASTERY_BOX;
}

export function getDueCards(deck: SRSDeck, now: number = Date.now()): SRSCard[] {
  return Object.values(deck)
    .filter((card) => isCardDue(card, now))
    .sort((a, b) => a.nextReviewAt - b.nextReviewAt);
}
