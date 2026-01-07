import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "@/hooks/use-translation"
import { useConfirmDialog } from "@/lib/dialog/hooks"
import { useRecordingStore } from "@/lib/recording-store"

interface GameNavbarProps {
	ghostsKilled: number
}

export function GameNavbar({ ghostsKilled }: GameNavbarProps) {
	const navigate = useNavigate()
	const { stopRecording, resetSession } = useRecordingStore()
	const { confirm } = useConfirmDialog()
	const { t } = useTranslation()

	const handleRestartExperiment = async () => {
		const confirmed = await confirm({
			title: t.game.navbar.restartConfirmTitle,
			message: t.game.navbar.restartConfirmMessage,
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
			alert(t.errors.restartExperimentFailed)
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
				<div className="flex gap-2 text-sm items-center text-red-200">
					<span>⟲</span>
					<span className="hidden lg:block">{t.game.navbar.restartButton}</span>
				</div>
			</button>

			<div className="flex items-center gap-2 sm:gap-4 md:gap-6">
				<div className="flex flex-col items-center">
					<span className="text-stone-400 text-sm! uppercase tracking-wider font-bold">
						{t.game.navbar.ghostsKilledLabel}
					</span>
					<span className="text-purple-300 text-sm! font-bold flex items-center justify-center gap-2">
						<span>👻</span>
						<span>{ghostsKilled} / 20</span>
					</span>
				</div>
			</div>
		</div>
	)
}
