import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Image, Link, BlitzPage, useMutation, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import logout from "app/auth/mutations/logout"
import logo from "public/logo.png"
import { use } from "ast-types"

/*
 * This file is just for a pleasant getting started page for your new app.
 * You can delete everything in here and start from scratch if you like.
 */

const UserInfo = () => {
  const currentUser = useCurrentUser()
  const [logoutMutation] = useMutation(logout)

  if (currentUser) {
    return (
      <>
        <button
          className="button small"
          onClick={async () => {
            await logoutMutation()
          }}
        >
          Logout
        </button>
        <div>
          User id: <code>{currentUser.id}</code>
          <br />
          User role: <code>{currentUser.role}</code>
        </div>
      </>
    )
  } else {
    return (
      <>
        <Link href={Routes.SignupPage()}>
          <a className="button small">
            <strong>Sign Up</strong>
          </a>
        </Link>
        <Link href={Routes.LoginPage()}>
          <a className="button small">
            <strong>Login</strong>
          </a>
        </Link>
      </>
    )
  }
}

const useFirstTime = (func: () => void) => {
  const [first, setFirst] = useState(false)

  useEffect(() => {
    if (first) return

    setFirst(true)
  }, [])

  func()
}

interface Card {
  value: string
  suit: string
}

const peek = (arr, ind = 0) => arr[ind]

const getValue = ({ value }: Card) => {
  if (["J", "Q", "K"].some((val) => val === value)) {
    return 10
  } else if (value === "A") {
    return 1
  } else {
    return parseInt(value)
  }
}

const isAce = (card) => getValue(card) === 1

const calcHandTotal = (hand: Card[]) => {
  let total = 0
  hand.forEach((card) => {
    total += getValue(card)
  })

  if (hand.some((card) => isAce(card))) {
    return [total, total + 10]
  }
  return [total]
}

const Home: BlitzPage = () => {
  const [shoe, setShoe] = useState(
    (() => {
      const tempdeck = new Array(13).fill(-1).map((_, index) => {
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
        const fulldeck = tempdeck.map(({ value }) => ({ value, suit: suit }))
        return [
          ...acc,
          ...fulldeck.slice(),
          ...fulldeck.slice(),
          ...fulldeck.slice(),
          ...fulldeck.slice(),
          ...fulldeck.slice(),
          ...fulldeck.slice(),
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
    })()
  )

  const [player, setPlayer] = useState<Card[] | []>([])
  const [dealer, setDealer] = useState<Card[] | []>([])
  const [dealDisabled, setDealDisabled] = useState(false)
  const [hitDisabled, setHitDisabled] = useState(true)
  const [doubleDisabled, setDoubleDisabled] = useState(true)
  const [standDisabled, setStandDisabled] = useState(true)

  const onDeal = () => {
    enableAllPlayerActions()
    setPlayer([peek(shoe), peek(shoe, 2)])
    setDealer([peek(shoe, 1), peek(shoe, 3)])
    setShoe((prev) => prev.slice(4))
    setDealDisabled(true)
  }

  const onHit = () => {
    setPlayer((prev) => [...prev, peek(shoe)])
    setShoe((prev) => prev.slice(1))
    if (calcHandTotal(player).every((total) => total > 21)) {
      disableAllPlayerActions()
      setDealDisabled(false)
    }
  }

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

  const onDouble = () => {
    setPlayer([peek(shoe)])
    setShoe((prev) => prev.slice(4))
  }

  const playerTotal = useMemo(() => calcHandTotal(player), [player])
  const dealerTotal = useMemo(() => calcHandTotal(dealer), [dealer])
  const dealerHasBlackjack = () => dealerTotal.some((total) => total === 21) && dealer.length === 2
  const playerHasBlackjack = () => playerTotal.some((total) => total === 21) && player.length === 2
  const dealerBusted = () => dealer.length > 0 && dealerTotal.every((total) => total > 21)
  const playerBusted = () => player.length > 0 && playerTotal.every((total) => total > 21)

  const onStand = useCallback(() => {
    disableAllPlayerActions()

    if (dealerHasBlackjack()) return

    // while (dealerTotal.some((total) => total < 17)) {
    //   setDealer((prev) => [...prev, peek(shoe)])
    //   setShoe((prev) => prev.slice(1))
    // }

    let peekIndex = 0
    let tempDealerTotal = [...dealerTotal]
    while (!tempDealerTotal.some((total) => total >= 17)) {
      tempDealerTotal = tempDealerTotal.map((total) => total + getValue(shoe[peekIndex] as Card))
      peekIndex++
    }

    setDealer((prev) => [...prev, ...shoe.slice(0, peekIndex)])
    setShoe((prev) => prev.slice(peekIndex))

    setDealDisabled(false)
  }, [dealerTotal])

  useEffect(() => {
    if (playerHasBlackjack() && !dealerHasBlackjack()) {
      disableAllPlayerActions()
      setDealDisabled(false)
    } else if (playerBusted()) {
      disableAllPlayerActionsButDeal()
    }
  }, [playerTotal])

  useEffect(() => {
    if (!playerHasBlackjack() && dealerHasBlackjack()) {
      disableAllPlayerActions()
      setDealDisabled(false)
    }
  }, [playerTotal])

  useEffect(() => {
    if (playerHasBlackjack() && dealerHasBlackjack()) {
      disableAllPlayerActions()
      setDealDisabled(false)
    }
  }, [playerTotal])

  return (
    <div>
      <div style={{ border: "1px dotted red", marginBottom: "20px" }}>
        {dealer.length > 0 &&
          dealer.map((card, index) =>
            isDisableAllPlayerActions() ? (
              <div key={card}>
                {card.value} of {card.suit}
              </div>
            ) : index === 0 ? (
              <div key={card}>
                {card.value} of {card.suit}
              </div>
            ) : (
              <div key={card}>facedown</div>
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
      <div style={{ border: "1px dotted green" }}>
        {player.length > 0 &&
          player.map((card) => (
            <div key={card}>
              {card.value} of {card.suit}
            </div>
          ))}
      </div>
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
      <button onClick={onDeal} disabled={dealDisabled}>
        Deal
      </button>
      <button onClick={onDouble} disabled={doubleDisabled}>
        Double
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
