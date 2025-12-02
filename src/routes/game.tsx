import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useCallback, useEffect, useRef, useState } from "react"
import { ExportDialog } from "@/components/export-dialog"
import { FullscreenMonitor } from "@/components/fullscreen-monitor"
import { GameBoard } from "@/components/game-board"
import { GameNavbar } from "@/components/game-navbar"
import { RecordingIndicator } from "@/components/recording-indicator"
import { useInterval } from "@/hooks/use-interval"
import { extractCardPositions } from "@/lib/click-tracker"
import { checkMatch, GRID_CONFIG, initializeGame } from "@/lib/game-utils"
import { useRecordingStore } from "@/lib/recording-store"
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
	const hasInitialized = useRef(false)
	const navigate = useNavigate()
	const isRecording = useRecordingStore((state) => state.isRecording)
	const setCardPositions = useRecordingStore((state) => state.setCardPositions)
	const markGameStart = useRecordingStore((state) => state.markGameStart)
	const markGameEnd = useRecordingStore((state) => state.markGameEnd)
	const updateGameMetadata = useRecordingStore((state) => state.updateGameMetadata)
	const setShowExportDialog = useRecordingStore((state) => state.setShowExportDialog)
	const showExportDialog = useRecordingStore((state) => state.showExportDialog)
	const stopRecording = useRecordingStore((state) => state.stopRecording)
	const resetSession = useRecordingStore((state) => state.resetSession)

	// Set card positions and mark game start when component mounts
	useEffect(() => {
		if (cards.length > 0 && isRecording && !hasInitialized.current) {
			hasInitialized.current = true
			// Extract card positions from DOM and save it
			const positions = extractCardPositions(cards)
			setCardPositions(positions)
			markGameStart()
		}
	}, [cards, isRecording, setCardPositions, markGameStart])

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
			// Mark game end and update metadata
			if (isRecording) {
				markGameEnd()
				updateGameMetadata({
					duration: stats.timeElapsed,
					totalMoves: stats.moves,
					totalMatches: stats.matches,
				})
			}
		}
	}, [cards, gameState, isRecording, markGameEnd, updateGameMetadata, stats])

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

				setStats((prev) => {
					const newStats = {
						...prev,
						moves: prev.moves + 1,
					}

					if (isRecording) {
						updateGameMetadata({
							totalMoves: newStats.moves,
						})
					}

					return newStats
				})

				if (checkMatch(first, second)) {
					// Match found!
					setCards((prev) =>
						prev.map((card) =>
							card.imageId === first.imageId ? { ...card, isMatched: true } : card,
						),
					)

					setStats((prev) => {
						const newStats = {
							...prev,
							matches: prev.matches + 1,
						}

						if (isRecording) {
							updateGameMetadata({
								totalMatches: newStats.matches,
							})
						}

						return newStats
					})

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
		[flippedCards, isChecking, isRecording, updateGameMetadata],
	)

	const handleReturnToMenu = async () => {
		try {
			// Stop recording and clean up
			await stopRecording()

			// Exit fullscreen if in fullscreen mode
			if (document.fullscreenElement) {
				await document.exitFullscreen().catch((err) => {
					console.warn("Failed to exit fullscreen:", err)
				})
			}

			// Reset session state
			resetSession()

			// Navigate to main menu
			navigate({ to: "/" })
		} catch (error) {
			console.error("Failed to return to menu:", error)
			alert("Failed to return to menu. Please try again.")
		}
	}

	return (
		<div
			className="min-h-screen h-screen bg-cover bg-center bg-no-repeat text-stone-50 flex flex-col overflow-hidden"
			style={{ backgroundImage: "url(/main-menu-bg.png)" }}
		>
			{/* Recording Indicator */}
			<RecordingIndicator />

			{/* Export Dialog */}
			{showExportDialog && <ExportDialog onClose={() => setShowExportDialog(false)} />}

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

						{/* Export data button (if recording) */}
						{isRecording && (
							<button
								type="button"
								onClick={() => setShowExportDialog(true)}
								className="w-full group relative overflow-hidden py-3 px-6 bg-linear-to-br from-green-700 to-emerald-600 hover:from-green-600 hover:to-emerald-500 text-white font-bold rounded-lg shadow-lg border-2 border-green-400 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer mb-3"
							>
								{/* Button shine effect */}
								<div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

								{/* Top border accent */}
								<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-green-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
								<span className="relative z-10 flex items-center justify-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5 mr-2"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
										/>
									</svg>
									Export Session Data
								</span>
							</button>
						)}

						{/* Return to menu button */}
						<button
							type="button"
							onClick={handleReturnToMenu}
							className="w-full group relative overflow-hidden py-3 px-6 bg-linear-to-br from-amber-700 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 text-amber-950 font-bold rounded-lg shadow-lg border-2 border-yellow-400 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
						>
							{/* Button shine effect */}
							<div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

							{/* Top border accent */}
							<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
							<span className="relative z-10">Return to Menu</span>
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
