import { RenderedCard } from "../../components/Card"

export const Player = ({
  player,
  playerTotal,
  playerBusted,
  playerHasBlackjack,
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
}) => {
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
            {playerTotal.length > 1 && !playerBusted()
              ? playerTotal.filter((total) => total <= 21).join(" or ")
              : playerTotal.join(" or ")}
          </div>
        )}
        {playerTotal.every((total) => total > 21) && <h3>BUSTED</h3>}
        {playerHasBlackjack() && <h3>BLACKJACK</h3>}
      </div>}
      <div>
        <button onClick={onDeal} disabled={dealDisabled}>
          Deal
        </button>
        <button onClick={onDouble} disabled={doubleDisabled}>
          Double
        </button>
        <button
          onClick={onSplit}
          disabled={showResult || !(player && player.length === 2 && player[0].value === player[1].value)}
        >
          Split
        </button>
        <button
          onClick={onHit}
          disabled={
            hitDisabled ||
            calcHandTotal(player).some((total) => total === 21) ||
            calcHandTotal(player).every((total) => total > 21)
          }
        >
          Hit
        </button>
        <button onClick={onStand} disabled={standDisabled}>
          Stand
        </button>
        {/*<button onClick={onSplit}>Split</button>*/}
        {showResult && (
          <h2>
            {playerHasBlackjack() && dealerHasBlackjack()
              ? "Push"
              : playerHasBlackjack()
                ? "You win"
                : dealerHasBlackjack()
                  ? "You lose"
                  : playerBusted()
                    ? "You lose"
                    : dealerBusted()
                      ? "You win"
                      : `${
                        bestHand(playerTotal) > bestHand(dealerTotal)
                          ? "You win"
                          : bestHand(playerTotal) === bestHand(dealerTotal)
                            ? "Push"
                            : "You lose"
                      }`}
          </h2>
        )}
      </div>
    </div>
  );
}
