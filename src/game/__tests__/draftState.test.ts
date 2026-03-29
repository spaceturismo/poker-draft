import { describe, it, expect } from 'vitest';
import { draftReducer, initialState, getEffectiveGrid } from '../draftState';
import { DraftPhase } from '../draftTypes';
import { Suit } from '../types';
import type { DraftState } from '../draftTypes';
import type { Card } from '../types';

function c(rank: number, suit: Suit): Card {
  return { rank, suit };
}

function emptyGrid(): (Card | null)[][] {
  return Array.from({ length: 5 }, () => Array(5).fill(null));
}

function makeDraftingState(overrides?: Partial<DraftState>): DraftState {
  const deck = Array.from({ length: 42 }, (_, i) => c((i % 13) + 2, Suit.Clubs));
  return {
    phase: DraftPhase.Drafting,
    grid: emptyGrid(),
    pendingPlacements: new Map(),
    deck,
    currentDraft: [c(7, Suit.Spades), c(9, Suit.Hearts), c(3, Suit.Diamonds), c(14, Suit.Clubs), c(5, Suit.Spades)],
    draftSkipped: [false, false, false, false, false],
    round: 1,
    evaluations: null,
    finalScore: null,
    bonusHighlighted: [],
    bonusEvaluation: null,
    bonusEnabled: true,
    ...overrides,
  };
}

describe('draftReducer', () => {
  describe('START_GAME', () => {
    it('transitions to drafting with 5 draft cards', () => {
      const state = draftReducer(initialState, { type: 'START_GAME' });
      expect(state.phase).toBe(DraftPhase.Drafting);
      expect(state.currentDraft).toHaveLength(5);
      expect(state.round).toBe(1);
      expect(state.grid.flat().every((c) => c === null)).toBe(true);
      expect(state.pendingPlacements.size).toBe(0);
    });
  });

  describe('PLACE_CARD', () => {
    it('adds a pending placement', () => {
      const playing = makeDraftingState();
      const state = draftReducer(playing, { type: 'PLACE_CARD', col: 0, row: 2 });
      expect(state.pendingPlacements.get(0)).toBe(2);
      // Committed grid is still empty
      expect(state.grid[2][0]).toBeNull();
    });

    it('shows in effective grid', () => {
      const playing = makeDraftingState();
      const state = draftReducer(playing, { type: 'PLACE_CARD', col: 0, row: 2 });
      const eff = getEffectiveGrid(state);
      expect(eff[2][0]).toEqual(c(7, Suit.Spades));
    });

    it('rejects placement into committed occupied slot', () => {
      const grid = emptyGrid();
      grid[2][0] = c(3, Suit.Hearts);
      const playing = makeDraftingState({ grid });
      const state = draftReducer(playing, { type: 'PLACE_CARD', col: 0, row: 2 });
      expect(state.pendingPlacements.size).toBe(0);
    });

    it('rejects placement when draft card already placed', () => {
      const pending = new Map([[0, 2]]);
      const playing = makeDraftingState({ pendingPlacements: pending });
      const state = draftReducer(playing, { type: 'PLACE_CARD', col: 0, row: 3 });
      // Card 0 is already placed at row 2, should not move
      expect(state.pendingPlacements.get(0)).toBe(2);
    });

    it('rejects placement when draft card is skipped', () => {
      const playing = makeDraftingState({ draftSkipped: [true, false, false, false, false] });
      const state = draftReducer(playing, { type: 'PLACE_CARD', col: 0, row: 2 });
      expect(state.pendingPlacements.size).toBe(0);
    });

    it('does not auto-advance (requires ACCEPT_ROUND)', () => {
      const pending = new Map<number, number>([[0, 0], [1, 1], [2, 2], [3, 3]]);
      const playing = makeDraftingState({
        pendingPlacements: pending,
        round: 1,
      });
      const state = draftReducer(playing, { type: 'PLACE_CARD', col: 4, row: 4 });
      // Should NOT auto-advance -- still round 1, waiting for ACCEPT_ROUND
      expect(state.round).toBe(1);
      expect(state.phase).toBe(DraftPhase.Drafting);
    });

    it('rejects out-of-bounds placement', () => {
      const playing = makeDraftingState();
      const state = draftReducer(playing, { type: 'PLACE_CARD', col: -1, row: 0 });
      expect(state.pendingPlacements.size).toBe(0);

      const state2 = draftReducer(playing, { type: 'PLACE_CARD', col: 0, row: 5 });
      expect(state2.pendingPlacements.size).toBe(0);
    });
  });

  describe('UNPLACE_CARD', () => {
    it('removes a pending placement', () => {
      const pending = new Map([[2, 3]]);
      const playing = makeDraftingState({ pendingPlacements: pending });
      const state = draftReducer(playing, { type: 'UNPLACE_CARD', col: 2 });
      expect(state.pendingPlacements.has(2)).toBe(false);
    });

    it('does nothing for non-pending card', () => {
      const playing = makeDraftingState();
      const state = draftReducer(playing, { type: 'UNPLACE_CARD', col: 0 });
      expect(state).toBe(playing);
    });
  });

  describe('SKIP_CARD / UNSKIP_CARD', () => {
    it('marks a card as skipped', () => {
      const playing = makeDraftingState();
      const state = draftReducer(playing, { type: 'SKIP_CARD', col: 2 });
      expect(state.draftSkipped[2]).toBe(true);
    });

    it('unskips a skipped card', () => {
      const playing = makeDraftingState({ draftSkipped: [false, false, true, false, false] });
      const state = draftReducer(playing, { type: 'UNSKIP_CARD', col: 2 });
      expect(state.draftSkipped[2]).toBe(false);
    });

    it('skip removes pending placement too', () => {
      const pending = new Map([[2, 3]]);
      const playing = makeDraftingState({ pendingPlacements: pending });
      const state = draftReducer(playing, { type: 'SKIP_CARD', col: 2 });
      expect(state.pendingPlacements.has(2)).toBe(false);
      expect(state.draftSkipped[2]).toBe(true);
    });
  });

  describe('ACCEPT_ROUND', () => {
    it('commits placements and advances to next round', () => {
      const pending = new Map([[0, 2], [3, 4]]);
      const playing = makeDraftingState({ pendingPlacements: pending, round: 1 });
      const state = draftReducer(playing, { type: 'ACCEPT_ROUND' });
      expect(state.round).toBe(2);
      expect(state.grid[2][0]).toEqual(c(7, Suit.Spades));
      expect(state.grid[4][3]).toEqual(c(14, Suit.Clubs));
      expect(state.pendingPlacements.size).toBe(0);
      expect(state.currentDraft).toHaveLength(5);
    });

    it('finishes game after round 7 (goes to bonus prompt when enabled)', () => {
      const playing = makeDraftingState({ round: 7 });
      const state = draftReducer(playing, { type: 'ACCEPT_ROUND' });
      expect(state.phase).toBe(DraftPhase.BonusPrompt);
      expect(state.evaluations).toHaveLength(12);
      expect(state.finalScore).toBeTypeOf('number');
    });

    it('finishes game after round 7 (goes to finished when bonus disabled)', () => {
      const playing = makeDraftingState({ round: 7, bonusEnabled: false });
      const state = draftReducer(playing, { type: 'ACCEPT_ROUND' });
      expect(state.phase).toBe(DraftPhase.Finished);
      expect(state.evaluations).toHaveLength(12);
      expect(state.finalScore).toBeTypeOf('number');
    });

    it('accepts with no placements (all skipped)', () => {
      const playing = makeDraftingState({ round: 1 });
      const state = draftReducer(playing, { type: 'ACCEPT_ROUND' });
      expect(state.round).toBe(2);
      expect(state.grid.flat().every((c) => c === null)).toBe(true);
    });
  });

  describe('SKIP_ALL', () => {
    it('discards pending placements and advances', () => {
      const pending = new Map([[0, 2]]);
      const playing = makeDraftingState({ pendingPlacements: pending, round: 1 });
      const state = draftReducer(playing, { type: 'SKIP_ALL' });
      expect(state.round).toBe(2);
      // Pending placement was NOT committed
      expect(state.grid[2][0]).toBeNull();
    });

    it('finishes game when on last round (goes to bonus prompt when enabled)', () => {
      const playing = makeDraftingState({ round: 7 });
      const state = draftReducer(playing, { type: 'SKIP_ALL' });
      expect(state.phase).toBe(DraftPhase.BonusPrompt);
    });
  });

  describe('FINISH_GAME', () => {
    it('commits pending placements and goes to bonus prompt', () => {
      const pending = new Map([[0, 2]]);
      const playing = makeDraftingState({ pendingPlacements: pending, round: 3 });
      const state = draftReducer(playing, { type: 'FINISH_GAME' });
      expect(state.phase).toBe(DraftPhase.BonusPrompt);
      expect(state.evaluations).toHaveLength(12);
      expect(state.finalScore).toBeTypeOf('number');
      // Pending was committed via effective grid
      expect(state.grid[2][0]).toEqual(c(7, Suit.Spades));
    });

    it('goes to finished when bonus disabled', () => {
      const pending = new Map([[0, 2]]);
      const playing = makeDraftingState({ pendingPlacements: pending, round: 3, bonusEnabled: false });
      const state = draftReducer(playing, { type: 'FINISH_GAME' });
      expect(state.phase).toBe(DraftPhase.Finished);
    });
  });

  describe('RESTART', () => {
    it('resets to a fresh game', () => {
      const finished = makeDraftingState({ phase: DraftPhase.Finished as DraftPhase });
      const state = draftReducer(finished, { type: 'RESTART' });
      expect(state.phase).toBe(DraftPhase.Drafting);
      expect(state.round).toBe(1);
      expect(state.grid.flat().every((c) => c === null)).toBe(true);
      expect(state.pendingPlacements.size).toBe(0);
    });
  });
});
