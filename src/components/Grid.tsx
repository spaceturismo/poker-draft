import { GridSlot } from './GridSlot';
import { HandLabel } from './HandLabel';
import { DraftPhase } from '../game/draftTypes';
import { GRID_SIZE } from '../game/constants';
import type { Card } from '../game/types';
import type { HandEvaluation } from '../game/types';
import './Grid.css';

interface GridProps {
  grid: (Card | null)[][];
  isSlotAvailable: (row: number, col: number) => boolean;
  onPlaceCard: (col: number, row: number) => void;
  onUnplaceCard: (col: number) => void;
  isPending: (row: number, col: number) => boolean;
  isBonusHighlighted: (row: number, col: number) => boolean;
  phase: string;
  evaluations: HandEvaluation[] | null;
}

export function Grid({
  grid, isSlotAvailable,
  onPlaceCard, onUnplaceCard, isPending,
  isBonusHighlighted,
  phase, evaluations,
}: GridProps) {
  const isFinished = phase === DraftPhase.Finished;

  return (
    <div className="grid-wrapper">
      {isFinished && evaluations && (
        <div className="grid-diag-labels">
          <div className="grid-diag-label">
            <span className="grid-diag-arrow">↘</span>
            <HandLabel evaluation={evaluations[10]} direction="diag" />
          </div>
          <div className="grid-diag-label">
            <HandLabel evaluation={evaluations[11]} direction="diag" />
            <span className="grid-diag-arrow">↙</span>
          </div>
        </div>
      )}

      <div className="grid-col-headers">
        <span className="grid-col-headers__spacer" />
        {Array.from({ length: GRID_SIZE }, (_, i) => (
          <div key={i} className="grid-col-header">
            Col {i + 1}
          </div>
        ))}
      </div>

      <div className="grid-main">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="grid-row">
            <span className="grid-row__label">R{rowIdx + 1}</span>
            {row.map((card, colIdx) => {
              const pending = isPending(rowIdx, colIdx);
              return (
                <GridSlot
                  key={colIdx}
                  card={card}
                  isAvailable={isSlotAvailable(rowIdx, colIdx)}
                  isPending={pending}
                  isBonusHighlighted={isBonusHighlighted(rowIdx, colIdx)}
                  onClick={() => onPlaceCard(colIdx, rowIdx)}
                  onUnplace={() => onUnplaceCard(colIdx)}
                />
              );
            })}
            {isFinished && evaluations && (
              <HandLabel evaluation={evaluations[rowIdx]} direction="row" />
            )}
          </div>
        ))}
      </div>

      {isFinished && evaluations && (
        <div className="grid-col-evals">
          <span className="grid-col-evals__spacer" />
          {Array.from({ length: GRID_SIZE }, (_, i) => (
            <HandLabel key={i} evaluation={evaluations[5 + i]} direction="col" />
          ))}
        </div>
      )}
    </div>
  );
}
