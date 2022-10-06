import {useCallback, useEffect, useMemo, useState} from "react"
import {BlitzPage} from "blitz"
import Layout from "app/core/layouts/Layout"
import {Dealer} from "../auth/components/Dealer"
import {Player} from "../auth/components/Player"
import useArray from "../auth/hooks/useArray"

/*
 * This file is just for a pleasant getting started page for your new app.
 * You can delete everything in here and start from scratch if you like.
 */
export interface Card {
  value: string
  suit: string
}

const peek = (arr, ind = 0) => arr[ind]

const getValue = ({value}: Card) => {
  if (["J", "Q", "K"].some((val) => val === value)) {
    return 10
  } else if (value === "A") {
    return 1
  } else {
    return parseInt(value)
  }
}

const isAce = (card) => getValue(card) === 1
const aceCount = (hand: Card[]) => hand.filter((card) => card.value === "A").length

const calcHandTotal = (hand: Card[]) => {
  let total = 0
  if(hand == undefined) debugger;
  if(hand.length === 0) return [0]
  hand.forEach((card) => {
    total += getValue(card)
  })

  if (hand.some((card) => isAce(card))) {
    const totals = [total]
    for (let i = 0; i !== aceCount(hand); i++) {
      totals.push(total + 10 * (i + 1))
    }
    return totals
  }
  return [total]
}

const freshShoe = () => {
  const tempDeck = new Array(13).fill(-1).map((_, index) => {
    if (index === 0) {
      return {
        value: "A",
      }
    } else if (index >= 1 && index <= 9) {
      return {
        value: `${index + 1}`,
      }
    } else {
      if (index === 10) {
        return {
          value: "J",
        }
      } else if (index === 11) {
        return {
          value: "Q",
        }
      } else {
        return {
          value: "K",
        }
      }
    }
  })

  const shoe = ["Spades", "Clubs", "Hearts", "Diamonds"].reduce((acc: Card[], suit) => {
    const fullDeck = tempDeck.map(({value}) => ({value, suit: suit}))
    return [
      ...acc,
      ...fullDeck.slice(),
      ...fullDeck.slice(),
      ...fullDeck.slice(),
      ...fullDeck.slice(),
      ...fullDeck.slice(),
      ...fullDeck.slice(),
    ]
  }, [])

  const swap = (a, b, shoe) => {
    const temp = shoe[a]
    shoe[a] = shoe[b]
    shoe[b] = temp
  }

  for (let i = 0; i !== shoe.length; i++) {
    const b = Math.floor(Math.random() * shoe.length - 1)
    swap(i, b, shoe)
  }

  return shoe
}

const bestHand = (totals) => {
  if (totals.length === 1) {
    return totals[0]
  }
  return totals.reduce((acc, cur) => {
    if (cur > acc && cur <= 21) return cur
  }, 0)
}

const Home: BlitzPage = () => {
  const [shoe, setShoe] = useState(freshShoe())
  const {array: playerSpots, update: updatePlayerSpots, updateWithPrev: updatePlayerSpotsWithPrev} = useArray([[]])
  const [currentPlayerSpot, setCurrentPlayerSpot] = useState(0)

  const numberOfPlayerSpots = useMemo(() => {
    return playerSpots.length
  }, [playerSpots])

  // const [player, setPlayer] = useState<Card[] | []>([])
  const [dealer, setDealer] = useState<Card[] | []>([])
  const [dealDisabled, setDealDisabled] = useState(false)
  const [splitDisabled, setSplitDisabled] = useState(true)
  const [hitDisabled, setHitDisabled] = useState(true)
  const [doubleDisabled, setDoubleDisabled] = useState(true)
  const [standDisabled, setStandDisabled] = useState(true)
  const [showResult, setShowResult] = useState<boolean>(false)
  // const playerTotal = useMemo(() => calcHandTotal(player), [player])
  const playerTotal = useMemo(() => calcHandTotal(playerSpots[currentPlayerSpot]),
    [currentPlayerSpot, playerSpots[currentPlayerSpot]])

  const onSplit = () => {
  }
  const onDeal = useCallback(() => {
    setShowResult(false)
    if (shoe.length <= 75) {
      console.log("Reshuffling")
      setShoe(freshShoe)
    }
    enableAllPlayerActions()
    // setPlayer([peek(shoe), peek(shoe, 2)])
    updatePlayerSpots(currentPlayerSpot, [peek(shoe), peek(shoe, 2)])
    setDealer([peek(shoe, 1), peek(shoe, 3)])
    setShoe((prev) => prev.slice(4))
    setDealDisabled(true)
  }, [shoe])

  const onHit = useCallback(() => {
    // setPlayer((prev) => [...prev, peek(shoe)])
    updatePlayerSpotsWithPrev((prev) =>
      [...prev.slice(0, currentPlayerSpot),
        [...prev[currentPlayerSpot], peek(shoe)],
        ...prev.slice(currentPlayerSpot + 1, prev.length)])
    setShoe((prev) => prev.slice(1))
    setDoubleDisabled(true)
  }, [shoe])

  const disableAllPlayerActions = () => {
    setHitDisabled(true)
    setDealDisabled(true)
    setDoubleDisabled(true)
    setStandDisabled(true)
  }

  const disableAllPlayerActionsButDeal = () => {
    setHitDisabled(true)
    setDealDisabled(false)
    setDoubleDisabled(true)
    setStandDisabled(true)
  }

  const isDisableAllPlayerActions = () =>
    /* dealDisabled && */ doubleDisabled && hitDisabled && standDisabled

  const enableAllPlayerActions = () => {
    setHitDisabled(false)
    setDealDisabled(false)
    setDoubleDisabled(false)
    setStandDisabled(false)
  }

  const dealerTotal = useMemo(() => calcHandTotal(dealer), [dealer])
  const dealerHasBlackjack = useCallback(
    () => dealerTotal.some((total) => total === 21) && dealer.length === 2,
    [dealerTotal, dealer]
  )
  // const playerHasBlackjack = useCallback(
  //   () => playerTotal.some((total) => total === 21) && player.length === 2,
  //   [playerTotal, player]
  // )
  const playerHasBlackjack = useCallback(
    () => playerTotal.some((total) => total === 21) &&
      playerSpots[currentPlayerSpot].length === 2,
    [playerTotal, playerSpots[currentPlayerSpot], currentPlayerSpot]
  )
  const dealerBusted = useCallback(
    () => dealer.length > 0 && dealerTotal.every((total) => total > 21),
    [dealer, dealerTotal]
  )
  // const playerBusted = useCallback(
  //   () => player.length > 0 && playerTotal.every((total) => total > 21),
  //   [player, playerTotal]
  // )
  const playerBusted = useCallback(
    () => playerSpots[currentPlayerSpot].length > 0 &&
      playerTotal.every((total) => total > 21),
    [currentPlayerSpot, playerSpots[currentPlayerSpot]]
  )

  // useEffect(() => {
  //   if (calcHandTotal(player).every((total) => total > 21)) {
  //     disableAllPlayerActions()
  //     setDealDisabled(false)
  //     setShowResult(true)
  //   }
  // }, [player])
  useEffect(() => {
    if (calcHandTotal(playerSpots[currentPlayerSpot]).every((total) => total > 21)) {
      disableAllPlayerActions()
      setDealDisabled(false)
      setShowResult(true)
    }
  }, [playerSpots[currentPlayerSpot]])
  useEffect(() => {
    if (dealerHasBlackjack()) {
      setShowResult(true)
    }
  }, [dealer, dealerHasBlackjack])
  const onStand = useCallback(() => {
    disableAllPlayerActions()

    if (dealerHasBlackjack()) {
      setShowResult(true)
      return
    }

    let peekIndex = 0
    let tempDealerTotal = [...dealerTotal]
    while (!tempDealerTotal.some((total) => total >= 17)) {
      tempDealerTotal = tempDealerTotal.map((total) => total + getValue(shoe[peekIndex] as Card))
      peekIndex++
    }

    setDealer((prev) => [...prev, ...shoe.slice(0, peekIndex)])
    setShoe((prev) => prev.slice(peekIndex))

    setDealDisabled(false)

    setShowResult(true)
  }, [dealerTotal, dealerHasBlackjack, shoe])

  // const onDouble = useCallback(() => {
  //   setDoubleDisabled(true)
  //   setShoe((prev) => prev.slice(1))
  //   setPlayer((prev) => {
  //     const totals = calcHandTotal([...prev, peek(shoe)])
  //     if (totals.every((total) => total > 21)) {
  //       setShowResult(true)
  //     }
  //     return [...prev, peek(shoe)]
  //   })
  //   onStand()
  // }, [shoe, onStand])
  const onDouble = useCallback(() => {
    setDoubleDisabled(true)
    setShoe((prev) => prev.slice(1))
    // setPlayer((prev) => {
    //   const totals = calcHandTotal([...prev, peek(shoe)])
    //   if (totals.every((total) => total > 21)) {
    //     setShowResult(true)
    //   }
    //   return [...prev, peek(shoe)]
    // })
    updatePlayerSpotsWithPrev((prev) => {
      // const totals = calcHandTotal([...prev, peek(shoe)])
      const totals = calcHandTotal([...prev[currentPlayerSpot], peek(shoe)])
      if (totals.every((total) => total > 21)) {
        setShowResult(true)
      }
      return [...prev.slice(0, currentPlayerSpot),
        [...prev[currentPlayerSpot], peek(shoe)],
        ...prev.slice(currentPlayerSpot+1, prev.length)];
    })
    onStand()
  }, [shoe, onStand, currentPlayerSpot])

  useEffect(() => {
    if (playerHasBlackjack() && !dealerHasBlackjack()) {
      disableAllPlayerActions()
      setDealDisabled(false)
    } else if (playerBusted()) {
      disableAllPlayerActionsButDeal()
    }
  }, [playerTotal, dealerHasBlackjack, playerBusted, playerHasBlackjack])

  useEffect(() => {
    if (!playerHasBlackjack() && dealerHasBlackjack()) {
      disableAllPlayerActions()
      setDealDisabled(false)
    }
  }, [playerTotal, dealerHasBlackjack, shoe, playerHasBlackjack])

  useEffect(() => {
    if (playerHasBlackjack() && dealerHasBlackjack()) {
      disableAllPlayerActions()
      setDealDisabled(false)
    }
  }, [playerTotal, dealerHasBlackjack, playerHasBlackjack])

  return (
    <div>
      <Dealer
        dealer={dealer}
        isDisableAllPlayerActions={isDisableAllPlayerActions}
        dealerTotal={dealerTotal}
        dealerBusted={dealerBusted}
        dealerHasBlackjack={dealerHasBlackjack}
      />
      {playerSpots.map((playerSpot, index) => (
        <Player
          key={Math.random().toString(23).substr(2, 9)}
          // player={player}
          player={playerSpots[index]}
          playerTotal={playerTotal}
          playerBusted={playerBusted}
          playerHasBlackjack={playerHasBlackjack}
          calcHandTotal={calcHandTotal}
          onStand={onStand}
          onDeal={onDeal}
          standDisabled={standDisabled}
          showResult={showResult}
          dealerHasBlackjack={dealerHasBlackjack}
          dealerBusted={dealerBusted}
          bestHand={bestHand}
          dealerTotal={dealerTotal}
          dealDisabled={dealDisabled}
          onDouble={onDouble}
          doubleDisabled={doubleDisabled}
          onHit={onHit}
          hitDisabled={hitDisabled}
          onSplit={onSplit}
          splitDisabled={splitDisabled}
        />
      ))}
    </div>
  )
}

// const Home: BlitzPage = () => {
//   return (
//     <div className="container">
//       <main>
//         <div className="logo">
//           <Image src={logo} alt="blitzjs" />
//         </div>
//         <p>
//           <strong>Congrats!</strong> Your app is ready, including user sign-up and log-in.
//         </p>
//         <div className="buttons" style={{ marginTop: "1rem", marginBottom: "1rem" }}>
//           <Suspense fallback="Loading...">
//             <UserInfo />
//           </Suspense>
//         </div>
//         <p>
//           <strong>
//             To add a new model to your app, <br />
//             run the following in your terminal:
//           </strong>
//         </p>
//         <pre>
//           <code>blitz generate all project name:string</code>
//         </pre>
//         <div style={{ marginBottom: "1rem" }}>(And select Yes to run prisma migrate)</div>
//         <div>
//           <p>
//             Then <strong>restart the server</strong>
//           </p>
//           <pre>
//             <code>Ctrl + c</code>
//           </pre>
//           <pre>
//             <code>blitz dev</code>
//           </pre>
//           <p>
//             and go to{" "}
//             <Link href="/projects">
//               <a>/projects</a>
//             </Link>
//           </p>
//         </div>
//         <div className="buttons" style={{ marginTop: "5rem" }}>
//           <a
//             className="button"
//             href="https://blitzjs.com/docs/getting-started?utm_source=blitz-new&utm_medium=app-template&utm_campaign=blitz-new"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//           <a
//             className="button-outline"
//             href="https://github.com/blitz-js/blitz"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Github Repo
//           </a>
//           <a
//             className="button-outline"
//             href="https://discord.blitzjs.com"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Discord Community
//           </a>
//         </div>
//       </main>
//
//       <footer>
//         <a
//           href="https://blitzjs.com?utm_source=blitz-new&utm_medium=app-template&utm_campaign=blitz-new"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Powered by Blitz.js
//         </a>
//       </footer>
//
//       <style jsx global>{`
//         @import url("https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;700&display=swap");
//
//         html,
//         body {
//           padding: 0;
//           margin: 0;
//           font-family: "Libre Franklin", -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
//             Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
//         }
//
//         * {
//           -webkit-font-smoothing: antialiased;
//           -moz-osx-font-smoothing: grayscale;
//           box-sizing: border-box;
//         }
//         .container {
//           min-height: 100vh;
//           display: flex;
//           flex-direction: column;
//           justify-content: center;
//           align-items: center;
//         }
//
//         main {
//           padding: 5rem 0;
//           flex: 1;
//           display: flex;
//           flex-direction: column;
//           justify-content: center;
//           align-items: center;
//         }
//
//         main p {
//           font-size: 1.2rem;
//         }
//
//         p {
//           text-align: center;
//         }
//
//         footer {
//           width: 100%;
//           height: 60px;
//           border-top: 1px solid #eaeaea;
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           background-color: #45009d;
//         }
//
//         footer a {
//           display: flex;
//           justify-content: center;
//           align-items: center;
//         }
//
//         footer a {
//           color: #f4f4f4;
//           text-decoration: none;
//         }
//
//         .logo {
//           margin-bottom: 2rem;
//         }
//
//         .logo img {
//           width: 300px;
//         }
//
//         .buttons {
//           display: grid;
//           grid-auto-flow: column;
//           grid-gap: 0.5rem;
//         }
//         .button {
//           font-size: 1rem;
//           background-color: #6700eb;
//           padding: 1rem 2rem;
//           color: #f4f4f4;
//           text-align: center;
//         }
//
//         .button.small {
//           padding: 0.5rem 1rem;
//         }
//
//         .button:hover {
//           background-color: #45009d;
//         }
//
//         .button-outline {
//           border: 2px solid #6700eb;
//           padding: 1rem 2rem;
//           color: #6700eb;
//           text-align: center;
//         }
//
//         .button-outline:hover {
//           border-color: #45009d;
//           color: #45009d;
//         }
//
//         pre {
//           background: #fafafa;
//           border-radius: 5px;
//           padding: 0.75rem;
//           text-align: center;
//         }
//         code {
//           font-size: 0.9rem;
//           font-family: Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono,
//             Bitstream Vera Sans Mono, Courier New, monospace;
//         }
//
//         .grid {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           flex-wrap: wrap;
//
//           max-width: 800px;
//           margin-top: 3rem;
//         }
//
//         @media (max-width: 600px) {
//           .grid {
//             width: 100%;
//             flex-direction: column;
//           }
//         }
//       `}</style>
//     </div>
//   )
// }

Home.suppressFirstRenderFlicker = true
Home.getLayout = (page) => <Layout title="Home">{page}</Layout>

export default Home
