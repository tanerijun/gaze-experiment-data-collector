import { useCallback, useEffect, useRef, useState } from "react"

interface SpiritPosition {
	x: number
	y: number
}

interface UseSpiritTimerOptions {
	enabled: boolean
	onSpiritClick?: () => void
}

interface UseSpiritTimerReturn {
	secondsUntilSpirit: number
	showSpirit: boolean
	spiritPosition: SpiritPosition | null
	onSpiritClick: () => void
	resetTimer: () => void
}

const TIMER_INTERVAL = 15
// Stratified random position generator
// Divides screen into 4x4 grid regions and cycles through them for balanced distribution
const GRID_REGIONS = 4

export function useSpiritTimer({
	enabled,
	onSpiritClick,
}: UseSpiritTimerOptions): UseSpiritTimerReturn {
	const [secondsUntilSpirit, setSecondsUntilSpirit] = useState(TIMER_INTERVAL)
	const [showSpirit, setShowSpirit] = useState(false)
	const [spiritPosition, setSpiritPosition] = useState<SpiritPosition | null>(null)
	const usedRegions = useRef<Set<number>>(new Set())

	const generateStratifiedPosition = useCallback((): SpiritPosition => {
		const regions = usedRegions.current

		// Reset if we've used all 16 regions
		if (regions.size >= GRID_REGIONS * GRID_REGIONS) {
			regions.clear()
		}

		// Find an unused region
		let regionIndex: number
		do {
			regionIndex = Math.floor(Math.random() * (GRID_REGIONS * GRID_REGIONS))
		} while (regions.has(regionIndex))

		regions.add(regionIndex)

		// Calculate region boundaries
		const row = Math.floor(regionIndex / GRID_REGIONS)
		const col = regionIndex % GRID_REGIONS
		const regionSize = 100 / GRID_REGIONS

		// Add padding (5%) so it doesn't spawn on the very edge
		const padding = 5
		const minX = col * regionSize + padding
		const maxX = (col + 1) * regionSize - padding
		const minY = row * regionSize + padding
		const maxY = (row + 1) * regionSize - padding

		return {
			x: minX + Math.random() * (maxX - minX),
			y: minY + Math.random() * (maxY - minY),
		}
	}, [])

	// Countdown timer
	useEffect(() => {
		if (!enabled || showSpirit) return

		const interval = setInterval(() => {
			setSecondsUntilSpirit((prev) => {
				if (prev <= 1) {
					// Timer reached 0, show spirit
					const position = generateStratifiedPosition()
					setSpiritPosition(position)
					setShowSpirit(true)
					return 0
				}
				return prev - 1
			})
		}, 1000)

		return () => clearInterval(interval)
	}, [enabled, showSpirit, generateStratifiedPosition])

	const handleSpiritClick = useCallback(() => {
		setShowSpirit(false)
		setSpiritPosition(null)
		setSecondsUntilSpirit(TIMER_INTERVAL) // Reset timer
		onSpiritClick?.()
	}, [onSpiritClick])

	const resetTimer = useCallback(() => {
		setShowSpirit(false)
		setSpiritPosition(null)
		setSecondsUntilSpirit(TIMER_INTERVAL)
		usedRegions.current.clear()
	}, [])

	return {
		secondsUntilSpirit,
		showSpirit,
		spiritPosition,
		onSpiritClick: handleSpiritClick,
		resetTimer,
	}
}
