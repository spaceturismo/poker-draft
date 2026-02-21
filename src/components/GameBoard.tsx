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

  return (
    <div className="gameboard">
      <h1 className="gameboard__title">Poker Draft</h1>
      <p className="gameboard__subtitle">Draft Cards into a 5x5 Grid &middot; 12 Hands &middot; 7 Rounds</p>

      {game.phase === DraftPhase.Idle && (
        <p className="gameboard__intro">
          Each round, 5 cards are dealt — one per column. Click an empty slot in
          that column to place a card. Rearrange freely until you accept the round.
          After 7 rounds, your score comes from all 12 poker hands.
        </p>
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

      {game.phase !== DraftPhase.Idle && (
        <div className="gameboard__grid-area">
          <Grid
            grid={game.effectiveGrid}
            isSlotAvailable={game.isSlotAvailable}
            onPlaceCard={game.placeCard}
            onUnplaceCard={game.unplaceCard}
            isPending={game.isPending}
            phase={game.phase}
            evaluations={game.evaluations}
          />
        </div>
      )}

      {game.phase === DraftPhase.Finished && game.finalScore !== null && (
        <Results finalScore={game.finalScore} />
      )}

      <Controls
        phase={game.phase}
        onStartGame={game.startGame}
        onAcceptRound={game.acceptRound}
        onSkipAll={game.skipAll}
        onFinishGame={game.finishGame}
        onRestart={game.restart}
      />
    </div>
  );
}
