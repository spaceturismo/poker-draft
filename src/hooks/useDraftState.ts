import { useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import { draftReducer, initialState, getEffectiveGrid, getFilledPositions, pickRandomFive } from '../game/draftState';
import { DraftPhase } from '../game/draftTypes';
import { evaluateGrid, totalScore } from '../game/gridEvaluator';

const BONUS_CYCLE_MS = 400;

export function useDraftState() {
  const [state, dispatch] = useReducer(draftReducer, initialState);
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const effectiveGrid = useMemo(() => {
    if (state.phase === DraftPhase.Idle) return state.grid;
    return getEffectiveGrid(state);
  }, [state]);

  const liveScore = useMemo(() => {
    if (state.phase === DraftPhase.Idle) return 0;
    return totalScore(evaluateGrid(effectiveGrid));
  }, [effectiveGrid, state.phase]);

  // Bonus round: cycle highlighted cards on an interval
  useEffect(() => {
    if (state.phase === DraftPhase.BonusRound) {
      const filled = getFilledPositions(state.grid);
      cycleRef.current = setInterval(() => {
        dispatch({ type: 'CYCLE_BONUS', highlighted: pickRandomFive(filled) });
      }, BONUS_CYCLE_MS);
      return () => {
        if (cycleRef.current) clearInterval(cycleRef.current);
      };
    } else {
      if (cycleRef.current) {
        clearInterval(cycleRef.current);
        cycleRef.current = null;
      }
    }
  }, [state.phase, state.grid]);

  const startGame = useCallback(() => dispatch({ type: 'START_GAME' }), []);
  const placeCard = useCallback(
    (col: number, row: number) => dispatch({ type: 'PLACE_CARD', col, row }),
    []
  );
  const unplaceCard = useCallback(
    (col: number) => dispatch({ type: 'UNPLACE_CARD', col }),
    []
  );
  const skipCard = useCallback(
    (col: number) => dispatch({ type: 'SKIP_CARD', col }),
    []
  );
  const unskipCard = useCallback(
    (col: number) => dispatch({ type: 'UNSKIP_CARD', col }),
    []
  );
  const acceptRound = useCallback(() => dispatch({ type: 'ACCEPT_ROUND' }), []);
  const skipAll = useCallback(() => dispatch({ type: 'SKIP_ALL' }), []);
  const finishGame = useCallback(() => dispatch({ type: 'FINISH_GAME' }), []);
  const restart = useCallback(() => dispatch({ type: 'RESTART' }), []);

  // Bonus round actions
  const acceptBonus = useCallback(() => dispatch({ type: 'ACCEPT_BONUS' }), []);
  const declineBonus = useCallback(() => dispatch({ type: 'DECLINE_BONUS' }), []);
  const lockInBonus = useCallback(() => dispatch({ type: 'LOCK_IN_BONUS' }), []);
  const setBonusEnabled = useCallback(
    (enabled: boolean) => dispatch({ type: 'SET_BONUS_ENABLED', enabled }),
    []
  );

  /** For each grid slot, is it a valid drop target? (empty + draft card available for that col) */
  const isSlotAvailable = useCallback(
    (row: number, col: number): boolean => {
      if (state.phase !== DraftPhase.Drafting) return false;
      if (state.grid[row][col] !== null) return false;
      if (state.pendingPlacements.has(col)) return false;
      if (state.draftSkipped[col]) return false;
      // Check no other pending occupies this exact slot
      for (const [draftCol, placedRow] of state.pendingPlacements) {
        if (placedRow === row && draftCol === col) return false;
      }
      return true;
    },
    [state]
  );

  const isPending = useCallback(
    (row: number, col: number): boolean => {
      return state.pendingPlacements.get(col) === row;
    },
    [state.pendingPlacements]
  );

  const isDraftPlaced = useCallback(
    (col: number): boolean => state.pendingPlacements.has(col),
    [state.pendingPlacements]
  );

  /** For a column, which draft card is it? Return the card if available (not placed, not skipped) */
  const getDraftCardForCol = useCallback(
    (col: number) => {
      if (state.currentDraft.length <= col) return null;
      if (state.pendingPlacements.has(col) || state.draftSkipped[col]) return null;
      return state.currentDraft[col];
    },
    [state.currentDraft, state.pendingPlacements, state.draftSkipped]
  );

  /** Check if a grid position is highlighted during bonus round */
  const isBonusHighlighted = useCallback(
    (row: number, col: number): boolean => {
      return state.bonusHighlighted.some(([r, c]) => r === row && c === col);
    },
    [state.bonusHighlighted]
  );

  return {
    ...state,
    effectiveGrid,
    liveScore,
    isSlotAvailable,
    isPending,
    isDraftPlaced,
    getDraftCardForCol,
    isBonusHighlighted,
    startGame,
    placeCard,
    unplaceCard,
    skipCard,
    unskipCard,
    acceptRound,
    skipAll,
    finishGame,
    restart,
    acceptBonus,
    declineBonus,
    lockInBonus,
    setBonusEnabled,
  };
}
