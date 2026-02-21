export const Suit = {
  Hearts: 'Hearts',
  Diamonds: 'Diamonds',
  Clubs: 'Clubs',
  Spades: 'Spades',
} as const;
export type Suit = (typeof Suit)[keyof typeof Suit];

export interface Card {
  rank: number; // 2-14, Ace=14
  suit: Suit;
}

export const HandRank = {
  HighCard: 0,
  OnePair: 1,
  TwoPair: 2,
  ThreeOfAKind: 3,
  Straight: 4,
  Flush: 5,
  FullHouse: 6,
  FourOfAKind: 7,
  StraightFlush: 8,
  RoyalFlush: 9,
} as const;
export type HandRank = (typeof HandRank)[keyof typeof HandRank];

export interface HandEvaluation {
  rank: HandRank;
  name: string;
  points: number;
}
