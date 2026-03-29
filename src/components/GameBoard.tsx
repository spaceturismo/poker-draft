import { useDraftState } from '../hooks/useDraftState';
import { DraftPhase } from '../game/draftTypes';
import { TOTAL_ROUNDS } from '../game/constants';
import { DraftRow } from './DraftRow';
import { Grid } from './Grid';
import { Controls } from './Controls';
import { Results } from './Results';
import './GameBoard.css';

export function GameBoard() {
  const game = useDraftState();

  const showGrid =
    game.phase !== DraftPhase.Idle;

  const showResults =
    game.phase === DraftPhase.Finished && game.finalScore !== null;

  return (
    <div className="gameboard">
      <h1 className="gameboard__title">Poker Draft</h1>
      <p className="gameboard__subtitle">Draft Cards into a 5x5 Grid &middot; 12 Hands &middot; 7 Rounds</p>

      {game.phase === DraftPhase.Idle && (
        <>
          <p className="gameboard__intro">
            Each round, 5 cards are dealt — one per column. Click an empty slot in
            that column to place a card. Rearrange freely until you accept the round.
            After 7 rounds, your score comes from all 12 poker hands.
          </p>
          <label className="gameboard__toggle">
            <input
              type="checkbox"
              checked={game.bonusEnabled}
              onChange={(e) => game.setBonusEnabled(e.target.checked)}
            />
            <span>Enable Bonus Round</span>
          </label>
        </>
      )}

      {game.phase !== DraftPhase.Idle && game.phase !== DraftPhase.Finished && (
        <div className="gameboard__live-score">
          Score: <strong>{game.liveScore}</strong>
        </div>
      )}

      {game.phase === DraftPhase.Drafting && (
        <DraftRow
          cards={game.currentDraft}
          skipped={game.draftSkipped}
          isDraftPlaced={game.isDraftPlaced}
          onSkip={game.skipCard}
          onUnskip={game.unskipCard}
          onUnplace={game.unplaceCard}
          round={game.round}
          totalRounds={TOTAL_ROUNDS}
        />
      )}

      {game.phase === DraftPhase.BonusPrompt && (
        <div className="gameboard__bonus-prompt">
          <h2 className="gameboard__bonus-title">Bonus Round!</h2>
          <p className="gameboard__bonus-desc">
            Five random cards from your grid will be highlighted in rapid succession.
            Hit <strong>Lock In</strong> at the right moment to score an extra hand!
          </p>
          <p className="gameboard__bonus-score">
            Current Score: <strong>{game.finalScore}</strong>
          </p>
        </div>
      )}

      {game.phase === DraftPhase.BonusRound && (
        <div className="gameboard__bonus-active">
          <h2 className="gameboard__bonus-title">Lock In Your Bonus Hand!</h2>
          {game.bonusEvaluation && (
            <div className="gameboard__bonus-live">
              <span className="gameboard__bonus-live-hand">{game.bonusEvaluation.name}</span>
              <span className="gameboard__bonus-live-points">+{game.bonusEvaluation.points}</span>
            </div>
          )}
          <p className="gameboard__bonus-desc">
            Watch the highlighted cards cycle — press <strong>Lock In</strong> when you see a hand you like!
          </p>
        </div>
      )}

      {showGrid && (
        <div className="gameboard__grid-area">
          <Grid
            grid={game.effectiveGrid}
            isSlotAvailable={game.isSlotAvailable}
            onPlaceCard={game.placeCard}
            onUnplaceCard={game.unplaceCard}
            isPending={game.isPending}
            isBonusHighlighted={game.isBonusHighlighted}
            phase={game.phase}
            evaluations={game.evaluations}
          />
        </div>
      )}

      {showResults && (
        <Results
          finalScore={game.finalScore!}
          bonusEvaluation={game.bonusEvaluation}
        />
      )}

      <Controls
        phase={game.phase}
        onStartGame={game.startGame}
        onAcceptRound={game.acceptRound}
        onSkipAll={game.skipAll}
        onFinishGame={game.finishGame}
        onRestart={game.restart}
        onAcceptBonus={game.acceptBonus}
        onDeclineBonus={game.declineBonus}
        onLockInBonus={game.lockInBonus}
      />
    </div>
  );
}
