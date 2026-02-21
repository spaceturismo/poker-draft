import { DraftPhase } from './draftTypes';
import { createDeck, shuffleDeck, dealCards } from './deck';
import { evaluateGrid, totalScore } from './gridEvaluator';
import { GRID_SIZE, TOTAL_ROUNDS } from './constants';
import type { Card } from './types';
import type { DraftState, DraftAction } from './draftTypes';

function emptyGrid(): (Card | null)[][] {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null)
  );
}

export const initialState: DraftState = {
  phase: DraftPhase.Idle,
  grid: emptyGrid(),
  pendingPlacements: new Map(),
  deck: [],
  currentDraft: [],
  draftSkipped: [],
  round: 0,
  evaluations: null,
  finalScore: null,
};

function commitPlacements(grid: (Card | null)[][], draft: Card[], pending: Map<number, number>): (Card | null)[][] {
  const newGrid = grid.map((r) => [...r]);
  for (const [col, row] of pending) {
    newGrid[row][col] = draft[col];
  }
  return newGrid;
}

export function getEffectiveGrid(state: DraftState): (Card | null)[][] {
  return commitPlacements(state.grid, state.currentDraft, state.pendingPlacements);
}

function finishGame(state: DraftState): DraftState {
  const effectiveGrid = getEffectiveGrid(state);
  const evaluations = evaluateGrid(effectiveGrid);
  return {
    ...state,
    grid: effectiveGrid,
    pendingPlacements: new Map(),
    phase: DraftPhase.Finished,
    evaluations,
    finalScore: totalScore(evaluations),
  };
}

function dealNextRound(state: DraftState): DraftState {
  const nextRound = state.round + 1;
  if (nextRound > TOTAL_ROUNDS) {
    return finishGame(state);
  }
  const { dealt, remaining } = dealCards(state.deck, GRID_SIZE);
  return {
    ...state,
    deck: remaining,
    currentDraft: dealt,
    draftSkipped: Array(GRID_SIZE).fill(false),
    pendingPlacements: new Map(),
    round: nextRound,
  };
}

function isSlotOccupied(state: DraftState, row: number, col: number): boolean {
  if (state.grid[row][col] !== null) return true;
  for (const [draftCol, placedRow] of state.pendingPlacements) {
    if (placedRow === row && draftCol === col) return true;
  }
  return false;
}

function isDraftCardAvailable(state: DraftState, col: number): boolean {
  return !state.pendingPlacements.has(col) && !state.draftSkipped[col];
}

export function draftReducer(state: DraftState, action: DraftAction): DraftState {
  switch (action.type) {
    case 'START_GAME':
    case 'RESTART': {
      const deck = shuffleDeck(createDeck());
      const base: DraftState = {
        phase: DraftPhase.Drafting,
        grid: emptyGrid(),
        pendingPlacements: new Map(),
        deck,
        currentDraft: [],
        draftSkipped: [],
        round: 0,
        evaluations: null,
        finalScore: null,
      };
      return dealNextRound(base);
    }

    case 'PLACE_CARD': {
      if (state.phase !== DraftPhase.Drafting) return state;
      const { col, row } = action;
      if (col < 0 || col >= GRID_SIZE || row < 0 || row >= GRID_SIZE) return state;
      if (!isDraftCardAvailable(state, col)) return state;
      if (isSlotOccupied(state, row, col)) return state;

      const newPending = new Map(state.pendingPlacements);
      newPending.set(col, row);

      return { ...state, pendingPlacements: newPending };
    }

    case 'UNPLACE_CARD': {
      if (state.phase !== DraftPhase.Drafting) return state;
      const { col } = action;
      if (!state.pendingPlacements.has(col)) return state;

      const newPending = new Map(state.pendingPlacements);
      newPending.delete(col);

      return { ...state, pendingPlacements: newPending };
    }

    case 'SKIP_CARD': {
      if (state.phase !== DraftPhase.Drafting) return state;
      const { col } = action;
      if (col < 0 || col >= GRID_SIZE) return state;

      const newPending = new Map(state.pendingPlacements);
      newPending.delete(col);

      const newSkipped = [...state.draftSkipped];
      newSkipped[col] = true;

      return { ...state, pendingPlacements: newPending, draftSkipped: newSkipped };
    }

    case 'UNSKIP_CARD': {
      if (state.phase !== DraftPhase.Drafting) return state;
      const { col } = action;
      if (!state.draftSkipped[col]) return state;

      const newSkipped = [...state.draftSkipped];
      newSkipped[col] = false;

      return { ...state, draftSkipped: newSkipped };
    }

    case 'ACCEPT_ROUND': {
      if (state.phase !== DraftPhase.Drafting) return state;
      const committedGrid = commitPlacements(state.grid, state.currentDraft, state.pendingPlacements);
      return dealNextRound({ ...state, grid: committedGrid, pendingPlacements: new Map() });
    }

    case 'SKIP_ALL': {
      if (state.phase !== DraftPhase.Drafting) return state;
      return dealNextRound({ ...state, pendingPlacements: new Map() });
    }

    case 'FINISH_GAME': {
      if (state.phase !== DraftPhase.Drafting) return state;
      return finishGame(state);
    }

    default:
      return state;
  }
}
