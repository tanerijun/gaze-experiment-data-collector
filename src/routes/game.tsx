import { createFileRoute, Link } from "@tanstack/react-router"
import { useCallback, useEffect, useState } from "react"
import FullscreenMonitor from "@/components/fullscreen-monitor"
import GameBoard from "@/components/game-board"
import GameNavbar from "@/components/game-navbar"
import { useInterval } from "@/hooks/use-interval"
import { checkMatch, GRID_CONFIG, initializeGame } from "@/lib/game-utils"
import type { Card, GameState, GameStats } from "@/lib/types"

export const Route = createFileRoute("/game")({
	component: RouteComponent,
})

function RouteComponent() {
	const [cards, setCards] = useState<Card[]>(() => initializeGame())
	const [flippedCards, setFlippedCards] = useState<Card[]>([])
	const [gameState, setGameState] = useState<GameState>("playing")
	const [stats, setStats] = useState<GameStats>({
		moves: 0,
		matches: 0,
		timeElapsed: 0,
	})
	const [isChecking, setIsChecking] = useState(false)
	const [isPausedByFullscreen, setIsPausedByFullscreen] = useState(false)

	useInterval(
		() => {
			setStats((prev) => ({
				...prev,
				timeElapsed: prev.timeElapsed + 1,
			}))
		},
		gameState === "playing" && !isPausedByFullscreen ? 1000 : null,
	)

	// Check for win condition
	useEffect(() => {
		if (cards.length === 0 || gameState !== "playing") return

		const allMatched = cards.every((card) => card.isMatched)
		if (allMatched) {
			setGameState("won")
		}
	}, [cards, gameState])

	// Handle card click
	const handleCardClick = useCallback(
		(clickedCard: Card) => {
			if (isChecking || flippedCards.length >= 2) return
			if (clickedCard.isFlipped || clickedCard.isMatched) return

			// Flip the card
			setCards((prev) =>
				prev.map((card) => (card.id === clickedCard.id ? { ...card, isFlipped: true } : card)),
			)

			const newFlippedCards = [...flippedCards, clickedCard]
			setFlippedCards(newFlippedCards)

			// Check for match when 2 cards are flipped
			if (newFlippedCards.length === 2) {
				setIsChecking(true)
				const [first, second] = newFlippedCards

				// Increment moves
				setStats((prev) => ({
					...prev,
					moves: prev.moves + 1,
				}))

				if (checkMatch(first, second)) {
					// Match found!
					setCards((prev) =>
						prev.map((card) =>
							card.imageId === first.imageId ? { ...card, isMatched: true } : card,
						),
					)

					setStats((prev) => ({
						...prev,
						matches: prev.matches + 1,
					}))

					setFlippedCards([])
					setIsChecking(false)
				} else {
					// No match - flip back after delay
					setTimeout(() => {
						setCards((prev) =>
							prev.map((card) =>
								card.id === first.id || card.id === second.id
									? { ...card, isFlipped: false }
									: card,
							),
						)
						setFlippedCards([])
						setIsChecking(false)
					}, 1000)
				}
			}
		},
		[flippedCards, isChecking],
	)

	return (
		<div
			className="min-h-screen h-screen bg-cover bg-center bg-no-repeat text-stone-50 flex flex-col overflow-hidden"
			style={{ backgroundImage: "url(/main-menu-bg.png)" }}
		>
			{/* Fullscreen Monitor - pauses game when user exits fullscreen */}
			<FullscreenMonitor
				enabled={gameState === "playing"}
				onExitFullscreen={() => setIsPausedByFullscreen(true)}
				onEnterFullscreen={() => setIsPausedByFullscreen(false)}
			/>

			<GameNavbar stats={stats} />

			{/* Game Board Container */}
			<div className="flex-1 flex items-center backdrop-blur-md justify-center relative overflow-hidden">
				{cards.length > 0 && (
					<GameBoard
						cards={cards}
						gridConfig={GRID_CONFIG}
						onCardClick={handleCardClick}
						disabled={isChecking || gameState === "won" || isPausedByFullscreen}
					/>
				)}
			</div>

			{/* Win Message */}
			{gameState === "won" && (
				<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-40 animate-in fade-in duration-200">
					<div className="bg-linear-to-br from-amber-950 via-amber-900 to-yellow-950 rounded-xl shadow-2xl border-4 border-yellow-700 p-8 max-w-md w-full text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
						{/* Top border accent */}
						<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-yellow-400 to-transparent rounded-t-lg" />

						{/* Corner decorations */}
						<div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-yellow-400" />
						<div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-yellow-400" />
						<div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-yellow-400" />
						<div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-yellow-400" />

						<h2 className="text-4xl font-bold text-yellow-100 mb-4 drop-shadow-lg">
							Game Complete!
						</h2>
						<p className="text-yellow-200 mb-6">Congratulations! You found all the pairs!</p>

						<div className="space-y-2 mb-8 text-left bg-amber-950/40 rounded-lg p-4 border border-yellow-700/50">
							<p className="text-yellow-100">
								<span className="text-yellow-300 font-bold">💎 Matches:</span> {stats.matches}
							</p>
							<p className="text-yellow-100">
								<span className="text-yellow-300 font-bold">🎯 Moves:</span> {stats.moves}
							</p>
							<p className="text-yellow-100">
								<span className="text-yellow-300 font-bold">⏱️ Time:</span> {stats.timeElapsed}s
							</p>
						</div>

						{/* Return to menu button */}
						<Link
							to="/"
							className="w-full group relative overflow-hidden py-3 px-6 bg-linear-to-br from-amber-700 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 text-amber-950 font-bold rounded-lg shadow-lg border-2 border-yellow-400 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer block"
						>
							{/* Button shine effect */}
							<div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

							{/* Top border accent */}
							<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
							<span className="relative z-10">Return to Menu</span>
						</Link>
					</div>
				</div>
			)}
		</div>
	)
}
