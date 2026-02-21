import { evaluatePartialHand } from './partialHandEvaluator';
import { GRID_SIZE } from './constants';
import type { Card, HandEvaluation } from './types';

/**
 * Evaluate all 12 hands from a 5x5 nullable grid:
 * [0-4] rows, [5-9] columns, [10] diag TL->BR, [11] diag TR->BL
 */
export function evaluateGrid(grid: (Card | null)[][]): HandEvaluation[] {
  const evaluations: HandEvaluation[] = [];

  // 5 rows
  for (let r = 0; r < GRID_SIZE; r++) {
    evaluations.push(evaluatePartialHand(grid[r]));
  }

  // 5 columns
  for (let c = 0; c < GRID_SIZE; c++) {
    const col = grid.map((row) => row[c]);
    evaluations.push(evaluatePartialHand(col));
  }

  // 2 diagonals
  const diag1: (Card | null)[] = [];
  const diag2: (Card | null)[] = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    diag1.push(grid[i][i]);
    diag2.push(grid[i][GRID_SIZE - 1 - i]);
  }
  evaluations.push(evaluatePartialHand(diag1));
  evaluations.push(evaluatePartialHand(diag2));

  return evaluations;
}

export function totalScore(evaluations: HandEvaluation[]): number {
  return evaluations.reduce((sum, e) => sum + e.points, 0);
}
