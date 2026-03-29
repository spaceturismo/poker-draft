import type { Card, HandEvaluation } from './types';

export const DraftPhase = {
  Idle: 'idle',
  Drafting: 'drafting',
  BonusPrompt: 'bonus_prompt',
  BonusRound: 'bonus_round',
  Finished: 'finished',
} as const;
export type DraftPhase = (typeof DraftPhase)[keyof typeof DraftPhase];

/** Grid position of a card: [row, col] */
export type GridPos = [number, number];

export interface DraftState {
  phase: DraftPhase;
  /** Committed grid -- cards from previous rounds (immutable during current round) */
  grid: (Card | null)[][];
  /** Tentative placements for the current round: maps col (draftIndex) -> row */
  pendingPlacements: Map<number, number>;
  deck: Card[];
  /** 5 cards for the current round (one per column) */
  currentDraft: Card[];
  /** Which draft cards have been skipped (not placed) */
  draftSkipped: boolean[];
  round: number;
  evaluations: HandEvaluation[] | null;
  finalScore: number | null;
  /** Bonus round: the 5 currently highlighted grid positions */
  bonusHighlighted: GridPos[];
  /** Bonus round: the evaluation of the locked-in bonus hand */
  bonusEvaluation: HandEvaluation | null;
  /** Whether the bonus round feature is enabled */
  bonusEnabled: boolean;
}

export type DraftAction =
  | { type: 'START_GAME' }
  | { type: 'PLACE_CARD'; col: number; row: number }
  | { type: 'UNPLACE_CARD'; col: number }
  | { type: 'SKIP_CARD'; col: number }
  | { type: 'UNSKIP_CARD'; col: number }
  | { type: 'ACCEPT_ROUND' }
  | { type: 'SKIP_ALL' }
  | { type: 'FINISH_GAME' }
  | { type: 'RESTART' }
  | { type: 'ACCEPT_BONUS' }
  | { type: 'DECLINE_BONUS' }
  | { type: 'CYCLE_BONUS'; highlighted: GridPos[] }
  | { type: 'LOCK_IN_BONUS' }
  | { type: 'SET_BONUS_ENABLED'; enabled: boolean };
