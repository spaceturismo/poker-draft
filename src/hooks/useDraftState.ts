import { useReducer, useCallback, useMemo } from 'react';
import { draftReducer, initialState, getEffectiveGrid } from '../game/draftState';
import { DraftPhase } from '../game/draftTypes';


export function useDraftState() {
  const [state, dispatch] = useReducer(draftReducer, initialState);

  const effectiveGrid = useMemo(() => {
    if (state.phase === DraftPhase.Idle) return state.grid;
    return getEffectiveGrid(state);
  }, [state]);

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

  return {
    ...state,
    effectiveGrid,
    isSlotAvailable,
    isPending,
    isDraftPlaced,
    getDraftCardForCol,
    startGame,
    placeCard,
    unplaceCard,
    skipCard,
    unskipCard,
    acceptRound,
    skipAll,
    finishGame,
    restart,
  };
}
