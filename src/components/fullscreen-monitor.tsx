import { useEffect, useEffectEvent, useState } from "react"
import { useFullscreen } from "@/hooks/use-fullscreen"
import { useTranslation } from "@/hooks/use-translation"

interface FullscreenMonitorProps {
	enabled?: boolean
	onExitFullscreen?: () => void
	onEnterFullscreen?: () => void
}

function doNothing() {
	return
}

export function FullscreenMonitor({
	enabled = true,
	onExitFullscreen,
	onEnterFullscreen,
}: FullscreenMonitorProps) {
	const { t } = useTranslation()
	const { isFullscreen, enter, isSupported } = useFullscreen()
	const [showWarning, setShowWarning] = useState(false)
	const handleExitFullscreen = useEffectEvent(onExitFullscreen || doNothing)
	const handleEnterFullscreen = useEffectEvent(onEnterFullscreen || doNothing)

	useEffect(() => {
		if (!enabled || !isSupported) return

		if (!isFullscreen) {
			setShowWarning(true)
			handleExitFullscreen()
		} else {
			setShowWarning(false)
			handleEnterFullscreen()
		}
	}, [isFullscreen, enabled, isSupported])

	if (!enabled || !showWarning || !isSupported) {
		return null
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/95 backdrop-blur-sm">
			<div className="max-w-lg mx-4 bg-stone-800 border-4 border-amber-600 rounded-xl p-8 shadow-2xl">
				<div className="flex flex-col items-center gap-6 text-center">
					{/* Warning Icon */}
					<div className="relative">
						<div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-20 w-20 text-amber-500 relative"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>

					{/* Title */}
					<h2 className="text-3xl font-bold text-amber-100">{t.fullscreenMonitor.title}</h2>

					{/* Message */}
					<div className="space-y-3">
						<p className="text-stone-200 text-lg leading-relaxed">{t.fullscreenMonitor.message}</p>
						<p className="text-stone-400 text-sm leading-relaxed">
							{t.fullscreenMonitor.description}
						</p>
					</div>

					{/* Return to Fullscreen Button */}
					<button
						type="button"
						onClick={async () => {
							try {
								await enter()
							} catch (error) {
								console.error("Failed to enter fullscreen:", error)
							}
						}}
						className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white text-lg font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-800 hover:scale-105 active:scale-95 shadow-lg"
					>
						{t.fullscreenMonitor.returnButton}
					</button>

					{/* Helper text */}
					<p className="text-stone-500 text-xs">
						{t.fullscreenMonitor.keyboardHint}{" "}
						<kbd className="px-2 py-1 bg-stone-700 rounded border border-stone-600 text-stone-300">
							{t.fullscreenMonitor.keyboardKey}
						</kbd>{" "}
						{t.fullscreenMonitor.keyboardHintSuffix}
					</p>
				</div>
			</div>
		</div>
	)
}
