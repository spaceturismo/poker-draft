import { describe, it, expect } from 'vitest';
import { evaluateGrid, totalScore } from '../gridEvaluator';
import { HandRank, Suit } from '../types';
import type { Card } from '../types';

const S = Suit.Spades;
const H = Suit.Hearts;
const D = Suit.Diamonds;
const C = Suit.Clubs;

function c(rank: number, suit: Suit): Card {
  return { rank, suit };
}

describe('evaluateGrid', () => {
  it('returns 12 evaluations for an empty grid', () => {
    const grid: (Card | null)[][] = Array.from({ length: 5 }, () => Array(5).fill(null));
    const evals = evaluateGrid(grid);
    expect(evals).toHaveLength(12);
    // All should be HighCard with 0 points
    expect(evals.every((e) => e.rank === HandRank.HighCard)).toBe(true);
  });

  it('returns 12 evaluations for a partially filled grid', () => {
    const grid: (Card | null)[][] = Array.from({ length: 5 }, () => Array(5).fill(null));
    grid[0][0] = c(7, S);
    grid[1][0] = c(7, H);
    const evals = evaluateGrid(grid);
    expect(evals).toHaveLength(12);
    // Column 0 has a pair of 7s
    expect(evals[5].rank).toBe(HandRank.OnePair);
  });

  it('scores a full grid correctly', () => {
    const grid: (Card | null)[][] = [
      [c(7, S), c(7, H), c(3, D), c(9, C), c(14, S)],
      [c(2, H), c(5, D), c(8, C), c(11, S), c(13, H)],
      [c(10, S), c(10, H), c(4, D), c(6, C), c(12, S)],
      [c(3, S), c(9, H), c(14, D), c(2, C), c(8, S)],
      [c(4, H), c(11, D), c(6, S), c(13, C), c(5, H)],
    ];
    const evals = evaluateGrid(grid);
    expect(evals).toHaveLength(12);
    // Row 0 has pair of 7s
    expect(evals[0].rank).toBe(HandRank.OnePair);
  });

  it('detects column flush in full grid', () => {
    const grid: (Card | null)[][] = [
      [c(2, H), c(3, S), c(4, D), c(5, C), c(6, H)],
      [c(5, H), c(7, S), c(8, D), c(9, C), c(10, D)],
      [c(8, H), c(11, S), c(12, D), c(13, C), c(14, S)],
      [c(11, H), c(2, D), c(3, C), c(4, S), c(5, D)],
      [c(14, H), c(6, D), c(7, C), c(8, S), c(9, S)],
    ];
    const evals = evaluateGrid(grid);
    // Column 0 is all Hearts
    expect(evals[5].rank).toBe(HandRank.Flush);
  });
});

describe('totalScore', () => {
  it('sums points from all evaluations', () => {
    const evals = [
      { rank: HandRank.TwoPair as HandRank, name: 'Two Pair', points: 10 },
      { rank: HandRank.Flush as HandRank, name: 'Flush', points: 40 },
      { rank: HandRank.HighCard as HandRank, name: 'High Card', points: 0 },
    ];
    expect(totalScore(evals)).toBe(50);
  });
});
