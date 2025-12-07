import { useState } from "react"
import { useTranslation } from "@/hooks/use-translation"
import type { TranslationObject } from "@/lib/localization"
import { FullscreenMonitor } from "./fullscreen-monitor"
import { AlertIcon, CheckmarkIcon } from "./icons"

interface CalibrationPoint {
	id: string
	x: number // percentage
	y: number // percentage
	label: string
}

export interface CalibrationResult {
	pointId: string
	x: number
	y: number
	timestamp: number
	screenX: number
	screenY: number
}

const getCalibrationPoints = (t: TranslationObject): CalibrationPoint[] => [
	{ id: "top-left", x: 5, y: 5, label: t.calibration.pointLabel.topLeft },
	{ id: "top-center", x: 50, y: 5, label: t.calibration.pointLabel.topCenter },
	{ id: "top-right", x: 95, y: 5, label: t.calibration.pointLabel.topRight },
	{ id: "center-left", x: 5, y: 50, label: t.calibration.pointLabel.centerLeft },
	{ id: "center-center", x: 50, y: 50, label: t.calibration.pointLabel.centerCenter },
	{ id: "center-right", x: 95, y: 50, label: t.calibration.pointLabel.centerRight },
	{ id: "bottom-left", x: 5, y: 95, label: t.calibration.pointLabel.bottomLeft },
	{ id: "bottom-center", x: 50, y: 95, label: t.calibration.pointLabel.bottomCenter },
	{ id: "bottom-right", x: 95, y: 95, label: t.calibration.pointLabel.bottomRight },
]

export function CalibrationOverlay({
	onComplete,
	onClose,
	onCancel,
	showIntro = true,
}: {
	onComplete?: (results: CalibrationResult[]) => void
	onClose?: () => void
	onCancel?: () => void
	showIntro?: boolean
}) {
	const { t } = useTranslation()
	const CALIBRATION_POINTS = getCalibrationPoints(t)
	const [currentIndex, setCurrentIndex] = useState(0)
	const [isPulsing, setIsPulsing] = useState(false)
	const [results, setResults] = useState<CalibrationResult[]>([])
	const [isComplete, setIsComplete] = useState(false)
	const [showingIntro, setShowingIntro] = useState(showIntro)
	const [isFailed, setIsFailed] = useState(false)
	const currentPoint = CALIBRATION_POINTS[currentIndex]

	const handleFullscreenExit = () => {
		// If we are already done or showing intro, it's fine
		if (isComplete || showingIntro) return

		// Otherwise, FAIL the calibration
		setIsFailed(true)
	}

	const handleRestartCalibrationOnly = async () => {
		setCurrentIndex(0)
		setIsPulsing(false)
		setResults([])
		setIsComplete(false)
		setIsFailed(false)
		setShowingIntro(true)
	}

	const handlePointClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		if (isPulsing || isComplete || isFailed) return

		const result: CalibrationResult = {
			pointId: currentPoint.id,
			x: currentPoint.x,
			y: currentPoint.y,
			timestamp: Date.now(),
			screenX: event.clientX,
			screenY: event.clientY,
		}

		setResults((prev) => [...prev, result])
		setIsPulsing(true)

		// Pulse for a bit, then move to next point
		setTimeout(() => {
			setIsPulsing(false)
			if (currentIndex < CALIBRATION_POINTS.length - 1) {
				setCurrentIndex((prev) => prev + 1)
			} else {
				setIsComplete(true)
				onComplete?.([...results, result])
			}
		}, 1000)
	}

	const handleStartCalibration = async () => {
		if (!document.fullscreenElement) {
			try {
				await document.documentElement.requestFullscreen()
			} catch (e) {
				console.error("Fullscreen request failed", e)
			}
		}
		setShowingIntro(false)
	}

	if (isFailed) {
		return (
			<div className="fixed inset-0 z-50 bg-stone-950 flex items-center justify-center p-4">
				<div className="max-w-md w-full bg-stone-800 border-4 border-red-600 rounded-xl p-8 shadow-2xl text-center relative overflow-hidden">
					<div className="absolute inset-0 bg-red-950/20 pointer-events-none" />

					<div className="relative z-10">
						<div className="flex justify-center mb-6">
							<div className="p-4 bg-red-950/50 rounded-full border border-red-800">
								<AlertIcon className="h-16 w-16 text-red-500" />
							</div>
						</div>

						<h2 className="text-3xl font-bold text-red-100 mb-2">{t.calibration.failedTitle}</h2>

						<div className="text-stone-300 mb-8 text-lg space-y-3">
							<p>{t.calibration.failedMessage}</p>
							<p className="text-amber-200 font-semibold">{t.calibration.failedWarning}</p>
						</div>

						<button
							type="button"
							onClick={onCancel}
							className="w-full px-6 py-4 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg transition-colors shadow-lg active:scale-95"
						>
							{t.calibration.abortButton}
						</button>
					</div>
				</div>
			</div>
		)
	}

	// Show intro dialog
	if (showingIntro) {
		return (
			<div className="fixed inset-0 z-50 bg-stone-950 flex items-center justify-center p-4">
				<FullscreenMonitor enabled={true} />
				<div className="max-w-lg bg-stone-800 border-4 border-amber-600 rounded-xl p-8 shadow-2xl">
					<div className="space-y-6 text-center">
						<h2 className="text-3xl font-bold text-amber-100">{t.calibration.introTitle}</h2>

						<div className="space-y-4 text-stone-200 text-left">
							<p className="leading-relaxed">{t.calibration.introDescription}</p>

							<div className="bg-amber-950/50 border border-amber-800 rounded-lg p-4">
								<h3 className="text-amber-100 font-semibold mb-3">
									{t.calibration.instructionsLabel}
								</h3>
								<ol className="list-decimal list-inside space-y-2 text-sm">
									<li>{t.calibration.instruction1}</li>
									<li>{t.calibration.instruction2}</li>
									<li>{t.calibration.instruction3}</li>
									<li>{t.calibration.instruction4}</li>
								</ol>
							</div>
						</div>

						<button
							type="button"
							onClick={handleStartCalibration}
							className="w-full px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white text-lg font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-800 hover:scale-105 active:scale-95"
						>
							{t.calibration.startButton}
						</button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="fixed inset-0 z-50 bg-stone-950 flex items-center justify-center">
			<FullscreenMonitor
				enabled={!isFailed && !isComplete}
				onExitFullscreen={handleFullscreenExit}
			/>
			{/* Calibration point */}
			{!isComplete && currentPoint && (
				<button
					type="button"
					onClick={handlePointClick}
					className={`absolute cursor-pointer focus:outline-none rounded-full flex items-center justify-center ${
						isPulsing ? "animate-pulse" : ""
					}`}
					style={{
						left: `${currentPoint.x}%`,
						top: `${currentPoint.y}%`,
						transform: "translate(-50%, -50%)",
						width: "40px",
						height: "40px",
					}}
					aria-label={`Click calibration point: ${currentPoint.label}`}
					disabled={isPulsing}
				>
					{/* Outer glow ring - always visible */}
					<div
						className={`absolute rounded-full transition-all duration-300 ${
							isPulsing ? "animate-ping" : ""
						}`}
						style={{
							width: "40px",
							height: "40px",
							left: "0",
							top: "0",
							background: "radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%)",
						}}
					/>

					{/* Middle ring */}
					<div
						className={`absolute rounded-full border-2 border-amber-400 transition-all duration-300 ${
							isPulsing ? "scale-150 opacity-0" : "scale-100 opacity-100"
						}`}
						style={{
							width: "26px",
							height: "26px",
							left: "7px",
							top: "7px",
						}}
					/>

					{/* Inner dot */}
					<div
						className={`absolute rounded-full bg-amber-500 shadow-lg transition-all duration-300 ${
							isPulsing ? "scale-125" : "scale-100 hover:scale-110"
						}`}
						style={{
							width: "16px",
							height: "16px",
							left: "12px",
							top: "12px",
							boxShadow: isPulsing
								? "0 0 24px rgba(251, 191, 36, 0.8), 0 0 48px rgba(251, 191, 36, 0.4)"
								: "0 0 18px rgba(251, 191, 36, 0.6)",
						}}
					/>
				</button>
			)}

			{/* Completion message */}
			{isComplete && (
				<div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
					<div className="flex justify-center">
						<CheckmarkIcon className="size-20 text-green-500" />
					</div>
					<h2 className="text-2xl font-bold text-amber-100">{t.calibration.completeTitle}</h2>
					<p className="text-stone-300">{t.calibration.completeMessage}</p>
					<div className="flex gap-4">
						<button
							type="button"
							onClick={handleRestartCalibrationOnly}
							className="px-6 py-3 bg-stone-700 hover:bg-stone-600 text-stone-200 font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 focus:ring-offset-stone-950"
						>
							{t.calibration.restartButton}
						</button>
						<button
							type="button"
							onClick={onClose}
							className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-950"
						>
							{t.calibration.continueButton}
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
