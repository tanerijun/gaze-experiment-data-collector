import { useEffect, useState } from "react"
import { useTranslation } from "@/hooks/use-translation"
import { useRecordingStore } from "@/lib/recording-store"
import type { CalibrationData } from "@/lib/types"
import { CalibrationOverlay, type CalibrationResult } from "./calibration-overlay"
import { AlertIcon, CheckmarkIcon, LoadingIcon } from "./icons"
import { WebcamPreview } from "./webcam-preview"

type SetupStep = "webcam" | "screen-recording" | "fullscreen" | "calibration" | "complete"

function StepCard({
	children,
	title,
	className = "",
}: {
	children: React.ReactNode
	title?: string
	className?: string
}) {
	return (
		<div
			className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 ${className}`}
		>
			<div className="bg-linear-to-br from-stone-900 via-stone-800 to-stone-900 rounded-xl shadow-2xl border-4 border-amber-600 p-8 max-w-lg w-full relative overflow-hidden">
				{/* Top border accent */}
				<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent" />

				{/* Corner decorations */}
				<div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-amber-400" />
				<div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-amber-400" />
				<div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-amber-400" />
				<div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-amber-400" />

				{title && <h2 className="text-3xl font-bold text-amber-100 mb-2 text-center">{title}</h2>}

				{children}
			</div>
		</div>
	)
}

export function SetupFlow({
	onComplete,
	onCancel,
}: {
	onComplete: () => void
	onCancel: () => void
}) {
	const { t } = useTranslation()
	const [currentStep, setCurrentStep] = useState<SetupStep>("webcam")
	const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [isRequestingFullscreen, setIsRequestingFullscreen] = useState(false)
	const [isPreparingStreams, setIsPreparingStreams] = useState(false)
	const {
		setCalibrationData,
		prepareVideoStreams,
		startRecording,
		finalizeSetup,
		resetSession,
		recordingStartTime,
	} = useRecordingStore()

	// Monitor Fullscreen state
	useEffect(() => {
		const handleFullscreenChange = () => {
			if (!document.fullscreenElement && currentStep === "calibration") {
				setError("Fullscreen is required for calibration. Please enter fullscreen again.")
			}
		}

		document.addEventListener("fullscreenchange", handleFullscreenChange)
		return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
	}, [currentStep])

	const handleAbort = () => {
		resetSession(true)
		onCancel()
	}

	const handleWebcamStreamReady = (stream: MediaStream) => {
		if (!webcamStream) {
			setWebcamStream(stream)
			setError(null)
		}
	}

	const handleWebcamPermissionGranted = () => {
		// Webcam is ready, user can proceed
	}

	const handleWebcamPermissionDenied = (err: Error) => {
		setError(`Webcam error: ${err.message}`)
	}

	const handleWebcamContinue = () => {
		if (!webcamStream) {
			setError("Please enable your webcam before continuing")
			return
		}
		setCurrentStep("screen-recording")
	}

	const handleScreenRecordingContinue = async () => {
		// Prepare video streams (get permissions but don't start recording to disk yet)
		setIsPreparingStreams(true)
		setError(null)

		try {
			await prepareVideoStreams()
			// After screen recording permission granted, move to fullscreen
			setCurrentStep("fullscreen")
			setIsPreparingStreams(false)
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to prepare video streams")
			setIsPreparingStreams(false)
		}
	}

	const handleFullscreenContinue = async () => {
		setIsRequestingFullscreen(true)
		setError(null)

		try {
			// Enter fullscreen first
			if (!document.fullscreenElement) {
				await document.documentElement.requestFullscreen()
			}

			await startRecording()

			// Move to calibration
			setCurrentStep("calibration")
		} catch (err) {
			console.error("Fullscreen/Recording error:", err)
			setError(
				err instanceof Error ? err.message : "Failed to enter fullscreen or start recording.",
			)
		} finally {
			setIsRequestingFullscreen(false)
		}
	}

	const handleCalibrationComplete = async (results: CalibrationResult[]) => {
		// Convert results to CalibrationData format
		const calibration: CalibrationData = {
			startTimestamp: results[0]?.timestamp || Date.now(),
			endTimestamp: results[results.length - 1]?.timestamp || Date.now(),
			points: results.map((result) => ({
				pointId: result.pointId,
				x: result.x,
				y: result.y,
				screenX: result.screenX,
				screenY: result.screenY,
				timestamp: result.timestamp,
				videoTimestamp: result.timestamp - recordingStartTime,
			})),
		}

		setCalibrationData(calibration)

		// Now finalize recording with calibration data
		try {
			await finalizeSetup()
			setCurrentStep("complete")
			// Small delay before completing
			setTimeout(() => {
				onComplete()
			}, 500)
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to finalize recording")
		}
	}

	const handleCalibrationClose = () => {
		setCurrentStep("complete")
		onComplete()
	}

	// Webcam Setup Step
	if (currentStep === "webcam") {
		return (
			<div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
				<div className="w-full max-w-2xl">
					<WebcamPreview
						onStreamReady={handleWebcamStreamReady}
						onPermissionGranted={handleWebcamPermissionGranted}
						onPermissionDenied={handleWebcamPermissionDenied}
					/>

					{/* Error message */}
					{error && (
						<div className="mt-4 p-4 bg-red-950/50 border-2 border-red-600 rounded-lg">
							<div className="flex items-start space-x-3">
								<AlertIcon className="text-red-400 size-6" />
								<div>
									<h4 className="text-red-300 font-semibold mb-1">{t.webcamSetup.errorTitle}</h4>
									<p className="text-red-200 text-sm">{error}</p>
								</div>
							</div>
						</div>
					)}

					{/* Continue button */}
					<div className="mt-6 flex gap-3">
						<button
							type="button"
							onClick={onCancel}
							className="flex-1 px-6 py-3 bg-stone-700 hover:bg-stone-600 text-stone-200 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 focus:ring-offset-black active:scale-95"
						>
							{t.webcamSetup.cancelButton}
						</button>

						<button
							type="button"
							onClick={handleWebcamContinue}
							disabled={!webcamStream}
							className="flex-1 group relative overflow-hidden px-6 py-3 bg-linear-to-br from-amber-700 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 text-amber-950 font-bold rounded-lg shadow-lg border-2 border-yellow-400 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-black"
						>
							<div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
							<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
							<span className="relative z-10">{t.webcamSetup.continueButton}</span>
						</button>
					</div>
				</div>
			</div>
		)
	}

	// Screen Recording Step
	if (currentStep === "screen-recording") {
		return (
			<StepCard>
				<p className="text-stone-300 text-center mb-6 text-sm">
					{t.screenRecordingSetup.description}
				</p>

				{/* Instructions */}
				<div className="bg-amber-950/30 border border-amber-800 rounded-lg p-4 mb-6">
					<h4 className="text-amber-100 font-semibold mb-2 flex items-center text-sm">
						<AlertIcon className="size-5 mr-2" />
						{t.screenRecordingSetup.whatHappensLabel}
					</h4>
					<ol className="list-decimal list-inside space-y-1 text-stone-300 text-sm">
						<li>{t.screenRecordingSetup.instruction1}</li>
						<li>{t.screenRecordingSetup.instruction2}</li>
					</ol>
				</div>

				{/* Error message */}
				{error && (
					<div className="mb-4 p-4 bg-red-950/50 border-2 border-red-600 rounded-lg">
						<div className="flex items-start space-x-3">
							<AlertIcon className="size-6 text-red-400 shrink-0" />
							<div>
								<h4 className="text-red-300 font-semibold mb-1">
									{t.screenRecordingSetup.errorTitle}
								</h4>
								<p className="text-red-200 text-sm">{error}</p>
							</div>
						</div>
					</div>
				)}

				{/* Buttons */}
				<div className="flex gap-3">
					{!isPreparingStreams && (
						<button
							type="button"
							onClick={() => setCurrentStep("webcam")}
							className="flex-1 px-6 py-3 bg-stone-700 hover:bg-stone-600 text-stone-200 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 focus:ring-offset-black active:scale-95"
						>
							{t.screenRecordingSetup.backButton}
						</button>
					)}
					<button
						type="button"
						onClick={handleScreenRecordingContinue}
						disabled={isPreparingStreams}
						className="flex-1 group relative overflow-hidden px-6 py-3 bg-linear-to-br from-amber-700 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 text-amber-950 font-bold rounded-lg shadow-lg border-2 border-yellow-400 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-black"
					>
						<div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
						<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						<span className="relative z-10 flex items-center justify-center">
							{isPreparingStreams ? (
								<>
									<LoadingIcon className="-ml-1 mr-3 h-5 w-5" />
									{t.screenRecordingSetup.gettingPermissions}
								</>
							) : (
								t.screenRecordingSetup.continueButton
							)}
						</span>
					</button>
				</div>
			</StepCard>
		)
	}

	// Calibration Step
	if (currentStep === "calibration") {
		return (
			<CalibrationOverlay
				onComplete={handleCalibrationComplete}
				onClose={handleCalibrationClose}
				onCancel={handleAbort}
				showIntro={true}
			/>
		)
	}

	// Fullscreen Step
	if (currentStep === "fullscreen") {
		return (
			<StepCard title={t.fullscreenSetup.title}>
				<p className="text-stone-300 text-center mb-6 text-sm">{t.fullscreenSetup.description}</p>

				{/* Instructions */}
				<div className="bg-amber-950/30 border border-amber-800 rounded-lg p-4 mb-6">
					<h4 className="text-amber-100 font-semibold mb-2 flex items-center text-sm">
						<AlertIcon className="size-5 mr-2" />
						{t.fullscreenSetup.whatHappensLabel}
					</h4>
					<ol className="list-decimal list-inside space-y-1 text-stone-300 text-sm">
						<li>{t.fullscreenSetup.instruction1}</li>
						<li>{t.fullscreenSetup.instruction2}</li>
						<li>{t.fullscreenSetup.instruction3}</li>
					</ol>
				</div>

				<div className="bg-blue-950/30 border border-blue-800 rounded-lg p-4 mb-6">
					<p className="text-blue-200 text-sm flex items-start">
						<CheckmarkIcon className="size-5 mr-2 mt-0.5 shrink-0" />
						<span>
							<strong>{t.fullscreenSetup.permissionsGrantedLabel}</strong>{" "}
							{t.fullscreenSetup.permissionsGrantedMessage}
						</span>
					</p>
				</div>

				{/* Error message */}
				{error && (
					<div className="mb-4 p-4 bg-red-950/50 border-2 border-red-600 rounded-lg">
						<div className="flex items-start space-x-3">
							<AlertIcon className="size-6 text-red-400 shrink-0" />
							<div>
								<h4 className="text-red-300 font-semibold mb-1">{t.fullscreenSetup.errorTitle}</h4>
								<p className="text-red-200 text-sm">{error}</p>
							</div>
						</div>
					</div>
				)}

				{/* Buttons */}
				<div className="flex gap-3">
					{!isRequestingFullscreen && (
						<button
							type="button"
							onClick={() => setCurrentStep("screen-recording")}
							className="flex-1 px-6 py-3 bg-stone-700 hover:bg-stone-600 text-stone-200 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 focus:ring-offset-black active:scale-95"
						>
							{t.fullscreenSetup.backButton}
						</button>
					)}
					<button
						type="button"
						onClick={handleFullscreenContinue}
						disabled={isRequestingFullscreen}
						className="flex-1 group relative overflow-hidden px-6 py-3 bg-linear-to-br from-amber-700 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 text-amber-950 font-bold rounded-lg shadow-lg border-2 border-yellow-400 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-black"
					>
						<div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
						<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						<span className="relative z-10 flex items-center justify-center">
							{isRequestingFullscreen ? (
								<>
									<LoadingIcon className="-ml-1 mr-3 h-5 w-5" />
									{t.fullscreenSetup.startingRecording}
								</>
							) : (
								t.fullscreenSetup.continueButton
							)}
						</span>
					</button>
				</div>
			</StepCard>
		)
	}

	// Complete - show loading while navigating to game
	if (currentStep === "complete") {
		return (
			<StepCard>
				<div className="flex justify-center mb-4">
					<CheckmarkIcon className="size-16 text-green-500" />
				</div>
				<h3 className="text-2xl font-bold text-amber-100 mb-2">{t.setupComplete.title}</h3>
				<p className="text-stone-300 text-sm">{t.setupComplete.message}</p>

				{error && (
					<div className="mt-4 p-3 bg-red-950/50 border border-red-600 rounded-lg">
						<p className="text-red-200 text-sm">{error}</p>
					</div>
				)}
			</StepCard>
		)
	}

	return null
}
