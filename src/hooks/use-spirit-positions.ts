import { useState } from "react"

interface SpiritPosition {
	x: number
	y: number
}

const SPIRIT_POSITIONS: SpiritPosition[] = [
	{ x: 11.97, y: 16.08 },
	{ x: 62.57, y: 49.65 },
	{ x: 11.3, y: 83.22 },
	{ x: 87.63, y: 17.14 },
	{ x: 37.63, y: 17.61 },
	{ x: 62.5, y: 84.15 },
	{ x: 11.84, y: 49.65 },
	{ x: 87.77, y: 84.51 },
	{ x: 62.63, y: 16.31 },
	{ x: 37.7, y: 84.62 },
	{ x: 88.03, y: 49.41 },
	{ x: 37.63, y: 49.53 },
	{ x: 18.28, y: 23.71 },
	{ x: 69.88, y: 59.04 },
	{ x: 19.95, y: 92.25 },
	{ x: 95.21, y: 25.82 },
	{ x: 45.01, y: 26.29 },
	{ x: 69.88, y: 92.49 },
	{ x: 19.08, y: 59.04 },
	{ x: 94.88, y: 92.84 },
	{ x: 69.55, y: 25.23 },
	{ x: 45.21, y: 93.31 },
	{ x: 95.15, y: 58.92 },
	{ x: 45.21, y: 60.09 },
	{ x: 5.39, y: 7.75 },
	{ x: 54.59, y: 41.55 },
	{ x: 3.39, y: 73.71 },
	{ x: 79.39, y: 6.34 },
	{ x: 30.05, y: 6.92 },
	{ x: 54.85, y: 74.18 },
	{ x: 5.52, y: 40.61 },
	{ x: 79.99, y: 73.36 },
	{ x: 55.52, y: 6.81 },
	{ x: 30.19, y: 74.18 },
	{ x: 79.52, y: 40.02 },
	{ x: 30.45, y: 41.67 },
	{ x: 5.78, y: 25 },
	{ x: 55.98, y: 59.98 },
	{ x: 4.65, y: 91.67 },
	{ x: 80.19, y: 25.94 },
	{ x: 30.05, y: 25.94 },
	{ x: 54.72, y: 93.31 },
	{ x: 6.05, y: 58.22 },
	{ x: 93.28, y: 74.65 },
	{ x: 69.41, y: 8.33 },
	{ x: 43.68, y: 76.06 },
	{ x: 93.48, y: 41.78 },
	{ x: 44.41, y: 42.84 },
	{ x: 18.15, y: 7.86 },
	{ x: 68.95, y: 42.02 },
	{ x: 18.42, y: 75.47 },
	{ x: 93.62, y: 8.8 },
	{ x: 44.41, y: 8.33 },
	{ x: 69.48, y: 75.23 },
	{ x: 19.02, y: 41.78 },
	{ x: 80.85, y: 90.14 },
	{ x: 55.92, y: 23.36 },
	{ x: 30.45, y: 90.26 },
	{ x: 80.32, y: 56.81 },
	{ x: 30.59, y: 56.92 },
]

interface UseSpiritPositionsReturn {
	showSpirit: boolean
	currentPositions: SpiritPosition[]
	triggerNextSpirit: () => void
	closeSpirit: () => void
}

export function useSpiritPositions(): UseSpiritPositionsReturn {
	const [showSpirit, setShowSpirit] = useState(false)
	const [currentGhostIndex, setCurrentGhostIndex] = useState(0)

	const triggerNextSpirit = () => {
		if (currentGhostIndex < 20) {
			setShowSpirit(true)
		}
	}

	const closeSpirit = () => {
		setShowSpirit(false)
		setCurrentGhostIndex((prev) => prev + 1)
	}

	const startIndex = currentGhostIndex * 3
	const currentPositions = SPIRIT_POSITIONS.slice(startIndex, startIndex + 3)

	return {
		showSpirit,
		currentPositions,
		triggerNextSpirit,
		closeSpirit,
	}
}
