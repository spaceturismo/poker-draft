import './Results.css';

interface ResultsProps {
  finalScore: number;
}

export function Results({ finalScore }: ResultsProps) {
  return (
    <div className="results">
      <div className="results__label">Total Score</div>
      <div className="results__score">{finalScore}</div>
      <div className="results__sub">
        From 12 hands (5 rows + 5 columns + 2 diagonals)
      </div>
    </div>
  );
}
