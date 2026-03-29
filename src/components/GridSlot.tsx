import { Card } from './Card';
import type { Card as CardType } from '../game/types';
import './GridSlot.css';

interface GridSlotProps {
  card: CardType | null;
  isAvailable: boolean;
  isPending: boolean;
  isBonusHighlighted?: boolean;
  onClick: () => void;
  onUnplace: () => void;
}

export function GridSlot({ card, isAvailable, isPending, isBonusHighlighted, onClick, onUnplace }: GridSlotProps) {
  if (card && isPending) {
    return (
      <div className="grid-slot grid-slot--pending" onClick={onUnplace} title="Click to undo placement">
        <Card rank={card.rank} suit={card.suit} size="small" disabled />
        <div className="grid-slot__pending-badge">new</div>
      </div>
    );
  }

  if (card) {
    const classes = ['grid-slot', 'grid-slot--filled'];
    if (isBonusHighlighted) classes.push('grid-slot--bonus-highlight');
    return (
      <div className={classes.join(' ')}>
        <Card rank={card.rank} suit={card.suit} size="small" disabled />
      </div>
    );
  }

  return (
    <button
      className={`grid-slot grid-slot--empty ${isAvailable ? 'grid-slot--target' : ''}`}
      onClick={onClick}
      disabled={!isAvailable}
    >
      {isAvailable && <span className="grid-slot__target-icon">+</span>}
    </button>
  );
}
