import { DraftPhase } from './draftTypes';
import { createDeck, shuffleDeck, dealCards } from './deck';
import { evaluateGrid, totalScore } from './gridEvaluator';
import { evaluateHand } from './handEvaluator';
import { GRID_SIZE, TOTAL_ROUNDS } from './constants';
import type { Card } from './types';
import type { DraftState, DraftAction, GridPos } from './draftTypes';

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
  bonusHighlighted: [],
  bonusEvaluation: null,
  bonusEnabled: true,
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
  const score = totalScore(evaluations);

  // If bonus round is enabled, go to bonus prompt instead of finished
  if (state.bonusEnabled) {
    return {
      ...state,
      grid: effectiveGrid,
      pendingPlacements: new Map(),
      phase: DraftPhase.BonusPrompt,
      evaluations,
      finalScore: score,
    };
  }

  return {
    ...state,
    grid: effectiveGrid,
    pendingPlacements: new Map(),
    phase: DraftPhase.Finished,
    evaluations,
    finalScore: score,
  };
}

/** Collect all grid positions that have a card placed */
export function getFilledPositions(grid: (Card | null)[][]): GridPos[] {
  const positions: GridPos[] = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] !== null) positions.push([r, c]);
    }
  }
  return positions;
}

/** Pick 5 random positions from the filled grid slots */
export function pickRandomFive(filled: GridPos[]): GridPos[] {
  const shuffled = [...filled];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 5);
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
        bonusHighlighted: [],
        bonusEvaluation: null,
        bonusEnabled: state.bonusEnabled,
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

    case 'SET_BONUS_ENABLED': {
      return { ...state, bonusEnabled: action.enabled };
    }

    case 'ACCEPT_BONUS': {
      if (state.phase !== DraftPhase.BonusPrompt) return state;
      const filled = getFilledPositions(state.grid);
      if (filled.length < 5) return { ...state, phase: DraftPhase.Finished };
      return {
        ...state,
        phase: DraftPhase.BonusRound,
        bonusHighlighted: pickRandomFive(filled),
      };
    }

    case 'DECLINE_BONUS': {
      if (state.phase !== DraftPhase.BonusPrompt) return state;
      return { ...state, phase: DraftPhase.Finished };
    }

    case 'CYCLE_BONUS': {
      if (state.phase !== DraftPhase.BonusRound) return state;
      // Evaluate the highlighted hand live so the score updates as cards cycle
      const cycleCards = action.highlighted
        .map(([r, c]) => state.grid[r][c])
        .filter((card): card is Card => card !== null);
      const cycleEval = cycleCards.length === 5 ? evaluateHand(cycleCards) : null;
      return {
        ...state,
        bonusHighlighted: action.highlighted,
        bonusEvaluation: cycleEval,
      };
    }

    case 'LOCK_IN_BONUS': {
      if (state.phase !== DraftPhase.BonusRound) return state;
      const cards = state.bonusHighlighted
        .map(([r, c]) => state.grid[r][c])
        .filter((card): card is Card => card !== null);
      if (cards.length !== 5) return { ...state, phase: DraftPhase.Finished };

      const bonusEval = evaluateHand(cards);
      const newScore = (state.finalScore ?? 0) + bonusEval.points;
      return {
        ...state,
        phase: DraftPhase.Finished,
        bonusEvaluation: bonusEval,
        finalScore: newScore,
      };
    }

    default:
      return state;
  }
}
