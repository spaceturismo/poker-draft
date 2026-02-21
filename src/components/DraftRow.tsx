import { Card } from './Card';
import type { Card as CardType } from '../game/types';
import './DraftRow.css';

interface DraftRowProps {
  cards: CardType[];
  skipped: boolean[];
  isDraftPlaced: (col: number) => boolean;
  onSkip: (col: number) => void;
  onUnskip: (col: number) => void;
  onUnplace: (col: number) => void;
  round: number;
  totalRounds: number;
}

export function DraftRow({
  cards, skipped, isDraftPlaced,
  onSkip, onUnskip, onUnplace,
  round, totalRounds,
}: DraftRowProps) {
  return (
    <div className="draft-row">
      <div className="draft-row__header">
        <span className="draft-row__round">Round {round} / {totalRounds}</span>
        <span className="draft-row__hint">Click an empty slot to place a card</span>
      </div>
      <div className="draft-row__cards">
        {cards.map((card, i) => {
          const placed = isDraftPlaced(i);
          const isSkipped = skipped[i];
          const available = !placed && !isSkipped;

          return (
            <div key={i} className="draft-row__card-slot">
              <Card
                rank={card.rank}
                suit={card.suit}
                handled={placed || isSkipped}
                disabled
              />
              <span className="draft-row__col-label">Col {i + 1}</span>
              {available && (
                <button className="draft-row__action-btn draft-row__skip-btn" onClick={() => onSkip(i)}>
                  Skip
                </button>
              )}
              {placed && (
                <button className="draft-row__action-btn draft-row__undo-btn" onClick={() => onUnplace(i)}>
                  Undo
                </button>
              )}
              {isSkipped && (
                <button className="draft-row__action-btn draft-row__undo-btn" onClick={() => onUnskip(i)}>
                  Undo
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
