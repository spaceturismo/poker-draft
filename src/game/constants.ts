import { HandRank } from './types';

export const HAND_POINTS: Record<HandRank, number> = {
  [HandRank.HighCard]: 0,
  [HandRank.OnePair]: 100,
  [HandRank.TwoPair]: 500,
  [HandRank.ThreeOfAKind]: 1500,
  [HandRank.Straight]: 3000,
  [HandRank.Flush]: 5000,
  [HandRank.FullHouse]: 8000,
  [HandRank.FourOfAKind]: 15000,
  [HandRank.StraightFlush]: 30000,
  [HandRank.RoyalFlush]: 50000,
};

export const HAND_NAMES: Record<HandRank, string> = {
  [HandRank.HighCard]: 'High Card',
  [HandRank.OnePair]: 'One Pair',
  [HandRank.TwoPair]: 'Two Pair',
  [HandRank.ThreeOfAKind]: 'Three of a Kind',
  [HandRank.Straight]: 'Straight',
  [HandRank.Flush]: 'Flush',
  [HandRank.FullHouse]: 'Full House',
  [HandRank.FourOfAKind]: 'Four of a Kind',
  [HandRank.StraightFlush]: 'Straight Flush',
  [HandRank.RoyalFlush]: 'Royal Flush',
};

export const SUIT_SYMBOLS: Record<string, string> = {
  Hearts: '\u2665',
  Diamonds: '\u2666',
  Clubs: '\u2663',
  Spades: '\u2660',
};

export const RANK_DISPLAY: Record<number, string> = {
  2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8',
  9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K', 14: 'A',
};

export const GRID_SIZE = 5;
export const TOTAL_ROUNDS = 7;
