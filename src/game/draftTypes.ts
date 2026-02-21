import type { Card, HandEvaluation } from './types';

export const DraftPhase = {
  Idle: 'idle',
  Drafting: 'drafting',
  Finished: 'finished',
} as const;
export type DraftPhase = (typeof DraftPhase)[keyof typeof DraftPhase];

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
  | { type: 'RESTART' };
