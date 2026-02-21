import { HandRank } from './types';
import { HAND_NAMES, HAND_POINTS } from './constants';
import { evaluateHand } from './handEvaluator';
import type { Card, HandEvaluation } from './types';

/**
 * Evaluate a hand that may have null slots (unfilled positions).
 * - 5 cards: full evaluation (straights, flushes possible)
 * - 2-4 cards: only rank-based hands (pairs, trips, quads, two pair, full house)
 * - 0-1 cards: High Card (0 pts)
 */
export function evaluatePartialHand(slots: (Card | null)[]): HandEvaluation {
  const cards = slots.filter((c): c is Card => c !== null);

  if (cards.length === 5) {
    return evaluateHand(cards);
  }

  if (cards.length < 2) {
    return { rank: HandRank.HighCard, name: HAND_NAMES[HandRank.HighCard], points: 0 };
  }

  // 2-4 cards: evaluate rank-based hands only
  const rank = evaluatePartialRank(cards);
  return { rank, name: HAND_NAMES[rank], points: HAND_POINTS[rank] };
}

function evaluatePartialRank(cards: Card[]): HandRank {
  const counts = getRankCounts(cards);
  const countValues = Object.values(counts).sort((a, b) => b - a);

  if (countValues[0] === 4) return HandRank.FourOfAKind;
  if (countValues[0] === 3 && countValues[1] === 2) return HandRank.FullHouse;
  if (countValues[0] === 3) return HandRank.ThreeOfAKind;
  if (countValues[0] === 2 && countValues[1] === 2) return HandRank.TwoPair;
  if (countValues[0] === 2) return HandRank.OnePair;
  return HandRank.HighCard;
}

function getRankCounts(cards: Card[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const c of cards) {
    counts[c.rank] = (counts[c.rank] || 0) + 1;
  }
  return counts;
}
