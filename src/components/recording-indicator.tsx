import { useEffect, useState } from "react"
import { useTranslation } from "@/hooks/use-translation"
import { formatDuration } from "@/lib/data-export"
import { useRecordingStore } from "@/lib/recording-store"

export function RecordingIndicator() {
	const { t } = useTranslation()
	const { isRecording, isPaused, recordingStartTime } = useRecordingStore()
	const [duration, setDuration] = useState(0)

	// Update duration every second
	useEffect(() => {
		if (!isRecording || isPaused) {
			return
		}

		const interval = setInterval(() => {
			const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000)
			setDuration(elapsed)
		}, 1000)

		return () => clearInterval(interval)
	}, [isRecording, isPaused, recordingStartTime])

	if (!isRecording) {
		return null
	}

	return (
		<div className="fixed top-2 right-2 z-50 flex items-center space-x-3">
			{/* Recording status */}
			<div className="bg-stone-900/90 backdrop-blur-sm border-2 border-red-600 rounded-lg w-30 px-4 py-2 shadow-lg flex items-center space-x-3">
				{/* Pulsing red dot */}
				<div className="relative flex items-center justify-center">
					<div
						className={`absolute w-3 h-3 bg-red-500 rounded-full ${isPaused ? "" : "animate-ping"}`}
					/>
					<div
						className={`relative w-3 h-3 ${isPaused ? "bg-yellow-500" : "bg-red-600"} rounded-full`}
					/>
				</div>

				{/* Status text */}
				<div className="flex flex-col">
					<span className="text-xs! text-stone-400 leading-tight">
						{isPaused ? t.recordingIndicator.paused : t.recordingIndicator.recording}
					</span>
					<span className="text-xs! font-mono text-amber-100 leading-tight">
						{formatDuration(duration)}
					</span>
				</div>
			</div>
		</div>
	)
}
