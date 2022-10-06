import { RenderedCard } from "../../components/Card"

export const Dealer = ({
  dealer,
  isDisableAllPlayerActions,
  dealerTotal,
  dealerBusted,
  dealerHasBlackjack,
}) => (
  <div
    style={{
      border: "1px dotted red",
      marginBottom: "20px",
      display: "grid",
      gridAutoFlow: "column",
      justifyContent: "start",
    }}
  >
    {dealer.length > 0 &&
      dealer.map((card, index) =>
        isDisableAllPlayerActions() ? (
          <div key={Math.random().toString(19).substr(2, 9)}>
            <RenderedCard {...card} />
          </div>
        ) : index === 0 ? (
          <div key={Math.random().toString(19).substr(2, 9)}>
            <RenderedCard {...card} />
          </div>
        ) : (
          // <div key={Math.random().toString(19).substr(2, 9)}>[.......]</div>
          <div key={Math.random().toString(19).substr(2, 9)}>
            <RenderedCard />
          </div>
        )
      )}
    {dealer.length > 0 && isDisableAllPlayerActions() && (
      <div>
        Total:{" "}
        {dealerTotal.length > 1 && !dealerBusted()
          ? dealerTotal.filter((total) => total <= 21).join(" or ")
          : dealerTotal.join(" or ")}
      </div>
    )}
    {dealerTotal.every((total) => total > 21) && <h3>BUSTED</h3>}
    {dealerHasBlackjack() && <h3>BLACKJACK</h3>}
  </div>
)
