import { useRef, useState } from "react"
import { useTranslation } from "@/hooks/use-translation"
import { createDataPackage, generateExportFilename } from "@/lib/data-export"
import { useRecordingStore } from "@/lib/recording-store"
import { formatUploadProgress, type UploadProgress, uploadSessionToR2 } from "@/lib/upload"

interface ExportDialogProps {
	onClose: () => void
}

const isDevelopment = import.meta.env.DEV

export function ExportDialog({ onClose }: ExportDialogProps) {
	const { t } = useTranslation()
	const [isProcessing, setIsProcessing] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
	const [successMessage, setSuccessMessage] = useState<string | null>(null)
	const [uploadCompleted, setUploadCompleted] = useState(false)
	const zipBlobRef = useRef<Blob | null>(null)

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
		markAsUploaded,
	} = useRecordingStore()

	/**
	 * Package the data into a ZIP blob
	 * This is called automatically before upload/download if not already packaged
	 */
	const ensurePackaged = async (): Promise<Blob> => {
		// If already packaged, return the cached blob
		if (zipBlobRef.current) {
			return zipBlobRef.current
		}

		if (!sessionId || !participant || !calibrationData) {
			throw new Error(t.errors.missingSessionData)
		}

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

		// Create the ZIP package
		const zipBlob = await createDataPackage(exportData)

		// Cache the blob for future use
		zipBlobRef.current = zipBlob

		return zipBlob
	}

	/**
	 * Upload the packaged data to R2
	 */
	const handleUpload = async () => {
		if (!sessionId || !participant) {
			setError(t.errors.missingSessionData)
			return
		}

		setIsProcessing(true)
		setError(null)
		setSuccessMessage(null)
		setUploadProgress(null)

		try {
			const zipBlob = await ensurePackaged()

			const filename = generateExportFilename(sessionId, participant.name)

			await uploadSessionToR2(sessionId, zipBlob, filename, {
				onProgress: (prog) => {
					setUploadProgress(prog)
				},
				onSuccess: () => {
					setSuccessMessage(t.exportDialog.successMessage)
					setUploadProgress(null)
					setIsProcessing(false)
					setUploadCompleted(true)
					markAsUploaded()
				},
				onError: (err) => {
					setError(err.message)
					setUploadProgress(null)
					setIsProcessing(false)
				},
			})
		} catch (err) {
			console.error("Upload error:", err)
			setError(err instanceof Error ? err.message : t.errors.uploadFailed)
			setUploadProgress(null)
			setIsProcessing(false)
		}
	}

	/**
	 * Download the packaged data locally
	 */
	const handleDownload = async () => {
		if (!sessionId || !participant?.name) {
			setError(t.errors.missingSessionData)
			return
		}

		setIsProcessing(true)
		setError(null)
		setSuccessMessage(null)

		try {
			const zipBlob = await ensurePackaged()

			// Trigger download
			const filename = generateExportFilename(sessionId, participant.name)
			const url = URL.createObjectURL(zipBlob)
			const link = document.createElement("a")
			link.href = url
			link.download = filename
			link.click()
			URL.revokeObjectURL(url)

			setIsProcessing(false)
		} catch (err) {
			console.error("Download error:", err)
			setError(err instanceof Error ? err.message : t.errors.downloadFailed)
			setIsProcessing(false)
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

				<h2 className="text-3xl font-bold text-amber-100 mb-2 text-center">
					{t.exportDialog.title}
				</h2>
				<p className="text-stone-300 text-center mb-6 text-sm">{t.exportDialog.description}</p>

				{/* Session info */}
				<div className="space-y-3 mb-6 bg-stone-950/30 border border-stone-700 rounded-lg p-4">
					<div className="flex justify-between text-sm">
						<span className="text-stone-400">{t.exportDialog.participantLabel}</span>
						<span className="text-amber-100 font-semibold">{participant?.name}</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-stone-400">{t.exportDialog.sessionIdLabel}</span>
						<span className="text-stone-300 font-mono text-xs">{sessionId?.slice(0, 16)}...</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-stone-400">{t.exportDialog.clicksRecordedLabel}</span>
						<span className="text-amber-100 font-semibold">{clicks.length}</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-stone-400">{t.exportDialog.gameDurationLabel}</span>
						<span className="text-amber-100 font-semibold">{gameMetadata.duration}s</span>
					</div>
				</div>

				{/* Upload Progress */}
				{uploadProgress && (
					<div className="mb-6">
						<div className="flex justify-between text-sm text-stone-300 mb-2">
							<span>{t.exportDialog.uploadingLabel}</span>
							<span>{Math.round(uploadProgress.percentage)}%</span>
						</div>
						<div className="w-full h-2 bg-stone-950 rounded-full overflow-hidden">
							<div
								className="h-full bg-linear-to-r from-green-600 to-emerald-500 transition-all duration-300 ease-out"
								style={{ width: `${uploadProgress.percentage}%` }}
							/>
						</div>
						<p className="text-xs text-stone-400 text-center mt-2">
							{formatUploadProgress(uploadProgress)}
						</p>
					</div>
				)}

				{/* Success Message */}
				{successMessage && (
					<div className="mb-6 p-4 bg-green-950/50 border-2 border-green-600 rounded-lg">
						<div className="flex items-start space-x-3">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-6 w-6 text-green-400 shrink-0"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<div>
								<h4 className="text-green-300 font-semibold mb-1">{t.exportDialog.successTitle}</h4>
								<p className="text-green-200 text-sm">{successMessage}</p>
							</div>
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
								<h4 className="text-red-300 font-semibold mb-1">{t.exportDialog.errorTitle}</h4>
								<p className="text-red-200 text-sm">{error}</p>
							</div>
						</div>
					</div>
				)}

				{/* Buttons - Always visible */}
				<div className="flex flex-col gap-3">
					{/* Upload Button */}
					<button
						type="button"
						onClick={handleUpload}
						disabled={isProcessing || uploadCompleted}
						className="w-full group relative overflow-hidden px-6 py-3 bg-linear-to-br from-green-700 to-emerald-600 hover:from-green-600 hover:to-emerald-500 text-white font-bold rounded-lg shadow-lg border-2 border-green-400 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-stone-900"
					>
						<div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
						<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-green-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						<span className="relative z-10 flex items-center justify-center">
							{isProcessing && uploadProgress ? (
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
									{t.exportDialog.uploadingButton}
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
											d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
										/>
									</svg>
									{t.exportDialog.uploadButton}
								</>
							)}
						</span>
					</button>

					{/* Download Button (Dev Only) */}
					{isDevelopment && (
						<button
							type="button"
							onClick={handleDownload}
							disabled={isProcessing}
							className="w-full group relative overflow-hidden px-6 py-3 bg-linear-to-br from-stone-600 to-stone-700 hover:from-stone-500 hover:to-stone-600 text-stone-100 font-semibold rounded-lg shadow-lg border-2 border-stone-500 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 focus:ring-offset-stone-900"
						>
							<div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
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
								{t.exportDialog.downloadButton}
							</span>
						</button>
					)}

					{/* Close Button */}
					<button
						type="button"
						onClick={onClose}
						disabled={isProcessing}
						className="w-full px-6 py-3 bg-stone-700 hover:bg-stone-600 text-stone-200 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 focus:ring-offset-stone-900 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{t.exportDialog.closeButton}
					</button>
				</div>
			</div>
		</div>
	)
}
