import { Suit } from '../game/types';
import { SUIT_SYMBOLS, RANK_DISPLAY } from '../game/constants';
import './Card.css';

interface CardProps {
  rank: number;
  suit: Suit;
  selected?: boolean;
  handled?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'normal' | 'small';
}

export function Card({ rank, suit, selected, handled, onClick, disabled, size = 'normal' }: CardProps) {
  const isRed = suit === Suit.Hearts || suit === Suit.Diamonds;
  const className = [
    'card',
    `card--${size}`,
    isRed ? 'card--red' : 'card--black',
    selected ? 'card--selected' : '',
    handled ? 'card--handled' : '',
    disabled ? 'card--disabled' : '',
  ].filter(Boolean).join(' ');

  return (
    <button className={className} onClick={onClick} disabled={disabled}>
      <span className="card__rank">{RANK_DISPLAY[rank]}</span>
      <span className="card__suit">{SUIT_SYMBOLS[suit]}</span>
    </button>
  );
}
