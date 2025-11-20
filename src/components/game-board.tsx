import { useCallback, useEffect, useRef, useState } from "react"
import { calculateOptimalLayout } from "@/lib/game-utils"
import type { Card as CardType, GridConfig } from "@/lib/types"
import Card from "./card"

interface GameBoardProps {
	cards: CardType[]
	gridConfig: GridConfig
	onCardClick: (card: CardType) => void
	disabled: boolean
}

export default function GameBoard({ cards, gridConfig, onCardClick, disabled }: GameBoardProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const [layout, setLayout] = useState(() => {
		const initialLayout = calculateOptimalLayout(
			gridConfig.pairs,
			window.innerWidth,
			window.innerHeight,
		)
		return initialLayout
	})

	const updateLayout = useCallback(() => {
		if (!containerRef.current) return

		const container = containerRef.current
		const availableWidth = container.clientWidth
		const availableHeight = container.clientHeight

		const newLayout = calculateOptimalLayout(gridConfig.pairs, availableWidth, availableHeight)
		setLayout(newLayout)
	}, [gridConfig.pairs])

	// Initial layout calculation after mount
	useEffect(() => {
		updateLayout()
	}, [updateLayout])

	// Handle window resize and orientation change
	useEffect(() => {
		let timeoutId: number

		const handleResize = () => {
			// Debounce resize events
			clearTimeout(timeoutId)
			timeoutId = window.setTimeout(() => {
				updateLayout()
			}, 100)
		}

		window.addEventListener("resize", handleResize)
		window.addEventListener("orientationchange", updateLayout)

		return () => {
			clearTimeout(timeoutId)
			window.removeEventListener("resize", handleResize)
			window.removeEventListener("orientationchange", updateLayout)
		}
	}, [updateLayout])

	return (
		<div ref={containerRef} className="w-full h-full flex items-center justify-center">
			<div
				className="grid rounded-xl border-transparent transition-all duration-300 ease-in-out"
				style={{
					gridTemplateColumns: `repeat(${layout.cols}, ${layout.cardSize}px)`,
					gridTemplateRows: `repeat(${layout.rows}, ${layout.cardSize}px)`,
					gap: `${layout.gap}px`,
					width: "fit-content",
					height: "fit-content",
					padding: `${Math.max(8, layout.cardSize * 0.1)}px`,
					borderWidth: `${Math.max(2, Math.min(4, layout.cardSize * 0.05))}px`,
				}}
			>
				{cards.map((card) => (
					<Card key={card.id} card={card} onClick={onCardClick} disabled={disabled} />
				))}
			</div>
		</div>
	)
}
