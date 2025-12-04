import { useState } from "react"
import { createDataPackage, downloadZip, generateExportFilename } from "@/lib/data-export"
import { useRecordingStore } from "@/lib/recording-store"

interface ExportDialogProps {
	onClose: () => void
}

export function ExportDialog({ onClose }: ExportDialogProps) {
	const [isExporting, setIsExporting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [progress, setProgress] = useState(0)

	const {
		sessionId,
		participant,
		calibrationData,
		clicks,
		cardPositions,
		gameStartTimestamp,
		gameEndTimestamp,
		gameMetadata,
		recordingStartTime,
		recordingDuration,
		webcamMimeType,
		screenMimeType,
		screenResolution,
		screenStreamResolution,
		webcamResolution,
	} = useRecordingStore()

	const handleExport = async () => {
		if (!sessionId || !participant || !calibrationData) {
			setError("Missing required session data")
			return
		}

		setIsExporting(true)
		setError(null)
		setProgress(0)

		try {
			setProgress(20)

			const exportData = {
				sessionId,
				participant,
				recordingStartTime,
				recordingDuration,
				screenResolution: screenResolution || {
					width: window.screen.width,
					height: window.screen.height,
				},
				screenStreamResolution: screenStreamResolution || { width: 0, height: 0 },
				webcamResolution: webcamResolution || { width: 1280, height: 720 },
				initialCalibration: calibrationData,
				cardPositions,
				gameStartTimestamp,
				clicks,
				gameEndTimestamp,
				gameMetadata,
				webcamMimeType,
				screenMimeType,
			}

			setProgress(40)

			// Create the data package
			const zipBlob = await createDataPackage(exportData)

			setProgress(80)

			// Download the file
			const filename = generateExportFilename(sessionId, participant.name)
			downloadZip(zipBlob, filename)

			setProgress(100)

			// Small delay to show 100% progress
			setTimeout(() => {
				onClose()
			}, 500)
		} catch (err) {
			console.error("Export error:", err)
			setError(err instanceof Error ? err.message : "Failed to export data")
		} finally {
			setIsExporting(false)
		}
	}

	return (
		<div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
			<div className="bg-linear-to-br from-stone-900 via-stone-800 to-stone-900 rounded-xl shadow-2xl border-4 border-amber-600 p-8 max-w-lg w-full relative overflow-hidden">
				{/* Top border accent */}
				<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent" />

				{/* Corner decorations */}
				<div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-amber-400" />
				<div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-amber-400" />
				<div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-amber-400" />
				<div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-amber-400" />

				<h2 className="text-3xl font-bold text-amber-100 mb-2 text-center">Export Session Data</h2>
				<p className="text-stone-300 text-center mb-6 text-sm">
					Download all recorded data as a ZIP file
				</p>

				{/* Session info */}
				<div className="space-y-3 mb-6 bg-stone-950/30 border border-stone-700 rounded-lg p-4">
					<div className="flex justify-between text-sm">
						<span className="text-stone-400">Participant:</span>
						<span className="text-amber-100 font-semibold">{participant?.name}</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-stone-400">Session ID:</span>
						<span className="text-stone-300 font-mono text-xs">{sessionId?.slice(0, 16)}...</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-stone-400">Clicks Recorded:</span>
						<span className="text-amber-100 font-semibold">{clicks.length}</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-stone-400">Calibration Points:</span>
						<span className="text-amber-100 font-semibold">
							{calibrationData?.points.length || 0}
						</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-stone-400">Game Duration:</span>
						<span className="text-amber-100 font-semibold">{gameMetadata.duration}s</span>
					</div>
				</div>

				{/* Progress bar */}
				{isExporting && (
					<div className="mb-6">
						<div className="flex justify-between text-sm text-stone-300 mb-2">
							<span>Exporting...</span>
							<span>{progress}%</span>
						</div>
						<div className="w-full h-2 bg-stone-950 rounded-full overflow-hidden">
							<div
								className="h-full bg-linear-to-r from-amber-600 to-yellow-500 transition-all duration-300 ease-out"
								style={{ width: `${progress}%` }}
							/>
						</div>
					</div>
				)}

				{/* Error message */}
				{error && (
					<div className="mb-6 p-4 bg-red-950/50 border-2 border-red-600 rounded-lg">
						<div className="flex items-start space-x-3">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-6 w-6 text-red-400 shrink-0"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<div>
								<h4 className="text-red-300 font-semibold mb-1">Export Error</h4>
								<p className="text-red-200 text-sm">{error}</p>
							</div>
						</div>
					</div>
				)}

				{/* Info message */}
				<div className="mb-6 bg-amber-950/30 border border-amber-800 rounded-lg p-4">
					<h4 className="text-amber-100 font-semibold mb-2 flex items-center text-sm">
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
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						What's included:
					</h4>
					<ul className="list-disc list-inside space-y-1 text-stone-300 text-sm">
						<li>Webcam recording (video/webm)</li>
						<li>Screen recording (video/webm)</li>
						<li>Session metadata (JSON)</li>
						<li>All click events and timestamps</li>
						<li>Calibration data</li>
					</ul>
				</div>

				{/* Buttons */}
				<div className="flex gap-3">
					<button
						type="button"
						onClick={onClose}
						disabled={isExporting}
						className="flex-1 px-6 py-3 bg-stone-700 hover:bg-stone-600 text-stone-200 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 focus:ring-offset-stone-900 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleExport}
						disabled={isExporting}
						className="flex-1 group relative overflow-hidden px-6 py-3 bg-linear-to-br from-amber-700 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 text-amber-950 font-bold rounded-lg shadow-lg border-2 border-yellow-400 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-900"
					>
						<div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
						<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						<span className="relative z-10 flex items-center justify-center">
							{isExporting ? (
								<>
									<svg
										className="animate-spin -ml-1 mr-3 h-5 w-5"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										/>
									</svg>
									Exporting...
								</>
							) : (
								<>
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
									Download ZIP
								</>
							)}
						</span>
					</button>
				</div>
			</div>
		</div>
	)
}
