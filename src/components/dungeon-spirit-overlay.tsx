import { useEffect, useState } from "react"
import { useTranslation } from "@/hooks/use-translation"

// Add wiggle animation styles
const wiggleStyles = `
@keyframes wiggle {
  0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
  10% { transform: translate(-50%, -50%) rotate(-7deg); }
  20% { transform: translate(-50%, -50%) rotate(7deg); }
  30% { transform: translate(-50%, -50%) rotate(-7deg); }
  40% { transform: translate(-50%, -50%) rotate(7deg); }
  50% { transform: translate(-50%, -50%) rotate(-7deg); }
  60% { transform: translate(-50%, -50%) rotate(7deg); }
  70% { transform: translate(-50%, -50%) rotate(-7deg); }
  80% { transform: translate(-50%, -50%) rotate(7deg); }
  90% { transform: translate(-50%, -50%) rotate(-7deg); }
}

.animate-wiggle {
  animation: wiggle 0.5s ease-in-out infinite;
}
`

interface SpiritPosition {
	x: number
	y: number
}

interface DungeonSpiritOverlayProps {
	positions: SpiritPosition[]
	onSpiritClick?: () => void
	onSpiritKill?: () => void
}

export function DungeonSpiritOverlay({
	positions,
	onSpiritClick,
	onSpiritKill,
}: DungeonSpiritOverlayProps) {
	const { t } = useTranslation()
	const [isClicked, setIsClicked] = useState(false)
	const [showAppearMessage, setShowAppearMessage] = useState(true)
	const [showBanishMessage, setShowBanishMessage] = useState(false)
	const [currentPositionIndex, setCurrentPositionIndex] = useState(0)

	useEffect(() => {
		const appearTimer = setTimeout(() => {
			setShowAppearMessage(false)
		}, 1500)
		return () => clearTimeout(appearTimer)
	}, [])

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault()
		event.stopPropagation()

		if (isClicked) return

		setIsClicked(true)

		setTimeout(() => {
			onSpiritClick?.()
			if (currentPositionIndex === positions.length - 1) {
				setShowBanishMessage(true)
				setTimeout(() => {
					onSpiritKill?.()
				}, 1500)
			} else {
				setCurrentPositionIndex((prev) => prev + 1)
				setIsClicked(false)
			}
		}, 600)
	}

	return (
		<>
			<style>{wiggleStyles}</style>

			{showAppearMessage && (
				<div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
					<div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in-95 duration-300">
						<div className="bg-purple-950/90 border-2 border-purple-500 rounded-lg px-6 py-3 shadow-2xl backdrop-blur-sm">
							<p className="text-purple-200 font-bold text-lg flex items-center gap-2">
								<span className="text-2xl">👻</span>
								{t.dungeonSpirit.appearMessage}
							</p>
						</div>
					</div>
				</div>
			)}

			{!showAppearMessage && !showBanishMessage && (
				<div className="fixed inset-0 z-50 bg-stone-950/98 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-750">
					{/* Spirit orb - clickable */}
					<button
						type="button"
						onClick={handleClick}
						className={`absolute cursor-pointer focus:outline-none rounded-full flex items-center justify-center transition-transform hover:scale-110`}
						style={{
							left: `${positions[currentPositionIndex].x}%`,
							top: `${positions[currentPositionIndex].y}%`,
							transform: "translate(-50%, -50%)",
							width: "35px",
							height: "35px",
						}}
						aria-label={t.dungeonSpirit.clickLabel}
						disabled={isClicked}
						data-spirit="true"
						id="dungeon-spirit"
					>
						{/* Outer glow ring - pulsing purple */}
						<div
							className={`absolute rounded-full ${isClicked ? "animate-ping" : "animate-ping"}`}
							style={{
								width: "35px",
								height: "35px",
								left: "0",
								top: "0",
								background:
									"radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, rgba(147, 51, 234, 0.3) 50%, transparent 70%)",
							}}
						/>

						{/* Middle ring */}
						<div
							className={`absolute rounded-full border-2 transition-all duration-300 ${
								isClicked
									? "border-red-400 scale-100 opacity-100"
									: "border-purple-400 scale-100 opacity-100"
							}`}
							style={{
								width: "22px",
								height: "22px",
								left: "6.5px",
								top: "6.5px",
							}}
						/>

						{/* Inner orb - glowing purple */}
						<div
							className={`absolute rounded-full shadow-lg transition-all duration-300 ${
								isClicked ? "scale-100 bg-red-500" : "scale-100 bg-purple-500"
							}`}
							style={{
								width: "13px",
								height: "13px",
								left: "11px",
								top: "11px",
								boxShadow: isClicked
									? "0 0 20px rgba(34, 197, 94, 0.9), 0 0 40px rgba(34, 197, 94, 0.5)"
									: "0 0 16px rgba(168, 85, 247, 0.8), 0 0 32px rgba(147, 51, 234, 0.4)",
							}}
						/>

						{/* Spirit emoji overlay */}
						<div
							className={`absolute text-lg transition-all duration-300 ${
								isClicked ? "opacity-100 animate-wiggle" : "opacity-90"
							}`}
							style={{
								left: "50%",
								top: "50%",
								transform: "translate(-50%, -50%)",
								filter: isClicked
									? "drop-shadow(0 0 8px rgb(239, 68, 68)) brightness(1.2) hue-rotate(-10deg)"
									: "none",
							}}
						>
							👻
						</div>

						{/* HP Bar - above the spirit */}
						<div
							className="absolute -top-2 left-1/2 -translate-x-1/2 h-2 bg-gray-700 rounded-full border border-gray-600 overflow-hidden"
							style={{ width: "30px" }}
						>
							<div
								className="h-full bg-green-500 transition-all duration-300"
								style={{
									width: `${((positions.length - currentPositionIndex) / positions.length) * 100}%`,
								}}
							/>
						</div>
					</button>
				</div>
			)}

			{showBanishMessage && (
				<div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
					<div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in-95 duration-300">
						<div className="bg-green-950/90 border-2 border-green-500 rounded-lg px-6 py-3 shadow-2xl backdrop-blur-sm">
							<p className="text-green-200 font-bold text-lg flex items-center gap-2">
								<span className="text-2xl">✨</span>
								{t.dungeonSpirit.banishMessage}
							</p>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
