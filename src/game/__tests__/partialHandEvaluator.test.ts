import { describe, it, expect } from 'vitest';
import { evaluatePartialHand } from '../partialHandEvaluator';
import { HandRank, Suit } from '../types';
import type { Card } from '../types';

const S = Suit.Spades;
const H = Suit.Hearts;
const D = Suit.Diamonds;
const C = Suit.Clubs;

function c(rank: number, suit: Suit): Card {
  return { rank, suit };
}

describe('evaluatePartialHand', () => {
  describe('empty / single card', () => {
    it('returns HighCard for all nulls', () => {
      expect(evaluatePartialHand([null, null, null, null, null]).rank).toBe(HandRank.HighCard);
    });

    it('returns HighCard for 1 card', () => {
      expect(evaluatePartialHand([c(14, S), null, null, null, null]).rank).toBe(HandRank.HighCard);
    });
  });

  describe('partial hands (2-4 cards)', () => {
    it('detects a pair with 2 cards', () => {
      expect(evaluatePartialHand([c(7, S), null, null, null, c(7, H)]).rank).toBe(HandRank.OnePair);
    });

    it('returns HighCard with 2 different cards', () => {
      expect(evaluatePartialHand([c(7, S), c(9, H), null, null, null]).rank).toBe(HandRank.HighCard);
    });

    it('detects three of a kind with 3 cards', () => {
      expect(evaluatePartialHand([c(7, S), null, c(7, H), c(7, D), null]).rank).toBe(HandRank.ThreeOfAKind);
    });

    it('detects two pair with 4 cards', () => {
      expect(evaluatePartialHand([c(7, S), c(7, H), null, c(9, D), c(9, C)]).rank).toBe(HandRank.TwoPair);
    });

    it('detects four of a kind with 4 cards', () => {
      expect(evaluatePartialHand([c(7, S), c(7, H), c(7, D), c(7, C), null]).rank).toBe(HandRank.FourOfAKind);
    });

    it('does not detect flush with 4 same-suit cards', () => {
      // Partial hands can't have flushes
      const result = evaluatePartialHand([c(2, H), c(5, H), c(8, H), c(11, H), null]);
      expect(result.rank).toBe(HandRank.HighCard);
    });
  });

  describe('full hands (5 cards)', () => {
    it('detects flush with 5 cards', () => {
      expect(evaluatePartialHand([c(2, H), c(5, H), c(8, H), c(11, H), c(14, H)]).rank).toBe(HandRank.Flush);
    });

    it('detects straight with 5 cards', () => {
      expect(evaluatePartialHand([c(5, S), c(6, H), c(7, D), c(8, C), c(9, S)]).rank).toBe(HandRank.Straight);
    });

    it('detects royal flush with 5 cards', () => {
      expect(evaluatePartialHand([c(10, S), c(11, S), c(12, S), c(13, S), c(14, S)]).rank).toBe(HandRank.RoyalFlush);
    });
  });
});
