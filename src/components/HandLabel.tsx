import { HandRank } from '../game/types';
import type { HandEvaluation } from '../game/types';
import './HandLabel.css';

interface HandLabelProps {
  evaluation: HandEvaluation;
  direction: 'row' | 'col' | 'diag';
}

const RANK_COLORS: Record<number, string> = {
  [HandRank.HighCard]: '#777',
  [HandRank.OnePair]: '#aaa',
  [HandRank.TwoPair]: '#4fc3f7',
  [HandRank.ThreeOfAKind]: '#66bb6a',
  [HandRank.Straight]: '#ffa726',
  [HandRank.Flush]: '#ab47bc',
  [HandRank.FullHouse]: '#ef5350',
  [HandRank.FourOfAKind]: '#ff7043',
  [HandRank.StraightFlush]: '#ffee58',
  [HandRank.RoyalFlush]: '#ffd700',
};

export function HandLabel({ evaluation, direction }: HandLabelProps) {
  const color = RANK_COLORS[evaluation.rank] ?? '#999';
  return (
    <div className={`hand-label hand-label--${direction}`}>
      <span className="hand-label__name" style={{ color }}>
        {evaluation.name}
      </span>
      {evaluation.points > 0 && (
        <span className="hand-label__points">+{evaluation.points}</span>
      )}
    </div>
  );
}
