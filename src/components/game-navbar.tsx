import { useEffect, useState } from "react"
import { formatTime } from "@/lib/game-utils"
import type { GameStats } from "@/lib/types"
import { type FullscreenElement, useFullscreen } from "../hooks/use-fullscreen"

interface GameNavbarProps {
	stats: GameStats
	onBackToMenu: () => void
}

const checkFullscreenState = (): boolean => {
	const fullscreenElement = document.fullscreenElement as HTMLElement | null
	const fullscreenDoc = document as FullscreenElement
	const webkitElement = fullscreenDoc.webkitFullscreenElement as HTMLElement | null
	const mozElement = fullscreenDoc.mozFullScreenElement as HTMLElement | null
	const msElement = fullscreenDoc.msFullscreenElement as HTMLElement | null

	return !!(fullscreenElement || webkitElement || mozElement || msElement)
}

export default function GameNavbar({ stats, onBackToMenu }: GameNavbarProps) {
	const { toggleFullscreen, isFullscreenAvailable } = useFullscreen()
	const [isFullscreenMode, setIsFullscreenMode] = useState(false)

	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFullscreenMode(checkFullscreenState())
		}

		// Set initial state after mounting
		handleFullscreenChange()

		document.addEventListener("fullscreenchange", handleFullscreenChange)
		document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
		document.addEventListener("mozfullscreenchange", handleFullscreenChange)
		document.addEventListener("MSFullscreenChange", handleFullscreenChange)

		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange)
			document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
			document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
			document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
		}
	}, [])

	const handleFullscreenToggle = async () => {
		await toggleFullscreen()
	}
	return (
		<div className="w-full">
			{/* Completely transparent navbar */}
			<div className="px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
				{/* Left: Menu Button */}
				<button
					type="button"
					onClick={onBackToMenu}
					className="group px-2 py-1 sm:px-3 sm:py-1.5 bg-stone-800/50 hover:bg-stone-700/50 text-stone-100 text-xs sm:text-sm font-semibold rounded border border-stone-600 hover:border-stone-500 transition-all duration-200 cursor-pointer"
					aria-label="Back to menu"
				>
					<span>← Menu</span>
				</button>

				{/* Center: Stats */}
				<div className="flex items-center gap-2 sm:gap-4 md:gap-6">
					{/* Time */}
					<div className="flex flex-col items-center">
						<span className="text-stone-400 text-[8px] sm:text-[10px] uppercase tracking-wider font-bold">
							Time
						</span>
						<span className="text-stone-100 text-[10px] sm:text-xs md:text-sm font-bold">
							{formatTime(stats.timeElapsed)}
						</span>
					</div>

					{/* Vertical separator */}
					<div className="h-6 sm:h-8 w-px bg-linear-to-b from-transparent via-stone-600 to-transparent" />

					{/* Moves */}
					<div className="flex flex-col items-center">
						<span className="text-stone-400 text-[8px] sm:text-[10px] uppercase tracking-wider font-bold">
							Moves
						</span>
						<span className="text-stone-100 text-[10px] sm:text-xs md:text-sm font-bold">
							{stats.moves}
						</span>
					</div>

					{/* Vertical separator */}
					<div className="h-6 sm:h-8 w-px bg-linear-to-b from-transparent via-stone-600 to-transparent" />

					{/* Matches */}
					<div className="flex flex-col items-center">
						<span className="text-stone-400 text-[8px] sm:text-[10px] uppercase tracking-wider font-bold">
							Matches
						</span>
						<span className="text-stone-100 text-[10px] sm:text-xs md:text-sm font-bold">
							{stats.matches}
						</span>
					</div>

					{/* Vertical separator */}
					<div className="h-6 sm:h-8 w-px bg-linear-to-b from-transparent via-stone-600 to-transparent" />

					{/* Accuracy */}
					<div className="flex flex-col items-center">
						<span className="text-stone-400 text-[8px] sm:text-[10px] uppercase tracking-wider font-bold">
							Accuracy
						</span>
						<span className="text-stone-100 text-[10px] sm:text-xs md:text-sm font-bold">
							{stats.accuracy}%
						</span>
					</div>
				</div>

				{/* Right: Fullscreen Button */}
				{isFullscreenAvailable() && (
					<button
						type="button"
						onClick={handleFullscreenToggle}
						className="group px-2 py-1 sm:px-3 sm:py-1.5 bg-stone-800/50 hover:bg-stone-700/50 text-stone-100 text-xs sm:text-sm font-semibold rounded border border-stone-600 hover:border-stone-500 transition-all duration-200 cursor-pointer"
						aria-label={isFullscreenMode ? "Exit fullscreen" : "Enter fullscreen"}
						title={isFullscreenMode ? "Exit fullscreen" : "Enter fullscreen"}
					>
						<span>{isFullscreenMode ? "⛶ Exit" : "⛶ Full"}</span>
					</button>
				)}
			</div>
		</div>
	)
}
