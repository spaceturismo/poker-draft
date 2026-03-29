import type { HandEvaluation } from '../game/types';
import './Results.css';

interface ResultsProps {
  finalScore: number;
  bonusEvaluation: HandEvaluation | null;
}

export function Results({ finalScore, bonusEvaluation }: ResultsProps) {
  return (
    <div className="results">
      {bonusEvaluation && (
        <div className="results__bonus">
          <span className="results__bonus-label">Bonus Hand:</span>{' '}
          <span className="results__bonus-hand">{bonusEvaluation.name}</span>{' '}
          <span className="results__bonus-points">+{bonusEvaluation.points}</span>
        </div>
      )}
      <div className="results__label">Total Score</div>
      <div className="results__score">{finalScore}</div>
      <div className="results__sub">
        From {bonusEvaluation ? '13' : '12'} hands (5 rows + 5 columns + 2 diagonals{bonusEvaluation ? ' + bonus' : ''})
      </div>
    </div>
  );
}
