import { HandRank } from './types';
import { HAND_NAMES, HAND_POINTS } from './constants';
import type { Card, HandEvaluation } from './types';

export function evaluateHand(hand: Card[]): HandEvaluation {
  const rank = getHandRank(hand);
  return {
    rank,
    name: HAND_NAMES[rank],
    points: HAND_POINTS[rank],
  };
}

function getHandRank(hand: Card[]): HandRank {
  const ranks = hand.map((c) => c.rank).sort((a, b) => a - b);
  const suits = hand.map((c) => c.suit);

  const isFlush = suits.every((s) => s === suits[0]);
  const isStraight = checkStraight(ranks);

  if (isFlush && isStraight) {
    if (ranks[0] === 10 && ranks[4] === 14) return HandRank.RoyalFlush;
    return HandRank.StraightFlush;
  }

  const counts = getRankCounts(ranks);
  const countValues = Object.values(counts).sort((a, b) => b - a);

  if (countValues[0] === 4) return HandRank.FourOfAKind;
  if (countValues[0] === 3 && countValues[1] === 2) return HandRank.FullHouse;
  if (isFlush) return HandRank.Flush;
  if (isStraight) return HandRank.Straight;
  if (countValues[0] === 3) return HandRank.ThreeOfAKind;
  if (countValues[0] === 2 && countValues[1] === 2) return HandRank.TwoPair;
  if (countValues[0] === 2) return HandRank.OnePair;
  return HandRank.HighCard;
}

function checkStraight(sortedRanks: number[]): boolean {
  const isConsecutive =
    sortedRanks[4] - sortedRanks[0] === 4 && new Set(sortedRanks).size === 5;
  const isAceLow =
    sortedRanks[0] === 2 &&
    sortedRanks[1] === 3 &&
    sortedRanks[2] === 4 &&
    sortedRanks[3] === 5 &&
    sortedRanks[4] === 14;
  return isConsecutive || isAceLow;
}

function getRankCounts(ranks: number[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const r of ranks) {
    counts[r] = (counts[r] || 0) + 1;
  }
  return counts;
}
