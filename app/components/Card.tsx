import { Card } from "../pages"

export const RenderedCard = (card?) => {
  if (card.value == undefined) {
    const src = `/svg-cards/card-back.png`
    const ariaLabel = "back of playing card"
    return (
      <img
        style={{ width: "125px", height: "auto" }}
        src={src}
        aria-label={ariaLabel}
        role={"img"}
      />
    )
  }
  const ordinal = (() => {
    if (card.value === "A") return "ace"
    if (card.value === "J") return "jack"
    if (card.value === "Q") return "queen"
    if (card.value === "K") return "king"
    return card.value
  })()
  const src = `/svg-cards/${ordinal}_of_${card.suit.toLowerCase()}.svg`
  const ariaLabel = "jack of clubs"
  return (
    <img style={{ width: "125px", height: "auto" }} src={src} aria-label={ariaLabel} role={"img"} />
  )
}
