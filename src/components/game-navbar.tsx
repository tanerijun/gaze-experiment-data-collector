import { useNavigate } from "@tanstack/react-router"
import { useConfirmDialog } from "@/lib/dialog/hooks"
import { formatTime } from "@/lib/game-utils"
import { useRecordingStore } from "@/lib/recording-store"
import type { GameStats } from "@/lib/types"

interface GameNavbarProps {
	stats: GameStats
}

export function GameNavbar({ stats }: GameNavbarProps) {
	const navigate = useNavigate()
	const { stopRecording, resetSession } = useRecordingStore()
	const { confirm } = useConfirmDialog()

	const handleRestartExperiment = async () => {
		const confirmed = await confirm({
			title: "Confirm",
			message:
				"Are you sure you want to restart the experiment? This will stop the current recording and return to the main menu.",
		})

		if (!confirmed) return

		try {
			// Stop recording, clean up, and reset
			await stopRecording()
			if (document.fullscreenElement) {
				await document.exitFullscreen().catch((err) => {
					console.warn("Failed to exit fullscreen:", err)
				})
			}
			resetSession()
			navigate({ to: "/" })
		} catch (error) {
			console.error("Failed to restart experiment:", error)
			alert("Failed to restart experiment. Please try again.")
		}
	}

	return (
		<div className="w-full relative backdrop-blur-lg p-2 flex items-center justify-center">
			{/* Restart Experiment Button */}
			<button
				type="button"
				onClick={handleRestartExperiment}
				className="absolute left-2 top-2 bg-red-900/50 hover:bg-red-800/50 rounded border border-red-700 hover:border-red-600 transition-all duration-200 cursor-pointer py-0 px-1 lg:py-2 lg:px-4"
				aria-label="Restart experiment"
				title="Stop recording and return to main menu"
			>
				<div className="flex gap-2 items-center text-red-200">
					<span>⟲</span>
					<span className="hidden lg:block">Restart</span>
				</div>
			</button>

			<div className="flex items-center gap-2 sm:gap-4 md:gap-6">
				<div className="flex flex-col items-center">
					<span className="text-stone-400 text-[8px] sm:text-[10px] uppercase tracking-wider font-bold">
						Time
					</span>
					<span className="text-stone-100 text-[10px] sm:text-xs md:text-sm font-bold w-12 text-center">
						{formatTime(stats.timeElapsed)}
					</span>
				</div>

				<div className="h-6 sm:h-8 w-px bg-linear-to-b from-transparent via-stone-600 to-transparent" />

				<div className="flex flex-col items-center">
					<span className="text-stone-400 text-[8px] sm:text-[10px] uppercase tracking-wider font-bold">
						Moves
					</span>
					<span className="text-stone-100 text-[10px] sm:text-xs md:text-sm font-bold w-12 text-center">
						{stats.moves}
					</span>
				</div>

				<div className="h-6 sm:h-8 w-px bg-linear-to-b from-transparent via-stone-600 to-transparent" />

				<div className="flex flex-col items-center">
					<span className="text-stone-400 text-[8px] sm:text-[10px] uppercase tracking-wider font-bold">
						Matches
					</span>
					<span className="text-stone-100 text-[10px] sm:text-xs md:text-sm font-bold w-12 text-center">
						{stats.matches}
					</span>
				</div>
			</div>
		</div>
	)
}
