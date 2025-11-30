import { useState } from "react"

interface CalibrationPoint {
	id: string
	x: number // percentage
	y: number // percentage
	label: string
}

interface CalibrationOverlayProps {
	onComplete?: (results: CalibrationResult[]) => void
	onClose?: () => void
	showIntro?: boolean
}

export interface CalibrationResult {
	pointId: string
	x: number
	y: number
	timestamp: number
	screenX: number
	screenY: number
}

const CALIBRATION_POINTS: CalibrationPoint[] = [
	{ id: "top-left", x: 5, y: 5, label: "Top Left" },
	{ id: "top-center", x: 50, y: 5, label: "Top Center" },
	{ id: "top-right", x: 95, y: 5, label: "Top Right" },
	{ id: "center-left", x: 5, y: 50, label: "Center Left" },
	{ id: "center-center", x: 50, y: 50, label: "Center" },
	{ id: "center-right", x: 95, y: 50, label: "Center Right" },
	{ id: "bottom-left", x: 5, y: 95, label: "Bottom Left" },
	{ id: "bottom-center", x: 50, y: 95, label: "Bottom Center" },
	{ id: "bottom-right", x: 95, y: 95, label: "Bottom Right" },
]

export default function CalibrationOverlay({
	onComplete,
	onClose,
	showIntro = true,
}: CalibrationOverlayProps) {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [isPulsing, setIsPulsing] = useState(false)
	const [results, setResults] = useState<CalibrationResult[]>([])
	const [isComplete, setIsComplete] = useState(false)
	const [showingIntro, setShowingIntro] = useState(showIntro)

	const currentPoint = CALIBRATION_POINTS[currentIndex]

	// Check if calibration is complete
	if (currentIndex >= CALIBRATION_POINTS.length && !isComplete) {
		setIsComplete(true)
		onComplete?.(results)
	}

	const handlePointClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		if (isPulsing || isComplete) return

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

		// Pulse for 1 second, then move to next point
		setTimeout(() => {
			setIsPulsing(false)
			setCurrentIndex((prev) => prev + 1)
		}, 1000)
	}

	const handleRestart = () => {
		setCurrentIndex(0)
		setIsPulsing(false)
		setResults([])
		setIsComplete(false)
	}

	const handleStartCalibration = () => {
		setShowingIntro(false)
	}

	// Show intro dialog
	if (showingIntro) {
		return (
			<div className="fixed inset-0 z-50 bg-stone-950 flex items-center justify-center p-4">
				<div className="max-w-lg bg-stone-800 border-4 border-amber-600 rounded-xl p-8 shadow-2xl">
					<div className="space-y-6 text-center">
						<h2 className="text-3xl font-bold text-amber-100">Gaze Calibration</h2>

						<div className="space-y-4 text-stone-200 text-left">
							<p className="leading-relaxed">
								Before we begin, we need to calibrate the gaze tracking system.
							</p>

							<div className="bg-amber-950/50 border border-amber-800 rounded-lg p-4">
								<h3 className="text-amber-100 font-semibold mb-3">Instructions:</h3>
								<ol className="list-decimal list-inside space-y-2 text-sm">
									<li>Look directly at each point when it appears</li>
									<li>Keep your head still and only move your eyes</li>
									<li>Click on the point when you're focused on it</li>
									<li>The point will pulse briefly, then move to the next one</li>
									<li>Complete all 9 points for accurate calibration</li>
								</ol>
							</div>

							<p className="text-sm text-stone-400">
								This process takes about 30 seconds and helps ensure accurate gaze tracking data.
							</p>
						</div>

						<button
							type="button"
							onClick={handleStartCalibration}
							className="w-full px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white text-lg font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-800 hover:scale-105 active:scale-95"
						>
							Start Calibration
						</button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="fixed inset-0 z-50 bg-stone-950 flex items-center justify-center">
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
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-20 w-20 text-green-500"
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
					</div>
					<h2 className="text-2xl font-bold text-amber-100">Calibration Complete!</h2>
					<p className="text-stone-300">All calibration points captured successfully!</p>
					<div className="flex gap-4">
						<button
							type="button"
							onClick={handleRestart}
							className="px-6 py-3 bg-stone-700 hover:bg-stone-600 text-stone-200 font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 focus:ring-offset-stone-950"
						>
							Restart Calibration
						</button>
						<button
							type="button"
							onClick={onClose}
							className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-950"
						>
							Continue
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
