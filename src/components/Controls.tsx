import { DraftPhase } from '../game/draftTypes';
import './Controls.css';

interface ControlsProps {
  phase: string;
  onStartGame: () => void;
  onAcceptRound: () => void;
  onSkipAll: () => void;
  onFinishGame: () => void;
  onRestart: () => void;
}

export function Controls({ phase, onStartGame, onAcceptRound, onSkipAll, onFinishGame, onRestart }: ControlsProps) {
  if (phase === DraftPhase.Idle) {
    return (
      <div className="controls">
        <button className="controls__btn controls__btn--primary" onClick={onStartGame}>
          Start Game
        </button>
      </div>
    );
  }

  if (phase === DraftPhase.Drafting) {
    return (
      <div className="controls">
        <button className="controls__btn controls__btn--primary" onClick={onAcceptRound}>
          Accept Round
        </button>
        <button className="controls__btn controls__btn--secondary" onClick={onSkipAll}>
          Skip Round
        </button>
        <button className="controls__btn controls__btn--danger" onClick={onFinishGame}>
          Finish Game
        </button>
      </div>
    );
  }

  if (phase === DraftPhase.Finished) {
    return (
      <div className="controls">
        <button className="controls__btn controls__btn--primary" onClick={onRestart}>
          Play Again
        </button>
      </div>
    );
  }

  return null;
}
