import { RenderedCard } from "../../components/Card"
import {playerBusted, playerHasBlackjack} from "../../pages";

export const Player = ({
  player,
  currentPlayerTotal,
  currentPlayerBusted,
  currentPlayerHasBlackjack,
  onDeal,
  dealDisabled,
  onDouble,
  doubleDisabled,
  onHit,
  hitDisabled,
  calcHandTotal,
  onStand,
  standDisabled,
  showResult,
  dealerHasBlackjack,
  dealerBusted,
  bestHand,
  dealerTotal,
  onSplit,
  splitDisabled,
  currentPlayerSpot,
  playerSpot
}) => {
  const spotActive = currentPlayerSpot === playerSpot

  return (
    <div
      style={{
        border: "1px dotted green",
      }}
    >
      {player && <div
        style={{
          display: "grid",
          gridAutoFlow: "column",
          justifyContent: "start",
        }}
      >
        {player.length > 0 &&
          player.map((card) => (
            <div key={Math.random().toString(19).substr(2, 9)}>
              <RenderedCard {...card} />
            </div>
          ))}
        {player.length > 0 && (
          <div>
            Total:{" "}
            {calcHandTotal(player).length > 1 && !playerBusted(player)
              ? calcHandTotal(player).filter((total) => total <= 21).join(" or ")
              : calcHandTotal(player).join(" or ")}
          </div>
        )}
        {calcHandTotal(player).every((total) => total > 21) && <h3>BUSTED</h3>}
        {currentPlayerHasBlackjack() && <h3>BLACKJACK</h3>}
      </div>}
      <div>
        <button accessKey={'d'} onClick={onDeal} disabled={!spotActive || dealDisabled}>
          [D]eal
        </button>
        <button accessKey={'o'} onClick={onDouble} disabled={!spotActive || doubleDisabled
        || player.length < 2}>
          D[o]uble
        </button>
        <button
          accessKey={'p'}
          onClick={onSplit}
          disabled={!spotActive || showResult || !(player && player.length === 2 && player[0].value === player[1].value)}
        >
          S[p]lit
        </button>
        <button
          accessKey={'h'}
          onClick={onHit}
          disabled={
            !spotActive ||
            hitDisabled ||
            calcHandTotal(player).some((total) => total === 21) ||
            calcHandTotal(player).every((total) => total > 21)
          }
        >
          [H]it
        </button>
        <button
          accessKey={'s'}
          onClick={onStand} disabled={!spotActive || standDisabled}>
          [S]tand
        </button>
        {/*<button onClick={onSplit}>Split</button>*/}
        {spotActive && showResult && (
          <h2>
            {playerHasBlackjack(player) && dealerHasBlackjack()
              ? "Push"
              : playerHasBlackjack(player)
                ? "You win"
                : dealerHasBlackjack()
                  ? "You lose"
                  : playerBusted(player)
                    ? "You lose"
                    : dealerBusted()
                      ? "You win"
                      : `${
                        bestHand(player) > bestHand(dealerTotal)
                          ? "You win"
                          : bestHand(player) === bestHand(dealerTotal)
                            ? "Push"
                            : "You lose"
                      }`}
          </h2>
        )}
      </div>
    </div>
  );
}
